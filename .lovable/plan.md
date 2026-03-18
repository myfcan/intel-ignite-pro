

# Plano Consolidado: Correção dos Gaps 1, 2 e 3 do PR#240

## Resumo Executivo
3 gaps sistêmicos a corrigir em 4 arquivos. Gap 6 descartado (já funcional).

---

## Ação 1 — Migration: Nova coluna `image_statuses`

```sql
ALTER TABLE v10_bpa_pipeline 
ADD COLUMN image_statuses jsonb NOT NULL DEFAULT '{}'::jsonb;
```

**Justificativa:** A coluna não existe no DB (confirmado via schema — 36 colunas, nenhuma `image_statuses`). Default `{}` garante compatibilidade com pipelines existentes e com `CreateBpaModal` (que não precisa enviar o campo).

---

## Ação 2 — Tipo TypeScript: `src/types/v10.types.ts`

Após linha 342 (`images_approved: number;`), adicionar:

```typescript
image_statuses: Record<string, string> | null;
```

Nullable para compatibilidade com dados antigos.

---

## Ação 3 — Frontend: `src/components/admin/v10/stages/Stage3Images.tsx`

### 3a. Inicializar estado do DB (linha 37)
**De:**
```typescript
const [imageStatuses, setImageStatuses] = useState<Record<string, ImageStatus>>({});
```
**Para:**
```typescript
const [imageStatuses, setImageStatuses] = useState<Record<string, ImageStatus>>(
  (pipeline.image_statuses as Record<string, ImageStatus>) || {}
);
```

### 3b. handleSave incluir `image_statuses` (linhas 131-135)
**De:**
```typescript
await onUpdate({
  images_needed: imagesNeeded,
  images_generated: imagesGenerated,
  images_approved: imagesApproved,
});
```
**Para:**
```typescript
await onUpdate({
  images_needed: imagesNeeded,
  images_generated: imagesGenerated,
  images_approved: imagesApproved,
  image_statuses: imageStatuses,
});
```

### 3c. handleApproveAll auto-persistir sem race condition (linhas 144-154)
**De:**
```typescript
const handleApproveAll = () => {
  setImageStatuses(prev => {
    const next = { ...prev };
    for (const key of Object.keys(next)) {
      if (next[key] === 'generated') next[key] = 'approved';
    }
    recalcCounters(next);
    return next;
  });
  toast.info('Todas as imagens marcadas como aprovadas. Salve para confirmar.');
};
```
**Para:**
```typescript
const handleApproveAll = async () => {
  const newStatuses = { ...imageStatuses };
  for (const key of Object.keys(newStatuses)) {
    if (newStatuses[key] === 'generated') newStatuses[key] = 'approved';
  }
  const generated = Object.values(newStatuses).filter(s => s === 'generated' || s === 'approved').length;
  const approved = Object.values(newStatuses).filter(s => s === 'approved').length;

  setImageStatuses(newStatuses);
  setImagesGenerated(generated);
  setImagesApproved(approved);

  setSaving(true);
  try {
    await onUpdate({
      images_needed: imagesNeeded,
      images_generated: generated,
      images_approved: approved,
      image_statuses: newStatuses,
    });
    toast.success('Todas as imagens aprovadas e salvas.');
  } catch {
    toast.error('Erro ao salvar aprovações.');
  } finally {
    setSaving(false);
  }
};
```

Computa valores inline e chama `onUpdate()` direto — sem depender de `setState` assíncrono.

---

## Ação 4 — Edge Function: `supabase/functions/v10-generate-images/index.ts`

### Recalcular contadores reais (linhas 377-393)
**De:**
```typescript
const newImagesGenerated = (pipeline.images_generated || 0) + success;
const updatePayload: any = { images_generated: newImagesGenerated };

if (pipeline.images_needed === 0 && total > 0) {
  updatePayload.images_needed = total;
}

const { error: pipelineUpdateError } = await supabase
  .from("v10_bpa_pipeline")
  .update(updatePayload)
  .eq("id", pipeline_id);
```
**Para:**
```typescript
// Recalculate from real DB data instead of incrementing
const { data: allStepsForCount } = await supabase
  .from("v10_lesson_steps")
  .select("frames")
  .eq("lesson_id", lessonId);

let realImageCount = 0;
for (const s of (allStepsForCount || [])) {
  const sFrames = (s as any).frames;
  if (!Array.isArray(sFrames)) continue;
  for (const f of sFrames) {
    for (const el of (f.elements || [])) {
      if (el.type === "image" && el.src && el.src !== "" && !el.src.startsWith("placeholder")) {
        realImageCount++;
      }
    }
  }
}

const updatePayload: any = { images_generated: realImageCount };
if (pipeline.images_needed === 0 && total > 0) {
  updatePayload.images_needed = total;
}

const { error: pipelineUpdateError } = await supabase
  .from("v10_bpa_pipeline")
  .update(updatePayload)
  .eq("id", pipeline_id);
```

Adiciona 1 query leve (~50KB para 15 steps). Elimina inflação de contadores permanentemente.

---

## Resumo de Alterações

| Arquivo | Tipo | Linhas Afetadas |
|---------|------|----------------|
| `v10_bpa_pipeline` (migration) | +1 coluna JSONB | N/A |
| `src/types/v10.types.ts` | +1 campo | Após L342 |
| `src/components/admin/v10/stages/Stage3Images.tsx` | 3 trechos | L37, L131-135, L144-154 |
| `supabase/functions/v10-generate-images/index.ts` | 1 trecho | L377-393 |

## Efeitos Sistêmicos Verificados

- `handlePipelineUpdate` aceita qualquer campo via `as Record<string, unknown>` — sem risco
- `fetchImagePreviews` preserva statuses existentes via `!next[key]` — sem conflito
- `CreateBpaModal` não precisa de mudança — DB default `{}` resolve
- `v10-assembly-check` não é afetado — verifica frames, não statuses

