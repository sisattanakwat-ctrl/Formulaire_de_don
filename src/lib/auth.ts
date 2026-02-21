import { PrismaClient } from '@prisma/client';
import { db } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

// JWT Secret (en production, utiliser un secret sécurisé)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Type pour le payload JWT
interface JWTPayload {
  userId: string;
  email: string;
  name: string | null;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  const token = JSON.stringify(payload);
  const signature = crypto
    .createHmac('sha256', JWT_SECRET, 'utf8')
    .update(token, 'utf8')
    .digest('hex');

  return `${token}.${signature}`;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const [tokenEncoded, signature] = token.split('.');
    
    if (tokenEncoded.length !== 3 || signature.length !== 64) {
      return null;
    }
    
    const decoded = Buffer.from(tokenEncoded, 'base64').toString('utf8');
    const payloadString = decoded.slice(0, decoded.length - signature.length - 1);
    
    const payload = JSON.parse(payloadString);
    
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export async function createSession(userId: string, userRole: string) {
  const payload: JWTPayload = {
    userId,
    email: (await db.user.findUnique({ where: { id: userId } }))!.email!,
    name: (await db.user.findUnique({ where: { id: userId } }))!.name!,
    role: userRole,
  };

  const token = signToken(payload);

  return {
    userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    token,
  };
}
