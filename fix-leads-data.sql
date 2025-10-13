-- Script corrigido para inserir dados de leads
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'followup' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Inserir dados usando apenas as colunas que sabemos que existem
INSERT INTO public.followup (ultimaMensagem, ultimaAtividade, encerrado, followup1, followup2) VALUES
-- Janeiro 2025 (mais recentes)
('Olá! Gostaria de saber mais sobre seus serviços.', '2025-01-10T10:30:00Z', false, true, false),
('Interessado em uma proposta comercial.', '2025-01-10T11:15:00Z', false, false, false),
('Podemos agendar uma reunião?', '2025-01-09T14:20:00Z', true, true, true),
('Qual o valor do investimento?', '2025-01-09T16:45:00Z', false, true, false),
('Preciso de mais informações técnicas.', '2025-01-08T09:10:00Z', false, false, false),
('Reunião agendada para próxima semana.', '2025-01-08T15:30:00Z', true, true, true),
('Enviei o orçamento solicitado.', '2025-01-07T13:25:00Z', false, true, true),
('Aguardando retorno do cliente.', '2025-01-07T17:40:00Z', false, true, false),
('Cliente aprovou a proposta!', '2025-01-06T11:50:00Z', true, true, true),
('Seguindo com o processo de contratação.', '2025-01-06T14:15:00Z', false, true, true),

-- Dezembro 2024
('Primeiro contato realizado.', '2024-12-28T10:05:00Z', false, false, false),
('Cliente demonstrou interesse.', '2024-12-28T15:20:00Z', false, true, false),
('Reunião técnica realizada.', '2024-12-27T09:30:00Z', false, true, true),
('Proposta enviada para análise.', '2024-12-27T16:10:00Z', false, true, false),
('Cliente solicitou desconto.', '2024-12-26T12:35:00Z', false, true, false),
('Negociação em andamento.', '2024-12-26T18:45:00Z', false, true, true),
('Contrato assinado!', '2024-12-25T14:20:00Z', true, true, true),
('Projeto iniciado.', '2024-12-25T16:30:00Z', false, true, true),
('Follow-up agendado.', '2024-12-24T11:15:00Z', false, true, false),
('Cliente não respondeu.', '2024-12-24T17:25:00Z', false, false, false),

-- Novembro 2024
('Contato inicial via site.', '2024-11-30T14:20:00Z', false, true, false),
('Interesse em compliance.', '2024-11-30T16:45:00Z', false, false, false),
('Reunião presencial agendada.', '2024-11-29T10:30:00Z', true, true, true),
('Cliente precisa de urgência.', '2024-11-29T15:15:00Z', false, true, false),
('Proposta técnica aprovada.', '2024-11-28T11:40:00Z', false, true, true),
('Aguardando retorno sobre orçamento.', '2024-11-28T17:20:00Z', false, true, false),
('Contrato fechado!', '2024-11-27T13:50:00Z', true, true, true),
('Projeto em execução.', '2024-11-27T18:10:00Z', false, true, true),
('Follow-up realizado.', '2024-11-26T09:25:00Z', false, true, false),
('Cliente cancelou reunião.', '2024-11-26T14:35:00Z', false, false, false),

-- Outubro 2024
('Primeiro contato via indicação.', '2024-10-31T12:15:00Z', false, true, false),
('Interesse em direito trabalhista.', '2024-10-31T16:30:00Z', false, false, false),
('Reunião online realizada.', '2024-10-30T10:45:00Z', true, true, true),
('Cliente quer conhecer equipe.', '2024-10-30T15:20:00Z', false, true, false),
('Proposta comercial enviada.', '2024-10-29T11:30:00Z', false, true, true),
('Aguardando aprovação do conselho.', '2024-10-29T17:45:00Z', false, true, false),
('Contrato assinado!', '2024-10-28T14:10:00Z', true, true, true),
('Projeto iniciado.', '2024-10-28T18:25:00Z', false, true, true),
('Follow-up mensal realizado.', '2024-10-27T09:40:00Z', false, true, false),
('Cliente não atendeu ligações.', '2024-10-27T16:50:00Z', false, false, false),

-- Setembro 2024
('Contato inicial via formulário.', '2024-09-30T13:20:00Z', false, true, false),
('Interesse em consultoria jurídica.', '2024-09-30T17:35:00Z', false, false, false),
('Reunião presencial agendada.', '2024-09-29T11:15:00Z', true, true, true),
('Cliente precisa de resposta urgente.', '2024-09-29T15:40:00Z', false, true, false),
('Proposta técnica aprovada.', '2024-09-28T10:25:00Z', false, true, true),
('Aguardando retorno sobre valores.', '2024-09-28T16:55:00Z', false, true, false),
('Contrato fechado!', '2024-09-27T14:30:00Z', true, true, true),
('Projeto em execução.', '2024-09-27T19:15:00Z', false, true, true),
('Follow-up realizado.', '2024-09-26T08:45:00Z', false, true, false),
('Cliente cancelou reunião.', '2024-09-26T15:20:00Z', false, false, false);

-- Verificar os dados inseridos
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN encerrado = true THEN 1 END) as leads_encerrados,
  COUNT(CASE WHEN followup1 = true THEN 1 END) as com_followup1,
  COUNT(CASE WHEN followup2 = true THEN 1 END) as com_followup2,
  MIN(ultimaAtividade) as data_mais_antiga,
  MAX(ultimaAtividade) as data_mais_recente
FROM public.followup;
