"use client";

import { useState } from "react";
import { Loader2, Mail, QrCode } from "lucide-react";
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
  const sampleParticipant = participants.find(p => p.email === 'valeryayasta@gmail.com') || participants[0];

  const handleSendEmails = async () => {
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
        <div className="border rounded-lg p-4 space-y-4 bg-secondary/30">
          <h3 className="font-semibold text-foreground">Email Preview</h3>
          <p className="text-sm text-muted-foreground">To: {sampleParticipant.email}</p>
          <p className="text-sm font-bold">Subject: Your Invitation to the Main Event!</p>
          <div className="pt-4 border-t">
            <p className="text-sm">Hello {sampleParticipant.name},</p>
            <p className="mt-2 text-sm text-muted-foreground">We're excited to have you at our event. Please have this unique QR code ready for a smooth check-in process.</p>
            <div className="mt-4 flex flex-col items-center justify-center text-center p-4 bg-background rounded-md shadow-inner">
              <QrCode className="h-24 w-24 text-primary" />
              <p className="mt-2 text-xs text-muted-foreground">Your personal QR code</p>
            </div>
            <p className="mt-4 text-sm">See you there!</p>
          </div>
        </div>
        <Button onClick={handleSendEmails} className="w-full md:w-auto" size="lg" disabled={isSending}>
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
