

# Auditoria PR#239 — Stage3Images.tsx

## Erro de Build: CONFIRMADO

O arquivo `Stage3Images.tsx` referencia `nextBatchIndex` e `setNextBatchIndex` em 4 locais (linhas 128, 142, 143, 145) mas **nunca declara o state**.

**Evidência real — linhas 16-23:**
```typescript
const [imagesNeeded, setImagesNeeded] = useState(pipeline.images_needed);
const [imagesGenerated, setImagesGenerated] = useState(pipeline.images_generated);
const [imagesApproved, setImagesApproved] = useState(pipeline.images_approved);
const [saving, setSaving] = useState(false);
const [generating, setGenerating] = useState(false);
const [stepsCount, setStepsCount] = useState(0);
const [showPreview, setShowPreview] = useState(false);
const [stepImages, setStepImages] = useState<...>([]);
```

Falta: `const [nextBatchIndex, setNextBatchIndex] = useState(0);`

**Usos no código (linhas 128, 142-145):**
```typescript
// Linha 128
body: { pipeline_id: pipeline.id, batch_size: 15, batch_index: nextBatchIndex }

// Linha 142
setNextBatchIndex(prev => prev + 1);
// Linha 143
toast.success(`... (batch ${nextBatchIndex + 2}).`);
// Linha 145
setNextBatchIndex(0);
```

## Plano de Correção

**Arquivo:** `src/components/admin/v10/stages/Stage3Images.tsx`

**Única mudança:** Adicionar na linha 23 (após `showPreview`):
```typescript
const [nextBatchIndex, setNextBatchIndex] = useState(0);
```

Nenhum outro arquivo precisa ser alterado. O PR#239 adicionou o grid de preview de imagens e batching, mas esqueceu de declarar este state.

