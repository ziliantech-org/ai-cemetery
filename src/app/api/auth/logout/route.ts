import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as db from '@/lib/db';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;

  if (token) {
    db.deleteSession(token);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('session_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
