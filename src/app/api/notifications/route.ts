import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/notifications
 * Get user notifications with pagination
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const result = await notificationService.getUserNotifications(
            decoded.userId,
            page,
            limit
        );

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function DELETE(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const notificationId = searchParams.get('id');

        if (!notificationId) {
            return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
        }

        await notificationService.deleteNotification(notificationId, decoded.userId);

        return NextResponse.json({ message: 'Notification deleted' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting notification:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
