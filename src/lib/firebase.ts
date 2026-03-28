// API client — calls backend API routes.
// Function signatures preserved so existing component imports keep working.

// --- Counter operations ---

export type CounterType = 'candles' | 'flowers' | 'respects' | 'incense';

export interface CounterResult {
  count: number;
  limited?: boolean;
  error?: string;
}

export async function incrementCounter(
  modelId: string,
  type: CounterType
): Promise<CounterResult> {
  const res = await fetch('/api/counters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, type }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { count: -1, limited: data.limited, error: data.error };
  }
  return { count: data.count };
}

export async function getCounter(
  modelId: string,
  type: CounterType
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
  id?: number;
  modelId: string;
  parentId?: number | null;
  text: string;
  userEmail?: string | null;
  createdAt: Date | string | null;
}

export async function addEulogy(
  modelId: string,
  text: string,
  parentId?: number
): Promise<{ ok: boolean; eulogy?: Eulogy; error?: string }> {
  const res = await fetch('/api/eulogies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ modelId, text: text.slice(0, 280), parentId }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.error };
  }
  return {
    ok: true,
    eulogy: {
      id: data.id,
      modelId: data.modelId,
      parentId: data.parentId,
      text: data.text,
      userEmail: data.userEmail,
      createdAt: data.createdAt ? new Date(data.createdAt) : null,
    },
  };
}

export async function getEulogies(
  modelId: string,
  count = 50
): Promise<Eulogy[]> {
  const res = await fetch(
    `/api/eulogies?modelId=${encodeURIComponent(modelId)}&count=${count}`
  );
  const data = await res.json();
  return (data.eulogies ?? []).map(
    (e: { id: number; modelId: string; parentId: number | null; text: string; userEmail: string | null; createdAt: string }) => ({
      id: e.id,
      modelId: e.modelId,
      parentId: e.parentId,
      text: e.text,
      userEmail: e.userEmail,
      createdAt: e.createdAt ? new Date(e.createdAt) : null,
    })
  );
}

// --- Auth operations ---

export interface AuthUser {
  id: number;
  email: string;
}

export async function sendCode(email: string): Promise<{ ok: boolean; error?: string; devCode?: string }> {
  const res = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error };
  return { ok: true, devCode: data.devCode };
}

export async function verifyCode(
  email: string,
  code: string
): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) return { ok: false, error: data.error };
  return { ok: true, user: data.user };
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  return data.user ?? null;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}
