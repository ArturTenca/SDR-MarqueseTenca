-- Permitir leitura pública na tabela followup (temporário até implementar autenticação)
CREATE POLICY "Permitir leitura pública temporária" 
ON public.followup 
FOR SELECT 
USING (true);

-- Permitir leitura pública nas tabelas chats (caso sejam usadas)
CREATE POLICY "Permitir leitura pública temporária" 
ON public.chats 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir leitura pública temporária" 
ON public.chats_new 
FOR SELECT 
USING (true);

-- Habilitar RLS e bloquear acesso às tabelas sensíveis
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bloquear acesso temporariamente" 
ON public.n8n_chat_histories 
FOR ALL 
USING (false);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bloquear acesso temporariamente" 
ON public.documents 
FOR ALL 
USING (false);