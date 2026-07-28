import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

let firebaseAdminApp: App | null = null;
let firebaseAuth: Auth | null = null;

try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    firebaseAdminApp = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log("Firebase Admin initialized successfully with Service Account Key.");
  } else if (process.env.FIREBASE_PROJECT_ID) {
    firebaseAdminApp = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin initialized with Project ID.");
  }

  if (firebaseAdminApp) {
    firebaseAuth = getAuth(firebaseAdminApp);
  }
} catch (error) {
  console.warn("Firebase Admin Initialization Warning:", error);
}

export { firebaseAdminApp, firebaseAuth };
