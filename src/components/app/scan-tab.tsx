'use client';

import { useEffect, useRef, useState } from 'react';
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
  
  useEffect(() => {
    // Only initialize if not already done
    if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_READER_ID, /* verbose= */ false);
    }
    const scanner = scannerRef.current;
    
    // Check if the element is in the DOM
    const qrReaderElement = document.getElementById(QR_READER_ID);
    if (!qrReaderElement) return;

    // Check permissions and start camera
    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          setHasCameraPermission(true);
          const cameraId = cameras[0].id;

          const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
            const minEdgePercentage = 0.7; // 70%
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return { width: qrboxSize, height: qrboxSize };
          };
          
          if (scanner.getState() !== Html5QrcodeScannerState.SCANNING) {
            await scanner.start(
              cameraId,
              {
                fps: 5,
                qrbox: qrboxFunction,
              },
              (decodedText, decodedResult) => {
                if (isProcessingRef.current) return;
                isProcessingRef.current = true;
                onScan(decodedText);
                setTimeout(() => {
                  isProcessingRef.current = false;
                }, 2000); // 2-second cooldown to prevent rapid multi-scans
              },
              (errorMessage) => {
                // handle scan error
              }
            );
          }
        } else {
            setHasCameraPermission(false);
        }
      } catch (err) {
        console.error("Camera permission error:", err);
        setHasCameraPermission(false);
      }
    };
    
    startScanner();

    // Cleanup function to stop the scanner
    return () => {
      if (scanner && scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(err => {
          console.error("Failed to stop scanner:", err);
        });
      }
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
                <h3 className="text-lg font-semibold">Loading Data...</h3>
              </div>
            ) : (
                <>
                    <div id={QR_READER_ID} className="w-full h-full rounded-md overflow-hidden" />
                    {!hasCameraPermission && (
                         <div className="flex flex-col h-full items-center justify-center gap-4 text-destructive">
                            <CameraOff className="h-8 w-8" />
                            <h3 className="text-lg font-semibold">Camera Access Denied</h3>
                            <p className="text-sm text-muted-foreground px-4">
                            Please enable camera permissions in your browser settings to use the scanner.
                            </p>
                        </div>
                    )}
                </>
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
