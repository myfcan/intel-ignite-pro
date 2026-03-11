

# Auditoria de Diligência — Plano de 5 Correções

## Verificação: Dados Reais vs. Achismo

| # | Afirmação do Plano | Evidência no Código | Veredicto |
|---|-------------------|---------------------|-----------|
| **Vuln 1** | `META_KEYWORDS` na L56 gera falso positivo | **REAL** — L56: `const META_KEYWORDS = /\b(parser\|fix\|opcional\|discutimos\|TODO\|FIXME\|implementar\|corrigir\|descrição opcional)\b/i;` L60: `if (description && description.trim().length > 20 && !META_KEYWORDS.test(description))` | ✅ Confirmado |
| **Vuln 1 (mecanismo)** | `\b` sem flag `u` gera falso positivo em texto acentuado | **PARCIALMENTE ACHISMO** — A regex não tem flag `u`, isso é real. Porém eu NÃO TENHO LOG REAL mostrando qual keyword fez match. O mecanismo `\b` + acentos é uma hipótese técnica válida, mas não tenho prova forense de QUAL palavra disparou `metaMatch: true`. | ⚠️ Hipótese forte, não prova |
| **Vuln 2** | Merge posicional no refine sobrescreve Section 0 | **REAL** — L587-591: `for (let i = 0; i < parsed.sections.length && i < refineResult.sections.length; i++) { parsed.sections[i].content = refineResult.sections[i].content; }` — merge por índice, sem proteção de título | ✅ Confirmado |
| **Vuln 3** | Sem hard gate antes de salvar | **REAL** — L734-752: nenhuma validação de `sections[0].title === "Abertura"` nem `sections.length >= 9`. Existe apenas o gate de `totalInteractions < 2` na L758, que verifica exercícios, não seções. | ✅ Confirmado |
| **Vuln 4** | V8_C01_MAP shift quando 8 seções | **REAL** — L625: `const lastIdx = sections.length - 1;` L626: `coursivTargetIdx = lastIdx >= 4 ? lastIdx - 1 : -1`. Com 8 seções: lastIdx=7, coursivTargetIdx=6, que colide com `V8_C01_MAP[6]` (timed-quiz). Porém, L646 faz `if (i === coursivTargetIdx) continue;`, então o timed-quiz é **PULADO**, não duplicado. | ✅ Confirmado (consequência de Vuln 1) |
| **Vuln 7** | Refine pode reordenar seções | **REAL MAS BAIXA PROBABILIDADE** — O prompt (L30) diz "Copie-os EXATAMENTE" e L50 diz "manter o mesmo título". NÃO proíbe explicitamente reordenação. A Gemini PODE reordenar, mas é improvável dado que recebe seções numeradas (`### Seção 1`, `### Seção 2`). | ✅ Vulnerabilidade real, risco baixo |

---

## O que é ACHISMO que preciso declarar

**Eu NÃO tenho o log real** do processamento que mostra `metaMatch: true` para o conteúdo "Olá a todos!". Eu inferi isso porque:
1. O parser produz 8 seções (você confirmou)
2. O único caminho no código que produz 8 em vez de 9 é o `else` na L68 (`Section 0 SKIPPED`)
3. O único bloqueio nesse `if` é `!META_KEYWORDS.test(description)`

A hipótese do `\b` sem `u` é tecnicamente sólida, mas a causa exata pode ser outra — por exemplo, a palavra **"opcional"** na regex poderia fazer match com algum trecho do texto via boundary artifacts. O conteúdo bruto NÃO contém nenhuma das keywords literais, confirmando que o match é um falso positivo do regex engine.

---

## Coerência do Plano com Tags Emocionais + PT-BR

| Requisito | Status no Plano |
|-----------|----------------|
| Tags emocionais preservadas no parser | ✅ A Correção A remove `META_KEYWORDS` mas NÃO toca na whitelist `ELEVENLABS_EMOTION_TAGS` em `v8TextSanitizer.ts` — tags continuam preservadas |
| Tags emocionais preservadas no refine | ✅ O prompt do refine (L30) já diz "tags de emoção/prosódia como [excited], [pause]... Copie-os EXATAMENTE". Correção D reforça mas não conflita |
| Tags emocionais preservadas no TTS | ✅ `v8-generate-section-audio` L168-170: `stripMarkdownForTTS` preserva tags da whitelist, strip apenas markdown |
| Narração PT-BR | ✅ `language_code: 'pt'` no TTS (L115 de `v8-generate-section-audio`), sem prefixo `[Brazilian Portuguese accent]` |
| Nenhuma correção quebra tags/PT-BR | ✅ Nenhuma das 5 correções toca em `ELEVENLABS_EMOTION_TAGS`, `language_code`, `VOICE_ID` ou `MODEL_ID` |

---

## Plano Revisado Final — 5 Correções

### A — Remover META_KEYWORDS (`v8ContentParser.ts` L56-60)
Remover L56 (`META_KEYWORDS`), L58 (`metaMatch`), e `!META_KEYWORDS.test(description)` da L60. Manter `descLen > 20`.

### B — Proteger Section 0 no merge do refine (`AdminV8Create.tsx` L587-591)
Se `parsed.sections[0].title === "Abertura"` e `refineResult.sections[0]?.title` não contém "Abertura", iniciar o loop em `i = 1` e fazer offset: `parsed.sections[i].content = refineResult.sections[i-1].content`.

### C — Hard gate antes de salvar (`AdminV8Create.tsx`, antes de L734)
```text
if (finalSections.length < 9 || finalSections[0]?.title !== "Abertura") {
  addLog('error', 'V8-C01 VIOLATION: Section 0 ausente');
  throw new Error('Pipeline abortado');
}
```

### D — Proibir reordenação no prompt do refine (`v8-refine-content/index.ts` L149)
Adicionar ao `userPrompt`: "Retorne na MESMA ORDEM. NÃO renomeie 'Abertura'."

### E — Validação server-side no refine (`v8-refine-content/index.ts`, após L196)
Se `sections[0].title` contém "Abertura" e `refinedSections[0].title` não, restaurar `sections[0]` original.

### Arquivos impactados: 3
1. `src/lib/v8ContentParser.ts` — Correção A
2. `src/pages/AdminV8Create.tsx` — Correções B + C
3. `supabase/functions/v8-refine-content/index.ts` — Correções D + E

