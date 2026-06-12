import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { User } from '@/lib/models';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

/**
 * PATCH /api/profile/change-password
 * Change user password
 */
export async function PATCH(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        // Get user with password
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            message: 'Password changed successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error changing password:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
