import { db } from "./db";
import {
  consultationRequests, messages, users,
  type ConsultationRequest, type InsertConsultationRequest,
  type Message, type InsertMessage,
  type User
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Consultations
  getConsultationRequests(userId: string, isAdmin?: boolean): Promise<(ConsultationRequest & { user: User })[]>;
  getConsultationRequest(id: number): Promise<(ConsultationRequest & { user: User }) | undefined>;
  createConsultationRequest(userId: string, request: InsertConsultationRequest): Promise<ConsultationRequest>;
  updateConsultationStatus(id: number, status: string): Promise<ConsultationRequest>;
  
  // Messages
  getMessages(consultationId: number): Promise<(Message & { sender: User })[]>;
  createMessage(senderId: string, message: InsertMessage): Promise<Message>;

  // Users (helper)
  getUser(id: string): Promise<User | undefined>;
}

const hasDatabase = Boolean(process.env.DATABASE_URL);

export class DatabaseStorage implements IStorage {
  async getConsultationRequests(userId: string, isAdmin: boolean = false): Promise<(ConsultationRequest & { user: User })[]> {
    if (isAdmin) {
      return await db.query.consultationRequests.findMany({
        orderBy: desc(consultationRequests.createdAt),
        with: { user: true },
      });
    }
    return await db.query.consultationRequests.findMany({
      where: eq(consultationRequests.userId, userId),
      orderBy: desc(consultationRequests.createdAt),
      with: { user: true },
    });
  }

  async getConsultationRequest(id: number): Promise<(ConsultationRequest & { user: User }) | undefined> {
    return await db.query.consultationRequests.findFirst({
      where: eq(consultationRequests.id, id),
      with: { user: true },
    });
  }

  async createConsultationRequest(userId: string, request: InsertConsultationRequest): Promise<ConsultationRequest> {
    const [consultation] = await db
      .insert(consultationRequests)
      .values({ ...request, userId })
      .returning();
    return consultation;
  }

  async updateConsultationStatus(id: number, status: string): Promise<ConsultationRequest> {
    const [updated] = await db
      .update(consultationRequests)
      .set({ status })
      .where(eq(consultationRequests.id, id))
      .returning();
    return updated;
  }

  async getMessages(consultationId: number): Promise<(Message & { sender: User })[]> {
    return await db.query.messages.findMany({
      where: eq(messages.consultationId, consultationId),
      orderBy: messages.createdAt,
      with: { sender: true },
    });
  }

  async createMessage(senderId: string, message: InsertMessage): Promise<Message> {
    const [msg] = await db
      .insert(messages)
      .values({ ...message, senderId })
      .returning();
    return msg;
  }

  async getUser(id: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }
}

class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private consultations: ConsultationRequest[] = [];
  private messages: Message[] = [];
  private nextConsultationId = 1;
  private nextMessageId = 1;

  private ensureUser(id: string): User {
    const existing = this.users.get(id);
    if (existing) return existing;
    const now = new Date();
    const user: User = {
      id,
      username: null,
      password: null,
      role: "client",
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async getConsultationRequests(userId: string, isAdmin: boolean = false) {
    const list = isAdmin
      ? [...this.consultations]
      : this.consultations.filter((c) => c.userId === userId);

    // newest first (match DB orderBy desc(createdAt))
    list.sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));

    return list.map((c) => ({
      ...c,
      user: this.ensureUser(c.userId),
    }));
  }

  async getConsultationRequest(id: number) {
    const found = this.consultations.find((c) => c.id === id);
    if (!found) return undefined;
    return { ...found, user: this.ensureUser(found.userId) };
  }

  async createConsultationRequest(userId: string, request: InsertConsultationRequest) {
    const now = new Date();
    this.ensureUser(userId);
    const consultation: ConsultationRequest = {
      id: this.nextConsultationId++,
      userId,
      title: request.title,
      description: request.description,
      status: "pending",
      scheduledDate: request.scheduledDate ? new Date(request.scheduledDate) : null,
      timeSlot: request.timeSlot || null,
      createdAt: now,
      updatedAt: now,
    };
    this.consultations.push(consultation);
    return consultation;
  }

  async updateConsultationStatus(id: number, status: string) {
    const idx = this.consultations.findIndex((c) => c.id === id);
    if (idx < 0) {
      throw new Error("Not found");
    }
    const updated: ConsultationRequest = {
      ...this.consultations[idx],
      status: status as any,
      updatedAt: new Date(),
    };
    this.consultations[idx] = updated;
    return updated;
  }

  async getMessages(consultationId: number) {
    const list = this.messages
      .filter((m) => m.consultationId === consultationId)
      .sort((a, b) => (a.createdAt?.getTime?.() ?? 0) - (b.createdAt?.getTime?.() ?? 0));

    return list.map((m) => ({
      ...m,
      sender: this.ensureUser(m.senderId),
    }));
  }

  async createMessage(senderId: string, message: InsertMessage) {
    const now = new Date();
    this.ensureUser(senderId);
    const msg: Message = {
      id: this.nextMessageId++,
      consultationId: message.consultationId,
      senderId,
      content: message.content,
      isRead: false,
      createdAt: now,
    };
    this.messages.push(msg);
    return msg;
  }

  async getUser(id: string) {
    return this.users.get(id);
  }
}

export const storage: IStorage = hasDatabase ? new DatabaseStorage() : new MemoryStorage();
