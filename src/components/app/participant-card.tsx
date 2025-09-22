'use client';

import type { Participant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Send } from "lucide-react";

import { useTransition } from "react";

// Importa tu server action
import { sendEmailToParticipant } from "@/ai/flows/send-email-flow";

interface ParticipantCardProps {
    participant: Participant;
    currentDay: "day1" | "day2";
}

export function ParticipantCard({ participant, currentDay }: ParticipantCardProps) {
    const isAttended = participant.attendance[currentDay] === "Attended";

    const [isPending, startTransition] = useTransition();

    const handleResend = () => {
      startTransition(async () => {
        try {
          await sendEmailToParticipant(participant);
          alert(`Correo reenviado a ${participant.email}`);
        } catch (err) {
          alert(`Error al enviar correo a ${participant.email}`);
        }
      });
    };

    return (
        <Card className={`transition-all duration-300 ${isAttended ? 'bg-primary/5 border-primary/20' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2 min-w-0">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                        <span className="truncate min-w-0">{participant.name}</span>
                    </CardTitle>
                    <Badge
                      variant={isAttended ? "default" : "outline"} 
                      className="capitalize whitespace-nowrap flex-shrink-0">
                        {participant.attendance[currentDay].toLowerCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground flex items-center gap-2 truncate mb-3">
                    <Mail className="w-3 h-3 flex-shrink-0"/>
                    <span className="truncate">{participant.email}</span>
                </p>
                <button
                  onClick={handleResend}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  {isPending ? "Enviando..." : "Reenviar"}
                </button>
            </CardContent>
        </Card>
    );
}
