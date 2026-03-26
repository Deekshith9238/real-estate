import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { authStorage } from "./storage";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { users } from "@shared/models/auth";

const hasOidcEnv = Boolean(process.env.REPL_ID) && Boolean(process.env.SESSION_SECRET);

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const secret = process.env.SESSION_SECRET ?? "dev-session-secret";
  const secureCookie = process.env.NODE_ENV === "production";

  const sessionStore = process.env.DATABASE_URL
    ? new (connectPg(session))({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    })
    : new (createMemoryStore(session))({
      checkPeriod: sessionTtl,
    });

  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: secureCookie,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local/dev convenience: if OIDC isn't configured, don't crash the server.
  // Instead, run in a "dev auth" mode with a fixed user.
  if (!hasOidcEnv && process.env.NODE_ENV !== "production") {
    const devUserClaims = {
      sub: "dev-user",
      email: "dev@example.com",
      first_name: "Dev",
      last_name: "User",
      profile_image_url: null,
      exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60, // ~10 years
    };

    await authStorage.upsertUser({
      id: devUserClaims.sub,
      email: devUserClaims.email,
      firstName: devUserClaims.first_name,
      lastName: devUserClaims.last_name,
      profileImageUrl: devUserClaims.profile_image_url,
    });

    // We'll keep the dev user for simplicity in some contexts, but we won't return early
    // so that our LocalStrategy and custom routes can be registered.
    /*
    app.use((req: any, _res, next) => {
      req.isAuthenticated = () => true;
      req.user = {
        claims: devUserClaims,
        expires_at: devUserClaims.exp,
        access_token: "dev",
        refresh_token: "dev",
      };
      next();
    });
    */

    // app.get("/api/login", (_req, res) => res.redirect("/")); // Conflicting with our new route
    app.get("/api/callback", (_req, res) => res.redirect("/"));
    app.get("/api/callback/dev", (_req, res) => res.redirect("/"));
    /*
    app.get("/api/logout", (req, res) => {
      // express-session cleanup
      req.session?.destroy(() => res.redirect("/"));
    });
    */
  }

  passport.serializeUser((user: any, cb) => {
    cb(null, user.id);
  });

  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await authStorage.getUser(id);
      cb(null, user);
    } catch (err) {
      cb(err);
    }
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await authStorage.getUserByUsername(username);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Keep OIDC routes for compatibility if env exists
  if (hasOidcEnv) {
    const config = await getOidcConfig();
    const verifyOidc: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const claims = tokens.claims();
      if (!claims) {
        return verified(new Error("No claims found in token"), null);
      }
      const user = await authStorage.upsertUser({
        id: claims["sub"] as string,
        email: claims["email"] as string,
        firstName: claims["first_name"] as string,
        lastName: claims["last_name"] as string,
        profileImageUrl: claims["profile_image_url"] as string,
      });
      verified(null, user);
    };

    const registeredStrategies = new Set<string>();
    const ensureStrategy = (domain: string) => {
      const strategyName = `replitauth:${domain}`;
      if (!registeredStrategies.has(strategyName)) {
        const strategy = new Strategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verifyOidc
        );
        passport.use(strategy);
        registeredStrategies.add(strategyName);
      }
    };

    app.get("/api/login/oidc", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/auth",
      })(req, res, next);
    });
  }

  // Seed default admin user
  (async () => {
    try {
      const adminUser = await authStorage.getUserByUsername("admin");
      if (!adminUser) {
        console.log("Seeding default admin user...");
        const hashedPassword = await bcrypt.hash("Nri@2026", 10);
        await authStorage.upsertUser({
          username: "admin",
          password: hashedPassword,
          role: "admin",
          email: "admin@nripropservices.com",
          firstName: "Admin",
          lastName: "User",
        });
        console.log("Default admin user created.");
      } else if (adminUser.role !== "admin") {
        console.log("Fixing admin role for existing admin user...");
        const hashedPassword = await bcrypt.hash("Nri@2026", 10);
        await authStorage.upsertUser({
          id: adminUser.id,
          username: "admin",
          password: hashedPassword,
          role: "admin",
          email: "admin@nripropservices.com",
          firstName: "Admin",
          lastName: "User",
        });
        console.log("Admin role fixed.");
      }
    } catch (err) {
      console.error("Error seeding admin user:", err);
    }
  })();
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!hasOidcEnv && process.env.NODE_ENV !== "production") {
    return next();
  }

  const user = req.user as any;
  if (!user || !user.expires_at) {
    // If it's a local user (no expires_at), they might still be valid
    if (user && !user.claims) return next();
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
