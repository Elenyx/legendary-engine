import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import { authService } from './auth';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';

export function setupDiscordOAuth() {
  passport.use(new DiscordStrategy({
    clientID: DISCORD_CLIENT_ID,
    clientSecret: DISCORD_CLIENT_SECRET,
    callbackURL: "/api/auth/discord/callback",
    scope: ["identify", "email"]
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await authService.validateDiscordUser(profile);
      return done(null, user);
    } catch (error) {
      console.error('Discord OAuth error:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await authService.refreshUserData(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export function getDiscordLoginURL(state?: string): string {
  const baseURL = 'https://discord.com/api/oauth2/authorize';
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/discord/callback',
    response_type: 'code',
    scope: 'identify email',
  });

  if (state) {
    params.append('state', state);
  }

  return `${baseURL}?${params.toString()}`;
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

export function optionalAuth(req: any, res: any, next: any) {
  // Continue regardless of auth status
  next();
}
