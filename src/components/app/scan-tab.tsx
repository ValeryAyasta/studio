'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Loader2 } from 'lucide-react';

import type { Participant } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ParticipantCard } from './participant-card';

interface ScanTabProps {
  participants: Participant[];
  onScan: (id: string) => void;
  isLoading: boolean;
}

const QR_READER_ID = 'qr-reader';

export function ScanTab({ participants, onScan, isLoading }: ScanTabProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isLoading || scannerRef.current || !document.getElementById(QR_READER_ID)) {
      return;
    }

    const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
      const minEdgePercentage = 0.7; // 70%
      const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
      const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
      return {
        width: qrboxSize,
        height: qrboxSize,
      };
    };

    const scanner = new Html5QrcodeScanner(
      QR_READER_ID,
      {
        qrbox: qrboxFunction,
        fps: 5,
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    const success = (result: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      scanner.pause(true);
      onScan(result);

      setTimeout(() => {
        isProcessingRef.current = false;
        if (scannerRef.current) {
          scanner.resume();
        }
      }, 1500);
    };

    const error = (err: any) => {
      // Ignore frequent errors
    };

    scanner.render(success, error);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current && (scannerRef.current as any).getState() === 2) { // 2 is SCANNING STATE
        scannerRef.current.clear().catch((err) => {
          console.error('Failed to clear scanner on unmount.', err);
        });
      }
      scannerRef.current = null;
    };
  }, [isLoading, onScan]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Scan & Track Attendance</CardTitle>
        <CardDescription>
          Scan a participant's QR code to mark them as attended.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="p-4 md:p-6 bg-primary/5 rounded-lg flex flex-col items-center justify-center text-center border border-primary/10">
          <div className="w-full aspect-square max-w-sm mx-auto">
            {isLoading ? (
              <div className="flex flex-col h-full items-center justify-center gap-4 text-primary">
                <Loader2 className="h-8 w-8 animate-spin" />
                <h3 className="text-lg font-semibold">Loading Scanner...</h3>
                <p className="text-sm text-muted-foreground px-4">
                  Please wait for the attendance list to load.
                </p>
              </div>
            ) : (
              <div id={QR_READER_ID} className="w-full h-full rounded-md overflow-hidden"></div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Attendance List</h3>
          {participants.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              No participants found. Try seeding the database.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((p) => (
                  <ParticipantCard key={p.id} participant={p} />
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
