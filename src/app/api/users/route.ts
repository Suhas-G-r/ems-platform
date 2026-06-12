import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const user = await verifyToken(req);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.role === 'ADMIN') {
            const { searchParams } = new URL(req.url);
            const showAll = searchParams.get('all') === 'true';
            const searchQuery = searchParams.get('q');

            // Find all that are NOT explicitly isActive: false (handles missing field)
            let query: any = showAll ? {} : { isActive: { $ne: false } };

            if (searchQuery) {
                query.$or = [
                    { name: { $regex: searchQuery, $options: 'i' } },
                    { lastName: { $regex: searchQuery, $options: 'i' } },
                    { email: { $regex: searchQuery, $options: 'i' } }
                ];
            }

            const users = await User.find(query).select('-password').sort({ createdAt: -1 });

            return NextResponse.json({ users }, { status: 200 });
        } else {
            // Employee can only see their own profile
            const currentUser = await User.findById(user.userId).select('-password');
            return NextResponse.json({ user: currentUser }, { status: 200 });
        }
    } catch (error: any) {
        console.error('Get users error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
