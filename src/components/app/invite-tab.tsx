"use client";

import { Mail, QrCode } from "lucide-react";
import type { Participant } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface InviteTabProps {
  participants: Participant[];
}

export function InviteTab({ participants }: InviteTabProps) {
  const { toast } = useToast();
  const sampleParticipant = participants.find(p => p.email === 'valeryayasta@gmail.com') || participants[0];

  const handleSendEmails = () => {
    toast({
      title: "Invitations Sent!",
      description: `Successfully simulated sending ${participants.length} email invitations.`,
    });
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
        <Button onClick={handleSendEmails} className="w-full md:w-auto" size="lg">
          <Mail className="mr-2 h-4 w-4" />
          Send Invitations to {participants.length} Participants
        </Button>
      </CardContent>
    </Card>
  );
}
