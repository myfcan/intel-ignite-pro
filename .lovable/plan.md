

# Plano: Auto-loop de Geração de Mockups + Progresso Visual

## Situação Real (Dados do Banco)

Logs reais de `v10_bpa_pipeline_log`:
```
Batch 0: 3 succeeded, 0 failed out of 3 frames (total needing mockups: 32) — 2026-03-18 23:12:28
Batch 1: 3 succeeded, 0 failed out of 3 frames (total needing mockups: 29) — 2026-03-18 23:14:04
```

Estado atual dos 16 steps (query real):
- Step 1: 2/2 mockups ✓
- Step 2: 1/3 mockups
- Steps 3-16: 0 mockups cada
- **Total: 6 mockups gerados de 32 frames**

O usuário clicou 2 vezes. Precisaria clicar mais **9 vezes** para completar.

## Root Cause (Código Real)

**`Stage4Mockups.tsx` linha 215:**
```typescript
const { data, error } = await supabase.functions.invoke('v10-generate-mockups', {
  body: { pipeline_id: pipeline.id, batch_size: 3, batch_index: nextBatchIndex },
});
```

Cada clique processa **apenas 3 frames**. Não há auto-loop.

## Gaps Identificados

### Gap 1: Bucket Inconsistente (BUG REAL)
- **Edge function** (`v10-generate-mockups/index.ts` linha 288): upload para `lesson-audios`
- **Frontend manual upload** (`Stage4Mockups.tsx` linha 97): upload para `lesson-images`
- **`lesson-images` NÃO EXISTE** nos storage buckets configurados (apenas `lesson-audios`, `avatars`, `tts-cache`, `image-lab`)
- **Impacto:** O upload manual via botão de arquivo vai falhar com "Bucket not found". Apenas a edge function funciona (usa `lesson-audios`).
- **Correção:** Alterar o frontend para usar `lesson-audios` (bucket que existe).

### Gap 2: Contador `mockups_from_refero` inflado
Edge function linha 351:
```typescript
mockups_from_refero: ((pipeline as any).mockups_from_refero || 0) + referoUsed,
```
Isso é **aditivo sobre o valor do pipeline**, mas `referoUsed` conta quantas vezes o Refero foi **consultado** (retornou hint textual), não quantos screenshots reais foram importados. Após 10 batches, o contador estará inflado.

### Gap 3: Variável `newMockupsTotal` calculada mas nunca usada
Linhas 337-339:
```typescript
const newMockupsTotal = framesToProcess.length + (steps as any[]).reduce(...)
```
Variável declarada, calculada, e descartada. Código morto.

### Gap 4: Sem controle de interrupção
Se o usuário fechar a aba durante o auto-loop, não há como retomar do ponto onde parou. O `batch_index` é resetado a 0 no state do componente. Porém o edge function já filtra `!frame.mockup_url`, então frames já processados são pulados automaticamente — **isso mitiga o gap parcialmente**.

## Plano de Implementação

### Arquivo 1: `Stage4Mockups.tsx` — Auto-loop + Progresso

Modificar `handleGenerateMockups` (linhas 207-245):

1. Trocar `batch_size: 3` → `batch_size: 5` (5 frames × ~7s = ~35s, dentro do timeout de 60s)
2. Implementar `while` loop: após cada batch bem-sucedido com `hasMoreBatches === true`, chamar automaticamente o próximo batch
3. Adicionar state `mockupProgress: { current: number; total: number } | null`
4. Atualizar progresso a cada batch completado
5. Mostrar barra de progresso + texto "Gerando mockups... 15/32"
6. Corrigir bucket no upload manual: `lesson-images` → `lesson-audios` (linhas 97-107)

### Arquivo 2: `v10-generate-mockups/index.ts` — Limpeza

1. Remover variável morta `newMockupsTotal` (linhas 337-339)
2. Corrigir `mockups_from_refero`: contar apenas frames que efetivamente usaram `referoHint` não-vazio na geração (já rastreado por `referoUsed`, mas o nome do campo é enganoso — renomear para `mockups_with_refero_hint` seria mais preciso, porém manter compatibilidade com o frontend)

### Sem Migration

Nenhuma alteração de schema necessária. Alterações são puramente de lógica client-side (auto-loop) e limpeza server-side (código morto).

### Riscos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Rate limit 429 do Gemini | Médio | Edge function já tem retry com backoff de 5s (linha 111) |
| Timeout da edge function com batch_size=5 | Baixo | 5×7s = 35s < 60s timeout; delay de 2s entre frames |
| Créditos esgotados (402) | Alto | Edge function já retorna erro claro (linha 118); auto-loop para imediatamente |
| Bucket `lesson-images` inexistente no upload manual | Alto | Corrigido neste plano |

