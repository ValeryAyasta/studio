'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Loader2, CameraOff } from 'lucide-react';

import type { AttendanceSummary, Participant } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ParticipantCard } from './participant-card';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';

interface ScanTabProps {
  participants: Participant[];
  onScan: (id: string) => void;
  isLoading: boolean;
  currentDay: "day1" | "day2";
  summary: AttendanceSummary
}

const QR_READER_ID = 'qr-reader';

export function ScanTab({ participants, onScan, isLoading, currentDay, summary }: ScanTabProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isProcessingRef = useRef(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const { toast } = useToast();

  const onScanSuccess = useCallback(
    (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      onScan(decodedText);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000); // 2-second cooldown
    },
    [onScan]
  );

  const onScanError = (errorMessage: string) => {
    // This callback is required but we can ignore non-critical errors.
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scanner = new Html5Qrcode(QR_READER_ID, { verbose: false });
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          setHasCameraPermission(true);
          if (
            scannerRef.current &&
            scannerRef.current.getState() !== Html5QrcodeScannerState.SCANNING
          ) {
            await scannerRef.current.start(
              { facingMode: 'environment' },
              {
                fps: 5,
                qrbox: 
                (viewfinderWidth, viewfinderHeight) => {
                  const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                  const qrboxSize = Math.floor(minEdge * 0.7);
                  return { width: qrboxSize, height: qrboxSize };
                },
              },
              onScanSuccess,
              onScanError
            );
          }
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.error('Camera permission error or start failed:', err);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Error',
          description:
            'Could not access camera. Please check permissions and try again.',
        });
      }
    };

    if (!isLoading && hasCameraPermission === null) {
      startScanner();
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => {
          console.error('Failed to stop scanner:', err);
        });
      }
    };
  }, [isLoading, hasCameraPermission, onScanSuccess, toast]);

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Scan & Track Attendance</CardTitle>
        <CardDescription>
          Scan a participant's QR code to mark them as attended.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="p-4 md:p-6 bg-primary/5 rounded-lg flex flex-col items-center justify-center text-center border border-primary/10 lg:sticky lg:top-4 lg:self-start">
          <div className="w-full rounded-md overflow-hidden bg-muted">
            <div id={QR_READER_ID} className="w-full h-80" />

            {hasCameraPermission === null && !isLoading && (
              <div className="absolute inset-0 flex flex-col h-full items-center justify-center gap-4 text-primary bg-background/80 z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
                <h3 className="text-lg font-semibold">Requesting Camera...</h3>
              </div>
            )}
            
            {hasCameraPermission === false && !isLoading && (
               <div className="absolute inset-0 flex flex-col h-full items-center justify-center gap-4 text-destructive bg-background/80 z-10 p-4">
                 <CameraOff className="h-8 w-8" />
                 <h3 className="text-lg font-semibold">Camera Access Denied</h3>
                 <p className="text-sm text-muted-foreground">
                   Please enable camera permissions in your browser settings to
                   use the scanner.
                 </p>
               </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Attendance List: {summary[currentDay]}
          </h3>
          {participants.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              No participants found. Try seeding the database.
            </p>
          ) : (
            <ScrollArea className="h-auto lg:h-[calc(100vh-20rem)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-4">
                {participants
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((p) => (
                    <ParticipantCard key={p.email} participant={p} currentDay={currentDay} />
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
