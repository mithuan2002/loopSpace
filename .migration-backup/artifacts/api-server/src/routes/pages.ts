import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, projectsTable, pagesTable, feedbackTable } from "@workspace/db";
import { requireAuth } from "./users";
import crypto from "crypto";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

function buildIframeUrl(token: string): string {
  const base = process.env.APP_BASE_URL || "";
  return `${base}/feedback/submit/${token}`;
}

async function enrichPage(page: typeof pagesTable.$inferSelect) {
  const [feedbackRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(eq(feedbackTable.pageId, page.id));

  const [openRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.pageId, page.id), eq(feedbackTable.status, "open")));

  return {
    ...page,
    iframeUrl: buildIframeUrl(page.iframeToken),
    feedbackCount: feedbackRow?.count ?? 0,
    openCount: openRow?.count ?? 0,
  };
}

// Verify project belongs to user
async function getOwnedProject(userId: number, projectId: number) {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)));
  return project;
}

router.get("/projects/:projectId/pages", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const project = await getOwnedProject(req.localUser.id, projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const pages = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.projectId, projectId))
    .orderBy(pagesTable.createdAt);

  const enriched = await Promise.all(pages.map(enrichPage));
  res.json(enriched);
});

router.post("/projects/:projectId/pages", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const project = await getOwnedProject(req.localUser.id, projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  const iframeToken = crypto.randomBytes(16).toString("hex");
  const [page] = await db
    .insert(pagesTable)
    .values({ projectId, name, description, iframeToken })
    .returning();

  res.status(201).json(await enrichPage(page));
});

router.get("/projects/:projectId/pages/:pageId", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const pageId = parseId(req.params.pageId);

  const project = await getOwnedProject(req.localUser.id, projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [page] = await db
    .select()
    .from(pagesTable)
    .where(and(eq(pagesTable.id, pageId), eq(pagesTable.projectId, projectId)));

  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json(await enrichPage(page));
});

router.patch("/projects/:projectId/pages/:pageId", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const pageId = parseId(req.params.pageId);

  const project = await getOwnedProject(req.localUser.id, projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const { name, description } = req.body;
  const [page] = await db
    .update(pagesTable)
    .set({ name, description })
    .where(and(eq(pagesTable.id, pageId), eq(pagesTable.projectId, projectId)))
    .returning();

  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.json(await enrichPage(page));
});

router.delete("/projects/:projectId/pages/:pageId", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const pageId = parseId(req.params.pageId);

  const project = await getOwnedProject(req.localUser.id, projectId);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [page] = await db
    .delete(pagesTable)
    .where(and(eq(pagesTable.id, pageId), eq(pagesTable.projectId, projectId)))
    .returning();

  if (!page) {
    res.status(404).json({ error: "Page not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
