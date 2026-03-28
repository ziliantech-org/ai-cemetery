// API client — replaces direct Firebase SDK calls with backend API routes.
// Function signatures are preserved so components need no changes.

// --- Counter operations ---

export async function incrementCounter(
  modelId: string,
  type: 'candles' | 'flowers' | 'respects'
): Promise<number> {
  const res = await fetch('/api/counters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, type }),
  });
  const data = await res.json();
  return data.count;
}

export async function getCounter(
  modelId: string,
  type: 'candles' | 'flowers' | 'respects'
): Promise<number> {
  const res = await fetch(
    `/api/counters?modelId=${encodeURIComponent(modelId)}&type=${type}`
  );
  const data = await res.json();
  return data.count;
}

export async function getGlobalVisitors(): Promise<number> {
  const res = await fetch('/api/visitors');
  const data = await res.json();
  return data.count;
}

export async function incrementGlobalVisitors(): Promise<number> {
  const res = await fetch('/api/visitors', { method: 'POST' });
  const data = await res.json();
  return data.count;
}

// --- Eulogy operations ---

export interface Eulogy {
  id?: string | number;
  modelId: string;
  text: string;
  createdAt: Date | string | null;
}

export async function addEulogy(modelId: string, text: string): Promise<void> {
  await fetch('/api/eulogies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, text: text.slice(0, 280) }),
  });
}

export async function getEulogies(
  modelId: string,
  count = 20
): Promise<Eulogy[]> {
  const res = await fetch(
    `/api/eulogies?modelId=${encodeURIComponent(modelId)}&count=${count}`
  );
  const data = await res.json();
  return (data.eulogies ?? []).map((e: { id: number; modelId: string; text: string; createdAt: string }) => ({
    id: e.id,
    modelId: e.modelId,
    text: e.text,
    createdAt: e.createdAt ? new Date(e.createdAt) : null,
  }));
}
