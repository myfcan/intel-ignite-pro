# AUDITORIA COMPLETA DO SISTEMA — Intel Ignite Pro

**Data:** 14 de Março de 2026
**Projeto:** `myfcan/intel-ignite-pro`
**Nível de Risco Geral:** CRITICAL
**Total de Issues Encontradas:** 68+

---

## SUMÁRIO EXECUTIVO

O Intel Ignite Pro é uma aplicação SaaS educacional robusta construída com React/Vite + Supabase, com sistemas de aulas cinematográficas (V7/V8), gamificação, playground de IA, e painel administrativo avançado. A auditoria revelou **vulnerabilidades críticas de segurança**, problemas arquiteturais significativos e débitos técnicos que necessitam atenção imediata.

### Números-Chave do Projeto
| Métrica | Valor |
|---------|-------|
| Componentes React | 480 arquivos |
| Páginas | 74 arquivos |
| Custom Hooks | 26 arquivos |
| Edge Functions (Supabase) | 40+ funções |
| Migrations SQL | 30+ arquivos |
| Tabelas no Banco | 25+ tabelas |
| `console.log` em produção | 1.678 ocorrências |
| Uso de tipo `any` | 715 ocorrências em 156 arquivos |
| `dangerouslySetInnerHTML` | 5 componentes |
| `React.memo` | 0 usos |

---

## PAINEL DE SEVERIDADE

| Severidade | Quantidade | Ação Requerida |
|------------|------------|----------------|
| CRITICAL | 8 | Correção imediata (24-48h) |
| HIGH | 18 | Correção urgente (1-2 semanas) |
| MEDIUM | 22 | Correção planejada (1 mês) |
| LOW | 6 | Melhoria contínua |

---

## 1. VULNERABILIDADES CRÍTICAS (CRITICAL)

### 1.1 Execução Arbitrária de Código (ACE)
- **Arquivo:** `src/components/lessons/v7/V7CodeChallenge.tsx` (linha 88)
- **Problema:** `new Function('console', codeToRun)` executa código JavaScript fornecido pelo usuário
- **Impacto:** Acesso ao DOM, roubo de dados de sessão, XSS persistente
- **Correção:** Usar Web Worker ou iframe sandbox

### 1.2 Credenciais Expostas no `.env`
- **Arquivo:** `.env` (raiz do projeto)
- **Problema:** `.env` **NÃO está no `.gitignore`** — contém:
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` (JWT completo)
  - `VITE_SUPABASE_URL`
- **Impacto:** Credenciais possivelmente commitadas no histórico do git
- **Correção:** Adicionar `.env` ao `.gitignore` imediatamente e rotacionar credenciais

### 1.3 JWT Verification Desabilitada em TODAS as Edge Functions
- **Arquivo:** `supabase/config.toml`
- **Problema:** 36 de 40+ Edge Functions têm `verify_jwt = false`
- **Funções afetadas:** `admin-reset-password`, `unlock-premium-prompt`, `collect-reward`, `v7-vv`, todas as funções de áudio
- **Impacto:** Se qualquer função não validar auth manualmente, fica acessível sem autenticação
- **Correção:** Habilitar JWT verification no config.toml

### 1.4 Tabelas de Imagem Sem RLS (Row Level Security)
- **Tabelas:** `image_jobs`, `image_attempts`, `image_assets`, `image_presets`, `image_lab_circuit_state`
- **Problema:** RLS **NÃO habilitado** — qualquer usuário autenticado pode ler/modificar
- **Impacto:** Exposição de templates, manipulação de custos, abuso de geração
- **Correção:** Habilitar RLS e criar policies imediatamente

### 1.5 XSS via `dangerouslySetInnerHTML` sem Sanitização
- **Arquivos afetados:**
  - `src/components/lessons/v7/cinematic/V7ActPlayground.tsx` (linha 245)
  - `src/components/lessons/v7/cinematic/V7ActResult.tsx` (linha 226)
  - `src/components/lessons/v7/CodeEditor.tsx` (linha 194)
  - `src/components/lessons/v7/CinematicActRenderer.tsx` (linha 201)
  - `src/components/ui/chart.tsx` (linha 70)
- **Problema:** Conteúdo da API e do banco renderizado como HTML sem DOMPurify
- **Impacto:** XSS stored e reflected
- **Correção:** Instalar DOMPurify e sanitizar todo conteúdo antes de renderizar

### 1.6 Mega-Componentes (2000+ linhas)
- **Arquivos:** `AdminV5CardConfig.tsx` (2.029 linhas), `AdminV8Create.tsx` (1.438), `Dashboard.tsx` (1.410)
- **Problema:** Violação do Single Responsibility Principle, impossível testar/manter
- **Correção:** Dividir em componentes menores (max 300-400 linhas)

### 1.7 Sem Input Sanitization Global
- **Problema:** Nenhuma biblioteca de sanitização (DOMPurify) encontrada no projeto
- **Impacto:** Múltiplos vetores de XSS abertos

### 1.8 Sem Content Security Policy (CSP)
- **Arquivo:** `index.html`
- **Problema:** Nenhum header CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection
- **Impacto:** XSS muito mais efetivo sem CSP

---

## 2. VULNERABILIDADES ALTAS (HIGH)

### 2.1 Race Condition em Operações de Coins/Points
- **Arquivo:** `supabase/functions/unlock-premium-prompt/index.ts` (linhas 72-118)
- **Problema:** TOCTOU — check de saldo e dedução não são atômicos
- **Ataque:** 2 requests simultâneos podem gastar coins duplicados
- **Correção:** Usar transação SQL atômica ou constraint no Postgres

### 2.2 Service Role Key Usada em 41 Edge Functions
- **Problema:** Bypass total de RLS em todas as funções. Se qualquer função for comprometida, atacante tem acesso total ao banco
- **Correção:** Minimizar uso da service role key, implementar RLS policies adequadas

### 2.3 CORS Wildcard (`*`) em 41 Edge Functions
- **Problema:** `Access-Control-Allow-Origin: "*"` permite CSRF e abuso cross-origin
- **Correção:** Restringir a domínios específicos

### 2.4 Validação de Senha Fraca
- **Arquivo:** `src/pages/Auth.tsx` (linha 140)
- **Problema:** Mínimo de apenas 6 caracteres, sem requisitos de complexidade
- **Padrão NIST:** Mínimo de 12 caracteres recomendado
- **Correção:** Aumentar para 12+ caracteres com complexidade

### 2.5 Admin Reset Password Inseguro
- **Arquivo:** `supabase/functions/admin-reset-password/index.ts`
- **Problemas:** CORS wildcard, sem audit log, senha mínima 6 chars, sem notificação ao usuário, sem MFA
- **Correção:** Restringir CORS, adicionar audit logging, fortalecer validação

### 2.6 Pipeline Executions Acessível a Todos
- **Problema:** Policy RLS permite qualquer usuário autenticado ver todas as execuções
- **Impacto:** Exposição de input_data (prompts, configs) e output_data (conteúdo gerado)
- **Correção:** Restringir a admins e criador da execução

### 2.7 Dependências com Vulnerabilidades Conhecidas
- **Críticas/Altas:**
  - `react-router-dom` 6.30.1 — XSS via Open Redirects
  - `minimatch` — ReDoS
  - `glob` — Command injection
  - `flatted` — DoS via recursão
  - `esbuild` — TOCTOU
  - `lodash` — Prototype pollution
- **Correção:** `npm audit fix` e atualizar dependências

### 2.8 TypeScript com `strict: false`
- **Arquivos:** `tsconfig.json`, `tsconfig.app.json`
- **Problema:** `noImplicitAny: false`, `strictNullChecks: false`, `strict: false`
- **Impacto:** Type safety severamente reduzida
- **Correção:** Habilitar strict mode progressivamente

### 2.9 715 Usos de Tipo `any`
- **Arquivos afetados:** 156 arquivos
- **Pior arquivo:** `V7LessonTest.tsx` (20 ocorrências)
- **Correção:** Substituir por tipos apropriados progressivamente

### 2.10 1.678 `console.log` em Produção
- **Arquivos afetados:** 158 arquivos
- **Piores:** `V7PhasePlayer.tsx` (139), `GuidedLessonV4.tsx` (132), `GuidedLesson.tsx` (131)
- **Impacto:** Performance, possível vazamento de dados sensíveis
- **Correção:** Remover todos e implementar serviço de logging (Sentry)

### 2.11 Sem Error Boundary
- **Problema:** Nenhum Error Boundary no app — um componente falhando crasha a aplicação inteira
- **Correção:** Implementar Error Boundary no nível do App

### 2.12 `useLesson` Hook com Padrões Inseguros
- **Arquivo:** `src/hooks/useLesson.ts` (linhas 106-222)
- **Problemas:** Redirect via `window.location.href` (bypass React Router), error matching por string, silent failures

### 2.13 `useOnboarding` Salva no DB a Cada Keystroke
- **Arquivo:** `src/hooks/useOnboarding.ts` (linhas 17-34)
- **Problema:** INSERT no banco para cada mudança de resposta, sem debounce
- **Correção:** Adicionar debounce de 1-2s e batch saves

### 2.14 Prop Drilling Massivo no Sistema V7
- **Arquivo:** `src/components/lessons/v7/cinematic/V7PhasePlayer.tsx`
- **Evidência:** 54 console.log em um único arquivo (debug de props complexos)
- **Correção:** Extrair estado para Context (V7CinematicContext)

### 2.15 Dados Sensíveis Não Encriptados
- **Problema:** `pricing_sessions.discount_code`, dados de perfil armazenados em plaintext
- **Correção:** Implementar encryption at rest para dados sensíveis

### 2.16 Erros de API Expostos ao Cliente
- **Arquivo:** `supabase/functions/generate-audio-elevenlabs/index.ts` (linhas 70-80)
- **Problema:** `details: error` repassa erros internos da API ao frontend
- **Correção:** Retornar mensagens genéricas, logar detalhes no servidor

### 2.17 Falha Parcial em Transações (collect-reward)
- **Arquivo:** `supabase/functions/collect-reward/index.ts` (linhas 141-149)
- **Problema:** Points creditados mas missão não marcada como claimed — retorna sucesso
- **Correção:** Usar transação DB ou compensação em caso de falha

### 2.18 localStorage para Tokens de Auth
- **Arquivo:** `src/integrations/supabase/client.ts` (linha 13)
- **Problema:** Tokens de auth em localStorage (XSS pode roubar)
- **Melhor:** `sessionStorage` ou HTTP-only cookies

---

## 3. PROBLEMAS MÉDIOS (MEDIUM)

### Frontend
| # | Problema | Arquivo |
|---|---------|---------|
| 3.1 | Race condition no ProtectedRoute | `src/components/ProtectedRoute.tsx` |
| 3.2 | Zero uso de `React.memo` em 480 componentes | Todo o projeto |
| 3.3 | 60+ Card Effects duplicados (boilerplate) | `src/components/lessons/card-effects/` |
| 3.4 | 3 estratégias de proteção de rotas diferentes | `src/App.tsx` |
| 3.5 | `useV8Audio` cria DOM elements diretamente | `src/hooks/useV8Audio.ts` |
| 3.6 | Dependency arrays incorretos em hooks | Múltiplos hooks |
| 3.7 | Erros de localStorage silenciosos | `src/contexts/Background3DContext.tsx` |
| 3.8 | Apenas 2 Contexts para app de 480 componentes | Todo o projeto |
| 3.9 | Imports não utilizados | `Dashboard.tsx` e outros |
| 3.10 | Sem loading states/skeletons consistentes | Múltiplas páginas |
| 3.11 | Sem analytics/monitoring | Todo o projeto |
| 3.12 | Tipos V8 incompletos (quiz types não discriminados) | `src/types/v8Lesson.ts` |
| 3.13 | Legacy type re-exports | `src/types/v7.types.ts` |
| 3.14 | Apenas 1 arquivo de utils | `src/utils/` |

### Backend
| # | Problema | Arquivo |
|---|---------|---------|
| 3.15 | Adapter V7 sem validação strict de tipos | `src/services/v7vvPayloadAdapter.ts` |
| 3.16 | Voice IDs hardcoded | `supabase/functions/elevenlabs-tts-contextual/index.ts` |
| 3.17 | Sem audit logging persistente | Todas as Edge Functions |
| 3.18 | Sem retry logic ou timeout em fetch | `supabase/functions/validate-exercise/index.ts` |
| 3.19 | Pipeline executor misleading (apenas atualiza status) | `supabase/functions/pipeline-executor/index.ts` |

### Database
| # | Problema | Localização |
|---|---------|-------------|
| 3.20 | RLS ausente em tabelas de auditoria | `lesson_migrations_audit`, `diagnostic_logs`, `lesson_reports` |
| 3.21 | Sem CHECK constraint em scores | `user_progress.score`, `v7_user_progress.score` |
| 3.22 | JSONB fields sem schema validation | `lessons.content`, `v7_lessons.data` |
| 3.23 | Indexes faltando | `lessons.is_active`, `user_progress.status`, etc. |
| 3.24 | ON DELETE CASCADE sem soft delete | Múltiplas tabelas |
| 3.25 | UPDATE sem WHERE em migration | `20260307191933` — reseta todos os usuários |
| 3.26 | SECURITY DEFINER functions sem search_path | Algumas funções antigas |
| 3.27 | Admin role check frágil | `supabase/functions/admin-reset-password/index.ts` |

---

## 4. PROBLEMAS BAIXOS (LOW)

| # | Problema | Localização |
|---|---------|-------------|
| 4.1 | Timestamps inconsistentes (TIMESTAMP vs TIMESTAMPTZ) | Migrations |
| 4.2 | Scripts com lesson IDs hardcoded | `scripts/debug-lessons.ts` |
| 4.3 | ESLint configuração mínima | `eslint.config.js` |
| 4.4 | Sem `.env.example` documentação | Raiz do projeto |
| 4.5 | API key logging em cenário de erro | Edge functions ElevenLabs |
| 4.6 | Reload agressivo em chunk failure | `src/App.tsx` |

---

## 5. ANÁLISE DO BANCO DE DADOS

### Schema Overview
```
CORE:
├── users (perfil, coins, plan, dashboard_access)
├── trails (trilhas de aprendizado)
├── lessons (aulas com conteúdo JSONB)
├── exercises (quizzes, opções, respostas)
├── user_progress (progresso por aula)
├── user_achievements (conquistas)
├── saved_templates (prompts salvos)
└── claude_cache (cache de LLM)

V7 CINEMATIC:
├── v7_lessons (aulas cinematográficas JSONB)
├── v7_analytics (métricas de sessão)
├── v7_user_progress (progresso V7: acts, xp)
└── courses (unidade organizacional)

IMAGE LAB:
├── image_jobs ⚠️ SEM RLS
├── image_attempts ⚠️ SEM RLS
├── image_assets ⚠️ SEM RLS
├── image_presets ⚠️ SEM RLS
└── image_lab_circuit_state ⚠️ SEM RLS

SUPORTE:
├── pipeline_executions (⚠️ acessível a todos)
├── community_posts
├── user_playground_sessions
├── diagnostic_logs ⚠️ SEM RLS
├── lesson_ratings ⚠️ SEM RLS
└── lesson_reports ⚠️ SEM RLS
```

### RLS Status
- **COM RLS:** 17 tabelas (users, trails, lessons, exercises, etc.)
- **SEM RLS:** 8+ tabelas (todas image_*, audit, diagnostic, ratings, reports)
- **Policy inconsistente:** 3 migrations separadas para corrigir admin access

### Indexes Faltando
1. `lessons.is_active` — usado em queries frequentes
2. `user_progress.status` — queries de progresso
3. `v7_user_progress.(completed, user_id)` — leaderboards
4. `pipeline_executions.created_by` — histórico do usuário
5. `lesson_reports.lesson_id` — tracking de issues
6. `diagnostic_logs.event_type` — análise de performance

---

## 6. ANÁLISE DE SEGURANÇA (OWASP TOP 10)

| OWASP | Status | Detalhes |
|-------|--------|----------|
| A01:2021 Broken Access Control | CRITICAL | RLS ausente em 8+ tabelas, JWT disabled em todas as functions |
| A02:2021 Cryptographic Failures | HIGH | Credenciais em .env sem .gitignore, dados sensíveis plaintext |
| A03:2021 Injection | CRITICAL | XSS via dangerouslySetInnerHTML, new Function() |
| A04:2021 Insecure Design | HIGH | Race conditions, service role key exposta |
| A05:2021 Security Misconfiguration | HIGH | CORS *, CSP ausente, TypeScript strict off |
| A06:2021 Vulnerable Components | HIGH | Dependências com CVEs conhecidos |
| A07:2021 Auth Failures | HIGH | Senha mínima 6 chars, sem MFA admin |
| A08:2021 Software Integrity | MEDIUM | Sem verificação de integridade em deps |
| A09:2021 Logging Failures | HIGH | Sem audit logging persistente, 1.678 console.logs |
| A10:2021 SSRF | LOW | Não detectado |

---

## 7. PLANO DE AÇÃO PRIORITIZADO

### IMEDIATO (24-48 horas)
1. Adicionar `.env` ao `.gitignore` e rotacionar credenciais Supabase
2. Habilitar RLS nas tabelas `image_*`, `diagnostic_logs`, `lesson_ratings`, `lesson_reports`
3. Restringir CORS de `*` para domínio(s) específico(s) em todas as Edge Functions
4. Adicionar CSP headers no `index.html`

### URGENTE (1-2 semanas)
5. Instalar DOMPurify e sanitizar todos os `dangerouslySetInnerHTML`
6. Substituir `new Function()` por Web Worker/iframe sandbox
7. Habilitar JWT verification no `supabase/config.toml`
8. Corrigir race condition em coins/points com transação atômica
9. Fortalecer validação de senha (12+ chars com complexidade)
10. Adicionar Error Boundary no App
11. Corrigir `admin-reset-password` (CORS, audit log, MFA)
12. Restringir RLS de `pipeline_executions`

### CURTO PRAZO (1 mês)
13. Remover todos os 1.678 `console.log` de produção
14. Implementar Sentry/Datadog para error tracking
15. Habilitar TypeScript strict mode progressivamente
16. Corrigir as 715 ocorrências de `any`
17. Executar `npm audit fix` para dependências vulneráveis
18. Implementar audit logging persistente no banco
19. Adicionar missing indexes no banco
20. Corrigir useOnboarding (debounce)
21. Corrigir useLesson (navigate ao invés de window.location)

### MÉDIO PRAZO (1-3 meses)
22. Dividir mega-componentes (Dashboard 1.410 linhas, AdminV5CardConfig 2.029 linhas)
23. Criar V7CinematicContext para eliminar prop drilling
24. Refatorar 60+ Card Effects em factory pattern
25. Adicionar React.memo em componentes caros
26. Criar utility library centralizada
27. Implementar soft delete ao invés de CASCADE
28. Adicionar JSONB schema validation
29. Consolidar route protection em componente único
30. Adicionar loading states/skeletons consistentes

### LONGO PRAZO (contínuo)
31. Reduzir de 5 versões de aula para 2-3 consolidadas
32. Implementar state management (Zustand/Jotai)
33. Criar design system documentado
34. Adicionar testes automatizados de segurança no CI/CD
35. Auditoria RLS trimestral automatizada

---

## 8. RESUMO FINAL

### O Que Está Bom
- Arquitetura de aulas sofisticada (V7 cinematic, V8 premium)
- Sistema de gamificação completo
- Admin panel robusto com ferramentas de debug
- RLS habilitado na maioria das tabelas core
- Sem SQL injection (usa Supabase client parameterizado)
- Sem credenciais hardcoded no código-fonte
- Edge functions bem estruturadas com CORS handling

### O Que Precisa de Atenção Imediata
- **Segurança:** `.env` exposto, XSS, ACE via `new Function()`, CORS wildcard
- **Banco:** 8+ tabelas sem RLS, JWT disabled em todas as functions
- **Código:** 1.678 console.logs, 715 `any`, strict mode off
- **Arquitetura:** Componentes gigantes, sem Error Boundary, prop drilling

### Risco Geral: CRITICAL
A aplicação é funcional e rica em features, mas tem vulnerabilidades de segurança que requerem correção imediata antes de qualquer scaling adicional. Os problemas de código e arquitetura, embora não bloqueantes, aumentam significativamente o risco de bugs em produção e a dificuldade de manutenção.

---

*Auditoria realizada em 14/03/2026 por análise automatizada completa do repositório.*
