import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Task } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

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

        const { id } = await params;

        // When an Admin reads, all Employee messages are marked seen
        // When an Employee reads, all Admin messages are marked seen
        const roleToMark = user.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';

        await Task.updateOne(
            { _id: id },
            {
                $set: { "discussionMessages.$[msg].seen": true }
            },
            {
                arrayFilters: [{ "msg.senderRole": roleToMark, "msg.seen": false }]
            }
        );

        return NextResponse.json({ message: 'Messages marked as read' }, { status: 200 });
    } catch (error: any) {
        console.error('Mark read error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
