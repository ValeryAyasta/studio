
"use client";

import { useState, useEffect } from "react";
import { Mail, QrCode, Database } from "lucide-react";
import { ref, onValue } from "firebase/database";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Participant } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase"; // Use client-side db
import { updateParticipantStatus, seedParticipants } from "@/lib/firestore";


import { InviteTab } from "@/components/app/invite-tab";
import { ScanTab } from "@/components/app/scan-tab";
import { ScanConfirmation } from "@/components/app/scan-confirmation";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const participantsRef = ref(db, 'participants');
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const participantsList: Participant[] = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setParticipants(participantsList);
      } else {
        setParticipants([]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleScan = async (participantId: string) => {
    const participant = participants.find((p) => p.id === participantId);
    if (participant && participant.status === "Not Attended") {
      const result = await updateParticipantStatus(participantId, "Attended");
      if (result.success) {
        setScannedParticipant(participant);
      } else {
         toast({
          title: "Error",
          description: "Failed to update participant status.",
          variant: "destructive",
        });
      }
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

  const handleSeed = async () => {
    const result = await seedParticipants();
    if (result.success) {
      toast({
        title: "Database Seeded",
        description: result.message,
      });
    } else {
      toast({
        title: "Error Seeding",
        description: result.error,
        variant: "destructive",
      });
    }
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
          <div className="flex justify-center items-center gap-4 mb-4">
             <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
              AttendEasy
            </h1>
            <Button onClick={handleSeed} variant="outline" size="sm">
              <Database className="mr-2 h-4 w-4" /> Seed Database
            </Button>
          </div>
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
            <div style={{ display: scannedParticipant ? "none" : "block" }}>
              <ScanTab participants={participants} onScan={handleScan} />
            </div>
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
