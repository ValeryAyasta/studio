'use server';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, collection, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { Participant } from '@/lib/types';
import { initialParticipants } from '@/lib/participants';

const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase for server-side
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const participantsCollection = collection(db, 'participants');

export async function getParticipants() {
    const snapshot = await getDocs(participantsCollection);
    const participants: Participant[] = [];
    snapshot.forEach(doc => {
        participants.push({ id: doc.id, ...doc.data() } as Participant);
    });
    return participants;
}

export async function updateParticipantStatus(id: string, status: 'Attended' | 'Not Attended') {
    try {
        const participantRef = doc(db, 'participants', id);
        await updateDoc(participantRef, { status });
        console.log(`Participant ${id} status updated to ${status}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating participant status: ", error);
        return { success: false, error: "Failed to update status." };
    }
}

export async function seedParticipants() {
  try {
    const snapshot = await getDocs(participantsCollection);
    if (!snapshot.empty) {
      console.log('Participants collection is not empty. Seeding aborted.');
      return { success: true, message: 'Database already seeded.' };
    }
    
    const batch = writeBatch(db);
    initialParticipants.forEach((participant) => {
      // We use the ID from the mock data as the document ID in Firestore
      const docRef = doc(db, "participants", participant.id);
      batch.set(docRef, {
        name: participant.name,
        email: participant.email,
        status: participant.status,
      });
    });

    await batch.commit();
    console.log(`Successfully seeded ${initialParticipants.length} participants.`);
    return { success: true, message: `Successfully seeded ${initialParticipants.length} participants.` };
  } catch (error) {
    console.error("Error seeding participants: ", error);
    return { success: false, error: "Failed to seed database." };
  }
}
