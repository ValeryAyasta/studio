'use server';

import type { Participant } from '@/lib/types';
import { db } from './firebase-admin';
import { initialParticipants } from '@/data/participants';

export async function getParticipants(): Promise<Participant[]> {
  if (!db) {
    console.error('Firebase Admin SDK not initialized.');
    return [];
  }
  const participantsRef = db.ref('participants');
  const snapshot = await participantsRef.get();
  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ ...data[key], id: key }));
  }
  return [];
}

export async function updateParticipantStatus(
  id: string,
  status: 'Attended' | 'Not Attended'
) {
  if (!db) {
    console.error('Firebase Admin SDK not initialized.');
    return { success: false, error: 'Failed to connect to database.' };
  }
  try {
    const participantRef = db.ref(`participants/${id}`);
    await participantRef.update({ status });
    console.log(`Participant ${id} status updated to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating participant status: ', error);
    return { success: false, error: 'Failed to update status.' };
  }
}

export async function seedParticipants() {
  if (!db) {
    console.error('Firebase Admin SDK not initialized.');
    return { success: false, error: 'Failed to connect to database.' };
  }
  const ref = db.ref('participants');
  const snapshot = await ref.once('value');
  const data = snapshot.val();

  if (data) {
    console.log('Database already contains data:', data);
    return { success: false, error: 'Database already seeded.', data: data };
  }

  try {
    const updates: { [key: string]: Omit<Participant, 'id'> } = {};
    initialParticipants.forEach((participant) => {
      const { id, ...rest } = participant;
      updates[id] = rest;
    });

    await db.ref('participants').set(updates);
    console.log('Database seeded successfully!');
    return { success: true, message: 'Database seeded successfully!' };
  } catch (error: any) {
    console.error('Error seeding database: ', error);
    if (error.code === 'PERMISSION_DENIED') {
      return {
        success: false,
        error:
          'Permission denied. Please check your Firebase security rules and service account key.',
      };
    }
    return { success: false, error: 'Failed to seed database.' };
  }
}
