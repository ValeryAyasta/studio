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
  
  const sampleParticipant = participants.find(p => p.email === 'valeryayasta@gmail.com') || (participants.length > 0 ? participants[0] : null);

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
        title: "Invitations Sent!",
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Send Invitations</CardTitle>
        <CardDescription>
          Send a mass email to all participants with their unique QR code for check-in. Here's a preview.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
       {sampleParticipant ? (
          <div className="border rounded-lg p-4 space-y-4 bg-secondary/30">
            <h3 className="font-semibold text-foreground">Email Preview</h3>
            <p className="text-sm text-muted-foreground">To: {sampleParticipant.email}</p>
            <p className="text-sm font-bold">Subject: Your Invitation to the Main Event!</p>
            <div className="pt-4 border-t">
              <p className="text-sm">Hello {sampleParticipant.name},</p>
              <p className="mt-2 text-sm text-muted-foreground">We're excited to have you at our event. Please have this unique QR code ready for a smooth check-in process.</p>
              <div className="mt-4 flex flex-col items-center justify-center text-center p-4 bg-background rounded-md shadow-inner">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Participant QR Code" className="h-32 w-32" />
                ) : (
                  <div className="h-32 w-32 bg-muted-foreground/10 animate-pulse rounded-md"></div>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Your personal QR code</p>
              </div>
              <p className="mt-4 text-sm">See you there!</p>
            </div>
          </div>
        ) : (
           <div className="border rounded-lg p-4 space-y-4 bg-secondary/30 text-center">
             <p className="text-muted-foreground">No participants to display. Try seeding the database.</p>
           </div>
        )}
        <Button onClick={handleSendEmails} className="w-full md:w-auto" size="lg" disabled={isSending || participants.length === 0}>
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Mail className="mr-2 h-4 w-4" />
          )}
          {isSending ? 'Sending...' : `Send Invitations to ${participants.length} Participants`}
        </Button>
      </CardContent>
    </Card>
  );
}
