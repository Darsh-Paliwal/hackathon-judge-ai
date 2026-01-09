
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface EvaluationResult {
    scores: {
        problem_understanding: number;
        solution_approach: number;
        innovation: number;
        technical_feasibility: number;
        presentation_quality: number;
    };
    total_score: number;
    missing_sections: string[];
    strengths: string[];
    weaknesses: string[];
    verdict: "SHORTLIST" | "REJECT";
    confidence: number;
}


export async function evaluatePPT(pptData: { text: string, images: any[] }, blueprint: any): Promise<EvaluationResult> {
    // Verified available models from logs (2026-01-04)
    // Prioritizing newer 2.5 models and latest aliases which might have better quotas
    const modelsToTry = [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-flash-latest",
        "gemini-pro-latest",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.0-flash",
        "gemini-2.0-flash-exp"
    ];

    const promptText = `
    You are an expert Hackathon Judge. Evaluate the following Hackathon PPT submission based strictly on the provided blueprint.
    
    BLUEPRINT (CRITERIA & WEIGHTS):
    ${JSON.stringify(blueprint, null, 2)}
    
    INSTRUCTIONS:
    1. Score each criterion 0-Max Weight based on the blueprint.
    2. Be critical. Vague content should get low scores.
    3. Calculate total score out of 150.
    4. CRITICAL: Analyze the provided SLIDE IMAGES for content, diagrams, and flow. The text provided might be sparse.
    5. Identify missing critical sections (e.g., No tech stack, no problem statement).
    6. Provide a verdict: SHORTLIST if Total >= 100, else REJECT.
    6. Return ONLY valid JSON matching this schema:
    {
      "scores": { "problem_understanding": number, "solution_approach": number, "innovation": number, "technical_feasibility": number, "presentation_quality": number },
      "total_score": number,
      "missing_sections": string[],
      "strengths": string[],
      "weaknesses": string[],
      "verdict": "SHORTLIST" | "REJECT",
      "confidence": number (0-1)
    }
  `;

    const parts = [
        { text: promptText },
        { text: `PPT TEXT CONTENT:\n${pptData.text}` },
        ...pptData.images
    ];

    for (const modelName of modelsToTry) {
        console.log(`Attempting evaluation with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const MAX_RETRIES = 2; // Reduced retries to fail fast
        let attempt = 0;

        while (attempt <= MAX_RETRIES) {
            try {
                // Determine timeout based on model priority (longer for better models)
                const timeoutMs = 30000; // Increased to 30s for multimodal

                // wrapper to add timeout to fetch
                const result = await Promise.race([
                    model.generateContent(parts),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs))
                ]) as any;

                const response = await result.response;
                const text = response.text();

                // Clean up markdown code blocks if present
                const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

                return JSON.parse(cleanText);
            } catch (error: any) {
                console.error(`Model ${modelName} Attempt ${attempt + 1} failed:`, error.message);

                // Check for Rate Limit (429)
                if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
                    attempt++;

                    // Parse retry delay from error message
                    const delayStr = error.message.match(/retry in ([\d\.]+)s/)?.[1];
                    const delayMs = delayStr ? Math.ceil(parseFloat(delayStr) * 1000) : 2000;

                    // CRITICAL: If delay is too long (> 5s), DO NOT WAIT. Skip to next model immediately.
                    // This is essential for free tier which often gives 60s+ cooldowns.
                    if (delayMs > 5000) {
                        console.warn(`Rate limit delay (${delayMs}ms) too high for model ${modelName}. Skipping directly to next model.`);
                        break; // Break inner loop, next model in outer loop will run
                    }

                    if (attempt > MAX_RETRIES) {
                        console.warn(`Model ${modelName} exhausted retries. Switching...`);
                        break;
                    }

                    console.log(`Waiting ${delayMs}ms before retry...`);
                    await new Promise(res => setTimeout(res, delayMs + 500));
                } else {
                    // Non-retriable error (e.g. 404, bad format, timeout)
                    console.warn(`Model ${modelName} failed with non-retriable error (or timeout). Switching...`);
                    break;
                }
            }
        }
    }

    throw new Error("All AI models failed or rate limited. Please try again later.");
}
