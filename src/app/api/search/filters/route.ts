import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { searchService } from '@/lib/searchService';
import connectDB from '@/lib/mongodb';

/**
 * GET /api/search/filters
 * Get available filter options
 */
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const options = await searchService.getFilterOptions();

        return NextResponse.json(options, { status: 200 });
    } catch (error) {
        console.error('Error fetching filter options:', error);
        return NextResponse.json(
            { error: 'Failed to fetch filter options' },
            { status: 500 }
        );
    }
}
