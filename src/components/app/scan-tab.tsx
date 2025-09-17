import type { Participant } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "lucide-react";
import { ParticipantCard } from "./participant-card";

interface ScanTabProps {
  participants: Participant[];
  onScan: (id: string) => void;
}

export function ScanTab({ participants, onScan }: ScanTabProps) {
  const valery = participants.find(p => p.email === 'valeryayasta@gmail.com');

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
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">Click the button to simulate scanning a QR code. In a real app, this would open a camera scanner.</p>
            {valery && (
                <Button 
                  onClick={() => onScan(valery.id)} 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-md"
                  disabled={valery.status === 'Attended'}
                >
                    <QrCode className="mr-2 h-5 w-5"/>
                    Simulate Scan for Valery Ayasta
                </Button>
            )}
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-4">Attendance List</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {participants.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                    <ParticipantCard key={p.id} participant={p} />
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
