'use client';

import { CheckCircle2, XCircle, QrCode } from 'lucide-react';
import type { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ScanConfirmationProps {
  participant: Participant;
  onClose: () => void;
  onStatusChange: (status: 'Attended' | 'Not Attended') => void;
  currentDay: "day1" | "day2";
}

export function ScanConfirmation({ participant, onClose, onStatusChange, currentDay }: ScanConfirmationProps) {
  console.log(participant);
  
  const status = participant.attendance[currentDay];
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl">
        <CardHeader className="p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            {status === 'Attended' ? (
              <CheckCircle2 className="text-green-500 size-16" />
            ) : (
              <QrCode className="text-primary size-16" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">{participant.name}</CardTitle>
          <CardDescription>{participant.email}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <p className="text-center text-sm text-muted-foreground mb-6">
            <span className="font-semibold uppercase">{currentDay} </span>
            Estado actual: <span className="font-semibold">{status}</span>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => onStatusChange('Not Attended')}
              disabled={status === 'Not Attended'}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Borrar
            </Button>
            <Button 
              onClick={() => onStatusChange('Attended')}
              disabled={status === 'Attended'}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Registrar
            </Button>
          </div>
        </CardContent>
        <CardFooter className="p-6 pt-0">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancelar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
