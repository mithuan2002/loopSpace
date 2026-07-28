import { Router, type IRouter } from "express";
import { eq, and, count, sql } from "drizzle-orm";
import { db, projectsTable, pagesTable, feedbackTable } from "@workspace/db";
import { requireAuth } from "./users";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

// Enrich a project row with counts
async function enrichProject(project: typeof projectsTable.$inferSelect) {
  const [pageRow] = await db
    .select({ count: count() })
    .from(pagesTable)
    .where(eq(pagesTable.projectId, project.id));

  const [feedbackRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(eq(feedbackTable.projectId, project.id));

  const [openRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.projectId, project.id), eq(feedbackTable.status, "open")));

  return {
    ...project,
    pageCount: pageRow?.count ?? 0,
    feedbackCount: feedbackRow?.count ?? 0,
    openCount: openRow?.count ?? 0,
  };
}

router.get("/projects", requireAuth, async (req: any, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, req.localUser.id))
    .orderBy(sql`${projectsTable.updatedAt} desc`);

  const enriched = await Promise.all(projects.map(enrichProject));
  res.json(enriched);
});

router.post("/projects", requireAuth, async (req: any, res): Promise<void> => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }
  const [project] = await db
    .insert(projectsTable)
    .values({ userId: req.localUser.id, name, description })
    .returning();
  res.status(201).json(await enrichProject(project));
});

router.get("/projects/:projectId", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.localUser.id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(await enrichProject(project));
});

router.patch("/projects/:projectId", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);
  const { name, description } = req.body;

  const [project] = await db
    .update(projectsTable)
    .set({ name, description })
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.localUser.id)))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(await enrichProject(project));
});

router.delete("/projects/:projectId", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);

  const [project] = await db
    .delete(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.localUser.id)))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
