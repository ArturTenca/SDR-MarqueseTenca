-- Script para testar inserção de um único registro
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'followup' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Tentar inserir apenas um registro para testar
INSERT INTO public.followup (ultimamensagem, ultimaatividade, encerrado, followup1, followup2) 
VALUES ('Teste de inserção', '2025-01-10T10:30:00Z', false, true, false);

-- Verificar se inseriu
SELECT * FROM public.followup WHERE ultimamensagem = 'Teste de inserção';
