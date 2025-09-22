"use client";

import { useState, useEffect } from "react";
import { Loader2, Mail } from "lucide-react";
import qrcode from 'qrcode';
import type { Participant } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendEmails } from "@/ai/flows/send-email-flow";

interface InviteTabProps {
  participants: Participant[];
}

export function InviteTab({ participants }: InviteTabProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  
  const sampleParticipant = participants.length > 0 ? participants[0] : null;

  useEffect(() => {
    if (sampleParticipant) {
      qrcode.toDataURL(sampleParticipant.id)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("Failed to generate QR code", err));
    } else {
      setQrCodeUrl(null);
    }
  }, [sampleParticipant]);

  const handleSendEmails = async () => {
    if (participants.length === 0) {
      toast({
        title: "No Participants",
        description: "There are no participants to send emails to.",
        variant: "destructive",
      });
      return;
    }
    setIsSending(true);
    try {
      await sendEmails(participants);
      toast({
        title: "¡Invitaciones enviadas!",
        description: `Successfully sent ${participants.length} email invitations.`,
      });
    } catch (error) {
      console.error("Failed to send emails", error);
      toast({
        title: "Failed to Send Invitations",
        description: "There was an error sending the emails. Please try again later.",
        variant: "destructive",
      });
    }
    setIsSending(false);
  };

  return (
    <Card className="shadow-lg max-w-6xl 2xl:max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Enviar invitaciones</CardTitle>
        <CardDescription>
          Envía un correo masivo a todos los participantes con un código QR único para el registro.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
       {sampleParticipant ? (
          <div className="border rounded-lg p-4 space-y-4 bg-secondary/30">
            <h3 className="font-semibold text-foreground">Email Preview</h3>
            <p className="text-sm text-muted-foreground">To: participante@correo.com</p>
            <p className="text-sm font-bold">Asunto: REGISTRO DE INVITADOS VI CONFERENCIA HEMISFERICA</p>
            <div className="pt-4 border-t">
              <p className="mt-2 text-sm text-muted-foreground">
              Estimado/a participante:

<br></br>Reciba un cordial saludo.<br></br>

Con relación a su registro de la <b>VI Conferencia Hemisférica sobre Gestión Portuaria Sostenible y Protección Ambiental,</b>
 que se llevará a cabo los días <b>23 y 24 de septiembre de 2025 en el Swissôtel Lima</b> (Av. Santo Toribio 173, San Isidro), nos complace remitirle su <b>código QR personal</b>, el cual deberá presentar en el área de acreditación para su registro de ingreso.
<br></br>
Se solicita conservar este código y llevarlo en formato digital los días del evento. Asimismo, recuerde portar su documento de identidad el cual será presentado para su registro.<br></br>

Finalmente, le informamos que, en cumplimiento de la Ley N.° 29733, Ley de Protección de Datos Personales, sus datos proporcionados podrán ser empleados por los organizadores y patrocinadores del evento para sus fines académicos y comerciales; salvo que exprese su negativa por lo que agradeceré comunicarlo al correo electrónico kriveros@apn.gob.pe<br></br>


              </p>
              <div className="mt-4 flex flex-col items-center justify-center text-center p-4 bg-background rounded-md shadow-inner">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Participant QR Code" className="h-32 w-32" />
                ) : (
                  <div className="h-32 w-32 bg-muted-foreground/10 animate-pulse rounded-md"></div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Tu personal QR code</p>
              </div>
              <p className="mt-4 text-sm">Atentamente,<br></br> Presidente del Comité Técnico Consultivo (CTC) sobre Gestión Portuaria Sostenible Y Protección Ambiental
<br></br>
AUTORIDAD PORTUARIA NACIONAL</p>
            </div>
          </div>
        ) : (
           <div className="border rounded-lg p-4 space-y-4 bg-secondary/30 text-center">
             <p className="text-muted-foreground">No participants to display. Try seeding the database.</p>
           </div>
        )}
        <Button onClick={handleSendEmails} className="w-full" size="lg" disabled={isSending || participants.length === 0}>
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {isSending ? 'Sending...' : `Enviar invitaciones a ${participants.length} participantes`}
        </Button>
      </CardContent>
    </Card>
  );
}
