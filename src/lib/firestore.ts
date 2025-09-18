'use server';

import type { Participant } from '@/lib/types';
import { db } from './firebase-admin';
import { initialParticipants } from '@/data/participants';

export async function getParticipants(): Promise<Participant[]> {
  const participantsRef = db.ref('participants');
  const snapshot = await participantsRef.get();
  if (snapshot.exists()) {
    const data = snapshot.val();
    console.log('Datos de Firebase:', data);
    // The data from Firebase is an object, we need to convert it to an array.
    return Object.keys(data).map(key => ({ ...data[key], id: key }));
  }
  return [];
}

export async function updateParticipantStatus(id: string, status: 'Attended' | 'Not Attended') {
  try {
    const participantRef = db.ref(`participants/${id}`);
    await participantRef.update({ status });
    console.log(`Participant ${id} status updated to ${status}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating participant status: ", error);
    return { success: false, error: "Failed to update status." };
  }
}

export async function seedParticipants() {
  const ref = db.ref('participants');
  const snapshot = await ref.once('value');
  const data = snapshot.val();

  if (data) {
    console.log('Database already contains data:', data);
    return { success: false, error: 'Database already seeded.', data: data };
  }

  try {
    const updates: { [key: string]: Omit<Participant, 'id'> } = {};
    initialParticipants.forEach(participant => {
      // The ID will be the key in the Realtime Database
      const { id, ...rest } = participant;
      updates[id] = rest;
    });

    await db.ref('participants').set(updates);
    console.log('Database seeded successfully!');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error: any) {
    console.error('Error seeding database: ', error);
    // Check for permission errors specifically
    if (error.code === 'PERMISSION_DENIED') {
        return { success: false, error: 'Permission denied. Please check your Firebase security rules.' };
    }
    return { success: false, error: 'Failed to seed database.' };
  }
}