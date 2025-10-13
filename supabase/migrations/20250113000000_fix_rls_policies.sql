-- Permitir acesso público à tabela followup para funcionar com login local
DROP POLICY IF EXISTS "Admins can view all followup data" ON public.followup;
CREATE POLICY "Permitir leitura pública followup" 
ON public.followup 
FOR SELECT 
USING (true);

-- Permitir acesso público às tabelas chats para funcionar com login local
DROP POLICY IF EXISTS "Admins can view all chats" ON public.chats;
CREATE POLICY "Permitir leitura pública chats" 
ON public.chats 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Admins can view all chats_new" ON public.chats_new;
CREATE POLICY "Permitir leitura pública chats_new" 
ON public.chats_new 
FOR SELECT 
USING (true);

-- Manter outras tabelas protegidas
DROP POLICY IF EXISTS "Admins can view chat histories" ON public.n8n_chat_histories;
CREATE POLICY "Bloquear acesso temporariamente" 
ON public.n8n_chat_histories 
FOR ALL 
USING (false);

DROP POLICY IF EXISTS "Admins can view documents" ON public.documents;
CREATE POLICY "Bloquear acesso temporariamente" 
ON public.documents 
FOR ALL 
USING (false);
