import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import * as db from './db';

const SESSION_COOKIE = 'session_token';

export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export async function getCurrentUser(): Promise<db.UserRow | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return undefined;
  return db.getSessionUser(token);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}***@${domain}`;
}
