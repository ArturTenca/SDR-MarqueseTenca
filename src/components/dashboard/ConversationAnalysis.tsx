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
          calculateInsightsFromData();
        }
      } catch (error) {
        console.error('Error fetching analysis data:', error);
        calculateInsightsFromData();
      }
    };

    fetchAnalysisData();
  }, [data]);

  const calculateInsightsFromData = () => {
    if (data.length === 0) return;

    // Average response time in minutes
    const responseTimes = data.map(item => {
      if (!item.ultimaAtividade) return 0;
      const created = new Date(item.created_at);
      const lastActivity = new Date(item.ultimaAtividade);
      return differenceInHours(lastActivity, created) * 60; // Convert to minutes
    }).filter(time => time > 0);

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;

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

    // Top keywords (empty - will be populated by real data analysis)
    const topKeywords: { word: string; count: number }[] = [];

    // Sentiment analysis (empty - will be populated by real data analysis)
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
      avgResponseTime,
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
      console.error('Error fetching conversation history:', error);
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

      console.log('Analysis data saved successfully');
    } catch (error) {
      console.error('Error saving analysis data:', error);
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
              <Brain className="h-5 w-5" />
              Análise de Sentimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights && (insights.sentimentAnalysis.positive > 0 || insights.sentimentAnalysis.neutral > 0 || insights.sentimentAnalysis.negative > 0) ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Positivo</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {insights.sentimentAnalysis.positive}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Neutro</span>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {insights.sentimentAnalysis.neutral}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Negativo</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {insights.sentimentAnalysis.negative}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Análise de sentimento não disponível</p>
                  <p className="text-xs mt-1">Os dados serão exibidos quando houver conversas suficientes</p>
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
              {insights?.topKeywords && insights.topKeywords.length > 0 ? (
                insights.topKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{keyword.word}</span>
                    <Badge variant="secondary">{keyword.count}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">Análise de palavras-chave não disponível</p>
                  <p className="text-xs mt-1">Os dados serão exibidos quando houver conversas suficientes</p>
                </div>
              )}
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
