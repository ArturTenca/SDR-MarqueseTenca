-- =====================================================
-- SECURE RLS POLICIES - CRITICAL SECURITY FIX
-- =====================================================
-- This migration fixes the security vulnerability where
-- all tables had public read access (USING true)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.followup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_analysis ENABLE ROW LEVEL SECURITY;

-- Drop all existing insecure policies
DROP POLICY IF EXISTS "Permitir leitura pública followup" ON public.followup;
DROP POLICY IF EXISTS "Permitir leitura pública chats" ON public.chats;
DROP POLICY IF EXISTS "Permitir leitura pública chats_new" ON public.chats_new;
DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.documents;
DROP POLICY IF EXISTS "Admins can view all followup data" ON public.followup;
DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;
DROP POLICY IF EXISTS "Admins can view all chats_new" ON public.chats_new;
DROP POLICY IF EXISTS "Admins can view chat histories" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Admins can view documents" ON public.documents;

-- =====================================================
-- FOLLOWUP TABLE - Only authenticated users
-- =====================================================
CREATE POLICY "Authenticated users can read followup"
  ON public.followup
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert followup"
  ON public.followup
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update followup"
  ON public.followup
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- CHATS TABLES - Only authenticated users
-- =====================================================
CREATE POLICY "Authenticated users can read chats"
  ON public.chats
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read chats_new"
  ON public.chats_new
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- N8N CHAT HISTORIES - Only authenticated users
-- =====================================================
CREATE POLICY "Authenticated users can read chat histories"
  ON public.n8n_chat_histories
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Service role can manage chat histories"
  ON public.n8n_chat_histories
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- DOCUMENTS - Only authenticated users
-- =====================================================
CREATE POLICY "Authenticated users can read documents"
  ON public.documents
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =====================================================
-- CONVERSATION ANALYSIS - Only authenticated users
-- =====================================================
CREATE POLICY "Authenticated users can read conversation analysis"
  ON public.conversation_analysis
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upsert conversation analysis"
  ON public.conversation_analysis
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update conversation analysis"
  ON public.conversation_analysis
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Verify policies are applied
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

