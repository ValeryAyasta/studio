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
  attendance: z.object({
    day1: z.enum(["Attended", "Not Attended"]),
    day2: z.enum(["Attended", "Not Attended"]),
  }),
});

/**
 * Utilidad para crear el transporter de nodemailer.
 */
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 1,
    rateLimit: 5,
  });
}

/**
 * Envía un correo a un solo participante, usando un transporter existente.
 */
async function sendEmailWithTransporter(
  transporter: nodemailer.Transporter,
  participant: Participant
): Promise<void> {
  try {
    console.log(`Sending email to ${participant.email}...`);
    const qrCodeDataUrl = await qrcode.toDataURL(participant.id);

    const emailContent = `
    <p>Estimado/a participante, ${participant.name},<br></br>

Reciba un cordial saludo.<br></br>

Con relación a su registro de la <b>VI Conferencia Hemisférica sobre Gestión Portuaria Sostenible y Protección Ambiental,</b> que se llevará a cabo los días <b>23 y 24 de septiembre de 2025 en el Swissôtel Lima</b> (Av. Santo Toribio 173, San Isidro), nos complace remitirle su <b>código QR personal</b>, el cual deberá presentar en el área de acreditación para su registro de ingreso.
<br></br>
Se solicita conservar este código y llevarlo en formato digital los días del evento. Asimismo, recuerde portar su documento de identidad el cual será presentado para su registro.<br></br>

Finalmente, le informamos que, en cumplimiento de la Ley N.° 29733, Ley de Protección de Datos Personales, sus datos proporcionados podrán ser empleados por los organizadores y patrocinadores del evento para sus fines académicos y comerciales; salvo que exprese su negativa por lo que agradeceré comunicarlo al correo electrónico kriveros@apn.gob.pe<br></br>
<img src="${qrCodeDataUrl}" alt="QR Code" /> 
<br></br>Atentamente,<br></br> Presidente del Comité Técnico Consultivo (CTC) sobre Gestión Portuaria Sostenible Y Protección Ambiental
<br></br>
AUTORIDAD PORTUARIA NACIONAL</p>
  `;

    await transporter.sendMail({
      from: `"AUTORIDAD PORTUARIA NACIONAL" <${process.env.EMAIL_USER}>`,
      to: participant.email,
      subject: 'REGISTRO DE INVITADOS VI CONFERENCIA HEMISFERICA',
      html: emailContent,
      attachments: [
        {
          filename: `qr-${participant.id}.png`,
          content: qrCodeDataUrl.split("base64,")[1],
          encoding: "base64",
          cid: `qr-${participant.id}`,
        },
        {
          filename: `qr-${participant.id}.png`,
          content: qrCodeDataUrl.split("base64,")[1],
          encoding: "base64", // 👈 este sí se verá como adjunto en Outlook
        },
      ],
    });

    console.log(`Email sent to ${participant.email}`);
  } catch (error) {
    console.error(`Failed to send email to ${participant.email}:`, error);
    throw error;
  }
}



/**
 * Enviar correo a un solo participante (crea y cierra transporter).
 */
export async function sendEmailToParticipant(participant: Participant): Promise<void> {
  const transporter = createTransporter();
  try {
    await sendEmailWithTransporter(transporter, participant);
  } finally {
    transporter.close();
  }
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: z.array(ParticipantSchema),
    outputSchema: z.void(),
  },
  async (participants) => {
    const transporter = createTransporter();

    console.log(`Sending ${participants.length} emails sequentially.`);

    for (const participant of participants) {
      try {
        await sendEmailWithTransporter(transporter, participant);
      } catch (error) {
        console.error(error);
        continue;
      }
    }
    
    console.log('All emails have been processed.');
    transporter.close();
  }
);

export async function sendEmails(participants: Participant[]): Promise<void> {
  await sendEmailFlow(participants);
}
