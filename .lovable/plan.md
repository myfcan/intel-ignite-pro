

# Auditoria do Plano — Gaps Identificados e Plano Revisado

## Gaps Encontrados no Plano Anterior

### GAP 1 (CRÍTICO): Frontend fica inerte após remover injeção

**Código real** — `Stage3Images.tsx`, L190-243, `handleGenerate`:
```typescript
while (true) {
  const { data, error } = await supabase.functions.invoke('v10-generate-images', {
    body: { pipeline_id: pipeline.id, batch_size: 3, batch_index: currentBatch }
  });
  // ...
  if (!hasMore) {
    toast.success(`${totalSuccess} imagens geradas! Todos os lotes concluídos.`);
    break;
  }
}
```

Se removermos a injeção automática da edge function (L238-248), **nenhum passo terá `type: "image"`**. O filtro L253-267 retorna 0 steps. A edge function responde `{ total: 0, hasMoreBatches: false, success: 0 }`. O frontend mostra "0 imagens geradas!" e o grid fica vazio.

**O plano anterior diz "0 alterações no frontend" — ERRADO.** O frontend precisa de ajuste ou o Stage 4 fica completamente inerte.

### GAP 2 (MODERADO): Opção C não define critérios de seleção

O plano diz "Stage 4 gera screenshots apenas para passos de intro/celebração" mas NÃO define como identificar esses passos. Não existe flag `is_intro` ou `is_celebration` em `v10_lesson_steps`. O campo `app_name` no último passo é "AILIV" (celebração), mas não há critério formal para "intro".

### GAP 3 (MENOR): `handleAutoCalc` calcula errado

`Stage3Images.tsx`, L177-188:
```typescript
const handleAutoCalc = () => {
  const realCount = stepImages.length;
  if (realCount > 0) {
    setImagesNeeded(realCount);
  } else if (stepsCount > 0) {
    setImagesNeeded(stepsCount); // Fallback: 1 por passo — errado se removemos injeção
  }
};
```
Com 0 image elements, cai no fallback `stepsCount` (ex: 13), mas a edge function não vai gerar 13 imagens porque não há `type: "image"` nos frames.

### GAP 4 (MENOR): Limpeza Calendly indefinida

O plano diz "via SQL ou edge function" mas não especifica. Precisa de ação concreta.

---

## Plano Revisado (Opção C Completa)

### Alteração 1 — Edge Function: remover injeção E adicionar injeção seletiva

**Arquivo**: `supabase/functions/v10-generate-images/index.ts`

Substituir o bloco L218-267 (injeção universal + filtro) por lógica seletiva:
- Injetar `type: "image"` **apenas** no primeiro e último passo (intro e celebração)
- Manter o filtro de `src` vazio para processar apenas os injetados

Critério de seleção (baseado no template):
- **Passo 1** = intro (sempre)
- **Último passo** = celebração (sempre, `app_name` = "AILIV")

```typescript
// Injeção SELETIVA: apenas primeiro e último passo
for (const step of steps) {
  const stepNum = (step as any).step_number;
  const isFirst = stepNum === 1;
  const isLast = stepNum === steps.length;
  
  if (!isFirst && !isLast) continue; // pula passos do meio
  
  const frames = (step as any).frames;
  if (!frames || !Array.isArray(frames) || frames.length === 0) continue;
  
  let hasImageElement = false;
  for (const frame of frames) {
    if (frame.elements?.some((e: any) => e.type === "image")) {
      hasImageElement = true;
      break;
    }
  }
  
  if (!hasImageElement) {
    const firstFrame = frames[0];
    if (!firstFrame.elements) firstFrame.elements = [];
    firstFrame.elements.push({
      type: "image", src: "", 
      alt: (step as any).title || "Ilustração",
      width: 1024, height: 576,
    });
  }
}
```

### Alteração 2 — Edge Function: mudar prompt para screenshot realista

**Arquivo**: `supabase/functions/v10-generate-images/index.ts`, L14-42

Substituir `buildImagePrompt` por prompt que gera screenshots de UI realistas (conforme plano anterior — sem mudança nesta parte).

### Alteração 3 — Frontend: ajustar `handleAutoCalc`

**Arquivo**: `src/components/admin/v10/stages/Stage3Images.tsx`, L177-188

Remover fallback `stepsCount`. Quando não há `type: "image"` nos frames, mostrar mensagem explicativa em vez de número inflado:

```typescript
const handleAutoCalc = () => {
  const realCount = stepImages.length;
  if (realCount > 0) {
    setImagesNeeded(realCount);
    toast.info(`Necessárias: ${realCount} (imagens existentes nos frames).`);
  } else {
    setImagesNeeded(0);
    toast.info('Nenhum elemento de imagem nos frames. Clique "Gerar Imagens" para criar imagens de intro e celebração.');
  }
};
```

### Alteração 4 — Limpeza Calendly via migration

**Ação**: Executar SQL migration para remover `type: "image"` injetados dos frames da aula `d217b930-5277-4afe-8f4a-ca797af20b5e`:

```sql
-- Remove injected image elements from all steps of the Calendly lesson
UPDATE v10_lesson_steps
SET frames = (
  SELECT jsonb_agg(
    jsonb_set(frame, '{elements}',
      (SELECT COALESCE(jsonb_agg(el), '[]'::jsonb)
       FROM jsonb_array_elements(frame->'elements') el
       WHERE el->>'type' != 'image')
    )
  )
  FROM jsonb_array_elements(frames::jsonb) frame
)
WHERE lesson_id = 'd217b930-5277-4afe-8f4a-ca797af20b5e';
```

### Alteração 5 — Re-deploy

Deploy de `v10-generate-images`.

---

## Checklist Preditivo Revisado

| Cenário | Coberto? | Como |
|---------|----------|------|
| Clicar "Gerar Imagens" com 0 image elements | Sim | Injeção seletiva cria 2 (intro+celebração) |
| Passos do meio NÃO recebem imagem | Sim | `if (!isFirst && !isLast) continue` |
| Passos do meio mantêm mockup JSON puro | Sim | Não são tocados pela edge function |
| Grid mostra apenas 2 imagens (intro+celebração) | Sim | `fetchImagePreviews` busca `type: "image"` dos frames |
| `handleAutoCalc` não infla contador | Sim | Removido fallback `stepsCount` |
| Aula Calendly limpa de imagens injetadas | Sim | Migration SQL (Alt. 4) |
| Regenerar imagem individual funciona | Sim | `step_ids` mode não mudou (L202-217) |
| Upload manual funciona | Sim | Não tocado |
| Aulas já publicadas (template) | Sem impacto | 0 image elements, não processadas |
| `images_needed` pipeline counter | Sim | Recalculado pela edge function L386-409 |
| Stage 3 (Mockups/enrich-frames) | Sem impacto | Edge function separada |

## Escopo Revisado

- 1 edge function alterada: `v10-generate-images/index.ts` (prompt + injeção seletiva)
- 1 frontend alterado: `Stage3Images.tsx` (handleAutoCalc)
- 1 migration: limpeza Calendly
- 1 deploy

