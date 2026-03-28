import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get, set, runTransaction } from 'firebase/database';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Check if Firebase is configured
const isFirebaseConfigured = !!firebaseConfig.apiKey;

// Realtime Database — counters
function getDb() {
  if (!isFirebaseConfigured) return null;
  return getDatabase(app);
}

// Firestore — eulogies
function getFs() {
  if (!isFirebaseConfigured) return null;
  return getFirestore(app);
}

// --- Counter operations (Realtime DB) ---

export async function incrementCounter(
  modelId: string,
  type: 'candles' | 'flowers' | 'respects'
): Promise<number> {
  const db = getDb();
  if (!db) return Math.floor(Math.random() * 1000); // Demo mode

  const counterRef = ref(db, `counters/${modelId}/${type}`);
  let newVal = 0;
  await runTransaction(counterRef, (current) => {
    newVal = (current || 0) + 1;
    return newVal;
  });
  return newVal;
}

export async function getCounter(
  modelId: string,
  type: 'candles' | 'flowers' | 'respects'
): Promise<number> {
  const db = getDb();
  if (!db) return Math.floor(Math.random() * 500);

  const counterRef = ref(db, `counters/${modelId}/${type}`);
  const snapshot = await get(counterRef);
  return snapshot.val() || 0;
}

export async function getGlobalVisitors(): Promise<number> {
  const db = getDb();
  if (!db) return Math.floor(Math.random() * 10000) + 5000;

  const visitorRef = ref(db, 'globalVisitors');
  const snapshot = await get(visitorRef);
  return snapshot.val() || 0;
}

export async function incrementGlobalVisitors(): Promise<number> {
  const db = getDb();
  if (!db) return Math.floor(Math.random() * 10000) + 5000;

  const visitorRef = ref(db, 'globalVisitors');
  let newVal = 0;
  await runTransaction(visitorRef, (current) => {
    newVal = (current || 0) + 1;
    return newVal;
  });
  return newVal;
}

// --- Eulogy operations (Firestore) ---

export interface Eulogy {
  id?: string;
  modelId: string;
  text: string;
  createdAt: Date | null;
}

export async function addEulogy(modelId: string, text: string): Promise<void> {
  const fs = getFs();
  if (!fs) return;

  await addDoc(collection(fs, 'eulogies'), {
    modelId,
    text: text.slice(0, 280),
    createdAt: serverTimestamp(),
  });
}

export async function getEulogies(
  modelId: string,
  count = 20
): Promise<Eulogy[]> {
  const fs = getFs();
  if (!fs) {
    return [
      { modelId, text: 'You were the best AI I ever used. RIP.', createdAt: new Date() },
      { modelId, text: '永远怀念你，谢谢你的陪伴。', createdAt: new Date() },
      { modelId, text: 'Gone but not forgotten.', createdAt: new Date() },
    ];
  }

  const q = query(
    collection(fs, 'eulogies'),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || null,
  })) as Eulogy[];
}
