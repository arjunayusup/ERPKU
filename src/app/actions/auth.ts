'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSession, clearSession } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi!' };
  }

  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase().trim() },
  });

  if (!user) {
    return { error: 'Username atau password salah!' };
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    return { error: 'Username atau password salah!' };
  }

  await createSession(user);
  redirect('/dashboard');
}

export async function logoutAction() {
  await clearSession();
  redirect('/login');
}
