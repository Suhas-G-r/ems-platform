import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const decoded = await verifyToken(req);

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error: any) {
        console.error('Get profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const decoded = await verifyToken(req);

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();

        // Fields that can be updated
        const updateFields = [
            'name', 'lastName', 'phone', 'address', 'city', 'postalCode', 'dob', 'gender'
        ];

        const updateData: any = {};
        updateFields.forEach(field => {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user, message: 'Profile updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
