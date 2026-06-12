import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const body = await req.json();
        const { subtasks, status } = body;

        const task = await Task.findById(id);

        if (!task) {
            console.log(`Task not found: ${id}`);
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Only assigned employee or admin can update
        const isOwner = task.assignedTo.toString() === user.userId;
        const isAdmin = user.role === 'ADMIN';
        console.log(`Update attempt for Task ${id} by User ${user.userId} (Owner: ${isOwner}, Admin: ${isAdmin})`);

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use findOneAndUpdate for more reliable atomic updates
        const updatedTask = await Task.findOneAndUpdate(
            { _id: id },
            {
                $set: {
                    ...(subtasks ? { subtasks } : {}),
                    ...(status ? { status } : {}),
                    ...(body.uploadedFiles ? { uploadedFiles: body.uploadedFiles } : {}),
                    updatedAt: new Date()
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            console.log(`Task not found during update: ${id}`);
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Trigger Notifications
        if (status && status !== task.status) {
            const recipientId = user.role === 'ADMIN' ? updatedTask.assignedTo.toString() : updatedTask.assignedBy.toString();
            await notificationService.notifyTaskStatusChanged(
                recipientId,
                user.userId,
                id,
                updatedTask.title,
                status
            );
        }

        if (body.uploadedFiles && body.uploadedFiles.length > task.uploadedFiles?.length) {
            const recipientId = user.role === 'ADMIN' ? updatedTask.assignedTo.toString() : updatedTask.assignedBy.toString();
            const lastFile = body.uploadedFiles[body.uploadedFiles.length - 1];
            await notificationService.notifyTaskFileUploaded(
                recipientId,
                user.userId,
                id,
                lastFile.name
            );
        }

        console.log(`Successfully updated task ${id}. Subtasks: ${updatedTask.subtasks?.length || 0}`);

        return NextResponse.json(
            { message: 'Task updated successfully', task: updatedTask },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('CRITICAL: Update task error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const task = await Task.findById(id)
            .populate('assignedTo', 'name email')
            .populate('assignedBy', 'name email');

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Only assigned employee or admin can view
        if (task.assignedTo.toString() !== user.userId && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({ task }, { status: 200 });
    } catch (error: any) {
        console.error('Get task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const task = await Task.findById(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Only the admin who created the task can delete it
        const isAdmin = user.role === 'ADMIN';
        const isCreator = task.assignedBy.toString() === user.userId;

        if (!isAdmin || !isCreator) {
            return NextResponse.json({ error: 'Only the task creator can delete this task' }, { status: 401 });
        }

        // Delete the task
        await Task.findByIdAndDelete(id);

        return NextResponse.json(
            { message: 'Task deleted successfully' },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Delete task error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
