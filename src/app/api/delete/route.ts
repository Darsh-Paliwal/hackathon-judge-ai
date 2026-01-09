import { NextRequest, NextResponse } from 'next/server';
import { submissions } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        const index = submissions.findIndex(s => s.id === id);

        if (index === -1) {
            return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        }

        submissions.splice(index, 1);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete submission" }, { status: 500 });
    }
}
