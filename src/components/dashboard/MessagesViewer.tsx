import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FollowupData } from "@/types/followup";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, User, Bot } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface MessagesViewerProps {
  data: FollowupData[];
  loading: boolean;
}

interface MessageHistory {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const MessagesViewer = ({ data, loading }: MessagesViewerProps) => {
  const [selectedLead, setSelectedLead] = useState<FollowupData | null>(null);
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch conversation history for a specific lead
  const fetchConversationHistory = async (remotejID: string) => {
    setLoadingHistory(true);
    try {
      // Try to fetch from n8n_chat_histories table
      const { data: chatHistory, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', remotejID)
        .order('id', { ascending: true });

      if (error) {
        // Error fetching chat history
        setMessageHistory([]);
      } else if (chatHistory && chatHistory.length > 0) {
        console.log('🔍 Raw chat history data (MessagesViewer):', chatHistory);
        
        // Process real chat history
        const processedHistory: MessageHistory[] = chatHistory.map((chat, index) => {
          const messageData = chat.message as any;
          
          // Log first few messages for debugging
          if (index < 5) {
            console.log(`📝 Message ${index + 1} structure (MessagesViewer):`, {
              id: chat.id,
              session_id: chat.session_id,
              message: messageData,
              messageType: messageData?.type,
              messageRole: messageData?.role,
              created_at: chat.created_at,
              timestamp: chat.timestamp
            });
          }
          
          // Determine role based on message structure
          let role = 'user'; // Default to user
          
          if (messageData) {
            console.log(`🔍 Analyzing message ${index + 1} (MessagesViewer):`, {
              type: messageData.type,
              role: messageData.role,
              from: messageData.from,
              sender: messageData.sender,
              content: messageData.content?.substring(0, 50) + '...'
            });
            
            // Check for type field - AI means bot/assistant
            if (messageData.type === 'AI') {
              role = 'assistant';
              console.log(`🤖 Identified as assistant by type: "${messageData.type}"`);
            }
            // Check for explicit role field
            else if (messageData.role) {
              role = messageData.role;
              console.log(`👤 Identified by role field: "${messageData.role}"`);
            }
            // Check for other indicators
            else if (messageData.from === 'bot' || messageData.sender === 'bot' || messageData.type === 'bot') {
              role = 'assistant';
              console.log(`🤖 Identified as assistant by other indicators`);
            }
            else if (messageData.from === 'user' || messageData.sender === 'user' || messageData.type === 'user') {
              role = 'user';
              console.log(`👤 Identified as user by indicators`);
            }
            // If no clear indicator, default to user
            else {
              role = 'user';
              console.log(`❓ No clear indicator found, defaulting to user`);
            }
          } else {
            console.log(`❌ No messageData found for message ${index + 1} (MessagesViewer)`);
          }
          
          return {
            id: chat.id,
            role: role,
            content: messageData?.content || messageData?.text || messageData?.message || 'Mensagem não disponível',
            timestamp: messageData?.timestamp || chat.created_at || new Date().toISOString()
          };
        });
        
        console.log('🎯 Processed messages (MessagesViewer):', processedHistory);
        setMessageHistory(processedHistory);
      } else {
        setMessageHistory([]);
      }
    } catch (error) {
      // Error fetching conversation history
      setMessageHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedLead(lead);
                          if (lead.remotejID) {
                            fetchConversationHistory(lead.remotejID);
                          }
                        }}
                      >
                        Ver conversa completa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Conversa Completa - {lead.remotejID}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {/* Full Conversation History */}
                          <div className="space-y-3">
                            <h4 className="font-medium">Histórico Completo da Conversa</h4>
                            {loadingHistory ? (
                              <div className="space-y-2">
                                {[1, 2, 3, 4].map((i) => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : messageHistory.length > 0 ? (
                              <div className="space-y-2">
                                {messageHistory.map((message) => (
                                  <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${
                                      message.role === 'user'
                                        ? 'bg-muted ml-8'
                                        : 'bg-primary/10 mr-8'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="flex items-center gap-1">
                                        {message.role === 'user' ? (
                                          <User className="h-3 w-3" />
                                        ) : (
                                          <Bot className="h-3 w-3" />
                                        )}
                                        <Badge variant="outline" className="text-xs">
                                          {message.role === 'user' ? 'Cliente' : 'Assistente'}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {format(parseISO(message.timestamp), "dd/MM HH:mm", {
                                          locale: ptBR,
                                        })}
                                      </span>
                                    </div>
                                    <p className="text-sm">{message.content}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Nenhuma mensagem encontrada para este lead.</p>
                              </div>
                            )}
                          </div>

                          {/* Lead Information */}
                          <div className="space-y-2 border-t pt-4">
                            <h4 className="font-medium">Informações do Lead</h4>
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
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Última Atividade:</span>{" "}
                                <span className="font-medium">
                                  {lead.ultimaAtividade
                                    ? format(parseISO(lead.ultimaAtividade), "dd/MM/yyyy 'às' HH:mm", {
                                        locale: ptBR,
                                      })
                                    : "-"}
                                </span>
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
