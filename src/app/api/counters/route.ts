import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

const VALID_TYPES = ['candles', 'flowers', 'respects'] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const modelId = searchParams.get('modelId');
  const type = searchParams.get('type');

  if (!modelId) {
    return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
  }

  if (type) {
    if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    const count = db.getCounter(modelId, type as typeof VALID_TYPES[number]);
    return NextResponse.json({ modelId, type, count });
  }

  const counters = db.getAllCounters(modelId);
  return NextResponse.json({ modelId, counters });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { modelId, type } = body;

  if (!modelId || !type) {
    return NextResponse.json(
      { error: 'modelId and type are required' },
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const count = db.incrementCounter(modelId, type);
  return NextResponse.json({ modelId, type, count });
}
