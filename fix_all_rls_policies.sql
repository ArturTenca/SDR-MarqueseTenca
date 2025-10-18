-- =====================================================
-- CORREÇÃO COMPLETA DAS POLICIES RLS
-- =====================================================
-- Este script corrige todas as policies conflitantes das tabelas principais
-- =====================================================

-- 1. TABELA FOLLOWUP
-- =====================================================
-- Verificar dados
SELECT 'followup' as tabela, COUNT(*) as total_registros FROM public.followup;

-- Remover policies conflitantes
DROP POLICY IF EXISTS "Permitir leitura pública followup" ON public.followup;
DROP POLICY IF EXISTS "Admins can view all followup data" ON public.followup;
DROP POLICY IF EXISTS "Authenticated users can read followup" ON public.followup;
DROP POLICY IF EXISTS "Authenticated users can insert followup" ON public.followup;
DROP POLICY IF EXISTS "Authenticated users can update followup" ON public.followup;
DROP POLICY IF EXISTS "Permitir leitura pública temporária" ON public.followup;

-- Criar policy simples
CREATE POLICY "Allow authenticated users to access followup"
ON public.followup
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. TABELA CHATS
-- =====================================================
-- Verificar dados
SELECT 'chats' as tabela, COUNT(*) as total_registros FROM public.chats;

-- Remover policies conflitantes
DROP POLICY IF EXISTS "Permitir leitura pública chats" ON public.chats;
DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;
DROP POLICY IF EXISTS "Authenticated users can read chats" ON public.chats;
DROP POLICY IF EXISTS "Permitir leitura pública temporária" ON public.chats;

-- Criar policy simples
CREATE POLICY "Allow authenticated users to access chats"
ON public.chats
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. TABELA N8N_CHAT_HISTORIES
-- =====================================================
-- Verificar dados
SELECT 'n8n_chat_histories' as tabela, COUNT(*) as total_registros FROM public.n8n_chat_histories;

-- Remover policies conflitantes
DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Admins can view chat histories" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Authenticated users can read chat histories" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Service role can manage chat histories" ON public.n8n_chat_histories;

-- Criar policy simples
CREATE POLICY "Allow authenticated users to access n8n_chat_histories"
ON public.n8n_chat_histories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. TABELA CONVERSATION_ANALYSIS
-- =====================================================
-- Verificar dados
SELECT 'conversation_analysis' as tabela, COUNT(*) as total_registros FROM public.conversation_analysis;

-- Remover policies conflitantes
DROP POLICY IF EXISTS "Authenticated users can read conversation analysis" ON public.conversation_analysis;
DROP POLICY IF EXISTS "Authenticated users can upsert conversation analysis" ON public.conversation_analysis;
DROP POLICY IF EXISTS "Authenticated users can update conversation analysis" ON public.conversation_analysis;

-- Criar policy simples
CREATE POLICY "Allow authenticated users to access conversation_analysis"
ON public.conversation_analysis
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. VERIFICAÇÃO FINAL
-- =====================================================
-- Verificar todas as policies criadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE tablename IN ('followup', 'chats', 'n8n_chat_histories', 'conversation_analysis')
ORDER BY tablename, policyname;

-- Verificar contagem de registros em todas as tabelas
SELECT 'followup' as tabela, COUNT(*) as total_registros FROM public.followup
UNION ALL
SELECT 'chats' as tabela, COUNT(*) as total_registros FROM public.chats
UNION ALL
SELECT 'n8n_chat_histories' as tabela, COUNT(*) as total_registros FROM public.n8n_chat_histories
UNION ALL
SELECT 'conversation_analysis' as tabela, COUNT(*) as total_registros FROM public.conversation_analysis;
