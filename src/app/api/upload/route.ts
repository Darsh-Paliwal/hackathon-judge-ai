import { NextRequest, NextResponse } from 'next/server';
import { extractDataFromPPTX } from '@/lib/pptx-parser';
import { evaluatePPT } from '@/lib/ai-service';
import { submissions, blueprint } from '@/lib/db';

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

        // 3. Get Blueprint (Directly from memory)
        // const blueprint is already imported

        // 4. AI Evaluation (Multimodal)
        const evaluation = await evaluatePPT(pptData, blueprint);

        // 5. Store in In-Memory DB
        const filename = file.name;
        // Use provided team name or fallback to filename
        const finalTeamName = inputTeamName || filename.replace(/\.[^/.]+$/, "");

        const newSubmission: any = {
            id: Date.now(), // Simple number ID based on timestamp
            team_name: finalTeamName,
            team_id: teamId || null,
            track: track || null,
            filename: filename,
            upload_timestamp: new Date().toISOString(),
            original_score: evaluation.total_score,
            final_score: evaluation.total_score,
            ai_verdict: evaluation.verdict,
            admin_verdict: evaluation.verdict,
            evaluation_json: JSON.stringify(evaluation), // Keep as string to match old schema expectations or refactor frontend
            status: evaluation.verdict === 'SHORTLIST' ? 'shortlisted' : 'rejected'
        };

        submissions.push(newSubmission);

        return NextResponse.json({
            success: true,
            id: newSubmission.id,
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
