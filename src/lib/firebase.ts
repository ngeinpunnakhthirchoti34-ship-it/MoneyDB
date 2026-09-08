import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  deleteDoc,
  Firestore 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { FirestoreErrorInfo, OperationType, Transaction, UserProfile, AppUser } from '../types';

export const activeFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId || '(default)',
};

export const PROJECT_DISPLAY_NAME = 'MoneyDB';
export const CURRENT_PROJECT_ID = activeFirebaseConfig.projectId || 'MoneyDB';

// Initialize Firebase App safely
const existingApps = getApps();
export const app = existingApps.length > 0 ? getApp() : initializeApp(activeFirebaseConfig);

// Firestore initialization as required by Firebase skill
export const db: Firestore = getFirestore(app, activeFirebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Global Error Handler conforming to Firebase Skill specification
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or server unreachable. Local mode fallback active.');
    } else {
      console.warn('Firebase connection test info:', error instanceof Error ? error.message : error);
    }
    return false;
  }
}

// Test connection on module boot
testConnection().catch(() => {
  // Gracefully ignored on initial boot
});

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Save or update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || null,
    };

    try {
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (dbErr) {
      console.warn('User profile sync to Firestore pending:', dbErr);
    }

    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}

// Translate and diagnose Firebase Auth error messages into friendly Thai advice
export function getAuthErrorMessage(error: unknown): { title: string; detail: string; isIframeIssue: boolean } {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/popup-blocked':
        return {
          title: 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป (Popup Blocked)',
          detail: 'หน้าต่างเข้าสู่ระบบของ Google ถูกเบราว์เซอร์ระงับไว้เนื่องจากการทำงานในกรอบ Iframe ของหน้าพรีวิว กรุณากดปุ่ม "เปิดในแท็บใหม่" ด้านล่าง หรือเลือก "เข้าสู่ระบบด่วน"',
          isIframeIssue: true,
        };
      case 'auth/popup-closed-by-user':
        return {
          title: 'หน้าต่างเข้าสู่ระบบถูกปิด',
          detail: 'หน้าต่างยืนยันตัวตน Google ถูกปิดก่อนทำรายการเสร็จสิ้น หรือระบบบล็อกคุกกี้บุคคลที่สาม (Third-party cookies)',
          isIframeIssue: true,
        };
      case 'auth/unauthorized-domain':
        return {
          title: 'โดเมนยังไม่ได้รับอนุญาตใน Firebase',
          detail: 'โดเมนของเซิร์ฟเวอร์พรีวิวนี้ยังไม่ได้ถูกเพิ่มใน Firebase Authorized Domains ท่านสามารถเข้าสู่ระบบด้วย "บัญชีด่วน" หรือกดเปิดในแท็บใหม่',
          isIframeIssue: true,
        };
      case 'auth/cancelled-popup-request':
        return {
          title: 'มีคำขอเข้าสู่ระบบกำลังทำงานอยู่',
          detail: 'ระบบกำลังดำเนินการเข้าสู่ระบบ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง',
          isIframeIssue: false,
        };
      case 'auth/network-request-failed':
        return {
          title: 'การเชื่อมต่อเครือข่ายขัดข้อง',
          detail: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Firebase ได้ กรุณาตรวจสอบสัญญาณอินเทอร์เน็ต',
          isIframeIssue: false,
        };
      default:
        return {
          title: 'การเข้าสู่ระบบมีข้อผิดพลาด',
          detail: (error as { message?: string }).message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน Google',
          isIframeIssue: true,
        };
    }
  }
  return {
    title: 'การเข้าสู่ระบบมีข้อผิดพลาด',
    detail: error instanceof Error ? error.message : 'ไม่สามารถเข้าสู่ระบบได้',
    isIframeIssue: false,
  };
}

// Local session storage for active user (works seamlessly in preview & standalone)
const LOCAL_USER_KEY = 'moneydb_active_user';

export function saveLocalUser(user: AppUser): void {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn('Cannot save active user locally:', e);
  }
}

export function loadLocalUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Cannot read active user locally:', e);
  }
  return null;
}

export function clearLocalUser(): void {
  try {
    localStorage.removeItem(LOCAL_USER_KEY);
  } catch (e) {
    console.warn('Cannot clear local user:', e);
  }
}

