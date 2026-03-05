

# Plano Consolidado V8-C01 — 7 Edições em 3 Fases

**Arquivo único:** `supabase/functions/v8-generate-lesson-content/index.ts`

---

## FASE 1 — Hardening de Geração (Prompts + Schema)

Objetivo: garantir que a IA gere exercícios e Coursiv com qualidade desde a origem.

### Edição 1.1 — Reescrever `COURSIV_SYSTEM_PROMPT` (linhas 359-376)

**ANTES:**
```typescript
const COURSIV_SYSTEM_PROMPT = `Você é um designer instrucional especializado em construção de prompts de IA.
...
EXEMPLO de frase válida:
"Crie uma lista de _______ para um freelancer de design que quer prospectar clientes no LinkedIn."
Opções: ["estratégias de prospecção", "receitas de bolo", "exercícios físicos", "planetas do sistema solar"]
Resposta correta: ["estratégias de prospecção"]`;
```

**DEPOIS:**
```typescript
const COURSIV_SYSTEM_PROMPT = `Você é um designer instrucional especializado em construção de prompts de IA.

Sua tarefa é gerar um exercício do tipo "complete a frase" (Coursiv) onde o aluno monta partes de um prompt profissional preenchendo lacunas com chips.

REGRAS:
1. Gere 4-6 frases que representem a ESTRUTURA de um prompt profissional relacionado ao tema da aula. Cada frase tem UMA lacuna.
2. Cada frase deve ter exatamente UMA lacuna (_______ como placeholder).
3. A lacuna deve representar um componente-chave do prompt: público-alvo, contexto, formato de saída, tom, objetivo, restrição, CTA, etc.
4. Os chips (options) devem ter EXATAMENTE 4 opções: 1 correta + 3 distratoras plausíveis.
5. Use Português Brasileiro (pt-BR).
6. O exercício deve testar a habilidade de MONTAR prompts, não conhecimento teórico.
7. NUNCA gere subtítulos meta como "Segmento vida real" ou "Atividade prática:".
8. As frases devem parecer prompts reais que o aluno usaria em uma ferramenta de IA.

REGRA CRÍTICA — DISTRATORES PLAUSÍVEIS:
- Distratores DEVEM ser do MESMO DOMÍNIO temático da aula (copywriting, IA, SEO, comunicação, empreendedorismo, marketing digital).
- Distratores são opções que "parecem corretas" mas prejudicam o resultado (ex.: objetivo vago demais, tom inadequado para o público, CTA fraca, persona errada para o contexto).
- PROIBIDO distratores absurdos ou fora do domínio.

LISTA DE PROIBIÇÕES ABSOLUTAS para opções (NUNCA usar estas palavras/conceitos):
café, bolo, receita, árvores, carros, poeta, clima, fonte tipográfica, imagens decorativas, planetas, exercícios físicos, filmes, música, esportes, animais, comida, viagem, moda.

EXEMPLO CORRETO:
Frase: "O post deve ter um _______ para engajar o leitor desde o início."
Opções: ["tom otimista e inspirador, com linguagem simples", "tom acadêmico, denso e cheio de termos técnicos", "tom agressivo e urgente, com pressão e medo", "tom neutro demais, sem exemplos e sem posição"]
Resposta correta: ["tom otimista e inspirador, com linguagem simples"]

Cada lacuna deve cobrir um COMPONENTE ESTRUTURAL do prompt: objetivo, tom de voz, CTA, persona/público-alvo, critério de revisão, contexto, restrição ou formato de saída.`;
```

**Motivo:** O prompt atual ensina a IA a gerar "receitas de bolo" como distrator (linha 375). O novo prompt proíbe explicitamente distratores fora do domínio e exige exatamente 4 opções.

---

### Edição 1.2 — Atualizar `COURSIV_BUILDER_TOOLS` options schema (linha 347)

**ANTES:**
```typescript
options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5, description: "Chip options: correct answer + plausible distractors" },
```

**DEPOIS:**
```typescript
options: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4, description: "Exactly 4 chip options: 1 correct answer + 3 plausible distractors from the SAME domain (copywriting, IA, SEO, marketing). NEVER use absurd options like food, sports, weather, animals." },
```

**Motivo:** Forçar a IA via schema a gerar exatamente 4 opções (consistente com o quality gate da Fase 2).

---

## FASE 2 — Filtro Robusto + Gates Hard Fail

Objetivo: impedir que exercícios quebrados ou incompletos passem pelo filtro, e abortar se o contrato V8-C01 não for cumprido.

### Edição 2.1 — Corrigir `INLINE_REQUIRED_DATA_KEYS` para `platform-match` (linha 565)

**ANTES:**
```typescript
'platform-match': ['scenarios'],
```

**DEPOIS:**
```typescript
'platform-match': ['scenarios', 'platforms'],
```

**Motivo:** O componente `PlatformMatchExercise` exige `data.scenarios` E `data.platforms`. O filtro atual aceita com apenas `scenarios`, resultando em exercício que renderiza vazio/quebrado.

---

### Edição 2.2 — Trocar `.some()` por `.every()` no filtro (linha 583)

**ANTES:**
```typescript
const hasRequired = requiredKeys.some((k: string) => dataKeys.includes(k));
```

**DEPOIS:**
```typescript
const hasRequired = requiredKeys.every((k: string) => dataKeys.includes(k));
```

**Motivo:** Com `some()`, basta UMA key existir. Para `platform-match` com `['scenarios', 'platforms']`, aceitaria só com `scenarios`. Precisa ser `.every()` para garantir que TODAS as keys obrigatórias existam.

---

### Edição 2.3 — Gate V8-C01 Hard Fail + contadores detalhados + gate de duplicata (linhas 591-596)

**ANTES** (linhas 591-596):
```typescript
        progress.push(`${generatedInlineExercises.length} exercícios inline gerados (V8-C01: ${generatedInlineExercises.map((e: any) => e.type).join(', ')})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Inline exercise generation failed";
        errors.push(`Inline exercises: ${msg}`);
        console.error("[v8-generate-lesson-content] Inline exercise generation error:", msg);
      }
```

**DEPOIS:**
```typescript
        // ── V8-C01 COUNTS: Detailed rejection logging ──
        const aiReturnedCount = (exResult.exercises || []).length;
        const acceptedCount = generatedInlineExercises.length;
        const rejectedCount = aiReturnedCount - acceptedCount;
        
        const rejectionReasons: Record<string, number> = {};
        (exResult.exercises || []).forEach((ex: any) => {
          const requiredKeys = INLINE_REQUIRED_DATA_KEYS[ex.type];
          if (!requiredKeys) {
            rejectionReasons[`unknown_type:${ex.type}`] = (rejectionReasons[`unknown_type:${ex.type}`] || 0) + 1;
          } else {
            const dataKeys = Object.keys(ex.data || {});
            const hasAll = requiredKeys.every((k: string) => dataKeys.includes(k));
            if (!hasAll) {
              const missing = requiredKeys.filter((k: string) => !dataKeys.includes(k));
              rejectionReasons[`missing_keys:${ex.type}(need:${missing.join('+')})`] = 
                (rejectionReasons[`missing_keys:${ex.type}(need:${missing.join('+')})`] || 0) + 1;
            }
          }
        });
        
        console.log(`[v8-generate] V8-C01 COUNTS: aiReturned=${aiReturnedCount}, accepted=${acceptedCount}, rejected=${rejectedCount}`);
        if (rejectedCount > 0) {
          console.error(`[v8-generate] V8-C01 REJECTION DETAILS: ${JSON.stringify(rejectionReasons)}`);
        }
        
        // ── V8-C01 GATE: Missing sections = HARD FAIL ──
        const coveredSections = new Set(generatedInlineExercises.map((e: any) => e.afterSectionIndex));
        const missingSections = interactionAssignments.filter(a => !coveredSections.has(a.sectionIndex));
        
        if (missingSections.length > 0) {
          const missingDesc = missingSections.map(m => `S${m.sectionIndex}(${m.type})`).join(', ');
          throw new Error(`V8-C01 HARD FAIL: Missing exercises for sections: ${missingDesc}. AI returned ${aiReturnedCount}, accepted ${acceptedCount}, rejected ${rejectedCount}. Details: ${JSON.stringify(rejectionReasons)}`);
        }

        // ── V8-C01 DUPLICATE GATE: Exactly 1 exercise per section ──
        const perSectionCounts: Record<number, number> = {};
        for (const ex of generatedInlineExercises) {
          perSectionCounts[ex.afterSectionIndex] = (perSectionCounts[ex.afterSectionIndex] || 0) + 1;
        }
        const dupSections = interactionAssignments
          .filter(a => (perSectionCounts[a.sectionIndex] || 0) !== 1)
          .map(a => `S${a.sectionIndex}(count=${perSectionCounts[a.sectionIndex] || 0})`);
        if (dupSections.length > 0) {
          throw new Error(`V8-C01 HARD FAIL: Expected exactly 1 inline exercise per section. Offenders: ${dupSections.join(', ')}`);
        }
        
        progress.push(`${generatedInlineExercises.length} exercícios inline gerados (V8-C01: ${generatedInlineExercises.map((e: any) => e.type).join(', ')})`);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Inline exercise generation failed";
        // V8-C01 HARD FAIL deve propagar (não capturar)
        if (msg.includes('V8-C01 HARD FAIL')) {
          throw err;
        }
        errors.push(`Inline exercises: ${msg}`);
        console.error("[v8-generate-lesson-content] Inline exercise generation error:", msg);
      }
```

**Motivo (3 em 1):**
1. **Contadores detalhados** — `rejectionReasons` agrupa rejeições por tipo e motivo (key ausente), respondendo "por que `inlineExercises=0`" em uma única leitura de log.
2. **Gate de seções faltantes** — `throw new Error` se qualquer seção do mapa V8-C01 (idx 2-6) ficou sem exercício. Propaga para HTTP 500, AdminV8Create mostra erro, aula NÃO é salva.
3. **Gate de duplicata** — `throw new Error` se qualquer seção tem mais de 1 exercício. Previne o bug original de "duplicação na Sessão 8".

O `catch` interno re-propaga erros `V8-C01 HARD FAIL` (não os engole). Erros de outros tipos (rede, parsing) continuam sendo capturados normalmente.

---

## FASE 3 — Coursiv Quality Gate Hard Fail

Objetivo: impedir que Coursiv com distratores absurdos ou formato incorreto seja salvo no banco.

### Edição 3.1 — Coursiv Quality Gate + Hard Fail se ausente (linhas 614-634)

**ANTES** (linhas 614-634):
```typescript
        if (coursivResult && coursivResult.sentences && coursivResult.sentences.length > 0) {
          const coursivExercise = {
            id: `coursiv-gen-01`,
            afterSectionIndex: coursivTargetIdx,
            title: sanitizeV8Text(coursivResult.title || 'Monte o Prompt Profissional'),
            instruction: sanitizeV8Text(coursivResult.instruction || 'Complete as frases escolhendo os chips corretos.'),
            sentences: coursivResult.sentences.map((s: any) => ({
              ...s,
              text: sanitizeV8Text(s.text || ''),
              correctAnswers: (s.correctAnswers || []).map((a: string) => sanitizeV8Text(a)),
              options: (s.options || []).map((o: string) => sanitizeV8Text(o)),
            })),
          };
          generatedCoursivSentences.push(coursivExercise);
          progress.push(`1 exercício Coursiv gerado (afterSection: ${coursivTargetIdx})`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Coursiv generation failed";
        errors.push(`Coursiv: ${msg}`);
        console.error("[v8-generate-lesson-content] Coursiv generation error:", msg);
      }
```

**DEPOIS:**
```typescript
        if (coursivResult && coursivResult.sentences && coursivResult.sentences.length > 0) {
          const coursivExercise = {
            id: `coursiv-gen-01`,
            afterSectionIndex: coursivTargetIdx,
            title: sanitizeV8Text(coursivResult.title || 'Monte o Prompt Profissional'),
            instruction: sanitizeV8Text(coursivResult.instruction || 'Complete as frases escolhendo os chips corretos.'),
            sentences: coursivResult.sentences.map((s: any) => ({
              ...s,
              text: sanitizeV8Text(s.text || ''),
              correctAnswers: (s.correctAnswers || []).map((a: string) => sanitizeV8Text(a)),
              options: (s.options || []).map((o: string) => sanitizeV8Text(o)),
            })),
          };

          // ── COURSIV QUALITY GATE (HARD FAIL) ──
          const COURSIV_BANNED_WORDS = ['café', 'bolo', 'receita', 'árvore', 'carro', 'poeta', 'clima', 'fonte tipográfica', 'imagens decorativas', 'planeta', 'exercício físico', 'filme', 'música', 'esporte', 'animal', 'comida', 'viagem', 'moda'];
          const coursivErrors: string[] = [];

          if (coursivExercise.sentences.length < 4) {
            coursivErrors.push(`Only ${coursivExercise.sentences.length} sentences (min 4)`);
          }

          for (const sent of coursivExercise.sentences) {
            if ((sent.options || []).length !== 4) {
              coursivErrors.push(`Sentence "${sent.id || sent.text?.slice(0, 30)}" has ${(sent.options || []).length} options (must be exactly 4)`);
            }
            for (const opt of (sent.options || [])) {
              const optLower = opt.toLowerCase();
              for (const banned of COURSIV_BANNED_WORDS) {
                if (optLower.includes(banned)) {
                  coursivErrors.push(`Option "${opt}" contains banned word "${banned}"`);
                }
              }
            }
          }

          if (coursivErrors.length > 0) {
            const errorMsg = `COURSIV QUALITY GATE HARD FAIL: ${coursivErrors.join('; ')}`;
            console.error(`[v8-generate] ${errorMsg}`);
            throw new Error(errorMsg);
          }

          generatedCoursivSentences.push(coursivExercise);
          progress.push(`1 exercício Coursiv gerado (afterSection: ${coursivTargetIdx}, ${coursivExercise.sentences.length} lacunas, quality: PASSED)`);
        } else {
          // Coursiv é OBRIGATÓRIO no V8-C01
          const errorMsg = `COURSIV HARD FAIL: AI returned empty or null coursiv result for section ${coursivTargetIdx}`;
          console.error(`[v8-generate] ${errorMsg}`);
          throw new Error(errorMsg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Coursiv generation failed";
        // HARD FAIL deve propagar
        if (msg.includes('HARD FAIL')) {
          throw err;
        }
        errors.push(`Coursiv: ${msg}`);
        console.error("[v8-generate-lesson-content] Coursiv generation error:", msg);
      }
```

**Motivo (3 validações + 1 gate):**
1. `sentences.length < 4` → `throw` → HTTP 500
2. `options.length !== 4` (consistente com Edição 1.2: min=4, max=4) → `throw` → HTTP 500
3. Qualquer option contém palavra banida → `throw` → HTTP 500
4. Se a IA retornou resultado vazio/null → `throw` → HTTP 500 (Coursiv é obrigatório no V8-C01)

O `catch` re-propaga erros `HARD FAIL`. Erros de rede/parsing são capturados normalmente.

---

## Resumo das 7 Edições por Fase

```text
FASE 1 — Hardening de Geração
  1.1  COURSIV_SYSTEM_PROMPT: remover exemplo ruim, proibir distratores absurdos     (L359-376)
  1.2  COURSIV_BUILDER_TOOLS: options min=4 max=4                                    (L347)

FASE 2 — Filtro Robusto + Gates Hard Fail
  2.1  INLINE_REQUIRED_DATA_KEYS: platform-match exige ['scenarios','platforms']      (L565)
  2.2  Filtro: trocar .some() por .every()                                            (L583)
  2.3  Gate V8-C01: contadores + missing sections throw + duplicate throw             (L591-596)

FASE 3 — Coursiv Quality Gate Hard Fail
  3.1  Coursiv: sentences>=4, options===4, banned words, null→throw                   (L614-634)
```

---

## Pós-Execução: Reprocessamento + Validação

1. Abrir **AdminV8Create**
2. Carregar aula `4cb60315-f8a3-4cac-bf6d-e67c90d5ffd5`
3. Clicar **"Converter e Gerar Tudo"**
4. Verificar logs:
   - `V8-C01 COUNTS: aiReturned=X, accepted>=5, rejected=Y`
   - `1 exercício Coursiv gerado (afterSection: 7, N lacunas, quality: PASSED)`
   - `JSON montado: 9 seções, X quizzes, >=5 inlineEx, 1 completeSent, Y exercícios`
   - Se `V8-C01 HARD FAIL` ou `COURSIV QUALITY GATE HARD FAIL` → a aula NÃO foi salva → tentar novamente
5. Validar no banco:

```sql
SELECT 
  jsonb_array_length(content->'sections') as sections,
  COALESCE(jsonb_array_length(content->'inlineExercises'), 0) as inline_ex,
  COALESCE(jsonb_array_length(content->'inlineCompleteSentences'), 0) as coursiv,
  COALESCE(jsonb_array_length(content->'inlinePlaygrounds'), 0) as playground
FROM lessons 
WHERE id = '4cb60315-f8a3-4cac-bf6d-e67c90d5ffd5';
```

**Resultado esperado:** `sections=9, inline_ex>=5, coursiv=1, playground=1`

---

## Comportamento do Sistema Após as 7 Edições

```text
Cenário                                    | Resultado
-------------------------------------------|---------------------------
Seção 2-6 sem exercício                    | throw → HTTP 500 → NÃO salva
Seção com 2+ exercícios                    | throw → HTTP 500 → NÃO salva
Coursiv com <4 lacunas                     | throw → HTTP 500 → NÃO salva
Coursiv com options !== 4                  | throw → HTTP 500 → NÃO salva
Coursiv com "receita de bolo" em option    | throw → HTTP 500 → NÃO salva
Coursiv null/vazio                         | throw → HTTP 500 → NÃO salva
platform-match sem 'platforms' em data     | rejeitado pelo filtro → seção faltante → throw
Tudo válido                                | salva normalmente com logs de contagem
```

