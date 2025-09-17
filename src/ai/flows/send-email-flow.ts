'use server';
/**
 * @fileOverview A flow for sending invitation emails to participants.
 *
 * - sendEmails - A function that handles sending emails to a list of participants.
 * - ParticipantSchema - The Zod schema for a participant.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Participant } from '@/lib/types';

const ParticipantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  status: z.enum(['Attended', 'Not Attended']),
});

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: z.array(ParticipantSchema),
    outputSchema: z.void(),
  },
  async (participants) => {
    // In a real application, you would integrate with an email sending service
    // like SendGrid, Mailgun, or AWS SES.
    // For this example, we will just log the emails to the console
    // to simulate that they have been sent.

    console.log(`Simulating sending ${participants.length} emails.`);

    const emailPromises = participants.map(participant => {
      const emailContent = `
        To: ${participant.email}
        Subject: Your Invitation to the Main Event!

        Hello ${participant.name},

        We're excited to have you at our event. Please have this unique QR code ready for a smooth check-in process.
        Your QR code is attached (simulated).

        See you there!
      `;
      console.log('--- Sending Email ---');
      console.log(emailContent.trim());
      console.log('---------------------');
      // Simulate network delay
      return new Promise(resolve => setTimeout(resolve, 50));
    });

    await Promise.all(emailPromises);

    console.log('All email simulations are complete.');
  }
);

export async function sendEmails(participants: Participant[]): Promise<void> {
  await sendEmailFlow(participants);
}
