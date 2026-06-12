import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const task = await Task.findById(id);

        if (!task) {
            console.log(`Task not found for message: ${id}`);
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Only assigned employee or admin (who assigned it) can participate in discussion
        const isAssignedEmployee = task.assignedTo.toString() === user.userId;
        const isAssigningAdmin = task.assignedBy?.toString() === user.userId;
        console.log(`Message attempt for Task ${id} by User ${user.userId} (Employee: ${isAssignedEmployee}, Admin: ${isAssigningAdmin})`);

        if (!isAssignedEmployee && !isAssigningAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const newMessage = {
            senderId: user.userId,
            senderRole: user.role,
            message,
            timestamp: new Date()
        };

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id },
            {
                $push: { discussionMessages: newMessage },
                $set: { updatedAt: new Date() }
            },
            { new: true }
        );

        if (!updatedTask) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        const savedMessage = updatedTask.discussionMessages[updatedTask.discussionMessages.length - 1];

        // Trigger Notification
        const recipientId = user.role === 'ADMIN' ? updatedTask.assignedTo.toString() : updatedTask.assignedBy.toString();
        await notificationService.notifyMessageReceived(
            recipientId,
            user.userId,
            id,
            message
        );

        console.log(`Successfully added message to task ${id} and sent notification to ${recipientId}`);

        return NextResponse.json(
            { message: 'Message sent successfully', newMessage: savedMessage },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Send message error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

        const { id } = await params;
        const task = await Task.findById(id).select('discussionMessages assignedTo assignedBy');

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        // Access check
        if (task.assignedTo.toString() !== user.userId && task.assignedBy?.toString() !== user.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({ messages: task.discussionMessages }, { status: 200 });
    } catch (error: any) {
        console.error('Get messages error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await verifyToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { messageId, text } = await req.json();

        const task = await Task.findById(id);
        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        const message = task.discussionMessages.id(messageId);
        if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

        // Only sender can edit
        if (message.senderId.toString() !== user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        message.message = text;
        await task.save();

        return NextResponse.json({ message: 'Message updated', updatedMessage: message });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const user = await verifyToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const messageId = searchParams.get('messageId');
        if (!messageId) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });

        const task = await Task.findById(id);
        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        const message = task.discussionMessages.id(messageId);
        if (!message) return NextResponse.json({ error: 'Message not found' }, { status: 404 });

        // Only sender or Admin who assigned can delete? (Let's stick to sender only for now as requested)
        if (message.senderId.toString() !== user.userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        task.discussionMessages.pull({ _id: messageId });
        await task.save();

        return NextResponse.json({ message: 'Message deleted' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
