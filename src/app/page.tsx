"use client";

import { useState, useEffect } from "react";
import { Mail, QrCode } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initialParticipants } from "@/lib/participants";
import type { Participant } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { InviteTab } from "@/components/app/invite-tab";
import { ScanTab } from "@/components/app/scan-tab";
import { ScanConfirmation } from "@/components/app/scan-confirmation";

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null);
  const { toast } = useToast();

  const handleScan = (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (participant && participant.status === "Not Attended") {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, status: "Attended" } : p
        )
      );
      setScannedParticipant(participant);
    } else if (participant) {
      toast({
        title: "Already Checked In",
        description: `${participant.name} has already been marked as attended.`,
        variant: "default",
      });
    }
  };

  const handleCloseConfirmation = () => {
    setScannedParticipant(null);
  };
  
  useEffect(() => {
    if (scannedParticipant) {
      const timer = setTimeout(() => {
        handleCloseConfirmation();
      }, 5000); // Auto-close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [scannedParticipant]);


  return (
    <div className="flex flex-col min-h-screen bg-background font-body">
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
            AttendEasy
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            Event attendance, simplified. Send invitations with unique QR codes and track arrivals with a quick scan.
          </p>
        </header>

        <Tabs defaultValue="scan" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 h-12">
            <TabsTrigger value="invite" className="text-base">
              <Mail className="mr-2 h-4 w-4" />
              Invite & Send
            </TabsTrigger>
            <TabsTrigger value="scan" className="text-base">
              <QrCode className="mr-2 h-4 w-4" />
              Scan & Track
            </TabsTrigger>
          </TabsList>
          <TabsContent value="invite">
            <InviteTab participants={participants} />
          </TabsContent>
          <TabsContent value="scan">
            <ScanTab participants={participants} onScan={handleScan} />
          </TabsContent>
        </Tabs>

        {scannedParticipant && (
          <ScanConfirmation
            participant={scannedParticipant}
            onClose={handleCloseConfirmation}
          />
        )}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Built for seamless event management.</p>
      </footer>
    </div>
  );
}
