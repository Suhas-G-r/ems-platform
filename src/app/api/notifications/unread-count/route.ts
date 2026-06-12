import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { notificationService } from '@/lib/notificationService';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const count = await notificationService.getUnreadCount(decoded.userId);

        return NextResponse.json({ count }, { status: 200 });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch unread count' },
            { status: 500 }
        );
    }
}
