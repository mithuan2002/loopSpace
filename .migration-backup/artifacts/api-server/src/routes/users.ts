import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// Helper: get or JIT-provision the local user row from a Clerk session
async function getOrCreateUser(clerkId: string, email: string) {
  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId));
  if (existing) return existing;

  const [created] = await db
    .insert(usersTable)
    .values({ clerkId, email })
    .returning();
  return created;
}

// Middleware that requires auth and attaches local user
async function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Get email from Clerk session claims
    const emailClaim =
      (auth?.sessionClaims?.email as string) ||
      (auth?.sessionClaims?.["email_address"] as string) ||
      "";
    const user = await getOrCreateUser(clerkId, emailClaim);
    req.localUser = user;
    next();
  } catch (err) {
    logger.error({ err }, "Failed to provision local user");
    res.status(500).json({ error: "Internal server error" });
  }
}

// Export for use by other routes
export { requireAuth };

router.get("/users/me", requireAuth, async (req: any, res): Promise<void> => {
  res.json(req.localUser);
});

router.put("/users/me", requireAuth, async (req: any, res): Promise<void> => {
  const { name, avatarUrl } = req.body;
  const [updated] = await db
    .update(usersTable)
    .set({ name, avatarUrl })
    .where(eq(usersTable.id, req.localUser.id))
    .returning();
  res.json(updated);
});

export default router;
