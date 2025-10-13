# Guia de Integração n8n → Supabase

## 1. Estrutura da Tabela `conversation_analysis`

A tabela já está criada com a seguinte estrutura:

```sql
CREATE TABLE conversation_analysis (
  id SERIAL PRIMARY KEY,
  remotejID TEXT NOT NULL,
  avg_response_time_hours DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_messages_per_lead INTEGER DEFAULT 0,
  peak_activity_hours INTEGER[] DEFAULT '{}',
  top_keywords JSONB DEFAULT '[]',
  sentiment_analysis JSONB DEFAULT '{"positive": 0, "neutral": 0, "negative": 0}',
  followup_effectiveness JSONB DEFAULT '{"followup1": 0, "followup2": 0}',
  total_conversations INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(remotejID)
);
```

## 2. Configuração do n8n

### Passo 1: Criar Workflow de Análise
1. No n8n, crie um novo workflow
2. Nome: "Conversation Analysis to Supabase"

### Passo 2: Configurar Trigger
- **Tipo**: Cron (executar a cada hora)
- **Expressão**: `0 * * * *` (a cada hora)

### Passo 3: Buscar Dados do Supabase (Leads)
```json
{
  "operation": "executeQuery",
  "query": "SELECT * FROM followup WHERE created_at >= NOW() - INTERVAL '24 hours'",
  "additionalFields": {}
}
```

### Passo 4: Buscar Histórico de Conversas
```json
{
  "operation": "executeQuery", 
  "query": "SELECT * FROM n8n_chat_histories WHERE created_at >= NOW() - INTERVAL '24 hours'",
  "additionalFields": {}
}
```

### Passo 5: Processar Dados (Code Node)
```javascript
// Calcular métricas de análise
const leads = $input.first().json;
const conversations = $input.last().json;

// Agrupar conversas por remotejID
const conversationsByLead = {};
conversations.forEach(conv => {
  const sessionId = conv.session_id;
  if (!conversationsByLead[sessionId]) {
    conversationsByLead[sessionId] = [];
  }
  conversationsByLead[sessionId].push(conv);
});

// Calcular métricas para cada lead
const analysisResults = [];

leads.forEach(lead => {
  const leadConversations = conversationsByLead[lead.remotejID] || [];
  
  // Calcular tempo médio de resposta (em horas)
  let avgResponseTime = 0;
  if (leadConversations.length > 0) {
    const responseTimes = [];
    for (let i = 1; i < leadConversations.length; i++) {
      const prevTime = new Date(leadConversations[i-1].created_at);
      const currTime = new Date(leadConversations[i].created_at);
      const diffHours = (currTime - prevTime) / (1000 * 60 * 60);
      responseTimes.push(diffHours);
    }
    avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
  }

  // Calcular taxa de conversão
  const conversionRate = lead.encerrado ? 100 : 0;

  // Calcular mensagens por lead
  const avgMessagesPerLead = leadConversations.length;

  // Calcular horários de pico
  const hourlyActivity = {};
  leadConversations.forEach(conv => {
    const hour = new Date(conv.created_at).getHours();
    hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
  });
  const peakActivityHours = Object.entries(hourlyActivity)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  // Análise de palavras-chave (simplificada)
  const allMessages = leadConversations.map(conv => {
    const messageData = conv.message;
    return messageData.content || messageData.text || '';
  }).join(' ').toLowerCase();

  const keywords = [
    'consultoria', 'contrato', 'trabalhista', 'tributário', 'compliance',
    'reunião', 'proposta', 'valor', 'serviço', 'empresa', 'direito',
    'advogado', 'jurídico', 'cliente', 'negociação'
  ];

  const topKeywords = keywords.map(word => ({
    word,
    count: (allMessages.match(new RegExp(word, 'g')) || []).length
  })).filter(kw => kw.count > 0).slice(0, 5);

  // Análise de sentimento (simplificada)
  const positiveWords = ['obrigado', 'perfeito', 'excelente', 'ótimo', 'bom'];
  const negativeWords = ['problema', 'erro', 'ruim', 'péssimo', 'difícil'];
  
  let positive = 0, negative = 0, neutral = 0;
  leadConversations.forEach(conv => {
    const content = (conv.message.content || conv.message.text || '').toLowerCase();
    const posCount = positiveWords.filter(word => content.includes(word)).length;
    const negCount = negativeWords.filter(word => content.includes(word)).length;
    
    if (posCount > negCount) positive++;
    else if (negCount > posCount) negative++;
    else neutral++;
  });

  // Efetividade dos followups
  const followupEffectiveness = {
    followup1: lead.followup1 && !lead.followup2 ? (lead.encerrado ? 100 : 0) : 0,
    followup2: lead.followup2 ? (lead.encerrado ? 100 : 0) : 0
  };

  analysisResults.push({
    remotejID: lead.remotejID,
    avg_response_time_hours: avgResponseTime,
    conversion_rate: conversionRate,
    avg_messages_per_lead: avgMessagesPerLead,
    peak_activity_hours: peakActivityHours,
    top_keywords: topKeywords,
    sentiment_analysis: {
      positive,
      neutral,
      negative
    },
    followup_effectiveness,
    total_conversations: leadConversations.length
  });
});

return analysisResults.map(result => ({ json: result }));
```

### Passo 6: Salvar no Supabase (Upsert)
```json
{
  "operation": "upsert",
  "table": "conversation_analysis",
  "upsertKey": "remotejID",
  "columns": [
    "remotejID",
    "avg_response_time_hours", 
    "conversion_rate",
    "avg_messages_per_lead",
    "peak_activity_hours",
    "top_keywords",
    "sentiment_analysis",
    "followup_effectiveness",
    "total_conversations"
  ]
}
```

## 3. Configuração do Supabase

### Variáveis de Ambiente no n8n
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
```

### Políticas RLS (já configuradas)
```sql
-- Permitir inserção/atualização de dados de análise
CREATE POLICY "Allow n8n to insert conversation analysis" ON conversation_analysis
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow n8n to update conversation analysis" ON conversation_analysis
  FOR UPDATE USING (true);
```

## 4. Teste do Workflow

### Teste Manual
1. Execute o workflow manualmente
2. Verifique se os dados foram inseridos na tabela
3. Confira no dashboard se as métricas aparecem

### Verificação no Supabase
```sql
SELECT * FROM conversation_analysis ORDER BY updated_at DESC LIMIT 10;
```

## 5. Monitoramento

### Logs do n8n
- Verifique os logs de execução
- Monitore erros de conexão com Supabase
- Acompanhe performance do workflow

### Alertas
- Configure alertas para falhas de execução
- Monitore se os dados estão sendo atualizados regularmente

## 6. Otimizações Futuras

### Performance
- Processar apenas leads novos/modificados
- Usar paginação para grandes volumes
- Implementar cache para consultas frequentes

### Funcionalidades
- Análise de sentimento mais sofisticada
- Detecção automática de palavras-chave
- Métricas de engajamento em tempo real

## 7. Troubleshooting

### Problemas Comuns
1. **Erro de conexão**: Verificar URL e chave do Supabase
2. **Dados não aparecem**: Verificar políticas RLS
3. **Performance lenta**: Otimizar queries e adicionar índices
4. **Workflow falha**: Verificar logs e configurações

### Comandos Úteis
```sql
-- Verificar dados recentes
SELECT * FROM conversation_analysis WHERE updated_at >= NOW() - INTERVAL '1 hour';

-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'conversation_analysis';

-- Verificar índices
SELECT * FROM pg_indexes WHERE tablename = 'conversation_analysis';
```
