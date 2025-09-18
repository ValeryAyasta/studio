'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Loader2, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { Participant } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ParticipantCard } from './participant-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ScanTabProps {
  participants: Participant[];
  onScan: (id: string) => void;
  isLoading: boolean;
}

const QR_READER_ID = 'qr-reader';

export function ScanTab({ participants, onScan, isLoading }: ScanTabProps) {
  const { toast } = useToast();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  
  const onScanSuccess = useCallback((decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;
      onScan(decodedText);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2000); // 2-second cooldown
  }, [onScan]);

  useEffect(() => {
    // Component mounts
    const scanner = new Html5Qrcode(QR_READER_ID, false);
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          setHasCameraPermission(true);
          if (scanner.getState() === Html5QrcodeScannerState.NOT_STARTED) {
            await scanner.start(
              { facingMode: "environment" },
              {
                fps: 5,
                qrbox: (viewfinderWidth, viewfinderHeight) => {
                  const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                  const qrboxSize = Math.floor(minEdge * 0.7);
                  return { width: qrboxSize, height: qrboxSize };
                },
              },
              onScanSuccess,
              (errorMessage) => { /* ignore errors */ }
            );
          }
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        setHasCameraPermission(false);
        console.error("Camera permission error:", err);
      }
    };

    if (!isLoading) {
      startScanner();
    }

    // Component unmounts
    return () => {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(err => {
          console.error("Failed to stop scanner:", err);
        });
      }
    };
  }, [isLoading, onScanSuccess]);


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
          <div className="w-full aspect-square max-w-sm mx-auto relative">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col h-full items-center justify-center gap-4 text-primary bg-background/80 rounded-md z-10">
                <Loader2 className="h-8 w-8 animate-spin" />
                <h3 className="text-lg font-semibold">Loading Data...</h3>
              </div>
            )}
            
            <div id={QR_READER_ID} className="w-full h-full rounded-md overflow-hidden" />
            
            {!hasCameraPermission && !isLoading && (
                 <div className="absolute inset-0 flex flex-col h-full items-center justify-center gap-4 text-destructive bg-background/80 rounded-md z-10">
                    <CameraOff className="h-8 w-8" />
                    <h3 className="text-lg font-semibold">Camera Access Denied</h3>
                    <p className="text-sm text-muted-foreground px-4">
                    Please enable camera permissions in your browser settings to use the scanner.
                    </p>
                </div>
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
