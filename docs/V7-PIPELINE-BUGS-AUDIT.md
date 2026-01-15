# V7-vv Pipeline - Auditoria de Bugs

**Data:** 2026-01-15
**Auditor:** Claude (Opus 4.5)
**Branch:** claude/confirm-merge-sync-Eu40U

---

## Resumo Executivo

A auditoria identificou **5 bugs críticos** e **3 problemas menores** no Pipeline V7-vv que causam falhas nas aulas geradas automaticamente.

---

## Bug 1: `visual` vs `scenes[]` (CRÍTICO)

### Descrição
O Pipeline gera fases com campo `visual` (objeto único), mas o V7PhasePlayer espera `scenes[]` (array de cenas).

### Evidências

**Pipeline gera (supabase/functions/v7-vv/index.ts:626-635):**
```typescript
const phase: Phase = {
  id: scene.id,
  visual: {
    type: scene.visual.type,
    content: scene.visual.content,
  },
  // NÃO gera scenes[]!
};
```

**V7PhasePlayer espera (src/components/lessons/v7/cinematic/phases/V7PhaseController.tsx:182):**
```typescript
export interface V7Phase {
  scenes: V7Scene[];  // OBRIGATÓRIO!
}
```

**Fallback atual (linha 427):**
```typescript
const phaseScenes = currentPhase?.scenes || [];  // Sempre retorna []
```

### Impacto
- Timing interno de cenas NÃO funciona
- Animações por cena não são aplicadas
- `currentScene` sempre é `null` para fases geradas pelo Pipeline

### Solução
O Pipeline deve gerar `scenes[]` a partir do campo `visual`:
```typescript
scenes: [{
  id: `scene-${scene.id}`,
  type: scene.visual.type,
  content: scene.visual.content,
  startTime: 0,
  duration: endTime - startTime,
  animation: 'fade',
}],
```

---

## Bug 2: `audioBehavior` Formato Incompleto (CRÍTICO)

### Descrição
O Pipeline gera `audioBehavior` simplificado, mas o sistema espera formato completo com `duringInteraction`.

### Evidências

**Pipeline gera (supabase/functions/v7-vv/index.ts:639-642):**
```typescript
audioBehavior: isInteractive ? {
  onStart: 'pause',
  onComplete: 'resume',
} : undefined,
```

**Sistema espera (V7PhaseController.tsx:139-148):**
```typescript
export interface V7AudioBehavior {
  onStart: 'pause' | 'fadeToBackground' | 'continue' | 'switch';
  duringInteraction: {  // OBRIGATÓRIO!
    mainVolume: number;
    ambientVolume: number;
    contextualLoops?: V7ContextualLoop[];
  };
  onComplete: 'resume' | 'fadeIn' | 'next';
}
```

### Impacto
- Comportamento de áudio durante interações não funciona corretamente
- `contextualLoops` (whispers de dicas) nunca são executados

### Solução
```typescript
audioBehavior: isInteractive ? {
  onStart: 'pause',
  duringInteraction: {
    mainVolume: 0,
    ambientVolume: 0.3,
    contextualLoops: scene.interaction?.contextualLoops || [],
  },
  onComplete: 'resume',
} : undefined,
```

---

## Bug 3: Timing Inconsistente (endTime < startTime) (CRÍTICO)

### Descrição
O cálculo de timing pode gerar `endTime` menor que `startTime` em algumas fases.

### Evidências
Na sessão anterior, ao analisar a aula problemática `eed75742-fcce-4afa-b4db-c1beda48cd94`:
- Phase 5: `startTime: 56.028`, `endTime: 49.062` ❌

**Código problemático (supabase/functions/v7-vv/index.ts:525-528):**
```typescript
if (range) {
  startTime = Math.max(range.startTime, lastEndTime);
  endTime = range.endTime;  // Pode ser < startTime se range.endTime < lastEndTime
```

### Impacto
- Fases "negativas" causam comportamento imprevisível
- Player não consegue determinar fase atual corretamente

### Solução
```typescript
if (range) {
  startTime = Math.max(range.startTime, lastEndTime);
  endTime = Math.max(range.endTime, startTime + 1);  // Garantir duração mínima
```

---

## Bug 4: `feedbackAudios` Não Conectados às Opções (MÉDIO)

### Descrição
O Pipeline gera `feedbackAudios` separadamente, mas as opções do quiz não têm referência `audioId` correta.

### Evidências

**Pipeline gera feedbackAudios (linha 793-798):**
```typescript
feedbackAudios[`feedback-${option.id}`] = {
  id: `feedback-${option.id}`,
  url: feedbackResult.url || '',
  // ...
};
```

**Mas no quiz (linha 659):**
```typescript
audioId: opt.feedback?.narration ? `feedback-${opt.id}` : undefined,
```

O `audioId` é gerado, mas o Player precisa receber `feedbackAudios` como prop separada.

### Impacto
- Áudios de feedback não são reproduzidos após seleção de resposta

### Solução
Verificar se `feedbackAudios` está sendo passado corretamente para o V7PhasePlayer e se o componente V7QuizComponent está usando.

---

## Bug 5: `microVisuals` Sem `triggerTime` Calculado (MÉDIO)

### Descrição
Quando a palavra-chave do microVisual não é encontrada nos timestamps, o fallback pode gerar `triggerTime` fora do range da fase.

### Evidências

**Pipeline (linha 606):**
```typescript
triggerTime: triggerTime ?? (startTime + (endTime - startTime) * ((idx + 1) / (scene.visual.microVisuals!.length + 1))),
```

Se `startTime` e `endTime` estão incorretos (Bug 3), o `triggerTime` também será incorreto.

### Impacto
- MicroVisuals não aparecem no momento correto
- Podem aparecer em fases erradas

### Solução
Corrigir Bug 3 primeiro, depois validar triggerTime:
```typescript
const calculatedTriggerTime = triggerTime ?? (startTime + (endTime - startTime) * ((idx + 1) / (mvCount + 1)));
// Garantir que está dentro da fase
microVisuals.push({
  triggerTime: Math.min(Math.max(calculatedTriggerTime, startTime), endTime - 0.5),
});
```

---

## Problemas Menores

### 1. Falta `once: true` em anchorActions
O Pipeline não adiciona `once: true` explicitamente. O sistema usa `true` como default, então funciona, mas seria melhor explicitar.

### 2. Falta `timeout` em fases interativas
O Pipeline não gera configuração de `timeout` para fases interativas, usando default do sistema.

### 3. Metadata incompleto
O Pipeline não inclui todos os campos opcionais como `estimatedInteractionTime`.

---

## Aula Funcional vs Aula do Pipeline - Diferenças Estruturais

| Campo | Aula Funcional | Pipeline | Status |
|-------|---------------|----------|--------|
| `scenes[]` | Array com múltiplas cenas | NÃO GERA | ❌ BUG |
| `visual` | NÃO TEM | Objeto com type/content | ⚠️ Diferente |
| `anchorActions.keywordTime` | NÃO TEM | number | ✅ Funciona |
| `anchorActions.once` | boolean | NÃO GERA | ⚠️ Usa default |
| `audioBehavior.duringInteraction` | Objeto completo | NÃO GERA | ❌ BUG |
| `contextualAudio` | Objeto com hints | NÃO GERA | ⚠️ Feature faltando |
| `microVisuals` | NÃO TEM | Array | ✅ Feature extra |
| Timing (startTime/endTime) | Coerente | Pode ter bugs | ❌ BUG |

---

## Plano de Correção Prioritizado

### Fase 1: Correções Críticas (URGENTE)
1. **Bug 1**: Adicionar transformação `visual` → `scenes[]`
2. **Bug 3**: Corrigir cálculo de timing

### Fase 2: Funcionalidades de Interação
3. **Bug 2**: Completar formato de `audioBehavior`
4. **Bug 4**: Conectar `feedbackAudios` corretamente

### Fase 3: Polish
5. **Bug 5**: Validar `triggerTime` de microVisuals
6. Problemas menores

---

## Comandos para Debug

```sql
-- Ver estrutura da aula problemática
SELECT id, title,
  content->'phases'->0 as first_phase,
  content->'audio' as audio_config
FROM lessons
WHERE id = 'eed75742-fcce-4afa-b4db-c1beda48cd94';

-- Comparar com aula funcional
SELECT id, title,
  content->'phases'->0 as first_phase
FROM lessons
WHERE id = '19f7e1df-6fb8-435f-ad51-cc44ac67618d';
```

---

## Conclusão

O Pipeline V7-vv tem potencial mas precisa de correções estruturais para gerar aulas compatíveis com o Player. Os bugs críticos (1, 2, 3) devem ser corrigidos antes de qualquer uso em produção.

A principal discrepância é que o Pipeline foi desenvolvido com uma estrutura diferente (`visual`) do que o Player espera (`scenes[]`), sugerindo que houve uma evolução do sistema sem atualização correspondente do Pipeline.
