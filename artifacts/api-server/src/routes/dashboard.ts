import { Router, type IRouter } from "express";
import { eq, and, count, sql } from "drizzle-orm";
import { db, projectsTable, pagesTable, feedbackTable } from "@workspace/db";
import { requireAuth } from "./users";

const router: IRouter = Router();

function parseId(raw: string | string[]): number {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return parseInt(s, 10);
}

router.get("/projects/:projectId/dashboard", requireAuth, async (req: any, res): Promise<void> => {
  const projectId = parseId(req.params.projectId);

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, req.localUser.id)));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  // Aggregate counts
  const [totalRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(eq(feedbackTable.projectId, projectId));

  const [openRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.projectId, projectId), eq(feedbackTable.status, "open")));

  const [inProgressRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.projectId, projectId), eq(feedbackTable.status, "in_progress")));

  const [fixedRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.projectId, projectId), eq(feedbackTable.status, "fixed")));

  const [ignoredRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(eq(feedbackTable.projectId, projectId), eq(feedbackTable.status, "ignored")));

  // Per-page breakdown
  const pages = await db
    .select()
    .from(pagesTable)
    .where(eq(pagesTable.projectId, projectId));

  const byPage = await Promise.all(
    pages.map(async (page: (typeof pages)[number]) => {
      const [total] = await db.select({ count: count() }).from(feedbackTable).where(eq(feedbackTable.pageId, page.id));
      const [open] = await db.select({ count: count() }).from(feedbackTable).where(and(eq(feedbackTable.pageId, page.id), eq(feedbackTable.status, "open")));
      const [inProg] = await db.select({ count: count() }).from(feedbackTable).where(and(eq(feedbackTable.pageId, page.id), eq(feedbackTable.status, "in_progress")));
      const [fixed] = await db.select({ count: count() }).from(feedbackTable).where(and(eq(feedbackTable.pageId, page.id), eq(feedbackTable.status, "fixed")));
      const [ignored] = await db.select({ count: count() }).from(feedbackTable).where(and(eq(feedbackTable.pageId, page.id), eq(feedbackTable.status, "ignored")));
      return {
        pageId: page.id,
        pageName: page.name,
        total: total?.count ?? 0,
        open: open?.count ?? 0,
        inProgress: inProg?.count ?? 0,
        fixed: fixed?.count ?? 0,
        ignored: ignored?.count ?? 0,
      };
    }),
  );

  // Recent feedback (last 10)
  const recentFeedback = await db
    .select()
    .from(feedbackTable)
    .where(eq(feedbackTable.projectId, projectId))
    .orderBy(sql`${feedbackTable.createdAt} desc`)
    .limit(10);

  res.json({
    projectId: project.id,
    projectName: project.name,
    totalFeedback: totalRow?.count ?? 0,
    openCount: openRow?.count ?? 0,
    inProgressCount: inProgressRow?.count ?? 0,
    fixedCount: fixedRow?.count ?? 0,
    ignoredCount: ignoredRow?.count ?? 0,
    byPage,
    recentFeedback,
  });
});

router.get("/dashboard/summary", requireAuth, async (req: any, res): Promise<void> => {
  const userId = req.localUser.id;

  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId));

  const projectIds = projects.map((p: (typeof projects)[number]) => p.id);

  if (projectIds.length === 0) {
    res.json({
      totalProjects: 0,
      totalFeedback: 0,
      openCount: 0,
      inProgressCount: 0,
      fixedCount: 0,
      ignoredCount: 0,
      topProjects: [],
    });
    return;
  }

  // Use sql.raw with inArray
  const { inArray } = await import("drizzle-orm");

  const [totalFeedbackRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(inArray(feedbackTable.projectId, projectIds));

  const [openRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(inArray(feedbackTable.projectId, projectIds), eq(feedbackTable.status, "open")));

  const [inProgressRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(inArray(feedbackTable.projectId, projectIds), eq(feedbackTable.status, "in_progress")));

  const [fixedRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(inArray(feedbackTable.projectId, projectIds), eq(feedbackTable.status, "fixed")));

  const [ignoredRow] = await db
    .select({ count: count() })
    .from(feedbackTable)
    .where(and(inArray(feedbackTable.projectId, projectIds), eq(feedbackTable.status, "ignored")));

  // Enrich top projects with counts
  const enriched = await Promise.all(
    projects.slice(0, 5).map(async (project: (typeof projects)[number]) => {
      const [pageRow] = await db.select({ count: count() }).from(pagesTable).where(eq(pagesTable.projectId, project.id));
      const [feedRow] = await db.select({ count: count() }).from(feedbackTable).where(eq(feedbackTable.projectId, project.id));
      const [openR] = await db.select({ count: count() }).from(feedbackTable).where(and(eq(feedbackTable.projectId, project.id), eq(feedbackTable.status, "open")));
      return {
        ...project,
        pageCount: pageRow?.count ?? 0,
        feedbackCount: feedRow?.count ?? 0,
        openCount: openR?.count ?? 0,
      };
    }),
  );

  res.json({
    totalProjects: projects.length,
    totalFeedback: totalFeedbackRow?.count ?? 0,
    openCount: openRow?.count ?? 0,
    inProgressCount: inProgressRow?.count ?? 0,
    fixedCount: fixedRow?.count ?? 0,
    ignoredCount: ignoredRow?.count ?? 0,
    topProjects: enriched,
  });
});

export default router;
