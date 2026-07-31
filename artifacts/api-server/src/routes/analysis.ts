import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, projectsTable, feedbackTable } from "@workspace/db";
import { requireAuth } from "./users";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

// Simple in-memory cache: projectId → { data, expiresAt }
const analysisCache = new Map<number, { data: unknown; expiresAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

router.get(
  "/projects/:projectId/analysis",
  requireAuth,
  async (req: any, res): Promise<void> => {
    const projectId = parseId(req.params.projectId);

    // Verify project belongs to this user
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(
        and(
          eq(projectsTable.id, projectId),
          eq(projectsTable.userId, req.localUser.id),
        ),
      );

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Check cache
    const cached = analysisCache.get(projectId);
    if (cached && cached.expiresAt > Date.now()) {
      res.json(cached.data);
      return;
    }

    // Fetch all feedback for this project
    const allFeedback = await db
      .select()
      .from(feedbackTable)
      .where(eq(feedbackTable.projectId, projectId));

    if (allFeedback.length === 0) {
      res.status(400).json({
        error:
          "Not enough feedback to analyze. Collect at least one piece of feedback first.",
      });
      return;
    }

    // Format feedback for the prompt
    const feedbackText = allFeedback
      .map(
        (fb, i) =>
          `[${i + 1}] Title: "${fb.title}"` +
          (fb.description ? `\n    Description: "${fb.description}"` : "") +
          `\n    Priority (user-submitted): ${fb.priority}` +
          `\n    Status: ${fb.status}` +
          (fb.submitterName ? `\n    From: ${fb.submitterName}` : ""),
      )
      .join("\n\n");

    const systemPrompt = `You are a senior product analyst. Your job is to analyze raw beta user feedback for a product and give the product owner clear, honest, and actionable insights. Be direct and specific — avoid vague language. Ground every insight in the actual feedback provided. Return ONLY valid JSON, no markdown, no explanation.`;

    const userPrompt = `You are analyzing feedback for the product: "${project.name}"${project.description ? ` (${project.description})` : ""}.

Here is all the feedback collected so far (${allFeedback.length} items):

${feedbackText}

Analyze this feedback and return a JSON object with exactly this structure:
{
  "executiveSummary": "3-4 sentence summary for the product owner. What is the overall state of user satisfaction? What is the single most urgent thing to address?",
  "overallSentiment": "One of: Positive, Mixed, Neutral, Negative. Then a single sentence explaining why.",
  "topIssues": [
    {
      "title": "Short issue title (max 8 words)",
      "description": "2-3 sentences: what exactly is the problem, which users mention it, why it matters",
      "priority": "critical | high | medium | low",
      "mentionCount": <number of feedback items this relates to>
    }
  ],
  "whatUsersLove": [
    "Short specific thing users appreciate or find working well (max 12 words)"
  ],
  "suggestions": [
    {
      "title": "Short actionable suggestion title (max 8 words)",
      "description": "2-3 sentences: what to do, why it will help, any specific detail from the feedback",
      "impact": "high | medium | low"
    }
  ]
}

Rules:
- topIssues: list up to 5 issues, sorted by priority (critical first). Only include real problems, not feature requests.
- whatUsersLove: up to 4 items. If the feedback is purely negative with nothing positive, return an empty array.
- suggestions: up to 5 suggestions, sorted by impact (high first). These should be concrete actions, not vague goals.
- mentionCount must be a real number based on the feedback items provided.
- Be honest. If the feedback is mostly negative, say so clearly.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      req.log.error({ raw }, "Failed to parse OpenAI JSON response");
      res.status(500).json({ error: "Failed to parse AI response" });
      return;
    }

    const analysis = {
      projectId: project.id,
      projectName: project.name,
      feedbackCount: allFeedback.length,
      executiveSummary: parsed.executiveSummary ?? "",
      overallSentiment: parsed.overallSentiment ?? "Neutral",
      topIssues: parsed.topIssues ?? [],
      whatUsersLove: parsed.whatUsersLove ?? [],
      suggestions: parsed.suggestions ?? [],
      generatedAt: new Date().toISOString(),
    };

    // Cache it
    analysisCache.set(projectId, {
      data: analysis,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    res.json(analysis);
  },
);

export default router;
