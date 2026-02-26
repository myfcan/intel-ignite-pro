
Objetivo: eliminar a recorrência do erro C12.1 (“image-sequence sem trigger com payload.frameIndex”) de forma estrutural, sem relaxar o contrato de determinismo.

Contexto confirmado na investigação:
- O run que falhou (`08ee2fdf-b287-4393-8932-a5baf8d1b14e`) já tinha `anchorActions` corretos no input da `scene-08-sessao-8-epp`:
  - `type: "trigger"` com `payload.frameIndex: 1/2`
  - keywords `MARCO1` e `MARCO2`
- O erro não é ausência de trigger no JSON de entrada; é ausência de trigger resolvido no output da fase.
- Na edge function `v7-vv`, os frame triggers só entram se `selectAnchorOccurrence(...)` encontrar o keyword no `wordTimestamps`.
- Se nenhum trigger é resolvido, a função lança erro bloqueante C12.1 (por contrato, fallback timer está proibido).
- Hoje existe validação de `anchorText` para microVisual/pauseAt, mas não existe validação equivalente para `scene.anchorActions` de image-sequence antes da montagem final.

Hipótese técnica mais provável (consistente com o caso):
- Keywords sentinela alfanuméricos (`MARCO1`, `MARCO2`) podem ser tokenizados pelo TTS/timestamps como partes separadas (ex.: “MARCO” + “1”), ou normalizados de forma diferente, então o matcher atual não encontra correspondência exata suficiente.
- Resultado: os triggers existem no input, mas “somem” na resolução temporal.

Plano de implementação (sem quebrar o contrato C12.1):

1) Fortalecer validação pré-áudio para image-sequence com triggers (fail-fast com diagnóstico útil)
- Arquivo: `supabase/functions/v7-vv/index.ts` (bloco de validação principal).
- Adicionar validação dedicada para `scene.anchorActions` quando `visual.type === "image-sequence"` e `frames.length >= 2`:
  - exigir ao menos `frames.length - 1` triggers com `payload.frameIndex` válido;
  - validar intervalo de `frameIndex` (1..frames.length-1);
  - validar keyword não vazio;
  - validar unicidade de `frameIndex`;
  - validar presença literal do keyword na narração normalizada (regra preflight, sem depender de timestamp ainda).
- Em caso de falha, retornar erro de contrato claro (antes de gerar áudio), com detalhes por cena.

2) Melhorar resolução de keyword para frame-trigger (robustez sem inventar fallback)
- Arquivo: `supabase/functions/v7-vv/index.ts` (`selectAnchorOccurrence` e/ou etapa de processamento de `scene.anchorActions`).
- Adicionar matching específico para tokens alfanuméricos:
  - suportar comparação por “janela concatenada” de palavras adjacentes normalizadas (ex.: `["marco","1"] -> "marco1"`), além do matching atual;
  - manter estratégia determinística e sem criar tempo artificial.
- Isso preserva o contrato de “trigger real no áudio”, mas reduz falso negativo para casos como `MARCO1`.

3) Erro operacional mais acionável no ponto de quebra C12.1
- Arquivo: `supabase/functions/v7-vv/index.ts` (trecho que lança `[C12.1] ... sem trigger ...`).
- Enriquecer erro com:
  - `sceneId`,
  - lista de keywords de frame-trigger declarados,
  - lista dos que resolveram vs não resolveram,
  - range temporal da cena,
  - amostra de palavras detectadas no range.
- Mantém status 500 (ou erro estruturado equivalente), mas com diagnóstico imediato para correção rápida.

4) Guardrail no frontend Admin (evitar ida desnecessária ao backend)
- Arquivo: `src/pages/AdminV7Create.tsx`.
- Expandir `validateJson` para incluir checks de `image-sequence + anchorActions`:
  - aviso/erro local se `frames>=2` e faltar trigger por frame;
  - aviso para keywords frágeis (somente sentinela com dígitos, ex.: `MARCO1`);
  - sugerir keywords naturais presentes na frase narrada.
- Resultado: menos tentativas quebradas em produção.

5) Atualizar documentação de referência para padrões resilientes
- Arquivos:
  - `src/pages/V7Documentation.tsx`
  - (opcional) `docs/references/v7-reference-image-sequence.json`
- Adicionar seção “Boas práticas C12.1”:
  - preferir keywords naturais da narração (“primeiro”, “depois”, “premium”) em vez de sentinelas alfanuméricos;
  - manter 1 trigger por troca de frame;
  - garantir keyword único dentro da cena para evitar ambiguidade.

6) Observabilidade mínima para recorrência
- Arquivo: `supabase/functions/v7-vv/index.ts`.
- Logar métricas por run:
  - `frameTriggersDeclared`,
  - `frameTriggersResolved`,
  - `frameTriggersMissing`,
  - `keywordNormalizationStats` por cena image-sequence.
- Facilita detectar regressão “segunda vez no dia” sem inspeção manual extensa.

Sequência de execução recomendada:
1. Ajuste de validação preflight (passo 1).
2. Ajuste de matching robusto (passo 2).
3. Enriquecimento do erro C12.1 (passo 3).
4. Guardrail na tela AdminV7Create (passo 4).
5. Atualização da documentação (passo 5).
6. Logs de observabilidade (passo 6).

Critérios de aceite:
- Um payload igual ao run falho deixa de quebrar se o áudio contiver os gatilhos de forma tokenizada separada (ex.: “MARCO 1”).
- Quando realmente inválido, falha cedo com mensagem específica apontando exatamente qual trigger/keyword está inconsistente.
- `image-sequence` continua sem fallback timer automático (contrato preservado).
- Admin mostra alerta pré-envio para JSON com alto risco de falha C12.1.
