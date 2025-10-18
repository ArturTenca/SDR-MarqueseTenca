-- Verificar e corrigir RLS policy da tabela followup
-- Primeiro, vamos verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_registros FROM public.followup;

-- Verificar as policies atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'followup';

-- Remover todas as policies existentes para evitar conflitos
DROP POLICY IF EXISTS "Permitir leitura pública followup" ON public.followup;
DROP POLICY IF EXISTS "Admins can view all followup data" ON public.followup;
DROP POLICY IF EXISTS "Authenticated users can read followup" ON public.followup;
DROP POLICY IF EXISTS "Authenticated users can insert followup" ON public.followup;
DROP POLICY IF EXISTS "Authenticated users can update followup" ON public.followup;

-- Criar uma policy simples que permite acesso a usuários autenticados
CREATE POLICY "Allow authenticated users to access followup"
ON public.followup
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificar se a policy foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'followup';
