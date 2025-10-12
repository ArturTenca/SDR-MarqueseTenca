import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowupData } from "@/types/followup";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MessagesViewerProps {
  data: FollowupData[];
  loading: boolean;
}

export const MessagesViewer = ({ data, loading }: MessagesViewerProps) => {
  const [selectedLead, setSelectedLead] = useState<FollowupData | null>(null);

  // Group by remotejID and get latest message for each
  const leadMessages = data.reduce((acc: any[], item) => {
    if (!item.remotejID) return acc;
    
    const existing = acc.find((l) => l.remotejID === item.remotejID);
    if (!existing) {
      acc.push(item);
    } else if (
      item.ultimaAtividade &&
      existing.ultimaAtividade &&
      new Date(item.ultimaAtividade) > new Date(existing.ultimaAtividade)
    ) {
      const index = acc.indexOf(existing);
      acc[index] = item;
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leadMessages.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate">
                        {lead.remotejID}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lead.ultimaAtividade
                      ? format(parseISO(lead.ultimaAtividade), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })
                      : "-"}
                  </div>
                  <p className="text-sm line-clamp-2">
                    {lead.ultimaMensagem || "Sem mensagem"}
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver conversa completa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Conversa com {lead.remotejID}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Última Mensagem</p>
                            <p className="text-sm">{lead.ultimaMensagem || "Sem mensagem"}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {lead.ultimaAtividade
                                ? format(parseISO(lead.ultimaAtividade), "dd/MM/yyyy 'às' HH:mm", {
                                    locale: ptBR,
                                  })
                                : "-"}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Informações do Lead</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">ID:</span>{" "}
                                <span className="font-medium">{lead.id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Status:</span>{" "}
                                <span className="font-medium">
                                  {lead.encerrado ? "Encerrado" : "Em Andamento"}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Follow-up 1:</span>{" "}
                                <span className="font-medium">{lead.followup1 ? "Sim" : "Não"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Follow-up 2:</span>{" "}
                                <span className="font-medium">{lead.followup2 ? "Sim" : "Não"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
