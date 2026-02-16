import { db } from "./db";
import { users, consultationRequests, messages } from "@shared/schema";
import { authStorage } from "./replit_integrations/auth";
import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");
  
  // 1. Create users (Admin + Client)
  // Since we use Replit Auth, we usually rely on real users logging in.
  // However, for demo purposes, we can seed users directly into the DB.
  
  const adminId = "admin-user-1";
  const clientId = "client-user-1";
  const client2Id = "client-user-2";

  await authStorage.upsertUser({
    id: adminId,
    email: "admin@luxerealty.com",
    firstName: "Victoria",
    lastName: "Sterling",
    profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  });

  await authStorage.upsertUser({
    id: clientId,
    email: "james.bond@example.com",
    firstName: "James",
    lastName: "Bond",
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  });

  await authStorage.upsertUser({
    id: client2Id,
    email: "sarah.connor@example.com",
    firstName: "Sarah",
    lastName: "Connor",
    profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  });

  // 2. Create Consultation Requests
  const req1 = await storage.createConsultationRequest(clientId, {
    title: "Luxury Penthouse in Downtown",
    description: "Looking for a 3-bedroom penthouse with city views. Budget around $2.5M. Prefer modern style.",
    status: "active"
  });

  const req2 = await storage.createConsultationRequest(client2Id, {
    title: "Family Home in Suburbs",
    description: "We need a 4-bedroom house with a large backyard near good schools. Budget $1.2M.",
    status: "pending"
  });

  const req3 = await storage.createConsultationRequest(clientId, {
    title: "Investment Property",
    description: "Looking for a rental property with good ROI. Open to condos or small multi-family units.",
    status: "completed"
  });

  // 3. Create Messages for Active Request (req1)
  await storage.createMessage(clientId, {
    consultationId: req1.id,
    content: "Hi Victoria, I saw a few listings on your site that look interesting. Are they available?",
    isRead: true
  });

  await storage.createMessage(adminId, {
    consultationId: req1.id,
    content: "Hello James! Yes, most of them are available. Which ones specifically caught your eye?",
    isRead: true
  });

  await storage.createMessage(clientId, {
    consultationId: req1.id,
    content: "The one on 5th Avenue and the loft in SoHo.",
    isRead: false
  });

  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit());
