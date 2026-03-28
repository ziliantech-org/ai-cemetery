import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const VALID_TYPES: db.CounterType[] = ['candles', 'flowers', 'respects', 'incense'];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const modelId = searchParams.get('modelId');
  const type = searchParams.get('type');

  if (!modelId) {
    // Return totals for all models
    const totals = db.getAllModelTotals();
    return NextResponse.json({ totals });
  }

  if (type) {
    if (!VALID_TYPES.includes(type as db.CounterType)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    const count = db.getCounter(modelId, type as db.CounterType);
    return NextResponse.json({ modelId, type, count });
  }

  const counters = db.getAllCounters(modelId);
  return NextResponse.json({ modelId, counters });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const body = await request.json();
  const { modelId, type } = body;

  if (!modelId || !type) {
    return NextResponse.json({ error: 'modelId and type are required' }, { status: 400 });
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  // Rate limit: 1 action per type per model per day
  if (db.hasActedToday(user.id, modelId, type)) {
    return NextResponse.json(
      { error: 'Already done today', limited: true },
      { status: 429 }
    );
  }

  const count = db.incrementCounter(modelId, type);
  db.recordAction(user.id, modelId, type);

  return NextResponse.json({ modelId, type, count });
}
