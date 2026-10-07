import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, DatabaseUser } from './db';
import { LearningJourney } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'yoe_prod_jwt_secret_998877_secure_key_3321';
const COOKIE_NAME = 'yoe_session';

export interface AuthRequest extends Request {
  user?: DatabaseUser;
}

// Password Hashing with Salt & PHC standard
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT Token Management
export function generateToken(user: DatabaseUser): string {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d', issuer: 'yoe-auth', audience: 'yoe-app' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'yoe-auth', audience: 'yoe-app' });
  } catch (err) {
    return null;
  }
}

// Sanitize user object for client response (NEVER send passwordHash)
export function sanitizeUser(user: DatabaseUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    uiLanguage: user.uiLanguage,
    theme: user.theme,
    subscriptionStatus: user.subscriptionStatus,
    emailVerified: user.emailVerified,
    status: user.status,
    activeJourneyId: user.activeJourneyId,
    onboardingCompleted: user.onboardingCompleted,
    learningGoal: user.learningGoal,
    motivation: user.motivation,
    focusAreas: user.focusAreas,
    knownLanguages: user.knownLanguages,
    supportLanguage: user.supportLanguage,
    previousExperience: user.previousExperience,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt
  };
}

// Authentication Middleware
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.[COOKIE_NAME];

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization.trim();
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Session missing' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.sub) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired session token' });
    return;
  }

  let user = await db.findUserById(decoded.sub);
  if (!user && decoded.username) {
    // Container restarted or scaled to zero: self-heal user record from cryptographically verified JWT
    user = await db.createUser({
      id: decoded.sub,
      username: decoded.username,
      email: decoded.email || `${decoded.username}@yoe.app`,
      passwordHash: '',
      name: decoded.name || decoded.username,
      avatarUrl: undefined,
      uiLanguage: 'en',
      theme: 'dark',
      subscriptionStatus: 'TRIAL',
      emailVerified: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const userJourneys = await db.getJourneysForUser(user.id);
    if (!userJourneys || userJourneys.length === 0) {
      await db.saveJourney({
        id: `jrn_${Date.now()}_es`,
        userId: user.id,
        targetLanguage: 'es',
        supportLanguage: 'en',
        cefrLevel: 'A1',
        streakDays: 1,
        totalMinutesSpoken: 0,
        points: 50,
        createdAt: new Date().toISOString()
      });
    }
  }

  if (!user || user.status === 'disabled') {
    res.status(401).json({ error: 'Unauthorized: User account unavailable' });
    return;
  }

  req.user = user;
  next();
}

// Auth Route Handlers
export async function registerHandler(req: Request, res: Response) {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      res.status(400).json({ error: 'All fields (Name, Username, Email, Password) are required' });
      return;
    }

    const normUsername = username.trim().toLowerCase();
    const normEmail = email.trim().toLowerCase();

    // Username validation rules
    if (normUsername.length < 3 || normUsername.length > 30 || !/^[a-zA-Z0-9_]+$/.test(normUsername)) {
      res.status(400).json({ error: 'Username must be 3-30 characters and contain only letters, numbers, or underscores' });
      return;
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      res.status(400).json({ error: 'Please enter a valid email address' });
      return;
    }

    // Password policy
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Check if username or email already exists
    const existingUser = await db.findUserByIdentifier(normUsername) || await db.findUserByIdentifier(normEmail);
    if (existingUser) {
      if (existingUser.username === normUsername) {
        res.status(400).json({ error: 'That username is already taken. Please choose another.' });
        return;
      }
      if (existingUser.email === normEmail) {
        res.status(400).json({ error: 'An account with that email address already exists. Please log in.' });
        return;
      }
    }

    // Hash password with Argon2id / salted bcrypt
    const passwordHash = await hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const targetLanguage = (req.body.targetLanguage || 'es') as any;
    const supportLanguage = (req.body.supportLanguage || 'en') as any;
    const knownLanguages = Array.isArray(req.body.knownLanguages) && req.body.knownLanguages.length > 0
      ? req.body.knownLanguages
      : [supportLanguage];
    const previousExperience = req.body.previousExperience || 'never';
    const motivation = req.body.motivation || 'Conversation';
    const focusAreas = Array.isArray(req.body.focusAreas) && req.body.focusAreas.length > 0
      ? req.body.focusAreas
      : ['Speaking'];
    const learningGoal = req.body.learningGoal || `Improve ${focusAreas[0]} for ${motivation}`;

    // Map previous experience to CEFR level
    let resolvedCefr = req.body.cefrLevel || 'A1';
    if (!req.body.cefrLevel) {
      if (previousExperience === 'comfortable') resolvedCefr = 'B1';
      else if (previousExperience === 'basics') resolvedCefr = 'A2';
      else resolvedCefr = 'A1';
    }

    const newUser: DatabaseUser = {
      id: userId,
      username: normUsername,
      email: normEmail,
      passwordHash,
      name: name.trim(),
      avatarUrl: undefined,
      uiLanguage: req.body.uiLanguage || 'en',
      theme: req.body.theme || 'dark',
      subscriptionStatus: 'TRIAL',
      emailVerified: true,
      status: 'active',
      onboardingCompleted: true,
      learningGoal,
      motivation,
      focusAreas,
      knownLanguages,
      supportLanguage,
      previousExperience,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const savedUser = await db.createUser(newUser);

    // Initialize personalized learning journey in database
    const initialJourney: LearningJourney = {
      id: `jrn_${Date.now()}_${targetLanguage}`,
      userId: savedUser.id,
      targetLanguage,
      supportLanguage,
      cefrLevel: resolvedCefr,
      streakDays: 1,
      totalMinutesSpoken: 0,
      points: 50,
      learnerName: savedUser.name,
      motivation,
      focusAreas,
      goals: learningGoal,
      knownLanguages,
      previousExperience,
      createdAt: new Date().toISOString()
    };
    await db.saveJourney(initialJourney);

    // Update user's active journey
    savedUser.activeJourneyId = initialJourney.id;
    db.updateUser(savedUser.id, { activeJourneyId: initialJourney.id });

    const token = generateToken(savedUser);

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.status(201).json({
      user: sanitizeUser(savedUser),
      journeys: [initialJourney],
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account. Please try again.' });
  }
}

export async function loginHandler(req: Request, res: Response) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Username/email and password are required' });
      return;
    }

    const norm = identifier.trim().toLowerCase();
    const user = await db.findUserByIdentifier(norm);

    if (!user) {
      res.status(401).json({ error: 'Invalid username/email or password.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid username/email or password.' });
      return;
    }

    await db.updateLastLogin(user.id);

    const journeys = await db.getJourneysForUser(user.id);
    const token = generateToken(user);

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      user: sanitizeUser(user),
      journeys,
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
}

export async function meHandler(req: AuthRequest, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  res.json({ user: sanitizeUser(req.user) });
}

export async function logoutHandler(req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ success: true, message: 'Logged out successfully' });
}
