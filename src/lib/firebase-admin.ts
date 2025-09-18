'use server';

import { cert, initializeApp, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const serviceAccount =
  serviceAccountKey && serviceAccountKey.trim() !== ''
    ? JSON.parse(serviceAccountKey)
    : undefined;

const adminApp =
  getApps().find((app) => app.name === 'admin') ||
  (serviceAccount
    ? initializeApp(
        {
          credential: cert(serviceAccount),
          databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
        },
        'admin'
      )
    : null);

export const db = adminApp ? getDatabase(adminApp) : null;
