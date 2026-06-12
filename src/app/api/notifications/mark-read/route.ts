import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';
import connectDB from '@/lib/mongodb';

/**
 * PATCH /api/notifications/mark-read
 * Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { notificationId, markAll } = body;

        if (markAll) {
            // Mark all notifications as read
            await notificationService.markAllAsRead(decoded.userId);
            return NextResponse.json({ message: 'All notifications marked as read' }, { status: 200 });
        } else if (notificationId) {
            // Mark single notification as read
            await notificationService.markAsRead(notificationId, decoded.userId);
            return NextResponse.json({ message: 'Notification marked as read' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
}
