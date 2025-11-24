# 🔧 AÇÕES CORRETIVAS - PIPELINE

**Baseado em:** AUDITORIA-PIPELINE-COMPLETA.md
**Data:** 2025-11-24

---

## ✅ AÇÕES JÁ CONCLUÍDAS

### 1. ✅ Corrigir transformSimplifiedExercise
**Commit:** `41ecdf5`
**Arquivo:** `src/pages/AdminPipelineCreateBatch.tsx`
**Status:** ✅ **CONCLUÍDO**

### 2. ✅ Corrigir validador de underscores
**Commit:** `b27cc42`
**Arquivo:** `src/lib/exerciseValidator.ts`
**Status:** ✅ **CONCLUÍDO**

### 3. ✅ Criar documentação de migração
**Commit:** `ef899cc`
**Arquivos:** `MIGRACAO-EXERCICIOS.md`, `migrate-corrupted-exercises.sql`
**Status:** ✅ **CONCLUÍDO**

---

## 🔴 PRIORIDADE ALTA (Fazer Agora)

### 4. Padronizar underscores nos componentes frontend

**Problema:** Componentes usam números diferentes de underscores no split()

**Arquivo 1:** `src/components/lessons/CompleteSentenceExercise.tsx`
**Linha:** 92
```typescript
// ❌ ANTES
const parts = sentence.text.split('___________');  // 11 underscores

// ✅ DEPOIS
const parts = sentence.text.split(/_{7,11}/);  // Aceita 7 a 11
```

**Arquivo 2:** `src/components/lessons/FillInBlanksExercise.tsx`
**Linha:** 121
```typescript
// ❌ ANTES
const parts = sentence.text.split('_______');  // 7 underscores

// ✅ DEPOIS
const parts = sentence.text.split(/_{7,11}/);  // Aceita 7 a 11
```

**Impacto:** 🟡 Médio - Garante que ambos formatos funcionem

---

### 5. Atualizar documentação de schemas

**Arquivo:** `src/types/exerciseSchemas.ts`
**Linha:** 179

```typescript
// ❌ ANTES
export interface CompleteSentenceSentence {
  id: string;
  text: string; // Deve conter _______ onde o usuário preenche
  correctAnswers: string[];
  // ...
}

// ✅ DEPOIS
export interface CompleteSentenceSentence {
  id: string;
  /**
   * Texto da sentença com placeholder para resposta.
   *
   * ✅ PADRÃO RECOMENDADO: 7 underscores (_______)
   * ⚠️ RETROCOMPATIBILIDADE: 11 underscores (___________) também funciona
   *
   * Exemplo: "A IA aprende com _______."
   */
  text: string;
  correctAnswers: string[];
  // ...
}
```

**Impacto:** 🟢 Baixo - Melhora clareza para desenvolvedores

---

### 6. Criar constante para placeholder padrão

**Criar arquivo:** `src/lib/exerciseConstants.ts`

```typescript
/**
 * ============================================================
 * CONSTANTES PARA EXERCÍCIOS
 * ============================================================
 */

/**
 * Placeholder padrão para exercícios complete-sentence e fill-in-blanks
 *
 * ✅ PADRÃO: 7 underscores
 * Regex que aceita 7 a 11 underscores para retrocompatibilidade
 */
export const EXERCISE_PLACEHOLDER = '_______';
export const EXERCISE_PLACEHOLDER_REGEX = /_{7,11}/;

/**
 * Verifica se texto contém placeholder válido
 */
export function hasValidPlaceholder(text: string): boolean {
  return EXERCISE_PLACEHOLDER_REGEX.test(text);
}

/**
 * Split de texto usando placeholder (aceita variações)
 */
export function splitByPlaceholder(text: string): string[] {
  return text.split(EXERCISE_PLACEHOLDER_REGEX);
}
```

**Uso nos componentes:**
```typescript
import { splitByPlaceholder } from '@/lib/exerciseConstants';

// ✅ PADRÃO
const parts = splitByPlaceholder(sentence.text);
```

**Impacto:** 🔴 Alto - Centraliza lógica, previne bugs futuros

---

## 🟡 PRIORIDADE MÉDIA (Fazer Depois)

### 7. Adicionar warning para formato sem wrapper `data`

**Arquivo:** `src/lib/lessonPipeline/step5-generate-exercises.ts`
**Linha:** ~70

```typescript
// Adicionar após detecção de formato antigo
if (!exercise.data) {
  console.warn(`
    ⚠️ [DEPRECATED] Exercício ${exerciseIndex} usa formato SEM wrapper 'data'.
    Este formato será descontinuado em versão futura.

    Formato atual (DEPRECATED):
    { type: 'multiple-choice', question: '...', options: [...] }

    Formato recomendado:
    { type: 'multiple-choice', data: { question: '...', options: [...] } }

    Migração automática aplicada nesta execução.
  `);
}
```

**Impacto:** 🟡 Médio - Prepara deprecação gradual

---

### 8. Atualizar todos os templates e exemplos

**Arquivos a atualizar:**
- `TEMPLATE-V1-PIPELINE.json`
- `EXEMPLO-V1-7-PROMPTS-CORRIGIDO.json`
- `docs/MODELO-V1-PIPELINE-GUIA-COMPLETO.md`
- `docs/TEMPLATES_DE_AULAS.md`

**Mudanças:**
1. Usar sempre **7 underscores** (`_______`)
2. Sempre usar wrapper `data`
3. Adicionar comentários explicativos

**Exemplo:**
```json
{
  "type": "complete-sentence",
  "question": "Complete a frase:",
  "data": {
    "sentences": [
      {
        "id": "sent-1",
        "text": "A IA aprende com _______.",  // ✅ 7 underscores
        "correctAnswers": ["dados", "exemplos"]
      }
    ]
  }
}
```

**Impacto:** 🟡 Médio - Evita confusão para novos usuários

---

## 🟢 PRIORIDADE BAIXA (Futuro)

### 9. Adicionar testes automatizados

**Criar:** `src/lib/__tests__/exerciseValidation.test.ts`

```typescript
import { validateExercise } from '@/lib/exerciseValidator';
import { splitByPlaceholder } from '@/lib/exerciseConstants';

describe('Exercise Validation', () => {
  describe('complete-sentence', () => {
    it('deve aceitar 7 underscores', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Test',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com _______.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
    });

    it('deve aceitar 11 underscores (retrocompatibilidade)', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Test',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase com ___________.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(true);
    });

    it('deve rejeitar texto sem underscores', () => {
      const exercise = {
        id: 'test',
        type: 'complete-sentence',
        title: 'Test',
        instruction: 'Test',
        data: {
          sentences: [{
            id: 'sent-1',
            text: 'Frase sem placeholder.',
            correctAnswers: ['resposta']
          }]
        }
      };

      const result = validateExercise(exercise);
      expect(result.isValid).toBe(false);
    });
  });

  describe('splitByPlaceholder', () => {
    it('deve splittar com 7 underscores', () => {
      const parts = splitByPlaceholder('Antes _______ depois');
      expect(parts).toEqual(['Antes ', ' depois']);
    });

    it('deve splittar com 11 underscores', () => {
      const parts = splitByPlaceholder('Antes ___________ depois');
      expect(parts).toEqual(['Antes ', ' depois']);
    });
  });
});
```

**Impacto:** 🟢 Baixo - Previne regressões futuras

---

### 10. Refatorar transformSimplifiedExercise

**Objetivo:** Extrair para módulo separado com TypeScript strict

**Criar:** `src/lib/lessonPipeline/exerciseTransformers.ts`

```typescript
/**
 * Transformadores de exercícios
 * Converte formatos simplificados para formato completo
 */

interface SimpleExercise {
  type: string;
  question?: string;
  options?: string[];
  correctAnswer?: string | number;
  // ... outros campos
}

interface CompleteExercise {
  id: string;
  title: string;
  instruction: string;
  type: string;
  data: any;
}

export function transformExerciseToComplete(
  exercise: SimpleExercise | CompleteExercise,
  index: number
): CompleteExercise {
  // Lógica de transformação aqui
  // Com TypeScript strict e validações
}
```

**Benefícios:**
- Código mais testável
- TypeScript strict (menos bugs)
- Reutilizável em outros contextos
- Documentação clara

**Impacto:** 🟢 Baixo - Melhoria de arquitetura

---

## 📊 PRIORIZAÇÃO VISUAL

```
URGÊNCIA
  ↑
  │  🔴 #4, #5, #6
  │  (Fazer Agora)
  │
  │  🟡 #7, #8
  │  (Fazer Depois)
  │
  │  🟢 #9, #10
  │  (Futuro)
  └──────────────────→ COMPLEXIDADE
```

---

## 🎯 ROADMAP SUGERIDO

### Sprint 1 (Esta Semana)
- [x] ✅ Ação #1: Corrigir transformSimplifiedExercise (FEITO)
- [x] ✅ Ação #2: Corrigir validador underscores (FEITO)
- [x] ✅ Ação #3: Criar documentação de migração (FEITO)
- [ ] 🔴 Ação #4: Padronizar underscores nos componentes
- [ ] 🔴 Ação #5: Atualizar documentação de schemas
- [ ] 🔴 Ação #6: Criar constantes compartilhadas

### Sprint 2 (Próxima Semana)
- [ ] 🟡 Ação #7: Adicionar warnings deprecação
- [ ] 🟡 Ação #8: Atualizar templates e exemplos

### Sprint 3 (Mês Seguinte)
- [ ] 🟢 Ação #9: Adicionar testes automatizados
- [ ] 🟢 Ação #10: Refatorar transformadores

---

## 📝 COMO EXECUTAR CADA AÇÃO

### Ação #4: Padronizar underscores

```bash
# 1. Criar constantes
git checkout claude/fix-json-parsing-014hFnfJofgbQBPeAXNrE1DF
touch src/lib/exerciseConstants.ts
# Adicionar conteúdo (ver acima)

# 2. Atualizar CompleteSentenceExercise
code src/components/lessons/CompleteSentenceExercise.tsx
# Linha 92: trocar split('___________') por splitByPlaceholder()

# 3. Atualizar FillInBlanksExercise
code src/components/lessons/FillInBlanksExercise.tsx
# Linha 121: trocar split('_______') por splitByPlaceholder()

# 4. Commit
git add .
git commit -m "Feat: Padroniza underscores com constantes compartilhadas"
git push -u origin claude/fix-json-parsing-014hFnfJofgbQBPeAXNrE1DF
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após aplicar cada ação, verificar:

- [ ] Código compila sem erros TypeScript
- [ ] Testes manuais passam (criar lição de teste)
- [ ] Logs não mostram warnings críticos
- [ ] Documentação atualizada (se aplicável)
- [ ] Commit com mensagem descritiva
- [ ] Push para branch correto

---

**Última atualização:** 2025-11-24
**Branch de trabalho:** `claude/fix-json-parsing-014hFnfJofgbQBPeAXNrE1DF`
