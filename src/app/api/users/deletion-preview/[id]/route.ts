import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userDeletionService } from '@/lib/userDeletionService';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/users/deletion-preview/:id
 * Get preview of what will be deleted (Admin only)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const preview = await userDeletionService.getDeletionPreview(id);

        return NextResponse.json(preview, { status: 200 });
    } catch (error) {
        console.error('Error getting deletion preview:', error);
        return NextResponse.json(
            { error: 'Failed to get deletion preview' },
            { status: 500 }
        );
    }
}
