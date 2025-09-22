'use server';

import type { Participant } from '@/lib/types';

// The URL for your Firebase Realtime Database participants endpoint.
const FIREBASE_URL = 'https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/participants.json';

// --- In-Memory Database Simulation ---

// This will be our in-memory cache for the participants, refreshed on each fetch.
let participants: Participant[] = [];

// --- Data Fetching Logic ---

/**
 * Fetches the participant list from Firebase and populates the in-memory cache.
 */
async function fetchAndCacheParticipants() {
  console.log('Fetching participants from Firebase...');
  try {
    const response = await fetch(FIREBASE_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Firebase fetch failed: ${response.statusText}`);
    }
    const data = await response.json();
    participants = data || []; // Update the cache with fresh data.

    participants.forEach(async (p, index) => {
      if (!p.id) {
        const newId = crypto.randomUUID();
        await fetch(
          `https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/participants/${index}.json`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newId }),
          }
        );
        p.id = newId;
      }
    });

    console.log('Successfully fetched and cached participants.');
  } catch (error) {
    console.error('Failed to fetch or cache participants:', error);
    participants = []; // Reset to a safe state on error.
  }
}

// --- Server Action Implementations ---

/**
 * This function is called on page load. It ALWAYS fetches the latest data
 * from Firebase, updates the in-memory cache, and then returns the data.
 */
export async function getParticipants(): Promise<Participant[]> {
  console.log('New page load detected. Fetching fresh participant data...');
  await fetchAndCacheParticipants();
  // Return a copy of the freshly fetched data.
  return JSON.parse(JSON.stringify(participants));
}

export async function updateParticipantEmail(id: string, newEmail: string) {
  console.log(`Updating participant email`);

  const participantIndex = participants.findIndex((p) => p.id === id);
  
  if (participantIndex === -1) {
    console.error(`Participant with id ${id} not found in cache.`);
    // This can happen if getParticipants hasn't been called yet for some reason.
    return { success: false, error: `Participant ${id} not found in memory. Try reloading.` };
  }
  
  try {
    const res = await fetch(
      `https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/participants/${participantIndex}.json`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
      }
    );

    if (!res.ok) {
      throw new Error(`Error actualizando email: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error en updateParticipantEmail:", err);
    throw err;
  }
}

export async function updateParticipantStatus(
  id: string,
  day: "day1" | "day2",
  status: 'Attended' | 'Not Attended'
) {
  console.log(`Updating participant ${id} to status ${status}...`);

  const participantIndex = participants.findIndex((p) => p.id === id);
  
  if (participantIndex === -1) {
    console.error(`Participant with id ${id} not found in cache.`);
    // This can happen if getParticipants hasn't been called yet for some reason.
    return { success: false, error: `Participant ${id} not found in memory. Try reloading.` };
  }


  try{
    const res = await fetch(
      `https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/participants/${participantIndex}/attendance.json`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [day]: status }), // 👈 solo ese día
      }
    );
    if (!res.ok) {
      throw new Error(`Firebase update failed with ${res.text}`);
    }
    participants[participantIndex].attendance[day] = status;
    console.log(`Participant ${id} updated in DB to ${status}`);

    let day1Count = 0;
    let day2Count = 0;

    participants.forEach((p: any) => {
      if (p.attendance?.day1 === "Attended") day1Count++;
      if (p.attendance?.day2 === "Attended") day2Count++;
    });

    // 3. Guardar el resumen
    await fetch(`https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/attendanceSummary.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day1: day1Count, day2: day2Count }),
    });

  } catch(error){
    console.error("Error updating participant:", error);
    return { success: false, error: (error as Error).message };
  }

  console.log('In-memory update successful.');
  return { success: true };
}

/**
 * Re-seeds the in-memory database by forcing a fetch from Firebase.
 */
export async function seedParticipants() {
  console.log('Re-seeding in-memory database from Firebase...');
  await fetchAndCacheParticipants();
  console.log('Seeding successful!');
  return { success: true, message: 'Database re-seeded successfully from Firebase!' };
}
