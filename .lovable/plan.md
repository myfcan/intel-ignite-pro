

# Análise Forense: Plano V8.b — Gaps, Efeitos Sistêmicos e Pontos Cegos

## Resumo da Proposta

Criar contratos V8-B01/B02/B03 com 7 seções (vs 9 atuais), tom conversacional-direto, ângulos pedagógicos novos (Comparação/Debate/Provocação), e exercícios finais reduzidos (1-2 vs 2-4).

---

## GAPS IDENTIFICADOS (com código real)

### GAP 1: Hard Gate de 9 seções no `AdminV8Create.tsx` (BLOQUEANTE)

**Código real (linhas 938-943):**
```typescript
const preFinalSections = result.sections || parsed.sections;
if (preFinalSections.length < 9) {
  addLog('error', `V8-C01 VIOLATION: apenas ${preFinalSections.length} seções (esperado ≥ 9)`);
  throw new Error(`Pipeline abortado: apenas ${preFinalSections.length} seções encontradas (mínimo 9)`);
}
```

**Impacto:** Uma aula V8-B com 7 seções será **abortada** pelo pipeline. Este gate precisa ser condicional: `< 9` para C*, `< 7` para B*.

### GAP 2: Hard Gate de 9 seções no `v8-generate-raw-content` (BLOQUEANTE)

**Código real (linhas 192-202):**
```typescript
if (sections.length !== 9) {
  console.warn(`[v8-generate-raw-content] Got ${sections.length} sections, expected 9. Padding/truncating.`);
  while (sections.length < 9) {
    sections.push({ title: `Seção ${sections.length + 1}`, content: "Conteúdo pendente..." });
  }
  sections.length = 9;
}
```

**Impacto:** Mesmo que a IA gere 7 seções, o pipeline vai **paddar para 9**, destruindo a estrutura compacta. Precisa aceitar 7 quando `structureVariant === 'compact'`.

### GAP 3: Hard Gate de 9 seções no `v8-generate-variations` (BLOQUEANTE)

**Código real (linhas 39-43):**
```typescript
while (result.length < 9) {
  result.push({ title: `Seção ${result.length + 1}`, ...placeholder });
}
```

**Impacto:** Se variações forem usadas com V8-B, também vai paddar para 9.

### GAP 4: Prompt do raw-content é fixo em "EXATAMENTE 9 seções"

**Código real (linhas 38-61):**
```
Sua tarefa é gerar o conteúdo bruto de uma aula com EXATAMENTE 9 seções
...
1. **EXATAMENTE 9 seções** — nem mais, nem menos.
```

E a tool schema (linhas 93-96):
```typescript
sections: { type: "array", minItems: 9, maxItems: 9, ... }
```

**Impacto:** A IA será instruída a gerar 9 seções mesmo para V8-B. Precisa de prompt condicional e schema com `minItems: 7, maxItems: 7` para compact.

### GAP 5: Mapa de exercícios inline assume índices 2-6

**Código real (linhas 650-656):**
```typescript
const V8_C01_MAP: Record<number, string[]> = {
  2: ['multiple-choice', 'flipcard-quiz'],
  3: ['complete-sentence', 'scenario-selection'],
  4: ['true-false'],
  5: ['platform-match', 'scenario-selection'],
  6: ['timed-quiz', 'fill-in-blanks'],
};
```

**Impacto:** V8-B usa índices 2-4 para exercícios. Os novos maps B01/B02/B03 precisam mapear apenas índices 2-4. Isso está no plano, mas o loop de assignment (linhas 717-734) usa `lastIdx` e `coursivTargetIdx` que são calculados dinamicamente:

```typescript
const lastIdx = sections.length - 1;  // 8 para C*, 6 para B*
const coursivTargetIdx = lastIdx >= 4 ? lastIdx - 1 : -1;  // 7 para C*, 5 para B*
```

**Isso funciona automaticamente** — `lastIdx` e `coursivTargetIdx` se ajustam. Mas o loop `for (let i = 2; i < sections.length; i++)` (linha 717) vai tentar gerar para seções 2-6 em V8-B. Seções 5 e 6 serão excluídas por `coursivTargetIdx` e `lastIdx`, mas **precisa garantir que os maps B* NÃO tenham entradas para 5+** (que são Coursiv/Playground).

### GAP 6: Exercícios finais — prompt não distingue B*

**Código real (linhas 1281-1288):**
```typescript
if (manualExercises.length === 0) {
  const exerciseResult = await callAI(
    LOVABLE_API_KEY,
    EXERCISE_SYSTEM_PROMPT,
    `Analise o conteúdo completo desta aula "${lessonTitle}" e gere 2-4 exercícios finais variados:\n\n${contentSummary}`,
    ...
  );
}
```

O prompt pede "2-4 exercícios" e o tool schema (linhas 88-89) tem `minItems: 2, maxItems: 4`. Para V8-B precisa ser `minItems: 1, maxItems: 2`.

### GAP 7: `v8-generate-raw-content` não recebe parâmetro `structureVariant`

**Código real (linha 119):**
```typescript
const { title, objectives, variationStyle } = await req.json();
```

Não existe `structureVariant`. Precisa ser adicionado.

### GAP 8: Tabela de estrutura no prompt raw-content assume 9 seções fixas

**Código real (linhas 43-54):**
```
| Índice | Função | Interação após |
| 0 | Abertura: boas-vindas... | Nenhuma |
| 1 | Explicação conceitual... | Nenhuma |
...
| 8 | Encerramento... | Nenhuma |
```

Para V8-B precisa de tabela alternativa com 7 seções.

---

## EFEITOS SISTÊMICOS

### 1. `useV8Player.ts` — SEM IMPACTO ✅
O player é genérico: itera `sections.length` e constrói timeline dinamicamente. Não há hardcoded para 9 seções. Código real (linha 82):
```typescript
for (let i = 0; i < lessonData.sections.length; i++) {
```

### 2. `V8Lesson.tsx` — SEM IMPACTO ✅
Apenas passa `playerData` para o player. Não valida contagem de seções.

### 3. `validateV8Json` em `AdminV8Create.tsx` — REQUER AJUSTE ⚠️
**Código real (linhas 74-79):**
```typescript
if (!Array.isArray(data.sections) || data.sections.length === 0) {
  result.errors.push("sections[] deve ter pelo menos 1 seção");
```
Valida `>= 1`, não `=== 9`, então **não bloqueia** V8-B. MAS a interações validation (linhas 976-978) pode alertar:
```typescript
if (totalInteractions < 2 && finalData.sections.length >= 5) {
  addLog('error', `V8-C01 VIOLATION: apenas ${totalInteractions} interações para ${finalData.sections.length} seções`);
}
```
Precisa ser condicional por pattern.

### 4. `v8-generate-variations` — REQUER AJUSTE ⚠️
Padda para 9 seções. Precisa condicional por structureVariant.

### 5. Audio pipeline — SEM IMPACTO ✅
O `v8-generate-audio` (se existir) gera áudio por seção, iterando o array. Não hardcoded para 9.

### 6. `src/types/v8Lesson.ts` — REQUER AJUSTE (mínimo)
**Código real (linha 131):**
```typescript
contractPattern?: 'V8-C01' | 'V8-C02' | 'V8-C03';
```
Precisa adicionar `| 'V8-B01' | 'V8-B02' | 'V8-B03'`.

---

## PLANO REVISADO (ROBUSTO)

### Arquivos a modificar

| # | Arquivo | Mudança | Risco |
|---|---|---|---|
| 1 | `src/types/v8Lesson.ts` | +3 valores no enum `contractPattern` | Baixo |
| 2 | `supabase/functions/v8-generate-raw-content/index.ts` | Aceitar `structureVariant`, prompt compacto para 7 seções, validação condicional | Alto |
| 3 | `supabase/functions/v8-generate-lesson-content/index.ts` | +3 maps B*, +3 ângulos pedagógicos, exercícios finais condicionais (1-2 para B*), schema tool condicional | Alto |
| 4 | `src/pages/AdminV8Create.tsx` | Rotação para 6 patterns, hard gate condicional (7 para B*, 9 para C*), interação gate condicional | Médio |
| 5 | `supabase/functions/v8-generate-variations/index.ts` | Padding condicional (7 ou 9) | Baixo |

### Detalhes técnicos por arquivo

**1. `v8-generate-raw-content/index.ts`**
- Adicionar `structureVariant` ao destructuring (linha 119)
- Criar `SYSTEM_PROMPT_COMPACT` com tabela de 7 seções e instruções de tom conversacional-direto
- Tool schema condicional: `minItems/maxItems: 7` quando compact
- Validação condicional: `sections.length !== 7` quando compact (vs `!== 9`)
- **Manter prompt atual intacto** para `standard` — zero risco de regressão

**2. `v8-generate-lesson-content/index.ts`**
- Adicionar maps B01/B02/B03 para índices 2-4 apenas:
```typescript
const V8_B01_MAP: Record<number, string[]> = {
  2: ['scenario-selection', 'flipcard-quiz'],
  3: ['true-false', 'timed-quiz'],
  4: ['platform-match', 'fill-in-blanks'],
};
```
- Expandir `PATTERN_MAPS` e `patternNames`:
```typescript
const patternNames = ['V8-C01', 'V8-B01', 'V8-C02', 'V8-B02', 'V8-C03', 'V8-B03'];
const selectedPattern = requestedPattern || patternNames[Math.abs(orderIndex) % 6];
```
- Adicionar 3 novos ângulos pedagógicos (Comparação, Debate, Provocação)
- Condicional para exercícios finais: quando `selectedPattern.startsWith('V8-B')`, usar prompt e tool com `minItems: 1, maxItems: 2`
- Anti-repetição no loop de assignment (GAP original do plano anterior):
```typescript
let lastType = '';
// dentro do loop existente (linha 732):
let selectedType = pool[Math.floor(Math.random() * pool.length)];
if (selectedType === lastType && pool.length > 1) {
  selectedType = pool.find(t => t !== lastType) || selectedType;
}
lastType = selectedType;
```

**3. `AdminV8Create.tsx`**
- Linha 811-812: expandir rotação
```typescript
const patternNames = ['V8-C01', 'V8-B01', 'V8-C02', 'V8-B02', 'V8-C03', 'V8-B03'];
```
- Linhas 940-943: hard gate condicional
```typescript
const isCompact = selectedPattern.startsWith('V8-B');
const minSections = isCompact ? 7 : 9;
if (preFinalSections.length < minSections) { ... }
```
- Enviar `structureVariant: isCompact ? 'compact' : 'standard'` na chamada do raw-content
- Linhas 976-978: ajustar gate de interações mínimas por pattern

**4. `v8-generate-variations/index.ts`**
- Aceitar parâmetro de target sections count, paddar para 7 ou 9 conforme indicado

### O que NÃO muda

- `useV8Player.ts` — já é genérico
- `V8LessonPlayer.tsx` — já é genérico
- Componentes de exercícios — inalterados
- Aulas já geradas com V8-C* — zero impacto
- Lógica de Coursiv/Playground — `lastIdx` e `coursivTargetIdx` se ajustam automaticamente
- Audio pipeline — itera por array, sem hardcode

### Ordem de implementação sugerida

1. `src/types/v8Lesson.ts` (trivial, desbloqueia tipos)
2. `supabase/functions/v8-generate-raw-content/index.ts` (gera 7 seções)
3. `supabase/functions/v8-generate-lesson-content/index.ts` (maps + ângulos + anti-repetição + exercícios finais condicionais)
4. `supabase/functions/v8-generate-variations/index.ts` (padding condicional)
5. `src/pages/AdminV8Create.tsx` (rotação + gates condicionais + envio de structureVariant)

