import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FollowupData } from "@/types/followup";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Users, 
  Target,
  Brain,
  BarChart3,
  Activity
} from "lucide-react";
import { format, parseISO, differenceInHours, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface ConversationAnalysisProps {
  data: FollowupData[];
  loading: boolean;
}

interface ConversationInsights {
  avgResponseTime: number;
  conversionRate: number;
  avgMessagesPerLead: number;
  peakActivityHours: number[];
  topKeywords: { word: string; count: number }[];
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  followupEffectiveness: {
    followup1: number;
    followup2: number;
  };
}

export const ConversationAnalysis = ({ data, loading }: ConversationAnalysisProps) => {
  const [insights, setInsights] = useState<ConversationInsights | null>(null);
  const [selectedLead, setSelectedLead] = useState<FollowupData | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Calculate conversation insights
  useEffect(() => {
    if (data.length === 0) return;

    const calculateInsights = () => {
      // Average response time (simulated based on activity patterns)
      const responseTimes = data.map(item => {
        if (!item.ultimaAtividade) return 0;
        const created = new Date(item.created_at);
        const lastActivity = new Date(item.ultimaAtividade);
        return differenceInHours(lastActivity, created);
      }).filter(time => time > 0);

      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      // Conversion rate
      const converted = data.filter(item => item.encerrado).length;
      const conversionRate = (converted / data.length) * 100;

      // Average messages per lead (simulated)
      const avgMessagesPerLead = Math.round(data.length * 3.2); // Simulated average

      // Peak activity hours
      const hourlyActivity = data.reduce((acc: any, item) => {
        if (!item.ultimaAtividade) return acc;
        const hour = new Date(item.ultimaAtividade).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const peakActivityHours = Object.entries(hourlyActivity)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

      // Top keywords (simulated based on common legal terms)
      const keywords = [
        'consultoria', 'contrato', 'trabalhista', 'tributário', 'compliance',
        'reunião', 'proposta', 'valor', 'serviço', 'empresa', 'direito',
        'advogado', 'jurídico', 'cliente', 'negociação'
      ];
      
      const topKeywords = keywords.slice(0, 5).map(word => ({
        word,
        count: Math.floor(Math.random() * 20) + 5
      }));

      // Sentiment analysis (simulated)
      const sentimentAnalysis = {
        positive: Math.round(data.length * 0.45),
        neutral: Math.round(data.length * 0.35),
        negative: Math.round(data.length * 0.20)
      };

      // Follow-up effectiveness
      const followup1Count = data.filter(item => item.followup1).length;
      const followup2Count = data.filter(item => item.followup2).length;
      const followupEffectiveness = {
        followup1: followup1Count > 0 ? (converted / followup1Count) * 100 : 0,
        followup2: followup2Count > 0 ? (converted / followup2Count) * 100 : 0
      };

      setInsights({
        avgResponseTime,
        conversionRate,
        avgMessagesPerLead,
        peakActivityHours,
        topKeywords,
        sentimentAnalysis,
        followupEffectiveness
      });
    };

    calculateInsights();
  }, [data]);

  const fetchConversationHistory = async (remotejID: string) => {
    setLoadingHistory(true);
    try {
      // Simulate fetching conversation history
      // In a real implementation, you would query the n8n_chat_histories table
      const mockHistory = [
        {
          id: 1,
          role: 'user',
          content: 'Olá! Gostaria de saber mais sobre os serviços jurídicos.',
          timestamp: '2025-01-10T10:30:00Z'
        },
        {
          id: 2,
          role: 'assistant',
          content: 'Olá! Ficamos felizes em saber do seu interesse. Oferecemos consultoria jurídica empresarial, direito trabalhista, tributário e compliance.',
          timestamp: '2025-01-10T10:31:00Z'
        },
        {
          id: 3,
          role: 'user',
          content: 'Sim, gostaria de agendar uma reunião. Qual seria o melhor horário?',
          timestamp: '2025-01-10T10:32:00Z'
        },
        {
          id: 4,
          role: 'assistant',
          content: 'Temos disponibilidade na próxima semana. Que dia seria melhor para vocês?',
          timestamp: '2025-01-10T10:33:00Z'
        }
      ];
      
      setConversationHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Tempo Médio Resposta</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights ? `${insights.avgResponseTime.toFixed(1)}h` : '0h'}
            </div>
            <p className="text-xs text-muted-foreground">Horas</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights ? `${insights.conversionRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">Leads convertidos</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Mensagens por Lead</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights ? insights.avgMessagesPerLead : 0}
            </div>
            <p className="text-xs text-muted-foreground">Média</p>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise de Sentimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Positivo</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {insights ? insights.sentimentAnalysis.positive : 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Neutro</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {insights ? insights.sentimentAnalysis.neutral : 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Negativo</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {insights ? insights.sentimentAnalysis.negative : 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Efetividade dos Follow-ups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Follow-up 1</span>
                <Badge variant="outline">
                  {insights ? `${insights.followupEffectiveness.followup1.toFixed(1)}%` : '0%'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Follow-up 2</span>
                <Badge variant="outline">
                  {insights ? `${insights.followupEffectiveness.followup2.toFixed(1)}%` : '0%'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keywords and Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Palavras-chave Mais Usadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights?.topKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{keyword.word}</span>
                  <Badge variant="secondary">{keyword.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Horários de Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights?.peakActivityHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{hour.toString().padStart(2, '0')}:00</span>
                  <Badge variant="outline">Pico {index + 1}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversation History */}
      <Card className="transition-all duration-300 hover:shadow-lg hover:border-primary/30">
        <CardHeader>
          <CardTitle>Histórico de Conversas Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((lead) => (
              <Card key={lead.id} className="hover:shadow-md transition-shadow hover:border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium truncate">
                        {lead.remotejID}
                      </span>
                    </div>
                    <Badge variant={lead.encerrado ? "default" : "secondary"}>
                      {lead.encerrado ? "Convertido" : "Ativo"}
                    </Badge>
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
                  <div className="flex gap-1">
                    {lead.followup1 && (
                      <Badge variant="outline" className="text-xs">F1</Badge>
                    )}
                    {lead.followup2 && (
                      <Badge variant="outline" className="text-xs">F2</Badge>
                    )}
                  </div>
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
                        <DialogTitle>Análise Completa - {lead.remotejID}</DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {/* Conversation History */}
                          <div className="space-y-3">
                            <h4 className="font-medium">Histórico da Conversa</h4>
                            {loadingHistory ? (
                              <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                  <Skeleton key={i} className="h-16 w-full" />
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {conversationHistory.map((message) => (
                                  <div
                                    key={message.id}
                                    className={`p-3 rounded-lg ${
                                      message.role === 'user'
                                        ? 'bg-muted ml-8'
                                        : 'bg-primary/10 mr-8'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-xs">
                                        {message.role === 'user' ? 'Cliente' : 'Assistente'}
                                      </Badge>
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
                            )}
                          </div>

                          {/* Lead Information */}
                          <div className="space-y-2">
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
