import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FollowupData } from "@/types/followup";
import { ConversationAnalysisData, ConversationInsights, ConversationHistory } from "@/types/conversation-analysis";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Users, 
  Target,
  Activity
} from "lucide-react";
import { format, parseISO, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConversationAnalysisProps {
  data: FollowupData[];
  loading: boolean;
}

export const ConversationAnalysis = ({ data, loading }: ConversationAnalysisProps) => {
  const [insights, setInsights] = useState<ConversationInsights | null>(null);
  const [selectedLead, setSelectedLead] = useState<FollowupData | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [analysisData, setAnalysisData] = useState<ConversationAnalysisData | null>(null);
  const { toast } = useToast();

  // Fetch conversation analysis data from Supabase
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const { data: analysis, error } = await supabase
          .from('conversation_analysis')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }

        if (analysis) {
          setAnalysisData(analysis);
          setInsights({
            avgResponseTime: (analysis.avg_response_time_hours || 0) * 60, // Convert hours to minutes
            conversionRate: analysis.conversion_rate || 0,
            avgMessagesPerLead: analysis.avg_messages_per_lead || 0,
            peakActivityHours: analysis.peak_activity_hours || [],
            topKeywords: analysis.top_keywords || [],
            sentimentAnalysis: analysis.sentiment_analysis || { positive: 0, neutral: 0, negative: 0 },
            followupEffectiveness: analysis.followup_effectiveness || { followup1: 0, followup2: 0 }
          });
        } else {
          // Calculate insights from current data if no analysis exists
          await calculateInsightsFromData();
        }
      } catch (error) {
        // Error fetching analysis data - fallback to calculated insights
        await calculateInsightsFromData();
      }
    };

    fetchAnalysisData();
  }, [data]);

  const calculateInsightsFromData = async () => {
    if (data.length === 0) return;

    // Calculate average response time from all conversation histories
    const calculateAvgResponseTime = async () => {
      try {
        // Get all conversation histories from Supabase
        const { data: allHistories, error } = await supabase
          .from('n8n_chat_histories')
          .select('message')
          .order('id', { ascending: true });

        if (error || !allHistories) {
          return 0;
        }

        let totalResponseTime = 0;
        let responseCount = 0;

        // Process all conversation histories
        allHistories.forEach(history => {
          try {
            const messageData = history.message as any;
            if (messageData && Array.isArray(messageData)) {
              const messages = messageData;
              
              // Calculate time between user message and bot response
              for (let i = 1; i < messages.length; i++) {
                const currentMessage = messages[i];
                const previousMessage = messages[i - 1];
                
                // If current message is from bot and previous is from user
                if (currentMessage.role === 'assistant' && previousMessage.role === 'user') {
                  const currentTime = new Date(currentMessage.timestamp);
                  const previousTime = new Date(previousMessage.timestamp);
                  
                  // Time between user message and bot response in minutes
                  const responseTime = (currentTime.getTime() - previousTime.getTime()) / (1000 * 60);
                  
                  // Only consider reasonable response times (less than 24 hours)
                  if (responseTime > 0 && responseTime < 1440) {
                    totalResponseTime += responseTime;
                    responseCount++;
                  }
                }
              }
            }
          } catch (e) {
            // Skip invalid message data
            console.log('Invalid message data:', e);
          }
        });

        const result = responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0;
        console.log('Response time calculation:', { totalResponseTime, responseCount, result });
        return result;
      } catch (error) {
        console.log('Error calculating response time:', error);
        return 0;
      }
    };

    const avgResponseTime = await calculateAvgResponseTime();
    console.log('Final avgResponseTime:', avgResponseTime);

    // Fallback: if no conversation history, use estimated time based on lead data
    const finalAvgResponseTime = avgResponseTime > 0 ? avgResponseTime : 
      data.length > 0 ? Math.round(data.reduce((acc, item) => {
        if (!item.ultimaAtividade) return acc;
        const created = new Date(item.created_at);
        const lastActivity = new Date(item.ultimaAtividade);
        const timeDiff = (lastActivity.getTime() - created.getTime()) / (1000 * 60); // minutes
        return acc + timeDiff;
      }, 0) / data.length) : 0;

    // Conversion rate
    const converted = data.filter(item => item.encerrado).length;
    const conversionRate = (converted / data.length) * 100;

    // Average messages per lead (estimated)
    const avgMessagesPerLead = Math.round(data.length * 3.2);

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

    // Top keywords (removed - not needed)
    const topKeywords: { word: string; count: number }[] = [];

    // Sentiment analysis (removed - not needed)
    const sentimentAnalysis = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    // Follow-up effectiveness with new logic
    const followup1Only = data.filter(item => item.followup1 && !item.followup2);
    const followup2Only = data.filter(item => item.followup2 && !item.followup1);
    const bothFollowups = data.filter(item => item.followup1 && item.followup2);
    
    // Followup1 effectiveness: only count leads that converted with followup1 only
    const followup1Converted = followup1Only.filter(item => item.encerrado).length;
    const followup1Effectiveness = followup1Only.length > 0 ? (followup1Converted / followup1Only.length) * 100 : 0;
    
    // Followup2 effectiveness: count all leads that converted with followup2 (including those with both)
    const followup2Converted = data.filter(item => item.followup2 && item.encerrado).length;
    const followup2Effectiveness = data.filter(item => item.followup2).length > 0 ? (followup2Converted / data.filter(item => item.followup2).length) * 100 : 0;

    const followupEffectiveness = {
      followup1: followup1Effectiveness,
      followup2: followup2Effectiveness
    };

    setInsights({
      avgResponseTime: finalAvgResponseTime,
      conversionRate,
      avgMessagesPerLead,
      peakActivityHours,
      topKeywords,
      sentimentAnalysis,
      followupEffectiveness
    });
  };

  const fetchConversationHistory = async (remotejID: string) => {
    setLoadingHistory(true);
    try {
      // Fetch real conversation history from n8n_chat_histories table
      const { data: historyData, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', remotejID)
        .order('id', { ascending: true });

      if (error) {
        throw error;
      }

      if (historyData && historyData.length > 0) {
        // Parse the message JSON and format it
        const messages = historyData.map((item: any) => {
          const messageData = item.message as any;
          return {
            id: item.id,
            role: messageData.role || 'user',
            content: messageData.content || messageData.text || 'Mensagem sem conteúdo',
            timestamp: messageData.timestamp || item.created_at || new Date().toISOString()
          };
        });

        setConversationHistory({
          session_id: remotejID,
          messages
        });
      } else {
        // No conversation history found
        setConversationHistory({
          session_id: remotejID,
          messages: []
        });
      }
    } catch (error) {
      // Error fetching conversation history
      toast({
        title: "Erro ao carregar histórico",
        description: "Não foi possível carregar o histórico da conversa.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  // Function to save analysis data to Supabase
  const saveAnalysisData = async (insights: ConversationInsights) => {
    try {
      const analysisData = {
        remotejID: 'global_analysis',
        avg_response_time_hours: insights.avgResponseTime / 60, // Convert minutes to hours for storage
        conversion_rate: insights.conversionRate,
        avg_messages_per_lead: insights.avgMessagesPerLead,
        peak_activity_hours: insights.peakActivityHours,
        top_keywords: insights.topKeywords,
        sentiment_analysis: insights.sentimentAnalysis,
        followup_effectiveness: insights.followupEffectiveness,
        total_conversations: data.length
      };

      const { error } = await supabase
        .from('conversation_analysis')
        .upsert(analysisData, { 
          onConflict: 'remotejID',
          ignoreDuplicates: false 
        });

      if (error) {
        throw error;
      }

      // Analysis data saved successfully
    } catch (error) {
      // Error saving analysis data - silent fail
    }
  };

  // Save analysis data when insights change
  useEffect(() => {
    if (insights && data.length > 0) {
      saveAnalysisData(insights);
    }
  }, [insights, data.length]);

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
              {insights ? `${insights.avgResponseTime.toFixed(0)}min` : '0min'}
            </div>
            <p className="text-xs text-muted-foreground">Minutos</p>
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
              <Activity className="h-5 w-5" />
              Horários de Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights?.peakActivityHours && insights.peakActivityHours.length > 0 ? (
                insights.peakActivityHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{hour.toString().padStart(2, '0')}:00</span>
                    <Badge variant="outline">Pico {index + 1}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Dados de horários de pico não disponíveis</p>
                  <p className="text-xs mt-1">Os dados serão exibidos quando houver atividade suficiente</p>
                </div>
              )}
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
                            ) : conversationHistory?.messages.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum histórico de conversa encontrado para este lead.</p>
                                <p className="text-sm mt-2">Os dados serão exibidos quando as conversas estiverem disponíveis no n8n.</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {conversationHistory?.messages.map((message) => (
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
