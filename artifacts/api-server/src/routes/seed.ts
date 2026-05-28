import bcrypt from "bcryptjs";
import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const SALT_ROUNDS = 12;
const router: IRouter = Router();

router.post("/admin/seed", async (req: Request, res: Response) => {
  const { secret, email, password, firstName, lastName } = req.body;

  const seedSecret = process.env.SEED_SECRET;
  if (!seedSecret || secret !== seedSecret) {
    res.status(401).json({ error: "Invalid or missing seed secret" });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()))
    .limit(1);

  if (existing.length > 0) {
    const u = existing[0]!;
    if (!u.isAdmin) {
      await db
        .update(usersTable)
        .set({ isAdmin: true })
        .where(eq(usersTable.id, u.id));
    }
    res.json({
      message: "User already exists — promoted to admin",
      email: u.email,
      alreadyExisted: true,
    });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: email.toLowerCase(),
      firstName: firstName || null,
      lastName: lastName || null,
      passwordHash,
      isAdmin: true,
    })
    .returning();

  res.status(201).json({
    message: "Admin user created successfully",
    email: user!.email,
    alreadyExisted: false,
  });
});

export default router;
