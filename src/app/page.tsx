'use client';

import { useState, useEffect } from 'react';
import { Mail, QrCode, Database } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Participant } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getParticipants, updateParticipantStatus, seedParticipants } from '@/lib/firestore';

import { InviteTab } from '@/components/app/invite-tab';
import { ScanTab } from '@/components/app/scan-tab';
import { ScanConfirmation } from '@/components/app/scan-confirmation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [scannedParticipant, setScannedParticipant] = useState<Participant | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const data = await getParticipants();
        setParticipants(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not fetch participants.',
          variant: 'destructive',
        });
      }
      setIsLoading(false);
    };
    fetchInitialData();
  }, []); // Empty dependency array to run only once on mount

  const handleSeed = async () => {
    const result = await seedParticipants();
    if (result?.success) {
      toast({
        title: 'Success',
        description: 'Database has been seeded with initial data.',
      });
      // Refetch data after seeding
      setIsLoading(true);
      const data = await getParticipants();
      setParticipants(data);
      setIsLoading(false);
    } else {
      toast({
        title: 'Seeding Failed',
        description:
          'An unknown error occurred during seeding.',
        variant: 'destructive',
      });
    }
  };

  const handleScan = (scannedValue: string) => {
    // Robustly clean the scanned value. It could be a simple string or a JSON string.
    let cleanedId = scannedValue.trim();
    try {
      const parsed = JSON.parse(cleanedId);
      // If it's a JSON object with an id, use that.
      if (parsed && parsed.id) {
        cleanedId = parsed.id;
      } else {
        // If it's a JSON string (e.g., "...id..."), re-assign to cleanedId
        cleanedId = parsed;
      }
    } catch (e) {
      // Not a JSON string, assume it's a plain ID. The initial trim is enough.
      // Also, remove potential quotes from simple strings if JSON.parse fails.
      cleanedId = cleanedId.replace(/^"|"$/g, '');
    }

    const participant = participants.find((p) => p.id === cleanedId);

    if (participant) {
      setScannedParticipant(participant);
    } else {
      console.error(
        'Failed to find participant. Scanned Value:',
        scannedValue,
        'Cleaned ID:',
        cleanedId
      );
      toast({
        title: 'Scan Error',
        description: `No participant found for ID: ${cleanedId}`,
        variant: 'destructive',
      });
    }
  };

  const handleCloseConfirmation = () => {
    setScannedParticipant(null);
  };

  const handleStatusChange = async (status: 'Attended' | 'Not Attended') => {
    if (!scannedParticipant) return;

    const result = await updateParticipantStatus(scannedParticipant.id, status);

    if (result?.success) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === scannedParticipant.id ? { ...p, status } : p
        )
      );
      toast({
        title: `Status Updated`,
        description: `${scannedParticipant.name}'s status updated to ${status}`,
      });
    } else {
      toast({
        title: 'Update Failed',
        description: result?.error || 'Could not update participant status.',
        variant: 'destructive',
      });
    }
    setScannedParticipant(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Firebase Studio
        </h1>
        <p className="text-center text-gray-500 mb-6">
          A starter for awesome apps.
        </p>

        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">
              <QrCode className="w-4 h-4 mr-2" />
              Scan
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Mail className="w-4 h-4 mr-2" />
              Invite
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scan">
            {/* Pass the isLoading state to ScanTab */}
            <ScanTab
              participants={participants}
              onScan={handleScan}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="invite">
            <InviteTab participants={participants} />
          </TabsContent>
        </Tabs>

        {scannedParticipant && (
          <ScanConfirmation
            participant={scannedParticipant}
            onClose={handleCloseConfirmation}
            onStatusChange={handleStatusChange}
          />
        )}

        <div className="absolute bottom-4 right-4">
          <Button variant="outline" size="icon" onClick={handleSeed}>
            <Database className="h-4 w-4" />
            <span className="sr-only">Seed Database</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
