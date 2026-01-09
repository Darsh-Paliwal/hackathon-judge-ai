// src/lib/db.ts (or wherever this file is)

export type Submission = {
  id: number;
  team_name: string;
  team_id?: string;
  track?: string;
  filename: string;
  upload_timestamp: string;
  original_score?: number;
  final_score?: number;
  ai_verdict?: string;
  admin_verdict?: string;
  evaluation_json?: any;
  status: "pending" | "shortlisted" | "rejected" | "hold";
};

// In-memory submissions store (resets on redeploy)
export const submissions: Submission[] = [];

// Blueprint (static, in-memory)
export const blueprint = {
  problem_understanding: { weight: 30 },
  solution_approach: { weight: 30 },
  innovation: { weight: 30 },
  technical_feasibility: { weight: 30 },
  presentation_quality: { weight: 30 },
};
