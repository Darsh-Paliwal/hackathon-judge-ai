
import { NextRequest, NextResponse } from 'next/server';
import { extractDataFromPPTX } from '@/lib/pptx-parser';
import { evaluatePPT } from '@/lib/ai-service';
import db from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const inputTeamName = formData.get('teamName') as string;
        const teamId = formData.get('teamId') as string;
        const track = formData.get('track') as string;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // 1. Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();

        // 2. Parse PPTX (Text + Images)
        const pptData = await extractDataFromPPTX(arrayBuffer);

        // 3. Get Blueprint
        const blueprintRow = db.prepare('SELECT criteria_json FROM blueprint WHERE id = 1').get() as { criteria_json: string };
        const blueprint = JSON.parse(blueprintRow.criteria_json);

        // 4. AI Evaluation (Multimodal)
        const evaluation = await evaluatePPT(pptData, blueprint);

        // 5. Store in DB
        const filename = file.name;
        // Use provided team name or fallback to filename
        const finalTeamName = inputTeamName || filename.replace(/\.[^/.]+$/, "");

        const insertStmt = db.prepare(`
        INSERT INTO submissions (team_name, team_id, track, filename, original_score, final_score, ai_verdict, admin_verdict, evaluation_json, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = insertStmt.run(
            finalTeamName,
            teamId || null,
            track || null,
            filename,
            evaluation.total_score,
            evaluation.total_score, // Initially same as original
            evaluation.verdict,
            evaluation.verdict, // Default admin verdict matches AI
            JSON.stringify(evaluation),
            evaluation.verdict === 'SHORTLIST' ? 'shortlisted' : 'rejected'
        );

        return NextResponse.json({
            success: true,
            id: result.lastInsertRowid,
            evaluation
        });

    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: (error as Error).message },
            { status: 500 }
        );
    }
}
