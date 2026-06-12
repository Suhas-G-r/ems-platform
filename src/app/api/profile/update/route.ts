import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { User } from '@/lib/models';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

/**
 * PATCH /api/profile/update
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            phone,
            address,
            city,
            postalCode,
            dob,
            gender
        } = body;

        // Update allowed fields only
        const updateData: any = {};
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (postalCode !== undefined) updateData.postalCode = postalCode;
        if (dob !== undefined) updateData.dob = dob;
        if (gender !== undefined) updateData.gender = gender;

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            updateData,
            { new: true }
        ).select('-password -securityAnswer');

        return NextResponse.json({
            message: 'Profile updated successfully',
            user
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}
