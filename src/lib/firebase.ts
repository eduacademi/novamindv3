import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, onSnapshot, writeBatch, deleteDoc } from "firebase/firestore";
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";
import { Card, ShoppingItem, ReminderItem } from "../types";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Helper to get subcollection path for user isolation
function getUserCollection(userId: string, collectionName: string) {
  return collection(db, "users", userId, collectionName);
}

function getUserDoc(userId: string, collectionName: string, docId: string) {
  return doc(db, "users", userId, collectionName, docId);
}

/**
 * Initialize Firebase Auth listener and fallback to anonymous sign-in
 */
export function initFirebaseAuth(onUserReady: (user: User | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onUserReady(user);
    } else {
      signInAnonymously(auth).then((cred) => {
        onUserReady(cred.user);
      }).catch((err) => {
        if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
          onUserReady(null);
          return;
        }
        console.warn("Firebase Auth Notice:", err?.message || err);
        onUserReady(null);
      });
    }
  });
}

/**
 * Sign in with Google
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (err) {
    console.error("Google sign in error:", err);
    throw err;
  }
}

/**
 * Sign in with Email and Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<User | null> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (err) {
    console.error("Email login error:", err);
    throw err;
  }
}

/**
 * Register with Email and Password
 */
export async function registerWithEmail(email: string, pass: string): Promise<User | null> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (err) {
    console.error("Email register error:", err);
    throw err;
  }
}

/**
 * Sign out
 */
export async function logoutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign out error:", err);
  }
}

/**
 * Subscribe to real-time changes for Cards (isolated per user)
 */
export function subscribeCards(userId: string, onData: (cards: Card[]) => void) {
  if (!userId) return () => {};
  const colRef = getUserCollection(userId, "cards");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const cards: Card[] = [];
      snapshot.forEach((docSnap) => {
        cards.push(docSnap.data() as Card);
      });
      cards.sort((a, b) => b.created_at - a.created_at);
      onData(cards);
    },
    (error) => {
      if (error?.code === 'unavailable') {
        console.info("Firestore currently in offline mode.");
      } else {
        console.warn("Firestore Cards Sync Notice:", error?.message || error);
      }
    }
  );
}

export async function syncCardToFirestore(userId: string, card: Card): Promise<void> {
  if (!userId) return;
  try {
    const docRef = getUserDoc(userId, "cards", card.id);
    await setDoc(docRef, card, { merge: true });
  } catch (err) {
    console.error("Error syncing card to Firestore:", err);
  }
}

export async function syncAllCardsToFirestore(userId: string, cards: Card[]): Promise<void> {
  if (!userId) return;
  try {
    const batch = writeBatch(db);
    cards.forEach((c) => {
      const docRef = getUserDoc(userId, "cards", c.id);
      batch.set(docRef, c, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Error batch syncing cards:", err);
  }
}

export async function deleteCardFromFirestore(userId: string, cardId: string): Promise<void> {
  if (!userId) return;
  try {
    const docRef = getUserDoc(userId, "cards", cardId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting card from Firestore:", err);
  }
}

/**
 * Subscribe to real-time changes for Shopping Items (isolated per user)
 */
export function subscribeShoppingItems(userId: string, onData: (items: ShoppingItem[]) => void) {
  if (!userId) return () => {};
  const colRef = getUserCollection(userId, "shopping_items");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ShoppingItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ShoppingItem);
      });
      items.sort((a, b) => b.created_at - a.created_at);
      onData(items);
    },
    (error) => {
      if (error?.code === 'unavailable') {
        console.info("Firestore offline mode for shopping.");
      } else {
        console.warn("Firestore Shopping Sync Notice:", error?.message || error);
      }
    }
  );
}

export async function syncShoppingItemToFirestore(userId: string, item: ShoppingItem): Promise<void> {
  if (!userId) return;
  try {
    const docRef = getUserDoc(userId, "shopping_items", item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.error("Error syncing shopping item:", err);
  }
}

export async function syncAllShoppingToFirestore(userId: string, items: ShoppingItem[]): Promise<void> {
  if (!userId) return;
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = getUserDoc(userId, "shopping_items", item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Error batch syncing shopping:", err);
  }
}

export async function deleteShoppingFromFirestore(userId: string, id: string): Promise<void> {
  if (!userId) return;
  try {
    const docRef = getUserDoc(userId, "shopping_items", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting shopping item:", err);
  }
}

/**
 * Subscribe to real-time changes for Reminders (isolated per user)
 */
export function subscribeReminders(userId: string, onData: (items: ReminderItem[]) => void) {
  if (!userId) return () => {};
  const colRef = getUserCollection(userId, "reminders");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: ReminderItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ReminderItem);
      });
      items.sort((a, b) => b.created_at - a.created_at);
      onData(items);
    },
    (error) => {
      if (error?.code === 'unavailable') {
        console.info("Firestore offline mode for reminders.");
      } else {
        console.warn("Firestore Reminders Sync Notice:", error?.message || error);
      }
    }
  );
}

export async function syncReminderToFirestore(userId: string, item: ReminderItem): Promise<void> {
  if (!userId) return;
  try {
    const docRef = getUserDoc(userId, "reminders", item.id);
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.error("Error syncing reminder:", err);
  }
}

export async function syncAllRemindersToFirestore(userId: string, items: ReminderItem[]): Promise<void> {
  if (!userId) return;
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = getUserDoc(userId, "reminders", item.id);
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error("Error batch syncing reminders:", err);
  }
}

export async function deleteReminderFromFirestore(userId: string, id: string): Promise<void> {
  if (!userId) return;
  try {
    const docRef = getUserDoc(userId, "reminders", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Error deleting reminder:", err);
  }
}
