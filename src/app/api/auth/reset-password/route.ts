import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

// GET: Fetch security question for an email
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ question: user.securityQuestion });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Verify answer and reset password
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, securityAnswer, newPassword } = await req.json();

        if (!email || !securityAnswer || !newPassword) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify answer (case-insensitive and trimmed)
        if (user.securityAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
            return NextResponse.json({ error: 'Incorrect answer to security question' }, { status: 401 });
        }

        // Reset password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ _id: user._id }, { password: hashedPassword });

        return NextResponse.json({ message: 'Password reset successful' });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
