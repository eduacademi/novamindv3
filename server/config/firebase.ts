import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import clientConfig from "../../firebase-applet-config.json";

let firebaseAdminApp: App | null = null;
let firebaseAuth: Auth | null = null;
/** Only set when real credentials exist; token verification alone just needs the project id. */
let firestoreDb: Firestore | null = null;

try {
  const existingApps = getApps();
  const hasCredentials = !!(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS);

  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseAdminApp = initializeApp({ credential: cert(serviceAccount) });
  } else {
    // Project id is enough to verify Firebase ID tokens (public certs).
    firebaseAdminApp = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID || clientConfig.projectId });
  }

  firebaseAuth = getAuth(firebaseAdminApp);
  if (hasCredentials) {
    const dbId = process.env.FIRESTORE_DATABASE_ID || clientConfig.firestoreDatabaseId;
    firestoreDb = dbId ? getFirestore(firebaseAdminApp, dbId) : getFirestore(firebaseAdminApp);
  } else {
    console.warn("⚠️ FIREBASE_SERVICE_ACCOUNT_KEY tanımlı değil: abonelik ve kullanım verileri bellekte tutulur (production için zorunlu).");
  }
} catch (error) {
  console.warn("Firebase Admin Initialization Warning:", error);
}

export { firebaseAdminApp, firebaseAuth, firestoreDb };
