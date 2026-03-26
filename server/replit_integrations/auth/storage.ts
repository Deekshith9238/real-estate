import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq } from "drizzle-orm";

const hasDatabase = Boolean(process.env.DATABASE_URL);
const memoryUsers = new Map<string, User>();

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    if (!hasDatabase) {
      return memoryUsers.get(id);
    }
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!hasDatabase) {
      return Array.from(memoryUsers.values()).find(u => u.username === username);
    }
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!hasDatabase) {
      const existing = memoryUsers.get(userData.id as string);
      const now = new Date();
      const merged: User = {
        id: (userData.id as string) ?? existing?.id ?? crypto.randomUUID(),
        username: userData.username ?? existing?.username ?? null,
        password: userData.password ?? existing?.password ?? null,
        role: userData.role ?? existing?.role ?? "client",
        email: userData.email ?? existing?.email ?? null,
        firstName: userData.firstName ?? existing?.firstName ?? null,
        lastName: userData.lastName ?? existing?.lastName ?? null,
        profileImageUrl: userData.profileImageUrl ?? existing?.profileImageUrl ?? null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      memoryUsers.set(merged.id, merged);
      return merged;
    }
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const authStorage = new AuthStorage();
