-- Script para criar dados realistas de leads com conversas antigas
-- Execute este script no SQL Editor do Supabase Dashboard

-- Limpar dados existentes (opcional)
-- DELETE FROM public.followup;
-- DELETE FROM public.n8n_chat_histories;

-- Inserir dados de followup com leads de diferentes períodos
INSERT INTO public.followup (remotejID, ultimaMensagem, ultimaAtividade, encerrado, followup1, followup2) VALUES
-- Leads de Janeiro 2025 (mais recentes)
('5511999999001', 'Olá! Gostaria de saber mais sobre seus serviços jurídicos.', '2025-01-10T10:30:00Z', false, true, false),
('5511999999002', 'Interessado em uma consultoria para minha empresa.', '2025-01-10T11:15:00Z', false, false, false),
('5511999999003', 'Podemos agendar uma reunião para próxima semana?', '2025-01-09T14:20:00Z', true, true, true),
('5511999999004', 'Qual o valor do investimento para um processo trabalhista?', '2025-01-09T16:45:00Z', false, true, false),
('5511999999005', 'Preciso de mais informações sobre direito empresarial.', '2025-01-08T09:10:00Z', false, false, false),
('5511999999006', 'Reunião agendada para próxima terça-feira às 14h.', '2025-01-08T15:30:00Z', true, true, true),
('5511999999007', 'Enviei o contrato para análise. Aguardando retorno.', '2025-01-07T13:25:00Z', false, true, true),
('5511999999008', 'Aguardando aprovação do orçamento pela diretoria.', '2025-01-07T17:40:00Z', false, true, false),
('5511999999009', 'Cliente aprovou a proposta! Vamos iniciar o processo.', '2025-01-06T11:50:00Z', true, true, true),
('5511999999010', 'Seguindo com o processo de contratação dos serviços.', '2025-01-06T14:15:00Z', false, true, true),

-- Leads de Dezembro 2024
('5511999999011', 'Primeiro contato realizado via LinkedIn.', '2024-12-28T10:05:00Z', false, false, false),
('5511999999012', 'Cliente demonstrou interesse em direito tributário.', '2024-12-28T15:20:00Z', false, true, false),
('5511999999013', 'Reunião técnica realizada com sucesso.', '2024-12-27T09:30:00Z', false, true, true),
('5511999999014', 'Proposta enviada para análise do departamento jurídico.', '2024-12-27T16:10:00Z', false, true, false),
('5511999999015', 'Cliente solicitou desconto especial para contrato anual.', '2024-12-26T12:35:00Z', false, true, false),
('5511999999016', 'Negociação em andamento. Cliente muito interessado.', '2024-12-26T18:45:00Z', false, true, true),
('5511999999017', 'Contrato assinado! Projeto iniciado com sucesso.', '2024-12-25T14:20:00Z', true, true, true),
('5511999999018', 'Primeira fase do projeto concluída com excelência.', '2024-12-25T16:30:00Z', false, true, true),
('5511999999019', 'Follow-up agendado para acompanhamento mensal.', '2024-12-24T11:15:00Z', false, true, false),
('5511999999020', 'Cliente não respondeu aos últimos contatos.', '2024-12-24T17:25:00Z', false, false, false),

-- Leads de Novembro 2024
('5511999999021', 'Contato inicial via site da empresa.', '2024-11-30T14:20:00Z', false, true, false),
('5511999999022', 'Interesse em serviços de compliance empresarial.', '2024-11-30T16:45:00Z', false, false, false),
('5511999999023', 'Reunião presencial agendada para próxima semana.', '2024-11-29T10:30:00Z', true, true, true),
('5511999999024', 'Cliente precisa de urgência no processo.', '2024-11-29T15:15:00Z', false, true, false),
('5511999999025', 'Proposta técnica enviada e aprovada.', '2024-11-28T11:40:00Z', false, true, true),
('5511999999026', 'Aguardando retorno do cliente sobre orçamento.', '2024-11-28T17:20:00Z', false, true, false),
('5511999999027', 'Contrato fechado! Cliente muito satisfeito.', '2024-11-27T13:50:00Z', true, true, true),
('5511999999028', 'Projeto em execução. Tudo dentro do prazo.', '2024-11-27T18:10:00Z', false, true, true),
('5511999999029', 'Follow-up realizado. Cliente renovou contrato.', '2024-11-26T09:25:00Z', false, true, false),
('5511999999030', 'Cliente cancelou reunião. Tentar reagendar.', '2024-11-26T14:35:00Z', false, false, false),

-- Leads de Outubro 2024
('5511999999031', 'Primeiro contato via indicação de cliente.', '2024-10-31T12:15:00Z', false, true, false),
('5511999999032', 'Interesse em direito trabalhista para empresa.', '2024-10-31T16:30:00Z', false, false, false),
('5511999999033', 'Reunião online realizada com sucesso.', '2024-10-30T10:45:00Z', true, true, true),
('5511999999034', 'Cliente quer conhecer toda equipe jurídica.', '2024-10-30T15:20:00Z', false, true, false),
('5511999999035', 'Proposta comercial enviada via email.', '2024-10-29T11:30:00Z', false, true, true),
('5511999999036', 'Aguardando aprovação do conselho administrativo.', '2024-10-29T17:45:00Z', false, true, false),
('5511999999037', 'Contrato assinado! Cliente muito entusiasmado.', '2024-10-28T14:10:00Z', true, true, true),
('5511999999038', 'Projeto iniciado. Primeira fase em andamento.', '2024-10-28T18:25:00Z', false, true, true),
('5511999999039', 'Follow-up mensal realizado com sucesso.', '2024-10-27T09:40:00Z', false, true, false),
('5511999999040', 'Cliente não atendeu ligações. Enviar WhatsApp.', '2024-10-27T16:50:00Z', false, false, false),

-- Leads de Setembro 2024
('5511999999041', 'Contato inicial via formulário do site.', '2024-09-30T13:20:00Z', false, true, false),
('5511999999042', 'Interesse em consultoria jurídica empresarial.', '2024-09-30T17:35:00Z', false, false, false),
('5511999999043', 'Reunião presencial agendada para próxima sexta.', '2024-09-29T11:15:00Z', true, true, true),
('5511999999044', 'Cliente precisa de resposta urgente.', '2024-09-29T15:40:00Z', false, true, false),
('5511999999045', 'Proposta técnica aprovada pelo cliente.', '2024-09-28T10:25:00Z', false, true, true),
('5511999999046', 'Aguardando retorno sobre valores propostos.', '2024-09-28T16:55:00Z', false, true, false),
('5511999999047', 'Contrato fechado! Excelente negociação.', '2024-09-27T14:30:00Z', true, true, true),
('5511999999048', 'Projeto em execução. Cliente muito satisfeito.', '2024-09-27T19:15:00Z', false, true, true),
('5511999999049', 'Follow-up realizado. Cliente renovou por mais 6 meses.', '2024-09-26T08:45:00Z', false, true, false),
('5511999999050', 'Cliente cancelou reunião. Tentar contato novamente.', '2024-09-26T15:20:00Z', false, false, false);

-- Inserir histórico de conversas na tabela n8n_chat_histories
INSERT INTO public.n8n_chat_histories (session_id, message) VALUES
-- Conversas para leads recentes
('session_001', '{"role": "user", "content": "Olá! Gostaria de saber mais sobre os serviços jurídicos da Marques e Tenca.", "timestamp": "2025-01-10T10:30:00Z"}'),
('session_001', '{"role": "assistant", "content": "Olá! Ficamos felizes em saber do seu interesse. Oferecemos consultoria jurídica empresarial, direito trabalhista, tributário e compliance. Gostaria de agendar uma reunião para conversarmos melhor?", "timestamp": "2025-01-10T10:31:00Z"}'),
('session_001', '{"role": "user", "content": "Sim, gostaria de agendar uma reunião. Qual seria o melhor horário?", "timestamp": "2025-01-10T10:32:00Z"}'),

('session_002', '{"role": "user", "content": "Preciso de uma consultoria para minha empresa. Temos algumas questões trabalhistas.", "timestamp": "2025-01-10T11:15:00Z"}'),
('session_002', '{"role": "assistant", "content": "Entendo. Questões trabalhistas são muito importantes para empresas. Podemos ajudar com consultoria preventiva, análise de contratos e processos. Que tipo de situação específica vocês estão enfrentando?", "timestamp": "2025-01-10T11:16:00Z"}'),

('session_003', '{"role": "user", "content": "Podemos agendar uma reunião para próxima semana? Preciso discutir um caso urgente.", "timestamp": "2025-01-09T14:20:00Z"}'),
('session_003', '{"role": "assistant", "content": "Claro! Para casos urgentes, temos disponibilidade na próxima semana. Que dia seria melhor para vocês? Temos horários disponíveis na terça, quarta ou quinta-feira.", "timestamp": "2025-01-09T14:21:00Z"}'),
('session_003', '{"role": "user", "content": "Terça-feira às 14h seria perfeito. Qual o endereço do escritório?", "timestamp": "2025-01-09T14:22:00Z"}'),
('session_003', '{"role": "assistant", "content": "Excelente! Terça-feira às 14h está confirmado. Nosso escritório fica na Rua das Flores, 123, Centro. Enviaremos um email de confirmação com todos os detalhes.", "timestamp": "2025-01-09T14:23:00Z"}'),

-- Conversas para leads de dezembro
('session_004', '{"role": "user", "content": "Vi o perfil de vocês no LinkedIn. Trabalham com direito tributário?", "timestamp": "2024-12-28T10:05:00Z"}'),
('session_004', '{"role": "assistant", "content": "Sim! Temos uma equipe especializada em direito tributário. Oferecemos consultoria para planejamento tributário, recuperação de créditos e defesa em processos fiscais. Gostaria de saber mais sobre algum caso específico?", "timestamp": "2024-12-28T10:06:00Z"}'),

('session_005', '{"role": "user", "content": "Preciso de ajuda com um processo trabalhista. A empresa está sendo processada.", "timestamp": "2024-12-27T09:30:00Z"}'),
('session_005', '{"role": "assistant", "content": "Entendo a preocupação. Processos trabalhistas podem ser complexos. Nossa equipe tem vasta experiência nessa área. Podemos analisar o caso e apresentar uma estratégia de defesa. Que tipo de ação foi movida contra a empresa?", "timestamp": "2024-12-27T09:31:00Z"}'),
('session_005', '{"role": "user", "content": "É uma ação por horas extras não pagas. O funcionário alega que trabalhou muito além do horário.", "timestamp": "2024-12-27T09:32:00Z"}'),
('session_005', '{"role": "assistant", "content": "Esse é um caso comum. Precisamos analisar os registros de ponto, contratos e políticas da empresa. Temos experiência em casos similares e podemos ajudar a construir uma defesa sólida.", "timestamp": "2024-12-27T09:33:00Z"}'),

-- Conversas para leads de novembro
('session_006', '{"role": "user", "content": "Acessei o site de vocês. Oferecem serviços de compliance?", "timestamp": "2024-11-30T14:20:00Z"}'),
('session_006', '{"role": "assistant", "content": "Sim! Oferecemos serviços completos de compliance empresarial. Ajudamos empresas a se adequarem às normas regulatórias, implementamos programas de integridade e oferecemos treinamentos. Que tipo de compliance vocês precisam?", "timestamp": "2024-11-30T14:21:00Z"}'),

('session_007', '{"role": "user", "content": "Temos uma reunião importante na próxima semana. Preciso de uma proposta urgente.", "timestamp": "2024-11-29T10:30:00Z"}'),
('session_007', '{"role": "assistant", "content": "Entendemos a urgência. Para reuniões importantes, podemos acelerar o processo. Que tipo de serviços vocês precisam? Com essas informações, prepararemos uma proposta personalizada para apresentar na reunião.", "timestamp": "2024-11-29T10:31:00Z"}'),
('session_007', '{"role": "user", "content": "Precisamos de consultoria jurídica completa para uma nova filial. Será uma apresentação para o conselho.", "timestamp": "2024-11-29T10:32:00Z"}'),
('session_007', '{"role": "assistant", "content": "Perfeito! Para apresentações ao conselho, preparamos propostas detalhadas e profissionais. Incluiremos análise de riscos, cronograma de implementação e investimento necessário. Enviaremos a proposta até amanhã.", "timestamp": "2024-11-29T10:33:00Z"}'),

-- Conversas para leads de outubro
('session_008', '{"role": "user", "content": "Fui indicado por um cliente de vocês. Ele falou muito bem dos serviços.", "timestamp": "2024-10-31T12:15:00Z"}'),
('session_008', '{"role": "assistant", "content": "Que bom saber que nossos clientes estão satisfeitos e nos indicam! Isso é muito importante para nós. Que tipo de serviços o cliente que te indicou utilizou? Assim podemos entender melhor como podemos ajudar você também.", "timestamp": "2024-10-31T12:16:00Z"}'),

('session_009', '{"role": "user", "content": "Preciso conhecer toda a equipe jurídica antes de fechar qualquer contrato.", "timestamp": "2024-10-30T15:20:00Z"}'),
('session_009', '{"role": "assistant", "content": "Entendemos perfeitamente. Conhecer a equipe é fundamental para estabelecer confiança. Podemos agendar uma reunião onde apresentaremos todos os advogados especialistas, suas áreas de atuação e experiência. Que dia seria melhor?", "timestamp": "2024-10-30T15:21:00Z"}'),

-- Conversas para leads de setembro
('session_010', '{"role": "user", "content": "Preenchi o formulário no site. Preciso de informações sobre consultoria jurídica.", "timestamp": "2024-09-30T13:20:00Z"}'),
('session_010', '{"role": "assistant", "content": "Obrigado por entrar em contato conosco! Recebemos seu formulário e estamos analisando suas necessidades. Que tipo de consultoria jurídica vocês precisam? Temos especialistas em diversas áreas do direito.", "timestamp": "2024-09-30T13:21:00Z"}'),

('session_011', '{"role": "user", "content": "Temos uma reunião importante na próxima sexta. Preciso de uma proposta detalhada.", "timestamp": "2024-09-29T11:15:00Z"}'),
('session_011', '{"role": "assistant", "content": "Entendemos a importância da reunião. Para sexta-feira, podemos preparar uma proposta completa e detalhada. Que tipo de serviços jurídicos vocês precisam? Com essas informações, criaremos uma apresentação profissional para a reunião.", "timestamp": "2024-09-29T11:16:00Z"}'),
('session_011', '{"role": "user", "content": "Precisamos de consultoria completa para uma nova operação. Será uma apresentação para investidores.", "timestamp": "2024-09-29T11:17:00Z"}'),
('session_011', '{"role": "assistant", "content": "Excelente! Para apresentações a investidores, preparamos propostas estratégicas e detalhadas. Incluiremos análise de riscos jurídicos, estruturação legal da operação e cronograma de implementação. Entregaremos até quinta-feira.", "timestamp": "2024-09-29T11:18:00Z"}');

-- Verificar se os dados foram inseridos corretamente
SELECT 
  COUNT(*) as total_followup,
  COUNT(CASE WHEN encerrado = true THEN 1 END) as leads_encerrados,
  COUNT(CASE WHEN followup1 = true THEN 1 END) as com_followup1,
  COUNT(CASE WHEN followup2 = true THEN 1 END) as com_followup2
FROM public.followup;

SELECT 
  COUNT(*) as total_conversas
FROM public.n8n_chat_histories;

-- Mostrar alguns exemplos dos dados inseridos
SELECT 
  remotejID,
  ultimaMensagem,
  ultimaAtividade,
  encerrado,
  followup1,
  followup2
FROM public.followup 
ORDER BY ultimaAtividade DESC 
LIMIT 10;
