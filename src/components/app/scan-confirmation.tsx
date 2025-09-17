"use client";

import { CheckCircle2 } from "lucide-react";
import type { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

interface ScanConfirmationProps {
  participant: Participant;
  onClose: () => void;
}

export function ScanConfirmation({ participant, onClose }: ScanConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-in fade-in-0 zoom-in-95 duration-500 shadow-2xl">
        <CardContent className="p-6 pt-8 flex flex-col items-center text-center gap-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
            <div className="relative bg-primary/10 rounded-full p-4">
              <CheckCircle2 className="text-primary size-12" />
            </div>
          </div>
          <div className="space-y-1 mt-2">
            <CardTitle className="text-3xl font-headline">Checked In!</CardTitle>
            <CardDescription className="text-lg font-semibold text-primary">{participant.name}</CardDescription>
          </div>
          <p className="text-sm text-muted-foreground">{participant.email}</p>
          <Button onClick={onClose} className="mt-4 w-full" size="lg">
            Done
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
