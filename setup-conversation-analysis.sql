-- =====================================================
-- CONFIGURAÇÃO DA ANÁLISE DE CONVERSAS NO SUPABASE
-- =====================================================

-- 1. EXECUTAR A MIGRAÇÃO DA TABELA
-- Execute o arquivo: supabase/migrations/20250113000001_create_conversation_analysis.sql
-- Isso criará a tabela conversation_analysis com todas as colunas necessárias

-- 2. VERIFICAR SE A TABELA FOI CRIADA
SELECT * FROM conversation_analysis LIMIT 1;

-- 3. INSERIR DADOS DE EXEMPLO (OPCIONAL)
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
) VALUES (
  'global_analysis',
  2.5,
  15.5,
  8,
  ARRAY[14, 16, 10],
  '[{"word": "consultoria", "count": 25}, {"word": "contrato", "count": 18}, {"word": "trabalhista", "count": 12}, {"word": "tributário", "count": 8}, {"word": "compliance", "count": 6}]'::jsonb,
  '{"positive": 45, "neutral": 35, "negative": 20}'::jsonb,
  '{"followup1": 12.5, "followup2": 18.3}'::jsonb,
  50
);

-- 4. VERIFICAR DADOS INSERIDOS
SELECT 
  remotejID,
  avg_response_time_hours,
  conversion_rate,
  followup_effectiveness,
  total_conversations,
  created_at
FROM conversation_analysis;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'conversation_analysis';

-- 6. TESTAR INSERÇÃO DE DADOS REAIS
-- O sistema irá automaticamente calcular e salvar os dados baseados nos dados da tabela followup
-- Não é necessário inserir dados manualmente, o sistema faz isso automaticamente

-- =====================================================
-- LÓGICA DE EFETIVIDADE DOS FOLLOWUPS IMPLEMENTADA:
-- =====================================================

-- FOLLOWUP1 EFETIVIDADE:
-- - Conta apenas leads que têm followup1=true E followup2=false
-- - Se o lead tem ambos followup1=true E followup2=true, NÃO conta para followup1
-- - Isso significa que followup1 falhou se foi necessário fazer followup2

-- FOLLOWUP2 EFETIVIDADE:
-- - Conta todos os leads que têm followup2=true (incluindo os que também têm followup1=true)
-- - Isso mostra a efetividade geral do followup2 como estratégia de recuperação

-- =====================================================
-- INTEGRAÇÃO COM N8N_CHAT_HISTORIES:
-- =====================================================

-- A tabela n8n_chat_histories deve conter dados no formato:
-- {
--   "id": 1,
--   "session_id": "remotejID_do_lead",
--   "message": {
--     "role": "user" | "assistant",
--     "content": "texto da mensagem",
--     "timestamp": "2025-01-10T10:30:00Z"
--   }
-- }

-- =====================================================
-- PRÓXIMOS PASSOS:
-- =====================================================

-- 1. Execute a migração no Supabase
-- 2. Faça deploy do código atualizado
-- 3. O sistema irá automaticamente:
--    - Calcular insights baseados nos dados existentes
--    - Salvar na tabela conversation_analysis
--    - Buscar histórico real das conversas
--    - Aplicar a nova lógica de efetividade dos followups

-- 4. Para testar:
--    - Acesse a aba "Análise de Conversas" no dashboard
--    - Verifique se os dados estão sendo calculados corretamente
--    - Clique em "Ver conversa completa" para testar o histórico real
