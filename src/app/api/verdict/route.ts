
import { NextRequest, NextResponse } from 'next/server';
import { submissions } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { id, verdict } = await req.json();

        if (!id || !verdict) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const submission = submissions.find(s => s.id === id);

        if (!submission) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        // Map verdict (SHORTLIST/REJECT/HOLD) to status (shortlisted/rejected/hold)
        let status: any = 'pending';
        if (verdict === 'SHORTLIST') status = 'shortlisted';
        else if (verdict === 'REJECT') status = 'rejected';
        else if (verdict === 'HOLD') status = 'hold';

        submission.admin_verdict = verdict;
        submission.status = status;

        return NextResponse.json({ success: true, verdict, status });
    } catch (error) {
        console.error("Verdict update error:", error);
        return NextResponse.json({ error: "Failed to update verdict" }, { status: 500 });
    }
}
