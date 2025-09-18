'use server';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getDatabase, ref, get, set, update, child } from 'firebase/database';
import type { Participant } from '@/lib/types';
import { initialParticipants } from '@/lib/participants';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCiGDghs77Nwy5h3upjK-kzQTwR5fjO4k4",
  authDomain: "control-asistencia-e7499.firebaseapp.com",
  projectId: "control-asistencia-e7499",
  databaseURL: "https://control-asistencia-e7499-default-rtdb.firebaseio.com",
  storageBucket: "control-asistencia-e7499.firebasestorage.app",
  messagingSenderId: "839935230948",
  appId: "1:839935230948:web:a0d66d17a6ad8d87b8fdf1",
  measurementId: "G-26GT07D7D6"
};

// Initialize Firebase for server-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

const dbRef = ref(db);
const participantsRef = ref(db, 'participants');

export async function getParticipants(): Promise<Participant[]> {
    const snapshot = await get(participantsRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
    }
    return [];
}

export async function updateParticipantStatus(id: string, status: 'Attended' | 'Not Attended') {
    try {
        const participantRef = ref(db, `participants/${id}`);
        await update(participantRef, { status });
        console.log(`Participant ${id} status updated to ${status}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating participant status: ", error);
        return { success: false, error: "Failed to update status." };
    }
}

export async function seedParticipants() {
  try {
    const snapshot = await get(participantsRef);
    if (snapshot.exists() && snapshot.size > 0) {
      console.log('Participants collection is not empty. Seeding aborted.');
      return { success: true, message: 'Database already seeded.' };
    }
    
    const updates: { [key: string]: Omit<Participant, 'id'> } = {};
    initialParticipants.forEach((participant) => {
      const { id, ...data } = participant;
      updates[id] = data;
    });

    await set(participantsRef, updates);
    console.log(`Successfully seeded ${initialParticipants.length} participants.`);
    return { success: true, message: `Successfully seeded ${initialParticipants.length} participants.` };
  } catch (error) {
    console.error("Error seeding participants: ", error);
    return { success: false, error: "Failed to seed database." };
  }
}
