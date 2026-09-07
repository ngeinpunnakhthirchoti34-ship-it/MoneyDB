import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError } from './firebase';
import { OperationType, Transaction } from '../types';

const LOCAL_STORAGE_KEY = 'moneydb_cached_transactions';

// Initial sample data for Thai monthly income/expense to show beautiful charts immediately
export function getInitialSampleData(userId: string = 'demo_user'): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'tx_sample_1',
      userId,
      type: 'income',
      amount: 45000,
      category: 'เงินเดือน / ค่าจ้าง',
      date: `${year}-${month}-01`,
      note: 'เงินเดือนประจำเดือน',
      createdAt: new Date(`${year}-${month}-01T09:00:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-01T09:00:00`).toISOString(),
    },
    {
      id: 'tx_sample_2',
      userId,
      type: 'expense',
      amount: 12000,
      category: 'ค่าเช่าและที่อยู่อาศัย',
      date: `${year}-${month}-02`,
      note: 'ค่าเช่าคอนโดมิเนียม',
      createdAt: new Date(`${year}-${month}-02T10:00:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-02T10:00:00`).toISOString(),
    },
    {
      id: 'tx_sample_3',
      userId,
      type: 'expense',
      amount: 2350,
      category: 'บิล ค่าน้ำ ค่าไฟ เน็ต',
      date: `${year}-${month}-04`,
      note: 'ค่าไฟและค่าอินเทอร์เน็ตบ้าน',
      createdAt: new Date(`${year}-${month}-04T14:30:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-04T14:30:00`).toISOString(),
    },
    {
      id: 'tx_sample_4',
      userId,
      type: 'expense',
      amount: 1850,
      category: 'อาหารและเครื่องดื่ม',
      date: `${year}-${month}-05`,
      note: 'ซื้อของสดและของกินเข้าตู้เย็น',
      createdAt: new Date(`${year}-${month}-05T18:20:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-05T18:20:00`).toISOString(),
    },
    {
      id: 'tx_sample_5',
      userId,
      type: 'income',
      amount: 8500,
      category: 'งานฟรีแลนซ์ / รับจ้างเสริม',
      date: `${year}-${month}-08`,
      note: 'ออกแบบ UI เว็บไซต์ลูกค้า',
      createdAt: new Date(`${year}-${month}-08T16:00:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-08T16:00:00`).toISOString(),
    },
    {
      id: 'tx_sample_6',
      userId,
      type: 'expense',
      amount: 1200,
      category: 'การเดินทางและยานพาหนะ',
      date: `${year}-${month}-10`,
      note: 'เติมน้ำมันรถยนต์',
      createdAt: new Date(`${year}-${month}-10T11:45:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-10T11:45:00`).toISOString(),
    },
    {
      id: 'tx_sample_7',
      userId,
      type: 'expense',
      amount: 2490,
      category: 'ช้อปปิ้งและของใช้',
      date: `${year}-${month}-12`,
      note: 'ซื้อเสื้อผ้าและรองเท้าวิ่ง',
      createdAt: new Date(`${year}-${month}-12T15:10:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-12T15:10:00`).toISOString(),
    },
    {
      id: 'tx_sample_8',
      userId,
      type: 'expense',
      amount: 850,
      category: 'ความบันเทิงและท่องเที่ยว',
      date: `${year}-${month}-15`,
      note: 'ดูหนังและทานอาหารนอกบ้านกับครอบครัว',
      createdAt: new Date(`${year}-${month}-15T20:00:00`).toISOString(),
      updatedAt: new Date(`${year}-${month}-15T20:00:00`).toISOString(),
    },
  ];
}

// Load cached transactions from localStorage
export function loadCachedTransactions(userId?: string | null): Transaction[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId || 'guest'}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read localStorage cache:', e);
  }
  return getInitialSampleData(userId || 'guest');
}

// Save cached transactions
export function saveCachedTransactions(userId: string | null, transactions: Transaction[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId || 'guest'}`, JSON.stringify(transactions));
  } catch (e) {
    console.warn('Could not write localStorage cache:', e);
  }
}

// Subscribe to real-time transactions from Firestore
export function subscribeToTransactions(
  userId: string,
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const collectionPath = `users/${userId}/transactions`;
  const q = query(collection(db, collectionPath), orderBy('date', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Transaction);
      });
      // Update cache
      saveCachedTransactions(userId, items);
      onUpdate(items);
    },
    (error) => {
      console.warn('Firestore subscription warning, falling back to local state:', error.message);
      if (onError) {
        onError(error);
      }
      try {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } catch (handled) {
        // Logged properly through error handler
      }
    }
  );
}

// Add or Update Transaction in Firestore with local optimistic sync
export async function saveTransaction(userId: string, tx: Transaction): Promise<void> {
  const collectionPath = `users/${userId}/transactions`;
  const docRef = doc(db, collectionPath, tx.id);

  try {
    await setDoc(docRef, tx);
  } catch (error) {
    // If Firestore is offline or permissions issue, handle and rethrow
    console.warn('Could not write to live Firestore, syncing locally:', error);
    try {
      handleFirestoreError(error, OperationType.WRITE, collectionPath);
    } catch {
      // Allow fallback
    }
  }
}

// Delete Transaction in Firestore
export async function removeTransaction(userId: string, txId: string): Promise<void> {
  const collectionPath = `users/${userId}/transactions`;
  const docRef = doc(db, collectionPath, txId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Could not delete in Firestore, removing locally:', error);
    try {
      handleFirestoreError(error, OperationType.DELETE, collectionPath);
    } catch {
      // Allow fallback
    }
  }
}
