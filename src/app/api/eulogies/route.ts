import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { getCurrentUser, maskEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const modelId = searchParams.get('modelId');
  const count = parseInt(searchParams.get('count') || '50', 10);

  if (!modelId) {
    return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
  }

  const eulogies = db.getEulogies(modelId, Math.min(count, 200));
  return NextResponse.json({
    modelId,
    eulogies: eulogies.map((e) => ({
      id: e.id,
      modelId: e.model_id,
      parentId: e.parent_id,
      text: e.text,
      userEmail: e.user_email ? maskEmail(e.user_email) : null,
      createdAt: e.created_at,
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const body = await request.json();
  const { modelId, text, parentId } = body;

  if (!modelId || !text?.trim()) {
    return NextResponse.json({ error: 'modelId and text are required' }, { status: 400 });
  }

  const eulogy = db.addEulogy(modelId, text.trim(), user.id, parentId);
  return NextResponse.json({
    id: eulogy.id,
    modelId: eulogy.model_id,
    parentId: eulogy.parent_id,
    text: eulogy.text,
    userEmail: eulogy.user_email ? maskEmail(eulogy.user_email) : null,
    createdAt: eulogy.created_at,
  });
}
