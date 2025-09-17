import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "your_discord_client_id";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "your_discord_client_secret";
const SESSION_SECRET = process.env.SESSION_SECRET || "your_session_secret";

// Configure Discord OAuth2
passport.use(new DiscordStrategy({
  clientID: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackURL: "/api/auth/discord/callback",
  scope: ["identify", "email"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await storage.getUserByDiscordId(profile.id);
    
    if (!user) {
      user = await storage.createUser({
        discordId: profile.id,
        username: profile.username,
        avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
      });
      
      // Create default ship for new user
      await storage.createShip({
        userId: user.id,
        name: `${user.username}'s Explorer`,
        shipType: "explorer",
      });
    } else {
      // Update user info
      await storage.updateUser(user.id, {
        username: profile.username,
        avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
        lastActive: new Date(),
      });
    }
    
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration
  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Authentication required" });
  };

  // Auth routes
  app.get("/api/auth/discord", passport.authenticate("discord"));
  
  app.get("/api/auth/discord/callback", 
    passport.authenticate("discord", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // User routes
  app.get("/api/users/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser((req.user as any).id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  app.get("/api/users/leaderboard", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topPlayers = await storage.getTopPlayersByRank(limit);
      res.json(topPlayers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Ship routes
  app.get("/api/ships/my-ships", requireAuth, async (req, res) => {
    try {
      const ships = await storage.getUserShips((req.user as any).id);
      res.json(ships);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ships" });
    }
  });

  app.get("/api/ships/active", requireAuth, async (req, res) => {
    try {
      const ship = await storage.getActiveShip((req.user as any).id);
      if (!ship) {
        return res.status(404).json({ error: "No active ship found" });
      }
      res.json(ship);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active ship" });
    }
  });

  // Market routes
  app.get("/api/market/listings", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const listings = await storage.getActiveMarketListings(limit, offset);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market listings" });
    }
  });

  app.get("/api/market/my-listings", requireAuth, async (req, res) => {
    try {
      const listings = await storage.getUserMarketListings((req.user as any).id);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user listings" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", requireAuth, async (req, res) => {
    try {
      const inventory = await storage.getUserInventory((req.user as any).id);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  // Battle routes
  app.get("/api/battles/history", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const battles = await storage.getUserBattles((req.user as any).id, limit);
      res.json(battles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch battle history" });
    }
  });

  // Exploration routes
  app.get("/api/explorations/history", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const explorations = await storage.getUserExplorations((req.user as any).id, limit);
      res.json(explorations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exploration history" });
    }
  });

  // Statistics routes
  app.get("/api/stats/global", async (req, res) => {
    try {
      const stats = await storage.getGlobalStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch global statistics" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        // Handle different message types
        switch (data.type) {
          case 'subscribe_to_market':
            // Subscribe to market updates
            break;
          case 'subscribe_to_battles':
            // Subscribe to battle updates
            break;
          default:
            ws.send(JSON.stringify({ error: 'Unknown message type' }));
        }
      } catch (error) {
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected', message: 'Welcome to Nexium RPG!' }));
  });

  return httpServer;
}
