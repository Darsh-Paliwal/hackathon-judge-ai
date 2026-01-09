import { NextResponse } from 'next/server';
import { submissions } from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure no caching

export async function GET() {
    try {
        // Sort by timestamp desc
        const sorted = [...submissions].sort((a, b) =>
            new Date(b.upload_timestamp).getTime() - new Date(a.upload_timestamp).getTime()
        );

        // Parse JSON string evaluation if needed, or if stored as string in upload, parse it here
        const results = sorted.map((row: any) => ({
            ...row,
            evaluation: typeof row.evaluation_json === 'string' ? JSON.parse(row.evaluation_json) : row.evaluation_json
        }));

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
    }
}
