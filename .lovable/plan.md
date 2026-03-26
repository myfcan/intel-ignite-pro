

## Plano de Correção — Parser V8 + Exercícios Inline

### Problema Real (dados do código)

**Causa raiz**: `src/lib/v8ContentParser.ts`, linha 119:
```typescript
const isShortResidual = contentTrimmed.length < 100 && contentTrimmed.length > 0;
```
Seções com `[EXERCISE:multiple-choice]` (~25 chars) são classificadas como "short residual" e podadas/mescladas (linhas 128-148). Isso reduz de 10 para 6 seções, e o hard gate (linha 940 de `AdminV8Create.tsx`) aborta:
```typescript
if (preFinalSections.length < 9) {
  throw new Error(`Pipeline abortado: apenas ${preFinalSections.length} seções encontradas (mínimo 9)`);
}
```

**Bug secundário**: `parseExerciseMarkersWithSections` (linha 563-592) opera sobre `keptSections` APÓS pruning — mas as seções com marcador já foram removidas, então `manualExerciseMarkers` fica vazio → edge function não recebe exercícios manuais → gera exercícios do pool automático (que podem não corresponder ao conteúdo).

**Bug terciário**: `handleSetupApply` (linha 1262) materializa com `data: { _placeholder: true }` — dado inútil que o player não consegue renderizar.

**Bug no player**: `createFallbackInlineExercise` (useV8Player.ts linhas 23-125) gera exercícios genéricos hardcoded sem relação com o conteúdo real da aula.

---

### Correções (3 arquivos)

#### 1. `src/lib/v8ContentParser.ts` — NÃO podar seções com marcador de exercício

No loop de pruning (linhas 116-152), adicionar detecção de `[EXERCISE:*]` ANTES do check de `isShortResidual`:

```typescript
const EXERCISE_MARKER_RE = /\[EXERCISE:([a-z-]+)\]/i;
const hasExerciseMarker = EXERCISE_MARKER_RE.test(contentTrimmed);
```

Se `hasExerciseMarker === true`, a seção **NÃO é podada** independentemente do tamanho. Ela é mantida em `keptSections`.

Além disso, mover `parseExerciseMarkersWithSections` para ANTES do pruning, usando `parsedSections` (originais) em vez de `keptSections`, para garantir que os marcadores sejam capturados mesmo que o conteúdo da seção seja apenas o marcador.

#### 2. `src/pages/AdminV8Create.tsx` — Remover materialização placeholder do `handleSetupApply`

Linhas 1236-1265: remover a lógica de materialização com `_placeholder: true` do `handleSetupApply`. Os exercícios reais são gerados pela edge function `v8-generate-lesson-content` que já recebe os `manualExerciseMarkers` e gera dados reais via IA.

O `handleSetupApply` deve apenas montar o JSON com `sections`, `inlineQuizzes`, `inlinePlaygrounds` — sem tentar criar `inlineExercises` com placeholders.

#### 3. `src/hooks/useV8Player.ts` — Remover fallback genérico

Linhas 23-125: remover `createFallbackInlineExercise` inteiramente. Se `inlineExercises` não existir no JSON, o player simplesmente não renderiza exercício naquela posição. A responsabilidade de gerar exercícios é exclusiva do pipeline (edge function), não do player.

Manter apenas a lógica de `isMarkerOnly` para pular seções que contêm apenas marcador (sem texto pedagógico).

---

### Efeito Sistêmico Verificado

| Fluxo | Impacto | Status |
|-------|---------|--------|
| Pipeline automático (botão "Gerar") | `manualExerciseMarkers` será enviado corretamente à edge function porque parser não poda mais seções com marcador | ✅ Corrigido |
| Conversão manual (botão "Setup → Aplicar") | Não insere mais `inlineExercises` com placeholder inútil | ✅ Corrigido |
| Player runtime | Não gera mais exercícios genéricos duplicados; renderiza apenas o que veio do banco | ✅ Corrigido |
| Edge function `v8-generate-lesson-content` | Já suporta `manualExercises` corretamente (linhas 696-728). Recebe tipos+índices e gera conteúdo real via IA | Sem alteração necessária |
| Edge function `v8-reprocess-audio` | Não toca em `inlineExercises` — correto, pois exercícios não têm áudio | Sem alteração necessária |
| Hard gate `< 9 seções` | Não será mais acionado porque seções com marcador não são podadas | ✅ Corrigido |
| Aulas existentes sem `inlineExercises` | Player não criará fallback genérico — simplesmente não mostra exercício. Precisa reprocessar via pipeline para gerar exercícios reais | Comportamento esperado |

### Pontos Cegos Verificados

1. **Seção com marcador + texto real**: Se uma seção tem `[EXERCISE:multiple-choice]` E texto pedagógico (>100 chars), o parser atual já a mantém. A correção não quebra esse caso.
2. **Índice do marcador após pruning**: O `parseExerciseMarkersWithSections` será chamado sobre seções pré-pruning, mas os índices retornados precisam ser remapeados via `indexRemap` para que `afterSectionIndex` aponte para o índice correto pós-pruning. Isso será implementado.
3. **Aulas V8 criadas ANTES desta correção**: Player não vai mais criar fallback → exercícios genéricos desaparecem. Comportamento correto.

