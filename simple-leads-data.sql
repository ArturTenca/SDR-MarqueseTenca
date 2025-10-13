-- Script simples para criar dados de leads para os gráficos
-- Execute este script no SQL Editor do Supabase Dashboard

-- Inserir dados de followup com leads de diferentes períodos
INSERT INTO public.followup (remotejID, ultimaMensagem, ultimaAtividade, encerrado, followup1, followup2) VALUES
-- Janeiro 2025 (mais recentes)
('5511999999001', 'Olá! Gostaria de saber mais sobre seus serviços.', '2025-01-10T10:30:00Z', false, true, false),
('5511999999002', 'Interessado em uma proposta comercial.', '2025-01-10T11:15:00Z', false, false, false),
('5511999999003', 'Podemos agendar uma reunião?', '2025-01-09T14:20:00Z', true, true, true),
('5511999999004', 'Qual o valor do investimento?', '2025-01-09T16:45:00Z', false, true, false),
('5511999999005', 'Preciso de mais informações técnicas.', '2025-01-08T09:10:00Z', false, false, false),
('5511999999006', 'Reunião agendada para próxima semana.', '2025-01-08T15:30:00Z', true, true, true),
('5511999999007', 'Enviei o orçamento solicitado.', '2025-01-07T13:25:00Z', false, true, true),
('5511999999008', 'Aguardando retorno do cliente.', '2025-01-07T17:40:00Z', false, true, false),
('5511999999009', 'Cliente aprovou a proposta!', '2025-01-06T11:50:00Z', true, true, true),
('5511999999010', 'Seguindo com o processo de contratação.', '2025-01-06T14:15:00Z', false, true, true),

-- Dezembro 2024
('5511999999011', 'Primeiro contato realizado.', '2024-12-28T10:05:00Z', false, false, false),
('5511999999012', 'Cliente demonstrou interesse.', '2024-12-28T15:20:00Z', false, true, false),
('5511999999013', 'Reunião técnica realizada.', '2024-12-27T09:30:00Z', false, true, true),
('5511999999014', 'Proposta enviada para análise.', '2024-12-27T16:10:00Z', false, true, false),
('5511999999015', 'Cliente solicitou desconto.', '2024-12-26T12:35:00Z', false, true, false),
('5511999999016', 'Negociação em andamento.', '2024-12-26T18:45:00Z', false, true, true),
('5511999999017', 'Contrato assinado!', '2024-12-25T14:20:00Z', true, true, true),
('5511999999018', 'Projeto iniciado.', '2024-12-25T16:30:00Z', false, true, true),
('5511999999019', 'Follow-up agendado.', '2024-12-24T11:15:00Z', false, true, false),
('5511999999020', 'Cliente não respondeu.', '2024-12-24T17:25:00Z', false, false, false),

-- Novembro 2024
('5511999999021', 'Contato inicial via site.', '2024-11-30T14:20:00Z', false, true, false),
('5511999999022', 'Interesse em compliance.', '2024-11-30T16:45:00Z', false, false, false),
('5511999999023', 'Reunião presencial agendada.', '2024-11-29T10:30:00Z', true, true, true),
('5511999999024', 'Cliente precisa de urgência.', '2024-11-29T15:15:00Z', false, true, false),
('5511999999025', 'Proposta técnica aprovada.', '2024-11-28T11:40:00Z', false, true, true),
('5511999999026', 'Aguardando retorno sobre orçamento.', '2024-11-28T17:20:00Z', false, true, false),
('5511999999027', 'Contrato fechado!', '2024-11-27T13:50:00Z', true, true, true),
('5511999999028', 'Projeto em execução.', '2024-11-27T18:10:00Z', false, true, true),
('5511999999029', 'Follow-up realizado.', '2024-11-26T09:25:00Z', false, true, false),
('5511999999030', 'Cliente cancelou reunião.', '2024-11-26T14:35:00Z', false, false, false),

-- Outubro 2024
('5511999999031', 'Primeiro contato via indicação.', '2024-10-31T12:15:00Z', false, true, false),
('5511999999032', 'Interesse em direito trabalhista.', '2024-10-31T16:30:00Z', false, false, false),
('5511999999033', 'Reunião online realizada.', '2024-10-30T10:45:00Z', true, true, true),
('5511999999034', 'Cliente quer conhecer equipe.', '2024-10-30T15:20:00Z', false, true, false),
('5511999999035', 'Proposta comercial enviada.', '2024-10-29T11:30:00Z', false, true, true),
('5511999999036', 'Aguardando aprovação do conselho.', '2024-10-29T17:45:00Z', false, true, false),
('5511999999037', 'Contrato assinado!', '2024-10-28T14:10:00Z', true, true, true),
('5511999999038', 'Projeto iniciado.', '2024-10-28T18:25:00Z', false, true, true),
('5511999999039', 'Follow-up mensal realizado.', '2024-10-27T09:40:00Z', false, true, false),
('5511999999040', 'Cliente não atendeu ligações.', '2024-10-27T16:50:00Z', false, false, false),

-- Setembro 2024
('5511999999041', 'Contato inicial via formulário.', '2024-09-30T13:20:00Z', false, true, false),
('5511999999042', 'Interesse em consultoria jurídica.', '2024-09-30T17:35:00Z', false, false, false),
('5511999999043', 'Reunião presencial agendada.', '2024-09-29T11:15:00Z', true, true, true),
('5511999999044', 'Cliente precisa de resposta urgente.', '2024-09-29T15:40:00Z', false, true, false),
('5511999999045', 'Proposta técnica aprovada.', '2024-09-28T10:25:00Z', false, true, true),
('5511999999046', 'Aguardando retorno sobre valores.', '2024-09-28T16:55:00Z', false, true, false),
('5511999999047', 'Contrato fechado!', '2024-09-27T14:30:00Z', true, true, true),
('5511999999048', 'Projeto em execução.', '2024-09-27T19:15:00Z', false, true, true),
('5511999999049', 'Follow-up realizado.', '2024-09-26T08:45:00Z', false, true, false),
('5511999999050', 'Cliente cancelou reunião.', '2024-09-26T15:20:00Z', false, false, false);

-- Verificar os dados inseridos
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN encerrado = true THEN 1 END) as leads_encerrados,
  COUNT(CASE WHEN followup1 = true THEN 1 END) as com_followup1,
  COUNT(CASE WHEN followup2 = true THEN 1 END) as com_followup2,
  MIN(ultimaAtividade) as data_mais_antiga,
  MAX(ultimaAtividade) as data_mais_recente
FROM public.followup;
