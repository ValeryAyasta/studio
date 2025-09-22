'use client';

import type { Participant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Send, Edit } from "lucide-react";

// Importa tu server action
import { sendEmailToParticipant } from "@/ai/flows/send-email-flow";
import { useState, useTransition } from "react";
import { updateParticipantEmail } from "@/lib/firestore";

interface ParticipantCardProps {
    participant: Participant;
    currentDay: "day1" | "day2";
}

export function ParticipantCard({ participant, currentDay }: ParticipantCardProps) {
    const isAttended = participant.attendance[currentDay] === "Attended";

    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState(participant.email);


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

    const handleEditEmail = async () => {
      const newEmail = prompt("Ingrese el nuevo correo:", email);
      if (newEmail && newEmail.trim()) {
        try {
          await updateParticipantEmail(participant.id, newEmail.trim());
          setEmail(newEmail.trim());
          alert(`Correo actualizado en Firebase a: ${newEmail.trim()}`);
        } catch (err) {
          alert("Error al actualizar el correo en la base de datos.");
        }
      }
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
          <span className="truncate">{email}</span>
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleResend}
            disabled={isPending}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            {isPending ? "Enviando..." : "Reenviar"}
          </button>

          <button
            onClick={handleEditEmail}
            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
          >
            <Edit className="w-3 h-3" />
            Editar
          </button>
        </div>
            </CardContent>
        </Card>
    );
}
