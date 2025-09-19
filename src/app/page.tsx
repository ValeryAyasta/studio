'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, QrCode, Database } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Participant, AttendanceSummary } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getParticipants, updateParticipantStatus, seedParticipants } from '@/lib/firestore';

import { InviteTab } from '@/components/app/invite-tab';
import { ScanTab } from '@/components/app/scan-tab';
import { ScanConfirmation } from '@/components/app/scan-confirmation';
import { Button } from '@/components/ui/button';



export default function Home() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const participantsRef = useRef<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add isLoading state
  const [currentDay, setCurrentDay] = useState<"day1" | "day2">("day1");
  const [summary, setSummary] = useState<AttendanceSummary>({ day1: 0, day2: 0 });
  const [scannedParticipantId, setScannedParticipantId] = useState<string | null>(null);

const scannedParticipant = scannedParticipantId
  ? participants.find((p) => p.id === scannedParticipantId) || null
  : null;

  const { toast } = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const data = await getParticipants();
        setParticipants(data);
        participantsRef.current = data;

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

    async function fetchSummary() {
      try {
        const res = await fetch(
          "https://studio-1109012300-d69eb-default-rtdb.firebaseio.com/attendanceSummary.json"
        );
        const data = await res.json();
        setSummary(data || { day1: 0, day2: 0 });
      } catch (err) {
        console.error("Error fetching summary:", err);
        setSummary({ day1: 0, day2: 0 });
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();

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

    const participant = participantsRef.current.find((p) => p.id === cleanedId);

    if (participant) {
      setScannedParticipantId(participant.id);    } else {
      console.error(
        'Error al encontrar al participante. Scanned Value:',
        scannedValue
      );
      toast({
        title: 'Scan Error',
        description: `No se encontró participante para el ID: ${cleanedId}`,
        variant: 'destructive',
      });
    }
  };

  const handleCloseConfirmation = () => {
    setScannedParticipantId(null);
  };

  const handleStatusChange = async (status: 'Attended' | 'Not Attended') => {
    if (!scannedParticipant) return;

    const result = await updateParticipantStatus(scannedParticipant.id, currentDay, status);

    if (result?.success) {
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === scannedParticipant.id 
            ? { 
                ...p, 
                attendance: {
                  ...p.attendance,
                  [currentDay]: status, 
                }, 
              } 
            : p
        )
      );

      setSummary(prev => ({
        ...prev,
        [currentDay]: prev[currentDay] + (status === 'Attended' ? 1 : -1)
      }));
      toast({
        title: `Status Updated`,
        description: `${scannedParticipant.name}'s status for ${currentDay} updated to ${status}`,
      });
    } else {
      toast({
        title: 'Update Failed',
        description: result?.error || 'Could not update participant status.',
        variant: 'destructive',
      });
    }
    setScannedParticipantId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Control de Asistencia
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Envío y escaneo de QRs
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <Button 
            variant={currentDay === "day1" ? "default" : "outline"} 
            onClick={() => setCurrentDay("day1")}
          >
            Día 1
          </Button>
          <Button 
            variant={currentDay === "day2" ? "default" : "outline"} 
            onClick={() => setCurrentDay("day2")}
          >
            Día 2
          </Button>
        </div>


        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan">
              <QrCode className="w-4 h-4 mr-2" />
              Escanear
            </TabsTrigger>
            <TabsTrigger value="invite">
              <Mail className="w-4 h-4 mr-2" />
              Invitar
            </TabsTrigger>
          </TabsList>
          <TabsContent value="scan">
            {/* Pass the isLoading state to ScanTab */}
            <ScanTab
              participants={participants}
              onScan={handleScan}
              isLoading={isLoading}
              currentDay={currentDay}
              summary={summary}
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
            currentDay={currentDay}
          />
        )}

        <div className="absolute bottom-4 right-4">
          <Button variant="outline" size="icon" onClick={handleSeed}>
            <Database className="h-4 w-4" />
            <span className="sr-only">Inicializar base de datos</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
