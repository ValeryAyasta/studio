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
import qrcode from 'qrcode';
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
      pool: true,
      maxConnections: 1, // Let's be very conservative
      rateLimit: 5, // 5 messages per second
    });

    console.log(`Sending ${participants.length} emails sequentially.`);

    for (const participant of participants) {
      try {
        console.log(`Sending email to ${participant.email}...`);
        const participantJson = JSON.stringify(participant);
        const qrCodeDataUrl = await qrcode.toDataURL(participantJson);
        
        const emailContent = `
          <p>Hello ${participant.name},</p>
          <p>We're excited to have you at our event. Please have this unique QR code ready for a smooth check-in process.</p>
          <img src="${qrCodeDataUrl}" alt="Your QR Code" />
          <p>See you there!</p>
        `;

        await transporter.sendMail({
          from: `"AttendEasy" <${process.env.EMAIL_USER}>`,
          to: participant.email,
          subject: 'Your Invitation to the Main Event!',
          html: emailContent,
          attachments: [
            {
              filename: `qr-${participant.id}.png`,
              content: qrCodeDataUrl.split("base64,")[1],
              encoding: "base64",
              cid: `qr-${participant.id}`
            }
          ]
        });
        console.log(`Email sent to ${participant.email}`);
      } catch (error) {
        console.error(`Failed to send email to ${participant.email}:`, error);
        // We continue to the next participant even if one fails
      }
    }
    
    console.log('All emails have been processed.');
    transporter.close();
  }
);

export async function sendEmails(participants: Participant[]): Promise<void> {
  await sendEmailFlow(participants);
}
