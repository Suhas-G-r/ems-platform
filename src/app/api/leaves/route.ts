import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { LeaveRequest, User } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let leaveRequests;
        if (user.role === 'ADMIN') {
            // Admin can see all leave requests
            leaveRequests = await LeaveRequest.find()
                .populate('userId', 'name email department')
                .sort({ createdAt: -1 });
        } else {
            // Employee sees only their requests
            leaveRequests = await LeaveRequest.find({ userId: user.userId })
                .sort({ createdAt: -1 });
        }

        return NextResponse.json({ leaveRequests }, { status: 200 });
    } catch (error: any) {
        console.error('Get leave requests error:', error);
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

        const { type, startDate, endDate, reason } = await req.json();

        if (!type || !startDate || !endDate || !reason) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        const leaveRequest = await LeaveRequest.create({
            userId: user.userId,
            type,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: 'PENDING',
        });

        // Trigger Notifications for all Admins
        const admins = await User.find({ role: 'ADMIN', isActive: true });
        const employeeName = await User.findById(user.userId).select('name lastName').lean();
        const fullName = `${employeeName?.name} ${employeeName?.lastName}`;

        for (const admin of admins) {
            await notificationService.notifyLeaveRequested(
                admin._id.toString(),
                user.userId,
                leaveRequest._id.toString(),
                fullName
            );
        }

        const populatedRequest = await LeaveRequest.findById(leaveRequest._id)
            .populate('userId', 'name email department');

        return NextResponse.json(
            { message: 'Leave request submitted successfully', leaveRequest: populatedRequest },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create leave request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requestId, status, adminResponse } = await req.json();

        const leaveRequest = await LeaveRequest.findById(requestId);

        if (!leaveRequest) {
            return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
        }

        leaveRequest.status = status;
        leaveRequest.adminResponse = adminResponse;
        leaveRequest.updatedAt = new Date();
        await leaveRequest.save();

        // Trigger Notification for Employee
        if (status === 'APPROVED') {
            await notificationService.notifyLeaveApproved(
                leaveRequest.userId.toString(),
                user.userId,
                leaveRequest._id.toString()
            );
        } else if (status === 'REJECTED') {
            await notificationService.notifyLeaveRejected(
                leaveRequest.userId.toString(),
                user.userId,
                leaveRequest._id.toString(),
                adminResponse
            );
        }

        return NextResponse.json(
            { message: 'Leave request updated successfully', leaveRequest },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update leave request error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
