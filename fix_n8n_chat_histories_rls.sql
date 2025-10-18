-- Verificar e corrigir RLS policy da tabela n8n_chat_histories
-- Primeiro, vamos verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_registros FROM public.n8n_chat_histories;

-- Verificar as policies atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'n8n_chat_histories';

-- Remover todas as policies existentes para evitar conflitos
DROP POLICY IF EXISTS "Bloquear acesso temporariamente" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Admins can view chat histories" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Authenticated users can read chat histories" ON public.n8n_chat_histories;
DROP POLICY IF EXISTS "Service role can manage chat histories" ON public.n8n_chat_histories;

-- Criar uma policy simples que permite acesso a usuários autenticados
CREATE POLICY "Allow authenticated users to access n8n_chat_histories"
ON public.n8n_chat_histories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar se a policy foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'n8n_chat_histories';
