import { cert, initializeApp, getApps, getApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

// Initialize Firebase for server-side (admin)
const adminApp =
  getApps().find((app) => app.name === "admin") ||
  initializeApp(
    {
      credential: cert(serviceAccount!),
      databaseURL: "https://control-asistencia-e7499-default-rtdb.firebaseio.com",
    },
    "admin"
  );

export const db = getDatabase(adminApp);
