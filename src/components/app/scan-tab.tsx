"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

import type { Participant } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipantCard } from "./participant-card";

interface ScanTabProps {
  participants: Participant[];
  onScan: (id: string) => void;
}

// We will render the scanner in this constant div ID.
const QR_READER_ID = "qr-reader";

export function ScanTab({ participants, onScan }: ScanTabProps) {
  // Use a ref to hold the scanner instance. This prevents it from being re-created on every render.
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Only initialize the scanner if it doesn't exist and the element is in the DOM.
    if (!scannerRef.current && document.getElementById(QR_READER_ID)) {
      const scanner = new Html5QrcodeScanner(
        QR_READER_ID,
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 5,
        },
        /* verbose= */ false
      );

       const success = (result: string) => {
        if (isProcessingRef.current) return;
        
        try {
          // Intenta parsear el resultado como JSON para obtener el ID
          const participantData = JSON.parse(result);
          if (participantData && participantData.id) {
            isProcessingRef.current = true;
            onScan(participantData.id);
          } else {
             onScan(result);
          }
        } catch (error) {
           onScan(result);
        }

        // Reset del bloqueo después de 1.2s (evita procesar el mismo QR varias veces rápido)
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1200);
      };
      const error = (err: any) => {
        // This callback is called frequently when no QR is detected. We can ignore it.
      };

      scanner.render(success, error);
      scannerRef.current = scanner;
    }

    // Cleanup function: this will be called when the component unmounts.
    return () => {
      /*
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Failed to clear scanner on unmount", err);
        });
        scannerRef.current = null;
      }*/
    };
  // We pass onScan in the dependency array to ensure the callbacks have the latest version.
  }, [onScan]);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Scan & Track Attendance</CardTitle>
        <CardDescription>
          Scan a participant's QR code to mark them as attended.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="p-6 bg-primary/5 rounded-lg flex flex-col items-center justify-center text-center border border-primary/10">
          <h3 className="text-lg font-semibold text-primary">Ready to Scan</h3>
          {/* This div is where the scanner will be rendered. */}
          <div id={QR_READER_ID} className="w-full"></div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Attendance List</h3>
           {participants.length === 0 ? (
            <p className="text-muted-foreground text-center">No participants found. Try seeding the database.</p>
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
