import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, projectsTable, pagesTable, feedbackTable } from "@workspace/db";
import { requireAuth } from "./users";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

// Public: submit feedback via iframe token
router.post("/feedback", async (req, res): Promise<void> => {
  const { pageToken, title, description, submitterName, submitterEmail, priority } = req.body;

  if (!pageToken || !title) {
    res.status(400).json({ error: "pageToken and title are required" });
    return;
  }

  const [page] = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.iframeToken, pageToken));

  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }

  const [feedback] = await db
    .insert(feedbackTable)
    .values({
      pageId: page.id,
      projectId: page.projectId,
      title,
      description: description || null,
      submitterName: submitterName || null,
      submitterEmail: submitterEmail || null,
      priority: priority || "medium",
      status: "open",
    })
    .returning();

  res.status(201).json(feedback);
});

// List all feedback for a project
router.get("/projects/:projectId/feedback", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);

  // Verify ownership
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.localUser.id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const feedback = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.projectId, projectId))
    .orderBy(feedbackTable.createdAt);

  res.json(feedback);
});

// List feedback for a specific page
router.get("/projects/:projectId/pages/:pageId/feedback", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const pageId = parseId(req.params.pageId);

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.localUser.id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const feedback = await db
    .select()
    .from(feedbackTable)
    .where(and(eq(feedbackTable.pageId, pageId), eq(feedbackTable.projectId, projectId)))
    .orderBy(feedbackTable.createdAt);

  res.json(feedback);
});

// Update feedback (status, priority, title, description)
router.patch("/feedback/:feedbackId", requireAuth, async (req: any, res): Promise<void> => {
  const feedbackId = parseId(req.params.feedbackId);
  const { title, description, priority, status } = req.body;

  // Verify ownership via project
  const [existing] = await db
    .select({ feedback: feedbackTable, project: projectsTable })
    .from(feedbackTable)
    .innerJoin(projectsTable, eq(feedbackTable.projectId, projectsTable.id))
    .where(and(eq(feedbackTable.id, feedbackId), eq(projectsTable.userId, req.localUser.id)));

  if (!existing) {
    res.status(404).json({ error: "Feedback not found" });
    return;
  }

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (priority !== undefined) updates.priority = priority;
  if (status !== undefined) updates.status = status;

  const [updated] = await db
    .update(feedbackTable)
    .set(updates)
    .where(eq(feedbackTable.id, feedbackId))
    .returning();

  res.json(updated);
});

// Delete feedback
router.delete("/feedback/:feedbackId", requireAuth, async (req: any, res): Promise<void> => {
  const feedbackId = parseId(req.params.feedbackId);

  const [existing] = await db
    .select({ feedback: feedbackTable, project: projectsTable })
    .from(feedbackTable)
    .innerJoin(projectsTable, eq(feedbackTable.projectId, projectsTable.id))
    .where(and(eq(feedbackTable.id, feedbackId), eq(projectsTable.userId, req.localUser.id)));

  if (!existing) {
    res.status(404).json({ error: "Feedback not found" });
    return;
  }

  await db.delete(feedbackTable).where(eq(feedbackTable.id, feedbackId));
  res.sendStatus(204);
});

export default router;
