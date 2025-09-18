'use server';

import { ref, get, set, update } from 'firebase/database';
import type { Participant } from '@/lib/types';
import { initialParticipants } from '@/data/participants';
import { db } from './firebase-admin';


export async function getParticipants(): Promise<Participant[]> {
  const participantsRef = ref(db, 'participants');
  const snapshot = await get(participantsRef);
  if (snapshot.exists()) {
    const data = snapshot.val();
    console.log(data);
    return Object.values(data) as Participant[];
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
    const participantsRef = ref(db, 'participants');
    try {
      const snapshot = await get(participantsRef);
      if (snapshot.exists() && snapshot.val() !== null) {
        console.log("Database already contains data:", snapshot.val());
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
                                                                                                                                                                                                                            