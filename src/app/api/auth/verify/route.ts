import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { generateToken, maskEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code required' }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase();
  const valid = db.verifyCode(normalizedEmail, code);

  if (!valid) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
  }

  const user = db.findOrCreateUser(normalizedEmail);
  const token = generateToken();
  db.createSession(user.id, token);

  const res = NextResponse.json({
    user: { id: user.id, email: maskEmail(user.email) },
  });

  res.cookies.set('session_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return res;
}
