-- Script para verificar a estrutura real da tabela followup
-- Execute este script no SQL Editor do Supabase Dashboard

-- Verificar estrutura da tabela followup
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'followup' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela existe e tem dados
SELECT COUNT(*) as total_records FROM public.followup;

-- Verificar algumas linhas de exemplo (se existirem)
SELECT * FROM public.followup LIMIT 5;


