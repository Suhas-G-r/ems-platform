import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { userDeletionService } from '@/lib/userDeletionService';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

/**
 * DELETE /api/users/:id
 * Soft delete or hard delete a user (Admin only)
 */
export async function DELETE(
    request: NextRequest,
    context: { params: any }
) {
    try {
        const resolvedParams = await context.params;
        const userIdToDelete = resolvedParams?.id;
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded || decoded.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }

        const adminUser = await User.findById(decoded.userId);
        if (!adminUser) {
            console.error(`❌ Admin not found: ${decoded.userId}`);
            return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
        }

        const { password } = await request.json();
        if (!password) {
            return NextResponse.json({ error: 'Admin password is required for deletion' }, { status: 400 });
        }

        console.log(`🛡️ Auth Check: Admin=${adminUser.email} attempting deletion...`);
        const isMatch = await bcrypt.compare(password, adminUser.password);

        if (!isMatch) {
            console.warn(`⚠️ Password Mismatch for admin: ${adminUser.email}`);
            return NextResponse.json({ error: 'Incorrect admin password' }, { status: 401 });
        }
        console.log(`✅ Auth Success: ${adminUser.email}`);

        console.log(`🔍 DELETE Request: Admin=${adminUser.email}, TargetID=${userIdToDelete}`);

        if (!userIdToDelete) {
            return NextResponse.json({ error: 'User ID is required for deletion' }, { status: 400 });
        }

        const targetUser = await User.findById(userIdToDelete);

        if (!targetUser) {
            console.error(`❌ Target user not found: ${userIdToDelete}`);
            // Also check if any user exists with that ID as a string or ObjectId
            return NextResponse.json({ error: `User to delete not found in database (${userIdToDelete})` }, { status: 404 });
        }

        console.log(`👤 Target User: ${targetUser.email} (Role: ${targetUser.role}, ID: ${targetUser._id})`);

        // Admin Protection Rule: Admin can delete themselves, but not other Admins
        if (targetUser.role === 'ADMIN' && targetUser._id.toString() !== decoded.userId) {
            console.warn(`🛑 Protection Rule: ${adminUser.email} denied deleting ${targetUser.email}`);
            return NextResponse.json({ error: 'Security Violation: Admins cannot delete other Admins' }, { status: 403 });
        }

        console.log(`🗑️ Executing Permanent Deletion: User=${userIdToDelete} (${targetUser.name})`);

        const result = await userDeletionService.hardDeleteUser(userIdToDelete);

        console.log(`✅ Deletion Complete for ${userIdToDelete}`);
        return NextResponse.json({
            message: 'User and all associated data permanently deleted',
            summary: result
        }, { status: 200 });

    } catch (error: any) {
        console.error('❌ Error deleting user:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete user' },
            { status: 500 }
        );
    }
}

