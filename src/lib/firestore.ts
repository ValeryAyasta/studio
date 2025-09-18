'use server';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getDatabase, ref, get, set, update, child } from 'firebase/database';
import type { Participant } from '@/lib/types';
import { initialParticipants } from '@/lib/participants';

const firebaseConfig = {
  apiKey: "AIzaSyDchHOsFUxITpZdB09ShgtpLhjrF_pjXyY",
  authDomain: "studio-1109012300-d69eb.firebaseapp.com",
  databaseURL: "https://studio-1109012300-d69eb-default-rtdb.firebaseio.com",
  projectId: "studio-1109012300-d69eb",
  storageBucket: "studio-1109012300-d69eb.firebasestorage.app",
  messagingSenderId: "1031839838061",
  appId: "1:1031839838061:web:91721096bfaedac7913464"
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
        console.log(data);
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
    // For Realtime Database, we check if the snapshot exists and has children.
    if (snapshot.exists() && snapshot.hasChildren()) {
      console.log('Participants collection is not empty. Seeding aborted.');
      console.log(snapshot.val());
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
  } catch (error: any) {
    console.error("Error seeding participants: ", error);
    return { success: false, error: error.message };
  }
}
