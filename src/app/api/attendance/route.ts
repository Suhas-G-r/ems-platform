import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Attendance, User } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        if (user.role === 'ADMIN') {
            // 1. Get all employees
            const employees = await User.find({ role: 'EMPLOYEE' }).select('name lastName email designation avatar joinDate');

            let query: any = {};

            if (month && year) {
                const queryDate = new Date(parseInt(year), parseInt(month), 1);
                const monthStart = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1);
                const monthEnd = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 0, 23, 59, 59);
                query.date = { $gte: monthStart, $lte: monthEnd };
            } else {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                query.date = { $gte: today };
            }

            // Get attendance records based on query
            const attendanceRecords = await Attendance.find(query).populate('userId', 'name lastName email');

            // Get Pending Correction Requests (All time)
            const pendingRequests = await Attendance.find({
                'correctionRequest.status': 'PENDING',
                'correctionRequest.requested': true
            }).populate('userId', 'name lastName email designation');

            // If it's a specific month query, return the raw records for the chart
            if (month && year) {
                return NextResponse.json({ attendance: attendanceRecords, employees }, { status: 200 });
            }

            // Otherwise, return the daily status report (Daily Overview)
            const report = employees.map((emp: any) => {
                const record = attendanceRecords.find((r: any) => r.userId._id.toString() === emp._id.toString());

                return {
                    _id: record?._id,
                    userId: emp,
                    date: record ? record.date : new Date(),
                    checkIn: record ? record.checkIn : null,
                    checkOut: record ? record.checkOut : null,
                    status: record ? record.status : 'ABSENT',
                    workHours: record?.workHours || 0,
                    isLate: record?.isLate || false,
                    locationType: record?.locationType || 'OFFICE'
                };
            });

            return NextResponse.json({ attendance: report, pendingRequests }, { status: 200 });

        } else {
            // Employee sees their own history
            let query: any = { userId: user.userId };

            if (month && year) {
                const queryDate = new Date(parseInt(year), parseInt(month), 1);
                const monthStart = new Date(queryDate.getFullYear(), queryDate.getMonth(), 1);
                const monthEnd = new Date(queryDate.getFullYear(), queryDate.getMonth() + 1, 0, 23, 59, 59);
                query.date = { $gte: monthStart, $lte: monthEnd };
            }

            const attendanceRecords = await Attendance.find(query)
                .sort({ date: -1 })
                .populate('userId', 'name lastName email');

            return NextResponse.json({ attendance: attendanceRecords }, { status: 200 });
        }

    } catch (error: any) {
        console.error('Get attendance error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action, locationType = 'OFFICE' } = await req.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find the LATEST attendance record for today (sorted descending by creation/checkIn)
        let latestAttendance = await Attendance.findOne({
            userId: user.userId,
            date: { $gte: today },
        }).sort({ checkIn: -1 });

        const now = new Date();
        const lateThreshold = new Date(now);
        lateThreshold.setHours(9, 30, 0, 0);
        const isLate = now > lateThreshold;

        if (action === 'checkin') {
            // Check if there is an ACTIVE session (checked in but not checked out)
            if (latestAttendance && !latestAttendance.checkOut) {
                return NextResponse.json({ error: 'Already checked in. Please check out first.' }, { status: 400 });
            }

            // Create a NEW attendance record (Start new session)
            const newAttendance = await Attendance.create({
                userId: user.userId,
                date: new Date(),
                checkIn: now,
                locationType,
                isLate: isLate,
                status: isLate ? 'LATE' : (locationType === 'REMOTE' ? 'REMOTE' : 'PRESENT'),
            });

            return NextResponse.json({ message: 'Checked in successfully', attendance: newAttendance }, { status: 200 });

        } else if (action === 'checkout') {
            // Must have an ACTIVE session
            if (!latestAttendance || latestAttendance.checkOut) {
                return NextResponse.json({ error: 'No active session found. Please check in first.' }, { status: 400 });
            }

            latestAttendance.checkOut = now;
            const diff = now.getTime() - latestAttendance.checkIn.getTime();
            latestAttendance.workHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
            await latestAttendance.save();

            return NextResponse.json({ message: 'Checked out successfully', attendance: latestAttendance }, { status: 200 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Attendance error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // ADMIN ACTION: Resolve Correction Request
        if (body.action === 'resolve' && user.role === 'ADMIN') {
            const { attendanceId, status, newCheckOut } = body; // status: APPROVED | REJECTED

            const attendance = await Attendance.findById(attendanceId).populate('userId', 'name');
            if (!attendance) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

            attendance.correctionRequest.status = status;

            if (status === 'APPROVED' && newCheckOut) {
                attendance.checkOut = new Date(newCheckOut);
                // Recalculate work hours
                if (attendance.checkIn) {
                    const diff = new Date(newCheckOut).getTime() - new Date(attendance.checkIn).getTime();
                    attendance.workHours = parseFloat((diff / (1000 * 60 * 60)).toFixed(2));
                }
                attendance.status = 'PRESENT'; // Ensure status is present if approved
            }

            await attendance.save();

            // Notify Employee
            if (status === 'APPROVED') {
                await notificationService.notifyAttendanceApproved(
                    attendance.userId._id.toString(),
                    user.userId,
                    attendance._id.toString()
                );
            } else {
                await notificationService.notifyAttendanceRejected(
                    attendance.userId._id.toString(),
                    user.userId,
                    attendance._id.toString()
                );
            }

            return NextResponse.json({ message: `Request ${status.toLowerCase()}`, attendance }, { status: 200 });
        }

        // EMPLOYEE ACTION: Submit Correction Request
        const { attendanceId, reason } = body;
        const attendance = await Attendance.findOne({ _id: attendanceId, userId: user.userId });

        if (!attendance) {
            return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
        }

        attendance.correctionRequest = {
            requested: true,
            reason: reason,
            status: 'PENDING'
        };

        await attendance.save();

        // Notify Admins
        const admins = await User.find({ role: 'ADMIN', isActive: true });
        const employee = await User.findById(user.userId).select('name lastName').lean();
        const fullName = `${employee?.name} ${employee?.lastName}`;

        for (const admin of admins) {
            await notificationService.notifyAttendanceRequested(
                admin._id.toString(),
                user.userId,
                attendance._id.toString(),
                fullName
            );
        }

        return NextResponse.json({ message: 'Correction request submitted', attendance }, { status: 200 });

    } catch (error: any) {
        console.error('Correction request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
