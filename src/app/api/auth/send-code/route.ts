import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { generateCode } from '@/lib/auth';
import { sendVerificationEmail, isSmtpConfigured } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const code = generateCode();
  db.createVerificationCode(email.toLowerCase(), code);

  try {
    await sendVerificationEmail(email.toLowerCase(), code);
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  // Dev mode: return code directly so the frontend can auto-fill it
  if (!isSmtpConfigured()) {
    return NextResponse.json({ ok: true, devCode: code });
  }

  return NextResponse.json({ ok: true });
}
