'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Loader2, CameraOff, Camera } from 'lucide-react';

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
import { Button } from '../ui/button';
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
  const [scannerStarted, setScannerStarted] = useState(false);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const { toast } = useToast();

  const switchCamera = async () => {
    if (!scannerRef.current) return;
    const cameras = await Html5Qrcode.getCameras();
    if (cameras.length < 2) return;
  
    const nextCamera = cameras.find(cam => cam.id !== currentCameraId) || cameras[0];
  
    if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      await scannerRef.current.stop();
      await new Promise(res => setTimeout(res, 200));
    }

    await scannerRef.current.start(
      { deviceId: { exact: nextCamera.id } },
      { fps: 5, qrbox: 250 },
      onScanSuccess,
      onScanError
    );
  
    setCurrentCameraId(nextCamera.id);
  };

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

  const startScanner = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras && cameras.length) {
        setHasCameraPermission(true);

        const backCamera = cameras.find(cam =>
          cam.label.toLowerCase().includes("back")
          || cam.label.toLowerCase().includes("rear")
        );

        if (
          scannerRef.current &&
          scannerRef.current.getState() !== Html5QrcodeScannerState.SCANNING
        ) {
          const cameraId = backCamera ? backCamera.id : cameras[0].id;
          await scannerRef.current.start(
            { deviceId: { exact: cameraId } },
            {
              fps: 5,
              qrbox: (viewfinderWidth, viewfinderHeight) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const qrboxSize = Math.floor(minEdge * 0.8);
                return { width: qrboxSize, height: qrboxSize };
              },
            },
            onScanSuccess,
            onScanError
          );
          setScannerStarted(true);
        }
      } else {
        setHasCameraPermission(false);
      }
    } catch (err) {
      console.error('Camera permission error or start failed:', err);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camara Error',
        description:
          'No se puede acceder a la cámara. Por favor revisa los permisos e intenta de nuevo.',
      });
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scanner = new Html5Qrcode(QR_READER_ID, { verbose: false });
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null; // 👈 forzar recreación
        })
        .catch((err) => {
          console.error('Failed to stop scanner:', err);
        });
  
      }
    };
  }, [isLoading, hasCameraPermission, onScanSuccess, toast]);

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle>Escanea y marca la asistencia</CardTitle>
        <CardDescription>
          Escanea el código QR del participante para marcar su asistencia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="p-4 md:p-6 bg-primary/5 rounded-lg flex flex-col items-center justify-center text-center border border-primary/10 lg:sticky lg:top-4 lg:self-start">
          <div className="w-full rounded-md overflow-hidden bg-muted">
            <div id={QR_READER_ID} className="w-full h-100" />

            {!scannerStarted && !isLoading && (
              <div className="absolute inset-0 flex flex-col h-full items-center justify-center gap-4 bg-background/90 z-10">
                <Button onClick={startScanner} className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Iniciar escaneo
                </Button>
              </div>
            )}
            
            {hasCameraPermission === false && !isLoading && (
               <div className="absolute inset-0 flex flex-col h-full items-center justify-center gap-4 text-destructive bg-background/80 z-10 p-4">
                 <CameraOff className="h-8 w-8" />
                 <h3 className="text-lg font-semibold">Acceso a la cámara denegado</h3>
                 <p className="text-sm text-muted-foreground">
                   Por favor, activa los permisos de la cámara en la configuración del navegador para escanear.
                 </p>
               </div>
            )}

            

          </div>
          {scannerStarted && hasCameraPermission && (
              <div className="mt-4">
                <Button
                  onClick={switchCamera}
                  size="sm"
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Cambiar cámara
                </Button>
              </div>
            )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Lista de participantes
          </h3>
          {participants.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              No se encontraron participantes, inicializa la base de datos.
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
