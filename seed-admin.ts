import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./server/db";
import { users } from "./shared/models/auth";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

async function seedAdmin() {
    const username = "admin";
    const plainPassword = "Admin@123";
    const role = "admin";

    console.log(`Checking for user: ${username}...`);

    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (existingUser.length > 0) {
        console.log(`User ${username} exists. Updating password and role...`);
        await db.update(users)
            .set({ 
                password: hashedPassword, 
                role: role,
                updatedAt: new Date()
            })
            .where(eq(users.username, username));
        console.log("Admin user updated successfully.");
    } else {
        console.log(`User ${username} does not exist. Creating...`);
        await db.insert(users).values({
            id: crypto.randomUUID(),
            username,
            password: hashedPassword,
            role: role,
            email: "admin@example.com",
            firstName: "System",
            lastName: "Administrator",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log("Admin user created successfully.");
    }

    process.exit(0);
}

seedAdmin().catch((err) => {
    console.error("Error seeding admin:", err);
    process.exit(1);
});
