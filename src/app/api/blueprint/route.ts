
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    const row = db.prepare('SELECT criteria_json FROM blueprint WHERE id = 1').get() as { criteria_json: string };
    return NextResponse.json(JSON.parse(row.criteria_json));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // Validate body structure briefly (optional but good)

        const stmt = db.prepare('UPDATE blueprint SET criteria_json = ? WHERE id = 1');
        stmt.run(JSON.stringify(body));

        return NextResponse.json({ success: true, blueprint: body });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update blueprint" }, { status: 500 });
    }
}
