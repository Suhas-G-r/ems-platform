import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { searchService } from '@/lib/searchService';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/search/global
 * Global search across all entities
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (!query || query.length < 2) {
            return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
        }

        const results = await searchService.globalSearch(query, decoded.userId, decoded.role);

        return NextResponse.json(results, { status: 200 });
    } catch (error) {
        console.error('Error in global search:', error);
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        );
    }
}
