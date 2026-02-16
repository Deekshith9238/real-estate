import { db } from "./db";
import {
  consultationRequests, messages, users,
  type ConsultationRequest, type InsertConsultationRequest,
  type Message, type InsertMessage,
  type User
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

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

export const storage = new DatabaseStorage();
