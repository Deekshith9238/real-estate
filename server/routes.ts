import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";
import bcrypt from "bcryptjs";
import { authStorage } from "./replit_integrations/auth/storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Hardcoded admin email for MVP
const ADMIN_EMAIL = "admin@example.com";
// In a real app, this would be a role in the database or env var.
// Since we are using Replit Auth, we rely on the email provided by the provider.
// We can also just make the first user admin, or just check specific emails.

function isAdmin(user: any) {
  if (!user) return false;
  // Support both local role and Replit email check
  if (user.role === "admin") return true;
  if (user.username === "admin") return true;
  if (user.claims?.email === ADMIN_EMAIL) return true;
  return false;
}

function getUserId(user: any) {
  return user.id || user.claims?.sub;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth first
  await setupAuth(app);


  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, role, email, firstName, lastName } = req.body;

      const existingUser = await authStorage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await authStorage.upsertUser({
        username,
        password: hashedPassword,
        role: role || "client",
        email,
        firstName,
        lastName,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Consultations
  app.get(api.consultations.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const admin = isAdmin(user);
    const userId = getUserId(user);
    const consultations = await storage.getConsultationRequests(userId, admin);
    res.json(consultations);
  });

  app.get(api.consultations.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const id = parseInt(req.params.id);
    const consultation = await storage.getConsultationRequest(id);

    if (!consultation) return res.sendStatus(404);

    // Check access
    const userId = getUserId(user);
    if (consultation.userId !== userId && !isAdmin(user)) {
      return res.sendStatus(403);
    }

    res.json(consultation);
  });

  app.post(api.consultations.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (isAdmin(user)) {
      return res.status(403).json({ message: "Admins cannot create consultation requests" });
    }
    const userId = getUserId(user);
    try {
      const input = api.consultations.create.input.parse(req.body);
      const consultation = await storage.createConsultationRequest(userId, input);
      res.status(201).json(consultation);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.patch(api.consultations.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (!isAdmin(user)) return res.sendStatus(403);

    const id = parseInt(req.params.id);
    try {
      const { status } = api.consultations.updateStatus.input.parse(req.body);
      const updated = await storage.updateConsultationStatus(id, status);
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        res.sendStatus(404);
      }
    }
  });

  // Messages
  app.get(api.messages.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const consultationId = parseInt(req.params.id);

    const consultation = await storage.getConsultationRequest(consultationId);
    if (!consultation) return res.sendStatus(404);

    const userId = getUserId(user);
    if (consultation.userId !== userId && !isAdmin(user)) {
      return res.sendStatus(403);
    }

    const messages = await storage.getMessages(consultationId);
    res.json(messages);
  });

  app.post(api.messages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const consultationId = parseInt(req.params.id);

    const consultation = await storage.getConsultationRequest(consultationId);
    if (!consultation) return res.sendStatus(404);

    const userId = getUserId(user);
    if (consultation.userId !== userId && !isAdmin(user)) {
      console.log(`User ${userId} attempted to post message to consultation ${consultationId} without access.`);
      return res.sendStatus(403);
    }

    try {
      const input = api.messages.create.input.parse(req.body);
      // Ensure the consultationId in body matches path or just override it?
      // schema has consultationId, but we are in nested route.
      // Actually schema input omits consultationId? No, insertMessageSchema includes it?
      // Let's check shared/schema.ts
      // insertMessageSchema = createInsertSchema(messages).omit({ id: true, senderId: true, isRead: true, createdAt: true });
      // It includes consultationId.

      console.log(`Creating message for consultation ${consultationId} by user ${userId}`);
      const message = await storage.createMessage(userId, {
        ...input,
        consultationId // Ensure it matches the path
      });
      res.status(201).json(message);
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.error(`Validation error creating message for consultation ${consultationId}:`, e.errors);
        res.status(400).json(e.errors);
      } else {
        console.error(`Error creating message for consultation ${consultationId}:`, e);
        throw e;
      }
    }
  });

  app.post("/api/consultations/:id/upload", upload.single("document"), async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    const consultationId = parseInt(req.params.id);

    const consultation = await storage.getConsultationRequest(consultationId);
    if (!consultation) return res.sendStatus(404);

    const userId = getUserId(user);
    if (consultation.userId !== userId && !isAdmin(user)) {
      return res.sendStatus(403);
    }

    if (!req.file) {
      return res.status(400).json({ message: "No document provided" });
    }

    try {
      const message = await storage.createMessage(userId, {
        consultationId,
        content: `Uploaded document: ${req.file.originalname}`,
        documentUrl: `/uploads/${req.file.filename}`,
        documentName: req.file.originalname,
      });
      res.status(201).json(message);
    } catch (e) {
      console.error(`Error saving uploaded document for consultation ${consultationId}:`, e);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  return httpServer;
}
