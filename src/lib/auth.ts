import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface DecodedToken {
    userId: string;
    email: string;
    role: string;
}

export async function verifyToken(req: NextRequest): Promise<DecodedToken | null> {
    try {
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export function generateToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}
