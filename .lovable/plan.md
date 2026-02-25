
Objetivo imediato: eliminar o problema recorrente de “dashboard antigo” com rastreabilidade técnica real (sem adivinhação), e criar um fluxo que impeça regressão em runtime.

Diagnóstico com dados reais do código/runtime atual (coletados agora):
1) Só existe uma rota de dashboard no app:
- `src/App.tsx` linhas 148-152:
```tsx
<Route path="/dashboard" element={
  <SuspenseWithFallback fallback={<DashboardSkeleton />}>
    <Dashboard />
  </SuspenseWithFallback>
} />
```

2) O dashboard atual no código NÃO é o da imagem “Olá, Fernando...”:
- `src/pages/Dashboard.tsx` linhas 372-386:
```tsx
<motion.h2 ...>
  Pronto para aprender?
</motion.h2>
<motion.p ...>
  Continue sua jornada de aprendizado. Você está a um passo dos seus objetivos.
</motion.p>
```
- Busca por textos do layout antigo:
  - `"Olá,"` → sem resultado no dashboard
  - `"Comece sua jornada de aprendizado em Inteligência Artificial"` → sem resultado no código do dashboard
  - Resultado objetivo: layout antigo está **NÃO LOCALIZADO NO CÓDIGO**.

3) Runtime observado no navegador de inspeção redireciona `/dashboard` para `/auth`:
- URL lida: `.../auth`
- Screenshot real capturado: tela de login “IA Academy”.
- Lógica que explica isso:
  - `src/pages/Dashboard.tsx` linhas 106-110:
```tsx
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  navigate('/auth');
  return;
}
```

4) Anti-cache já existe, mas sem fingerprint de release forte:
- `src/main.tsx`:
```tsx
const APP_VERSION = '2025-02-20-v3';
console.log('[AIliv] Dashboard versão:', APP_VERSION);
```
- Mesmo com limpeza de SW/caches, hoje não existe trilha operacional clara para provar ao usuário “qual build exata” ele está vendo.

5) Log real coletado (timestamp real):
- `[2026-02-25T20:39:29Z] "[AIliv] Dashboard versão:" "2025-02-20-v3"`
- `[2026-02-25T20:39:31Z] "[Dashboard] Recalculando trailsProgressWithStatus. isAdmin:" false "adminLoading:" true`

Hipótese técnica suportada pelos dados:
- O problema recorrente percebido como “dashboard antigo” está ligado a combinação de:
  1) sessão/autenticação mudando o fluxo para `/auth` sem contexto claro;
  2) ausência de fingerprint visível de build/layout para diferenciar “cache antigo” vs “runtime novo”;
  3) possível confusão entre ambientes (preview/publicado), hoje sem indicador explícito na UI.
- Causa exata do screenshot do dashboard antigo: **NÃO LOCALIZADO NO CÓDIGO** (neste snapshot de código atual).

Plano de implementação (sem executar agora; pronto para aprovação):
Fase 1 — Observabilidade de versão (bloqueia discussão subjetiva “antigo/novo”)
1. Adicionar `BUILD_FINGERPRINT` global (ex.: data+hash curto) via Vite `define` e expor em:
   - Console no boot;
   - Badge discreto no rodapé do Dashboard/Auth (apenas admin ou modo debug).
2. Incluir também `DASHBOARD_LAYOUT_ID` fixo no componente Dashboard (ex.: `dashboard_v2026_02_25`), visível no DOM (`data-layout-id`) e em log.
3. Criar utilitário único `logRuntimeSignature()` para imprimir:
   - build fingerprint
   - route atual
   - layout id
   - timestamp ISO

Fase 2 — Fluxo de sessão explícito (reduz “parece bug de dashboard”)
4. Trocar redirecionamento silencioso por redirecionamento com motivo:
   - `/auth?reason=session_missing&redirect=/dashboard`
5. No Auth, mostrar aviso claro quando chegar com `reason=session_missing`:
   - “Sua sessão expirou; faça login para voltar ao dashboard.”
6. Após login bem-sucedido, respeitar `redirect` param para voltar ao destino original.

Fase 3 — Guardrails anti-regressão visual
7. Adicionar smoke test E2E para `/dashboard` autenticado verificando:
   - presença de texto do layout novo (“Pronto para aprender?”)
   - presença de `data-layout-id=dashboard_v2026_02_25`
   - ausência de string antiga (se definida como assinatura legada)
8. Adicionar smoke test para sessão expirada:
   - acessar `/dashboard` sem sessão
   - confirmar redirect para `/auth?reason=session_missing...`

Fase 4 — Telemetria backend para auditoria operacional
9. Registrar evento técnico “runtime_signature_seen” no backend com:
   - build fingerprint
   - layout id
   - route
   - user_id (quando autenticado)
   - timestamp
10. Criar consulta operacional para confirmar qual build/layout está sendo realmente usado pelos usuários afetados.

Critério de aceite da correção (objetivo):
1. Em qualquer incidente, conseguimos responder em < 1 min:
   - “qual build”
   - “qual layout”
   - “qual ambiente”
   com dados auditáveis.
2. Usuário sem sessão não vê “comportamento ambíguo”; vê motivo claro de redirecionamento.
3. Testes E2E falham automaticamente se layout regressar para versão antiga.
4. Logs + telemetria permitem comprovação técnica (sem depender de percepção visual).

Riscos e mitigação:
- Risco: poluição visual com badge de versão.
  - Mitigação: mostrar apenas para admin/debug.
- Risco: quebra de navegação no auth redirect.
  - Mitigação: fallback para `/dashboard` quando `redirect` inválido.
- Risco: logs excessivos.
  - Mitigação: log detalhado apenas em dev/admin, resumido em produção.

Entrega sugerida em ordem:
1) Fase 1 + 2 (impacto imediato no problema relatado).
2) Fase 3 (garantia de não regressão).
3) Fase 4 (governança operacional contínua).

