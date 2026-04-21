import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const consultationRequests = pgTable("consultation_requests", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: ["pending", "active", "completed", "rejected"] }).default("pending").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  timeSlot: text("time_slot"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").notNull().references(() => consultationRequests.id),
  senderId: text("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  documentUrl: text("document_url"),
  documentName: text("document_name"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const usersRelations = relations(users, ({ many }) => ({
  consultationRequests: many(consultationRequests),
  messages: many(messages),
}));

export const consultationRequestsRelations = relations(consultationRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [consultationRequests.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  consultation: one(consultationRequests, {
    fields: [messages.consultationId],
    references: [consultationRequests.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertConsultationRequestSchema = createInsertSchema(consultationRequests, {
  scheduledDate: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date().optional().nullable()),
}).omit({ id: true, userId: true, createdAt: true, updatedAt: true, status: true });

export const insertMessageSchema = createInsertSchema(messages)
  .omit({ id: true, senderId: true, isRead: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type ConsultationRequest = typeof consultationRequests.$inferSelect;
export type InsertConsultationRequest = z.infer<typeof insertConsultationRequestSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type CreateConsultationRequest = InsertConsultationRequest;
export type UpdateConsultationStatusRequest = { status: "active" | "completed" | "rejected" };

export type ConsultationWithUser = ConsultationRequest & { user: typeof users.$inferSelect };
export type MessageWithSender = Message & { sender: typeof users.$inferSelect };
