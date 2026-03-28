import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const modelId = searchParams.get('modelId');
  const count = parseInt(searchParams.get('count') || '20', 10);

  if (!modelId) {
    return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
  }

  const eulogies = db.getEulogies(modelId, Math.min(count, 100));
  return NextResponse.json({
    modelId,
    eulogies: eulogies.map((e) => ({
      id: e.id,
      modelId: e.model_id,
      text: e.text,
      createdAt: e.created_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { modelId, text } = body;

  if (!modelId || !text?.trim()) {
    return NextResponse.json(
      { error: 'modelId and text are required' },
      { status: 400 }
    );
  }

  const eulogy = db.addEulogy(modelId, text.trim());
  return NextResponse.json({
    id: eulogy.id,
    modelId: eulogy.model_id,
    text: eulogy.text,
    createdAt: eulogy.created_at,
  });
}
