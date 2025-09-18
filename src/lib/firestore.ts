'use server';

import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getFirestore, collection, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
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
