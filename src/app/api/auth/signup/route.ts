import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Destructure request body
        const {
            name,
            lastName,
            email,
            password,
            role,
            phone,
            address,
            city,
            postalCode,
            dob,
            gender,
            securityQuestion,
            securityAnswer
        } = await req.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Please provide all required fields' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name,
            lastName: lastName || '',
            email: email.toLowerCase(),
            phone: phone || '',
            password: hashedPassword,
            role: role || 'EMPLOYEE',
            department: role === 'ADMIN' ? 'Management' : 'General',
            designation: role === 'ADMIN' ? 'Administrator' : 'Employee',
            address: address || '',
            city: city || '',
            postalCode: postalCode || '',
            dob: dob || '',
            gender: gender || '',
            securityQuestion: securityQuestion || "What is your pet's name?",
            securityAnswer: securityAnswer || '',
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
