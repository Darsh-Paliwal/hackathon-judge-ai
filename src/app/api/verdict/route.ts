
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { id, verdict } = await req.json();

        if (!id || !verdict) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Map verdict (SHORTLIST/REJECT/HOLD) to status (shortlisted/rejected/hold)
        let status = 'pending';
        if (verdict === 'SHORTLIST') status = 'shortlisted';
        else if (verdict === 'REJECT') status = 'rejected';
        else if (verdict === 'HOLD') status = 'hold';

        const stmt = db.prepare(`
            UPDATE submissions 
            SET admin_verdict = ?, status = ? 
            WHERE id = ?
        `);

        stmt.run(verdict, status, id);

        return NextResponse.json({ success: true, verdict, status });
    } catch (error) {
        console.error("Verdict update error:", error);
        return NextResponse.json({ error: "Failed to update verdict" }, { status: 500 });
    }
}
