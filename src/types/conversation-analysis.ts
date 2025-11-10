export interface ConversationAnalysisData {
  id: number;
  remotejID: string;
  avg_response_time_hours: number | null;
  conversion_rate: number | null;
  avg_messages_per_lead: number | null;
  peak_activity_hours: number[] | null;
  top_keywords: { word: string; count: number }[] | null;
  sentiment_analysis: {
    positive: number;
    neutral: number;
    negative: number;
  } | null;
  followup_effectiveness: {
    followup1: number;
    followup2: number;
  } | null;
  total_conversations: number | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationInsights {
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

export interface ConversationMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ConversationHistory {
  session_id: string;
  messages: ConversationMessage[];
}
