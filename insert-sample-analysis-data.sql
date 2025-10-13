-- Script para inserir dados de exemplo na tabela conversation_analysis
-- Execute este script no Supabase para testar a integração

-- Inserir dados de exemplo para diferentes leads
INSERT INTO conversation_analysis (
  remotejID,
  avg_response_time_hours,
  conversion_rate,
  avg_messages_per_lead,
  peak_activity_hours,
  top_keywords,
  sentiment_analysis,
  followup_effectiveness,
  total_conversations
) VALUES 
(
  'lead_001',
  1.5,
  75.0,
  8,
  ARRAY[14, 16, 10],
  '[
    {"word": "consultoria", "count": 5},
    {"word": "contrato", "count": 3},
    {"word": "trabalhista", "count": 2}
  ]'::jsonb,
  '{"positive": 6, "neutral": 2, "negative": 0}'::jsonb,
  '{"followup1": 80.0, "followup2": 60.0}'::jsonb,
  8
),
(
  'lead_002',
  2.3,
  50.0,
  12,
  ARRAY[15, 17, 11],
  '[
    {"word": "reunião", "count": 4},
    {"word": "proposta", "count": 3},
    {"word": "valor", "count": 2}
  ]'::jsonb,
  '{"positive": 4, "neutral": 6, "negative": 2}'::jsonb,
  '{"followup1": 40.0, "followup2": 70.0}'::jsonb,
  12
),
(
  'lead_003',
  0.8,
  100.0,
  6,
  ARRAY[13, 15, 9],
  '[
    {"word": "direito", "count": 3},
    {"word": "jurídico", "count": 2},
    {"word": "cliente", "count": 1}
  ]'::jsonb,
  '{"positive": 5, "neutral": 1, "negative": 0}'::jsonb,
  '{"followup1": 100.0, "followup2": 0.0}'::jsonb,
  6
),
(
  'global_analysis',
  1.5,
  75.0,
  8,
  ARRAY[14, 16, 10],
  '[
    {"word": "consultoria", "count": 12},
    {"word": "contrato", "count": 8},
    {"word": "trabalhista", "count": 5},
    {"word": "reunião", "count": 4},
    {"word": "proposta", "count": 3}
  ]'::jsonb,
  '{"positive": 15, "neutral": 9, "negative": 2}'::jsonb,
  '{"followup1": 73.3, "followup2": 43.3}'::jsonb,
  26
);

-- Verificar os dados inseridos
SELECT 
  remotejID,
  avg_response_time_hours,
  conversion_rate,
  avg_messages_per_lead,
  peak_activity_hours,
  top_keywords,
  sentiment_analysis,
  followup_effectiveness,
  total_conversations,
  created_at,
  updated_at
FROM conversation_analysis
ORDER BY created_at DESC;

-- Verificar se os dados estão sendo exibidos corretamente no dashboard
-- Acesse o dashboard e verifique a aba "Análise de Conversas"
