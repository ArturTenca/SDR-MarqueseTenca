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

    // Calculate average messages per lead from real chat histories
    const calculateAvgMessagesPerLead = async () => {
      try {
        console.log('🔍 Starting messages per lead calculation...');
        
        // Get all chat histories grouped by session_id
        const { data: allHistories, error } = await supabase
          .from('n8n_chat_histories')
          .select('session_id');

        console.log('📊 Messages per lead query result:', { 
          data: allHistories, 
          error, 
          count: allHistories?.length || 0 
        });

        if (error || !allHistories) {
          console.log('❌ Error or no data for messages per lead calculation');
          return 0;
        }

        // Count messages per session_id
        const messageCounts = allHistories.reduce((acc: any, history) => {
          const sessionId = history.session_id;
          acc[sessionId] = (acc[sessionId] || 0) + 1;
        return acc;
      }, {});

        // Calculate average
        const sessionIds = Object.keys(messageCounts);
        if (sessionIds.length === 0) {
          console.log('⚠️ No session IDs found for messages per lead calculation');
          return 0;
        }

        const totalMessages = Object.values(messageCounts).reduce((sum: number, count: any) => sum + count, 0);
        const avgMessages = totalMessages / sessionIds.length;

        console.log('🎯 Messages per lead calculation result:', { 
          totalSessions: sessionIds.length, 
          totalMessages, 
          avgMessages: Math.round(avgMessages),
          messageCounts: Object.keys(messageCounts).length > 0 ? messageCounts : 'empty'
        });

        return Math.round(avgMessages);
      } catch (error) {
        console.log('💥 Error calculating messages per lead:', error);
        return 0;
      }
    };

    const calculatePeakActivityHours = async () => {
      try {
        console.log('🔍 Starting peak activity hours calculation...');
        
        // Fetch all chat histories with timestamps to calculate real peak hours
        const { data: chatHistories, error } = await supabase
          .from('n8n_chat_histories')
          .select('timestamp, created_at')
          .order('created_at', { ascending: true });

        console.log('📊 Chat histories query result:', { 
          data: chatHistories, 
          error, 
          count: chatHistories?.length || 0 
        });

        if (error) {
          console.error('❌ Error fetching chat histories for peak hours:', error);
          return [];
        }

        if (!chatHistories || chatHistories.length === 0) {
          console.log('⚠️ No chat histories found for peak hours calculation');
          return [];
        }

        // Count messages per hour using both timestamp and created_at
        const hourlyActivity: { [hour: number]: number } = {};
        
        chatHistories.forEach((chat, index) => {
          let dateToUse = null;
          
          // Try to use timestamp first, then created_at as fallback
          if (chat.timestamp) {
            dateToUse = new Date(chat.timestamp);
          } else if (chat.created_at) {
            dateToUse = new Date(chat.created_at);
          }
          
          if (dateToUse && !isNaN(dateToUse.getTime())) {
            const hour = dateToUse.getHours();
            hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
          }
          
          // Log first few items for debugging
          if (index < 3) {
            console.log(`📝 Message ${index + 1}:`, {
              timestamp: chat.timestamp,
              created_at: chat.created_at,
              parsedHour: dateToUse ? dateToUse.getHours() : 'invalid'
            });
          }
        });

        // Get top 3 peak hours
        const peakHours = Object.entries(hourlyActivity)
          .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([hour]) => parseInt(hour));

        console.log('🎯 Peak activity hours calculation result:', {
          totalMessages: chatHistories.length,
          hourlyActivity,
          peakHours,
          hasData: peakHours.length > 0
        });

        return peakHours;
      } catch (error) {
        console.error('💥 Error calculating peak activity hours:', error);
        return [];
      }
    };

    const calculateFollowupEffectiveness = async () => {
      try {
        console.log('🔍 Starting followup effectiveness calculation...');
        
        // Get all leads with followup2 = true
        const followup2Leads = data.filter(item => item.followup2);
        console.log('📊 Followup2 leads found:', followup2Leads.length);
        
        if (followup2Leads.length === 0) {
          console.log('⚠️ No followup2 leads found');
          return { followup1: 0, followup2: 0 };
        }

        let effectiveFollowup2Count = 0;
        const followup2Analysis = [];

        // Check each followup2 lead for messages after followup2 was set to true
        for (const lead of followup2Leads) {
          try {
            // Get chat history for this lead
            const { data: chatHistory, error } = await supabase
              .from('n8n_chat_histories')
              .select('*')
              .eq('session_id', lead.remotejID)
              .order('created_at', { ascending: true });

            if (error) {
              console.log(`❌ Error fetching chat history for ${lead.remotejID}:`, error);
              continue;
            }

            if (!chatHistory || chatHistory.length === 0) {
              console.log(`⚠️ No chat history found for ${lead.remotejID}`);
              continue;
            }

            // Analyze message patterns to determine followup2 effectiveness
            // Followup2 is typically sent when the lead doesn't respond to followup1
            // So we look for a gap in conversation followed by new messages
            
            let hasMessagesAfterFollowup2 = false;
            let messagesAfterFollowup2 = 0;
            
            if (chatHistory.length >= 4) {
              // Look for patterns that suggest followup2 was sent and got a response
              // Pattern: initial messages -> gap -> followup2 -> response
              
              // Check if there are messages in the second half of the conversation
              const midPoint = Math.floor(chatHistory.length / 2);
              const laterMessages = chatHistory.slice(midPoint);
              
              // If there are significant messages in the later part, followup2 was likely effective
              if (laterMessages.length >= 2) {
                hasMessagesAfterFollowup2 = true;
                messagesAfterFollowup2 = laterMessages.length;
              }
            } else if (chatHistory.length >= 2) {
              // For shorter conversations, if there are at least 2 messages, consider it effective
              hasMessagesAfterFollowup2 = true;
              messagesAfterFollowup2 = chatHistory.length - 1;
            }
            
            if (hasMessagesAfterFollowup2) {
              effectiveFollowup2Count++;
            }

            followup2Analysis.push({
              remotejID: lead.remotejID,
              totalMessages: chatHistory.length,
              messagesAfterFollowup2: messagesAfterFollowup2.length,
              effective: hasMessagesAfterFollowup2
            });

            console.log(`📝 Lead ${lead.remotejID}:`, {
              totalMessages: chatHistory.length,
              messagesAfterFollowup2: messagesAfterFollowup2.length,
              effective: hasMessagesAfterFollowup2
            });

          } catch (error) {
            console.log(`💥 Error processing lead ${lead.remotejID}:`, error);
          }
        }

        // Calculate followup1 effectiveness (simplified - based on conversion)
        const followup1Only = data.filter(item => item.followup1 && !item.followup2);
        const followup1Converted = followup1Only.filter(item => item.encerrado).length;
        const followup1Effectiveness = followup1Only.length > 0 ? (followup1Converted / followup1Only.length) * 100 : 0;

        // Calculate followup2 effectiveness based on messages after followup2
        const followup2Effectiveness = followup2Leads.length > 0 ? (effectiveFollowup2Count / followup2Leads.length) * 100 : 0;

        console.log('🎯 Followup effectiveness calculation result:', {
          followup1Only: followup1Only.length,
          followup1Converted,
          followup1Effectiveness: Math.round(followup1Effectiveness),
          followup2Leads: followup2Leads.length,
          effectiveFollowup2Count,
          followup2Effectiveness: Math.round(followup2Effectiveness),
          followup2Analysis
        });

        return {
          followup1: Math.round(followup1Effectiveness),
          followup2: Math.round(followup2Effectiveness)
        };

      } catch (error) {
        console.error('💥 Error calculating followup effectiveness:', error);
        return { followup1: 0, followup2: 0 };
      }
    };

    const avgMessagesPerLead = await calculateAvgMessagesPerLead();

    // Peak activity hours - calculate from real chat history
    const peakActivityHours = await calculatePeakActivityHours();

    // Top keywords (removed - not needed)
    const topKeywords: { word: string; count: number }[] = [];

    // Sentiment analysis (removed - not needed)
    const sentimentAnalysis = {
      positive: 0,
      neutral: 0,
      negative: 0
    };

    // Follow-up effectiveness with new logic
    const followupEffectiveness = await calculateFollowupEffectiveness();

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
        console.log('🔍 Raw chat history data:', historyData);
        
        // Parse the message JSON and format it
        const messages = historyData.map((item: any, index: number) => {
          const messageData = item.message as any;
          
          // Log first few messages for debugging
          if (index < 5) {
            console.log(`📝 Message ${index + 1} structure:`, {
              id: item.id,
              session_id: item.session_id,
              message: messageData,
              messageType: messageData?.type,
              messageRole: messageData?.role,
              created_at: item.created_at,
              timestamp: item.timestamp
            });
          }
          
          // Determine role based on message structure
          let role = 'user'; // Default to user
          
          if (messageData) {
            console.log(`🔍 Analyzing message ${index + 1}:`, {
              type: messageData.type,
              role: messageData.role,
              from: messageData.from,
              sender: messageData.sender,
              content: messageData.content?.substring(0, 50) + '...'
            });
            
            // Check for type field - ai means bot/assistant
            if (messageData.type === 'ai') {
              role = 'assistant';
              console.log(`🤖 Identified as assistant by type: "${messageData.type}"`);
            }
            // Check for human type
            else if (messageData.type === 'human') {
              role = 'user';
              console.log(`👤 Identified as user by type: "${messageData.type}"`);
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
            console.log(`❌ No messageData found for message ${index + 1}`);
          }
          
          return {
            id: item.id,
            role: role,
            content: messageData?.content || messageData?.text || messageData?.message || 'Mensagem sem conteúdo',
            timestamp: messageData?.timestamp || item.created_at || new Date().toISOString()
          };
        });
        
        console.log('🎯 Processed messages:', messages);

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
                  {insights ? `${Math.round(insights.followupEffectiveness.followup1)}%` : '0%'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Follow-up 2</span>
                <Badge variant="outline">
                  {insights ? `${Math.round(insights.followupEffectiveness.followup2)}%` : '0%'}
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
