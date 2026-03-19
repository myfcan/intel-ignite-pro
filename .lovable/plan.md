

# Auditoria Forense: Stage 3 (Imagens) — Auto-loop + Correções

## 1. CONFIRMADO: Frontend envia `batch_size: 15` — edge function recebe e usa

**`Stage3Images.tsx` linha 196:**
```typescript
const { data, error } = await supabase.functions.invoke('v10-generate-images', {
  body: { pipeline_id: pipeline.id, batch_size: 15, batch_index: nextBatchIndex }
});
```

**`v10-generate-images/index.ts` linha 142:**
```typescript
const {
  pipeline_id,
  batch_size = 2,
  batch_index = 0,
  step_ids,
} = await req.json();
```

O default do edge function é 2, mas o frontend sobrescreve para 15. Com 16 steps e múltiplos elementos `image` por step (~22 imagens totais), 22 × ~10s = 220s → timeout confirmado nos logs (shutdown após ~200s).

## 2. CONFIRMADO: Sem auto-loop — clique único = 1 batch

**`Stage3Images.tsx` linhas 184-219:** A função `handleGenerate` faz UMA chamada e retorna. Se `hasMoreBatches === true`, mostra um toast pedindo novo clique:
```typescript
if (hasMore) {
  setNextBatchIndex(prev => prev + 1);
  toast.success(`${successCount} imagens geradas! Próximo lote (batch ${nextBatchIndex + 2}).`);
}
```

Nenhum `while` loop. CONFIRMADO.

## 3. CONFIRMADO: Injeção automática de imagens em steps sem `type: "image"`

**`v10-generate-images/index.ts` linhas 280-291:**
```typescript
if (!hasExistingImage && frames.length > 0) {
  if (!frames[0].elements) frames[0].elements = [];
  const existingEmpty = frames[0].elements.find((el: any) => el.type === "image" && (!el.src || el.src === ""));
  if (!existingEmpty) {
    frames[0].elements.unshift({
      type: "image",
      src: "",
      alt: `Ilustração: ${step.title || "passo da aula"}`,
    });
  }
}
```

Isso INJETA um elemento `image` vazio em TODOS os 16 steps, mesmo os que originalmente não tinham nenhum. Resultado: 16 steps processados quando possivelmente apenas ~8-10 realmente precisam de imagem.

## 4. CONFIRMADO: `handleAutoCalc` usa `stepsCount` (total de steps), não contagem real de elementos `image`

**`Stage3Images.tsx` linhas 175-182:**
```typescript
const handleAutoCalc = () => {
  if (stepsCount > 0) {
    setImagesNeeded(stepsCount);
    toast.info(`Necessárias atualizado para ${stepsCount} (1 por passo). Clique em Salvar.`);
  }
};
```

`stepsCount` vem de uma query `count: 'exact'` (linha 52) = total de steps (16). Não conta elementos `type: "image"` reais. O botão "Calcular (16)" define `imagesNeeded = 16` quando o número real de elementos `image` nos frames pode ser 22 (steps com múltiplos frames) ou 0 (antes da primeira geração com injeção).

## 5. GAP NÃO COBERTO NO PLANO ANTERIOR: Log stage errado

**`v10-generate-images/index.ts` linha 417:**
```typescript
await supabase.from("v10_bpa_pipeline_log").insert({
  pipeline_id,
  stage: 3,
  action: "generate-images:completed",
```

A UI mostra "Etapa 4 — Imagens" (`Stage3Images.tsx` linha 341). O log grava `stage: 3`. O Stage de Mockups (anterior) usa `stage: 4`. Inversão de numeração entre logs e UI — dificulta auditoria futura.

Porém, verificando o Stage4Mockups, o log do mockups usa `stage: 3` também. Isso sugere que a numeração de stages no log segue uma convenção interna diferente da UI. **Manter como está para evitar quebrar queries existentes no `v10_bpa_pipeline_log`.**

## 6. CONFIRMADO: Filtro `stepsToProcess` inclui steps SEM elementos image

**`v10-generate-images/index.ts` linhas 219-240:**
```typescript
stepsToProcess = steps.filter((step: any) => {
  // ...
  return !hasImageElement || hasEmptyImage;
});
```

`!hasImageElement` retorna `true` para steps sem nenhum elemento `type: "image"`. Esses steps entram no batch e recebem injeção (Gap 3 acima). Resultado: todos os 16 steps são processados na primeira execução.

---

## Plano Revisado Final

### Arquivo 1: `Stage3Images.tsx` — Auto-loop + Calcular corrigido

**Mudança A — Auto-loop (linhas 184-219):**
Substituir o `handleGenerate` por um `while` loop:
- `batch_size: 3` (3 steps por batch; cada step pode ter 1-3 imagens × ~10s = ~30s máx)
- Após cada batch com `hasMoreBatches === true`, chamar automaticamente o próximo
- Adicionar state `imageProgress: { current: number; total: number } | null`
- Atualizar progresso a cada batch: `current += data.success`
- Botão mostra "Gerando imagens... 12/22" com barra de progresso inline

**Mudança B — Calcular com contagem real (linhas 175-182):**
Substituir `stepsCount` por contagem real de elementos `type: "image"` dos frames existentes. Usar `stepImages.length` (já carregado por `fetchImagePreviews`):
```typescript
const handleAutoCalc = () => {
  const realCount = stepImages.length;
  if (realCount > 0) {
    setImagesNeeded(realCount);
  } else if (stepsCount > 0) {
    setImagesNeeded(stepsCount); // fallback se ainda não tem frames
  }
};
```

### Arquivo 2: `v10-generate-images/index.ts` — Remover injeção

**Mudança C — Remover injeção automática (linhas 280-291):**
Deletar o bloco inteiro. Se um step não tem elemento `type: "image"`, ele simplesmente não precisa de imagem gerada.

**Mudança D — Ajustar filtro (linhas 219-240):**
Trocar `return !hasImageElement || hasEmptyImage` por `return hasImageElement && hasEmptyImage`. Assim, apenas steps que JÁ possuem elementos `image` com `src` vazio são processados.

**Mudança E — Remover variável morta `newMockupsTotal`:**
NÃO LOCALIZADO NO CÓDIGO da edge function `v10-generate-images`. A variável `newMockupsTotal` mencionada no plano anterior pertence ao `v10-generate-mockups`, não a esta function. NENHUMA ação necessária aqui.

### Sem Migration

Nenhuma alteração de schema. Alterações puramente de lógica client-side (auto-loop, cálculo) e server-side (remoção de injeção, filtro).

### Riscos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Steps sem elementos `image` ficam sem imagem após remoção da injeção | Esperado | É o comportamento correto — v10-generate-steps deve criar os elementos `image` nos frames na geração inicial |
| `stepImages.length === 0` antes da primeira geração | Baixo | Fallback para `stepsCount` no cálculo |
| Batch com step com 5+ imagens estourando timeout | Médio | `batch_size: 3` steps × ~3 imgs × 10s = 90s — apertado. Se necessário, reduzir para 2 |
| Rate limit 429 | Médio | Retry com backoff de 5s já existe (linha 84) |

