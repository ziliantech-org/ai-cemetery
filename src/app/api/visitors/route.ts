import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  const count = db.getVisitors();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = db.incrementVisitors();
  return NextResponse.json({ count });
}
