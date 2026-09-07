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
import { FirestoreErrorInfo, OperationType, Transaction, UserProfile } from '../types';

export const PROJECT_DISPLAY_NAME = 'MoneyDB';
export const CURRENT_PROJECT_ID = firebaseConfigJson.projectId || 'MoneyDB';

// Initialize Firebase App safely
const existingApps = getApps();
export const app = existingApps.length > 0 ? getApp() : initializeApp(firebaseConfigJson);

// Firestore initialization as required by Firebase skill
export const db: Firestore = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');
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
