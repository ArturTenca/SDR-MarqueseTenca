-- Script para inserir dados de exemplo no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- Inserir dados de exemplo na tabela followup
INSERT INTO public.followup (remotejID, ultimaMensagem, ultimaAtividade, encerrado, followup1, followup2) VALUES
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
('5511999999011', 'Primeiro contato realizado.', '2025-01-05T10:05:00Z', false, false, false),
('5511999999012', 'Cliente demonstrou interesse.', '2025-01-05T15:20:00Z', false, true, false),
('5511999999013', 'Reunião técnica realizada.', '2025-01-04T09:30:00Z', false, true, true),
('5511999999014', 'Proposta enviada para análise.', '2025-01-04T16:10:00Z', false, true, false),
('5511999999015', 'Cliente solicitou desconto.', '2025-01-03T12:35:00Z', false, true, false),
('5511999999016', 'Negociação em andamento.', '2025-01-03T18:45:00Z', false, true, true),
('5511999999017', 'Contrato assinado!', '2025-01-02T14:20:00Z', true, true, true),
('5511999999018', 'Projeto iniciado.', '2025-01-02T16:30:00Z', false, true, true),
('5511999999019', 'Follow-up agendado.', '2025-01-01T11:15:00Z', false, true, false),
('5511999999020', 'Cliente não respondeu.', '2025-01-01T17:25:00Z', false, false, false);

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_registros FROM public.followup;
SELECT * FROM public.followup ORDER BY ultimaAtividade DESC LIMIT 5;
