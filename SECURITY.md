# Guia de Segurança - SDR-MT

## ⚠️ AÇÕES IMEDIATAS NECESSÁRIAS

### 1. Rotacionar Chaves do Supabase (CRÍTICO)
As chaves antigas foram expostas no repositório. Execute imediatamente:

1. Acesse o dashboard do Supabase: https://app.supabase.com
2. Vá em Settings → API
3. Clique em "Reset" para gerar novas chaves:
   - Anon/Public Key
   - Service Role Key (NUNCA use no frontend)
4. Revogue as chaves antigas

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (NÃO commitar):

```env
VITE_SUPABASE_URL=https://seu-novo-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_nova_chave_anon_aqui
```

### 3. Aplicar Políticas RLS Seguras
Execute no SQL Editor do Supabase:

```bash
# Arquivo: supabase/migrations/20250113000002_secure_rls_policies.sql
```

Isso removerá as políticas públicas (USING true) e aplicará autenticação.

### 4. Criar Usuários no Supabase Auth
Como a autenticação agora usa Supabase Auth:

1. Acesse Authentication → Users no dashboard
2. Crie usuários com email/senha
3. Use esses usuários para fazer login

Ou via SQL:
```sql
-- Criar usuário admin
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('admin@marquestenca.com', crypt('senha_segura_aqui', gen_salt('bf')), NOW());
```

## 🔒 Mudanças de Segurança Implementadas

### Autenticação
- ✅ Removidas credenciais hardcoded
- ✅ Implementado Supabase Auth
- ✅ Tokens gerenciados pelo Supabase (JWT)
- ✅ Session storage seguro

### Proteção de Dados
- ✅ Números de telefone mascarados na UI
- ✅ Exportações com dados mascarados
- ✅ Políticas RLS para acesso autenticado apenas

### Credenciais
- ✅ Variáveis de ambiente (.env)
- ✅ .gitignore atualizado
- ✅ Validação de variáveis obrigatórias

### Logs e Debugging
- ✅ Console.logs sensíveis removidos
- ✅ Erros sem exposição de dados

## 📋 Checklist de Segurança

- [ ] Rotacionar todas as chaves do Supabase
- [ ] Criar arquivo .env com novas chaves
- [ ] Aplicar migração de RLS policies
- [ ] Criar usuários no Supabase Auth
- [ ] Testar login com novo sistema
- [ ] Verificar máscaras de telefone funcionando
- [ ] Purgar histórico Git (opcional mas recomendado)
- [ ] Configurar variáveis no Netlify
- [ ] Revisar logs de acesso no Supabase
- [ ] Documentar políticas de acesso para equipe

## 🔐 Boas Práticas

### Desenvolvimento
- NUNCA commitar arquivos .env
- NUNCA usar service_role key no frontend
- Sempre usar variáveis de ambiente
- Testar políticas RLS antes de deploy

### Produção
- Usar HTTPS sempre
- Rotacionar chaves periodicamente
- Monitorar logs de acesso
- Implementar rate limiting
- Backup regular dos dados

### Dados Sensíveis (LGPD/GDPR)
- Números de telefone sempre mascarados
- Logs de acesso a dados não mascarados
- Consentimento documentado
- Direito ao esquecimento implementado

## 🚨 Em Caso de Vazamento

1. Rotacionar TODAS as chaves imediatamente
2. Revisar logs de acesso no Supabase
3. Notificar usuários afetados (se aplicável)
4. Documentar o incidente
5. Implementar medidas preventivas adicionais

## 📞 Contatos de Segurança

Para reportar vulnerabilidades:
- Email: security@marquestenca.com (criar)
- Não divulgar publicamente antes de correção

## 🔄 Próximas Melhorias

- [ ] Implementar 2FA
- [ ] Adicionar rate limiting
- [ ] Criptografia adicional para dados sensíveis
- [ ] Auditoria de acesso completa
- [ ] Penetration testing
- [ ] Compliance LGPD formal

## 📚 Recursos

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)

