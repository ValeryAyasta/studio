'use server';

import type { Participant } from '@/lib/types';

// The URL for your Firebase Realtime Database participants endpoint.
const FIREBASE_URL = 'https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/participants.json';

// --- In-Memory Database Simulation ---

// This will be our in-memory cache for the participants, refreshed on each fetch.
let participants: Participant[] = [];

// Utility function to simulate network delay.
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

export async function updateParticipantStatus(
  id: string,
  status: 'Attended' | 'Not Attended'
) {
  console.log(`Updating participant ${id} to status ${status}...`);
  // Note: This function only updates the IN-MEMORY cache.
  // The change will be overwritten the next time the page is loaded.

  await delay(300); // Simulate update latency

  const participantIndex = participants.findIndex((p) => p.id === id);

  if (participantIndex === -1) {
    console.error(`Participant with id ${id} not found in cache.`);
    // This can happen if getParticipants hasn't been called yet for some reason.
    return { success: false, error: 'Participant not found in memory. Try reloading.' };
  }

  // Update the status in our in-memory cache.
  participants[participantIndex].status = status;

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
