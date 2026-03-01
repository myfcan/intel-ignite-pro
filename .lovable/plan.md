
Objetivo: eliminar de forma sistêmica o problema de “dashboard antigo no preview”, com rastreabilidade visual e técnica para provar em runtime qual build/layout está ativo.

Contexto forense (dados reais já coletados)
1) Não existe “segunda versão” de dashboard no código atual
- Busca em `src/pages`:
  - somente `src/pages/Dashboard.tsx` exporta `Dashboard`.
- Trecho real (`src/pages/Dashboard.tsx`):
```tsx
<div className="min-h-screen relative" data-layout-id={DASHBOARD_LAYOUT_ID} ...>
```
- `DASHBOARD_LAYOUT_ID` real (`src/lib/runtimeSignature.ts`):
```ts
export const DASHBOARD_LAYOUT_ID = 'dashboard_v2026_02_25';
```

2) O dashboard atual no código não bate com o screenshot que você enviou
- Trechos reais do dashboard atual:
```tsx
<h2 ...>Pronto para aprender?</h2>
...
<div className="hidden sm:grid sm:grid-cols-4 ...">  // 4 stat cards
```
- No screenshot enviado aparecem textos e composição de uma versão anterior (hero com “Bem-vindo de volta / Olá...” + 3 cards), o que indica problema de entrega/cache de assets no cliente, não ausência de alteração no repositório.

3) Evidência de sessão real no preview
- Network real do iframe do usuário:
  - Origin: `https://5d6a7bc3-91d4-4047-a4f4-c9b771bd43ee.lovableproject.com`
  - Usuário autenticado carregando aula V8 (`/v8/92da...`) no timestamp `2026-03-01T13:10:17Z`.
- Isso confirma que o usuário estava no preview logado, mas não prova que o dashboard aberto naquele momento era o bundle mais novo.

4) Fragilidade real de invalidação de cache no boot
- Trecho real (`src/main.tsx`):
```ts
const APP_VERSION = '2026-02-27-v5';
```
- Esse valor é manual/fixo. Se não for incrementado sempre, existe risco de não forçar “hard refresh” quando deveria.

Diagnóstico técnico
- Causa principal provável: entrega de bundle antigo por cache no cliente/worker antigo + invalidação incompleta (chave fixa de versão).
- Causa secundária: falta de “prova visível obrigatória” de build/layout no topo do dashboard para validação imediata.
- NÃO LOCALIZADO NO CÓDIGO:
  - qualquer feature flag ativa de “dashboard antigo vs novo”;
  - qualquer rota alternativa de dashboard sendo usada no App Router.

Plano de correção (implementação)
Fase 1 — Invalidação determinística de versão (prioridade máxima)
Arquivos:
- `src/main.tsx`
- `src/lib/runtimeSignature.ts`

Ações:
1. Substituir a dependência em `APP_VERSION` fixo por `BUILD_FINGERPRINT` (dinâmico por build).
2. Persistir fingerprint anterior em `localStorage`.
3. Se fingerprint mudar:
   - limpar Service Workers;
   - limpar Cache API;
   - fazer reload único controlado (anti-loop).
4. Manter logs de assinatura no boot com timestamp.

Resultado esperado:
- Qualquer build novo invalida cliente antigo automaticamente, sem depender de atualizar string manual.

Fase 2 — Prova visual obrigatória no dashboard
Arquivos:
- `src/components/BuildBadge.tsx`
- `src/pages/Dashboard.tsx` (injeção/posição)

Ações:
1. Tornar assinatura de runtime sempre visível no dashboard para admin (e opcional em `?debug=true` para qualquer usuário).
2. Exibir explicitamente:
   - build fingerprint
   - `DASHBOARD_LAYOUT_ID`
   - ambiente (preview/published/local)
3. Posicionar indicador em área sempre visível (não apenas rodapé).

Resultado esperado:
- Em 2 segundos dá para comprovar em tela se está no layout/build correto.

Fase 3 — Guarda anti-stale no carregamento do dashboard
Arquivo:
- `src/pages/Dashboard.tsx`

Ações:
1. No mount do dashboard, validar assinatura esperada.
2. Se assinatura ausente/inconsistente, disparar rotina controlada de “cache purge + reload único” e logar motivo.

Resultado esperado:
- Mesmo em cenários de cache agressivo, o dashboard converge para a versão atual.

Fase 4 — Protocolo de validação com evidência (entrega forense)
Validação após implementação:
1. Abrir `/dashboard?debug=true` no preview.
2. Capturar screenshot com assinatura visível (build + layout).
3. Coletar logs:
   - `[AIliv:RuntimeSignature]` no boot
   - `[AIliv:RuntimeSignature]` no dashboard com `layoutId: dashboard_v2026_02_25`
   - timestamps reais.
4. Conferir visual:
   - ausência do hero antigo (“Bem-vindo de volta / Olá...”)
   - presença do layout atual (`Pronto para aprender?` + estrutura nova).
5. Recarregar hard 2x para confirmar persistência da versão correta.

Critérios de aceite
- Não aparecer novamente dashboard antigo no preview após refresh/login.
- Assinatura de runtime visível e consistente com o código atual.
- Logs com timestamp comprovando build/layout em execução.
- Evidência entregue com screenshot + logs brutos.

Riscos e mitigação
- Risco: loop de reload em clientes com cache corrompido.
  - Mitigação: chave de reload único por fingerprint em `sessionStorage`.
- Risco: indicador visual incomodar usuários finais.
  - Mitigação: manter visível apenas para admin e modo debug.

Sequenciamento recomendado
1) Fase 1 (invalidação)  
2) Fase 2 (prova visual)  
3) Fase 3 (guarda anti-stale)  
4) Fase 4 (validação forense com timestamps reais)
