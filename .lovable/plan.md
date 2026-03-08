
Diagnóstico forense (confirmado no código e dados):
- O contador está quebrado porque hoje depende de `sessionStorage` (`ailiv_session_counted`) em `Dashboard.tsx`. Isso bloqueia incrementos em ciclos de logout/login no mesmo contexto e não representa “login real”.
- O tour guiado foi forçado a resetar em `DashboardTour.tsx` (`localStorage.removeItem(STORAGE_KEY)`), o que reabre o tour quando não deveria.
- Evidência real:
  - `public.users.dashboard_access_count` do seu usuário está `0`.
  - Logs de autenticação mostram múltiplos logins (>= 7), portanto há divergência entre evento real e contador persistido.

Plano de correção (regra exata que você definiu):
1) Botão ouro:
- Mostrar apenas se `dashboard_access_count < 5`.
- Contador deve subir somente em login real (não em navegação, refresh, voltar da trilha).

2) Tour guiado:
- Exibir uma única vez no primeiro acesso.
- Nunca resetar automaticamente por localStorage/cache.

Implementação proposta:
1. Migração de banco (robustez do contador e tour)
- Adicionar em `public.users`:
  - `last_login_counted_at timestamptz null`
  - `dashboard_tour_seen_at timestamptz null`
- Criar função SQL (backend) para registrar login de forma atômica:
  - Recebe `last_sign_in_at` do usuário autenticado
  - Incrementa `dashboard_access_count` só se `last_sign_in_at > last_login_counted_at`
  - Limita em 5
  - Retorna contador atualizado + se era primeiro acesso.
- Criar função SQL para marcar `dashboard_tour_seen_at` (idempotente).

2. `src/pages/Dashboard.tsx`
- Remover totalmente a lógica `sessionStorage` de contagem.
- No `checkAuth`, chamar função de “registrar login” e usar retorno para:
  - `setDashboardAccessCount(...)`
  - definir `showTourNow` apenas no primeiro acesso real.
- `DashboardTour` passa a depender de `showTourNow` + `dashboard_tour_seen_at` (backend), não de reset local.

3. `src/components/onboarding/DashboardTour.tsx`
- Remover `localStorage.removeItem(STORAGE_KEY)` (causa raiz do replay indevido).
- Ao abrir pela primeira vez, marcar tour como visto via callback (persistência backend).
- Manter localStorage apenas como fallback visual opcional, sem poder reativar tour sozinho.

4. Ajuste de dados para seu usuário (correção imediata)
- Aplicar update pontual no seu usuário:
  - `dashboard_access_count = 5`
  - `dashboard_tour_seen_at = now()`
  - `last_login_counted_at = now()`
- Isso elimina imediatamente:
  - botão ouro visível indevido
  - tour reaparecendo indevidamente.

Validação (E2E obrigatória):
- Cenário A (usuário novo): login #1 mostra botão ouro + tour; refresh/navegação interna não incrementam.
- Cenário B: após login #5, botão ouro some exatamente no #5.
- Cenário C: após tour visto, logout/login/cache clear não reexibe tour.
- Cenário D: usuário antigo (como o seu) com `count=5` nunca vê botão ouro nem tour.
