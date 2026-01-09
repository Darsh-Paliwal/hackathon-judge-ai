
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET() {
    try {
        const stmt = db.prepare('SELECT * FROM submissions ORDER BY upload_timestamp DESC');
        const rows = stmt.all();

        // Parse the JSON string back to object for the frontend
        const results = rows.map((row: any) => ({
            ...row,
            evaluation: JSON.parse(row.evaluation_json)
        }));

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
    }
}
