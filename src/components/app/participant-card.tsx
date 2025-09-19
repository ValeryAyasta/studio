import type { Participant } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail } from "lucide-react";

interface ParticipantCardProps {
    participant: Participant;
    currentDay: "day1" | "day2";
}

export function ParticipantCard({ participant, currentDay }: ParticipantCardProps) {
    const isAttended = participant.attendance[currentDay] === "Attended";

    return (
        <Card className={`transition-all duration-300 ${isAttended ? 'bg-primary/5 border-primary/20' : ''}`}>
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                        <span className="truncate">{participant.name}</span>
                    </CardTitle>
                    <Badge variant={isAttended ? "default" : "outline"} className="capitalize whitespace-nowrap">
                        {participant.attendance[currentDay].toLowerCase()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground flex items-center gap-2 truncate">
                    <Mail className="w-3 h-3 flex-shrink-0"/>
                    <span className="truncate">{participant.email}</span>
                </p>
            </CardContent>
        </Card>
    );
}
