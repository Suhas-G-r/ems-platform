import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let tasks;
        if (user.role === 'ADMIN') {
            // Multi-Admin Logic: Only show tasks assigned by this specific admin
            tasks = await Task.find({ assignedBy: user.userId })
                .populate('assignedTo', 'name email')
                .populate('assignedBy', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // Employee sees only their tasks
            tasks = await Task.find({ assignedTo: user.userId })
                .populate('assignedBy', 'name email')
                .sort({ createdAt: -1 });
        }

        return NextResponse.json({ tasks }, { status: 200 });
    } catch (error: any) {
        console.error('Get tasks error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { assignedTo, title, description, dueDate, priority } = await req.json();

        if (!assignedTo || !title || !description || !dueDate) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        const task = await Task.create({
            assignedTo,
            assignedBy: user.userId,
            title,
            description,
            dueDate: new Date(dueDate),
            priority: priority || 'MEDIUM',
            status: 'TODO',
            subtasks: [],
            discussionMessages: []
        });

        // Trigger Notification
        await notificationService.notifyTaskAssigned(assignedTo, user.userId, task._id.toString(), title);

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email');

        return NextResponse.json(
            { message: 'Task created successfully', task: populatedTask },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create task error:', error);
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

        const { taskId, status } = await req.json();

        const task = await Task.findById(taskId);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const prevStatus = task.status;

        // Only assigned employee or admin can update
        if (task.assignedTo.toString() !== user.userId && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        task.status = status;
        task.updatedAt = new Date();
        await task.save();

        // Trigger Notifications
        if (prevStatus !== status) {
            if (user.role === 'EMPLOYEE') {
                // Notify admin
                await notificationService.notifyTaskStatusChanged(
                    task.assignedBy.toString(),
                    user.userId,
                    task._id.toString(),
                    task.title,
                    status
                );

                // If special case: Completed
                if (status === 'DONE') {
                    await notificationService.notifyTaskCompleted(
                        task.assignedBy.toString(),
                        user.userId,
                        task._id.toString(),
                        task.title
                    );
                }
            } else if (user.role === 'ADMIN') {
                // Notify employee
                await notificationService.notifyTaskStatusChanged(
                    task.assignedTo.toString(),
                    user.userId,
                    task._id.toString(),
                    task.title,
                    status
                );
            }
        }

        return NextResponse.json(
            { message: 'Task updated successfully', task },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
