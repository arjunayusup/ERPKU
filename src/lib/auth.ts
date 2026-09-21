import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserSession } from '@/types';

const SESSION_COOKIE_NAME = 'erpku_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: { id: string; username: string; name: string; role: string }) {
  const sessionData: UserSession = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as any,
  };

  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return sessionData;
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!sessionCookie?.value) return null;

  try {
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
