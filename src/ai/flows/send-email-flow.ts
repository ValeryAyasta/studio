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
import nodemailer from 'nodemailer';
import 'dotenv/config';

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
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log(`Sending ${participants.length} emails.`);

    const emailPromises = participants.map(participant => {
      const emailContent = `
        <p>Hello ${participant.name},</p>
        <p>We're excited to have you at our event. Please have this unique QR code ready for a smooth check-in process.</p>
        <p>Your QR code is attached (simulated).</p>
        <p>See you there!</p>
      `;

      return transporter.sendMail({
        from: `"AttendEasy" <${process.env.EMAIL_USER}>`,
        to: participant.email,
        subject: 'Your Invitation to the Main Event!',
        html: emailContent,
      });
    });

    await Promise.all(emailPromises);

    console.log('All emails have been sent.');
  }
);

export async function sendEmails(participants: Participant[]): Promise<void> {
  await sendEmailFlow(participants);
}
