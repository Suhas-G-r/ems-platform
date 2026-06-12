import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Task, Attendance, LeaveRequest, User } from '@/lib/models';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/profile/work-history
 * Get employee work history
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const months = parseInt(searchParams.get('months') || '6');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        // Get tasks
        const tasks = await Task.find({
            assignedTo: decoded.userId,
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .populate('assignedBy', 'name lastName')
            .sort({ createdAt: -1 })
            .lean();

        // Get attendance
        const attendance = await Attendance.find({
            userId: decoded.userId,
            date: { $gte: startDate, $lte: endDate }
        })
            .sort({ date: -1 })
            .lean();

        // Get leaves
        const leaves = await LeaveRequest.find({
            userId: decoded.userId,
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .sort({ createdAt: -1 })
            .lean();

        // Helper to count business days (Mon-Fri)
        function countBusinessDays(start: Date, end: Date) {
            let count = 0;
            const cur = new Date(start);
            while (cur <= end) {
                const dayOfWeek = cur.getDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
                cur.setDate(cur.getDate() + 1);
            }
            return count;
        }

        const totalWorkingDays = countBusinessDays(startDate, endDate);

        // Calculate leave days taken
        const leaveDaysTaken = leaves
            .filter(l => l.status === 'APPROVED')
            .reduce((acc, l) => {
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                return acc + diffDays;
            }, 0);

        // Calculate Points
        const completedCount = tasks.filter(t => t.status === 'DONE').length;
        const presentCount = attendance.filter(a => ['PRESENT', 'LATE', 'REMOTE'].includes(a.status)).length;
        const lateCount = attendance.filter(a => a.status === 'LATE').length;

        const score = (completedCount * 10) + (presentCount * 5) - (lateCount * 2);

        // 1. Get User Join Date
        const user = await User.findById(decoded.userId).select('joinDate');
        const joinDate = user?.joinDate ? new Date(user.joinDate) : new Date(0); // Default to epoch if no join date

        // 2. Aggregate Data by Month (Last 12 Months)
        const monthlyStats = [];
        const today = new Date();

        for (let i = 0; i < months; i++) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);

            // Total days in the month (e.g., 28, 30, 31)
            const totalDaysInMonth = monthEnd.getDate();

            // Stats for this month
            let presentDays = 0;
            let leaveDays = 0;
            let absentDays = 0;
            let workingPotential = 0;

            // Only calculate stats if the month is at or after joining
            if (monthEnd >= joinDate) {
                // Adjust start if joined this month
                const effectiveStart = (joinDate > monthStart && joinDate <= monthEnd) ? joinDate : monthStart;

                // Total working potential from join date to month end (business days)
                workingPotential = countBusinessDays(effectiveStart, monthEnd);

                // Count Present Days (Unique dates in this month)
                presentDays = attendance.filter(a => {
                    const aDate = new Date(a.date);
                    return aDate >= effectiveStart && aDate <= monthEnd && ['PRESENT', 'LATE', 'REMOTE'].includes(a.status);
                }).reduce((unique: Set<string>, item) => {
                    unique.add(new Date(item.date).toDateString());
                    return unique;
                }, new Set()).size;

                // Count Approved Leaves (Overlap with this month) - Only count business days
                leaveDays = leaves
                    .filter(l => l.status === 'APPROVED')
                    .reduce((acc, l) => {
                        const lStart = new Date(l.startDate);
                        const lEnd = new Date(l.endDate);

                        // Intersection of [lStart, lEnd] and [effectiveStart, monthEnd]
                        const start = lStart > effectiveStart ? lStart : effectiveStart;
                        const end = lEnd < monthEnd ? lEnd : monthEnd;

                        if (start <= end) {
                            const days = countBusinessDays(start, end);
                            return acc + days;
                        }
                        return acc;
                    }, 0);

                // Absent is the difference between what they were supposed to work and what they actually did
                absentDays = Math.max(0, workingPotential - presentDays - leaveDays);
            }

            monthlyStats.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                totalDays: totalDaysInMonth,
                present: presentDays,
                leaves: leaveDays,
                absent: absentDays,
                isBeforeJoining: monthEnd < joinDate,
                attendancePercentage: workingPotential > 0 ? Math.round(((presentDays + leaveDays) / workingPotential) * 100) : 0
            });
        }

        // Calculate summary (global) for backward compatibility or top-level metric if needed, 
        // but we will primarily use monthlyStats now.
        const summary = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'DONE').length,
            totalAttendance: attendance.length,
            presentDays: attendance.filter(a => ['PRESENT', 'LATE', 'REMOTE'].includes(a.status)).length,
            totalLeaves: leaves.length,
            approvedLeaves: leaves.filter(l => l.status === 'APPROVED').length,
            points: 0 // Legacy
        };

        return NextResponse.json({
            summary,
            monthlyStats, // New Field
            tasks: tasks.slice(0, 50),
            attendance: attendance.slice(0, 100),
            leaves: leaves.slice(0, 50)
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching work history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch work history' },
            { status: 500 }
        );
    }
}
