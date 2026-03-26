import { db } from "./server/db";
import { users } from "./shared/models/auth";
import { eq } from "drizzle-orm";

async function fix() {
    await db.update(users).set({ role: 'admin' }).where(eq(users.username, 'admin'));
    console.log("Admin role fixed.");
    process.exit(0);
}

fix().catch(console.error);
