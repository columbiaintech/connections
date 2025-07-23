import { NextResponse } from 'next/server';
import { backfillMissingGroupIds } from '@/app/actions/admin';

export async function GET() {
    try {
        const result = await backfillMissingGroupIds();
        console.log('Backfill result:', result);
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        console.error('Backfill error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
