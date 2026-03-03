  
Atue como um engenheiro sênior responsável pelo sistema V8 de todo o sistema e banco de dados, atue com obrigação de precisão técnica absoluta.  
Auditoria do Plano — 7 Gaps Reais Identificados

Analisei cada fase do plano consolidado contra o código-fonte real. O diagnóstico dos 8 problemas está correto, mas o plano de correção tem gaps que causariam falhas na implementação.  


&nbsp;

REGRA DESTE PROMPT:  
  
Execute todo o plano, mas caso não execute algo ou algum item por alguma razão, você é obrigado é dizer:  
Não implementei todo o plano ou não executei todas asa correções. 

Você NÃO pode mentir.

Você NÃO pode supor.

Você NÃO pode responder com explicações genéricas.

Você NÃO pode omitir dados.

Você deve executar tudo com DADOS REAIS do código atual.

Você deve copiar e colar trechos REAIS do código.

Você deve usar logs reais e timestamps reais.

Se não souber algo, diga explicitamente: “NÃO LOCALIZADO NO CÓDIGO”.  
  
TUDO ISSO É MANDATÓRIO

&nbsp;

---

### Gap 1: Sanitização NÃO restaura caracteres perdidos (Fase 1)

O plano propõe `text.replace(/\s{2,}/g, ' ')` e detecção de palavras corrompidas. Mas isso apenas colapsa espaços duplos — **não restaura "é", "ã", "ê" perdidos**. "Um prompt curto  vago" continuaria como "Um prompt curto vago" (sem o "é").

A detecção via regex (`/(n o|ausncia|especfico)/g`) pode alertar, mas não corrigir automaticamente sem um dicionário de mapeamento ou re-geração do campo.

**Correção do plano:** A sanitização deve incluir um mapa de correções conhecidas (`{"n o": "não é", "ausncia": "ausência", "especfico": "específico", "til": "útil", "informaes": "informações"}`). Se uma palavra corrompida é detectada, aplicar correção. Se o texto ainda tiver duplos espaços após correção, logar warning e re-gerar o campo via nova chamada à IA (single field, barato).

---

### Gap 2: Playground final — lógica de posicionamento incompleta (Fase 7)

O plano diz "forçar playground com `afterSectionIndex = sections.length - 1`". Mas no código real (linha 380):

```typescript
const sectionsForPlayground = sectionsNeedingInteraction.filter((_: number, i: number) => i % 3 === 1);
```

`sectionsNeedingInteraction` exclui seções que JÁ têm quiz ou playground manual. Se a última seção já recebeu um quiz gerado (etapa 2), ela NÃO está em `sectionsNeedingInteraction` e o playground nunca será atribuído a ela.

**Correção do plano:** A lógica deve ser:

1. Gerar quizzes normalmente (etapa 2)
2. Gerar playgrounds normalmente (etapa 3)
3. **Pós-processamento:** Verificar se algum playground tem `afterSectionIndex === lastIndex`. Se não, mover o playground com maior `afterSectionIndex` para `lastIndex`. Se houver quiz em `lastIndex`, mover esse quiz para a penúltima seção livre. Se não há nenhum playground gerado, forçar geração de 1 playground para `lastIndex`.

---

### Gap 3: Insight condicional — player não rastreia scores por item (Fase 3)

O plano diz "o timeline sabe se o playground anterior teve score >= 70". Mas no código real (`useV8Player.ts`, linha 116-118):

```typescript
const addScore = useCallback((score: number) => {
    setState((prev) => ({ ...prev, scores: [...prev.scores, score] }));
}, []);
```

`scores[]` é um array flat sem nenhum mapeamento para timeline items. O player **não sabe** qual score pertence a qual playground.

**Correção do plano:** Adicionar ao state um `Map<string, number>` (`playgroundScores`) indexado por `playground.id`. No `V8LessonPlayer.tsx`, quando `V8PlaygroundInline` chama `onScore(s)`, gravar `playgroundScores[playground.id] = s`. Depois, ao renderizar `V8InsightReward`, buscar o playground imediatamente anterior na timeline e checar seu score.

---

### Gap 4: Complete-sentence inline desapareceu do plano consolidado (Problema 4)

O Problema 4 analisa corretamente a necessidade de criar `V8CompleteSentenceInline`. Mas nas **Fases de Correção Consolidadas** (Fase 1-7), esse item **não aparece**. Foi esquecido.

**Correção do plano:** Adicionar Fase 4.5 — "Criar `V8CompleteSentenceInline` como novo tipo de timeline". Requer:

- Novo tipo `"complete-sentence"` no `TimelineItem` union (`useV8Player.ts`, linha 14-18)
- Novo campo `inlineCompleteSentences` na `V8LessonData`
- Renderização no `V8LessonPlayer.tsx` dentro do timeline loop
- Geração no pipeline com tool schema dedicado

---

### Gap 5: Fill-blank chips sem dados no pipeline (Fase 5)

O plano propõe criar `V8QuizFillBlankChips` com chips arrastáveis, mas o schema QUIZ_TOOLS (linhas 47-97) **não inclui `chipOptions**`. A IA não geraria esse campo.

**Correção do plano:** Adicionar ao schema `QUIZ_TOOLS` (linha 86-87):

```
chipOptions: { type: "array", items: { type: "string" }, description: "Opções de chip para fill-blank (corretas + distratoras). Required for fill-blank." }
```

E no `QUIZ_SYSTEM_PROMPT`, instruir: "Para fill-blank, gere chipOptions com 4-6 opções incluindo a correta e distratoras plausíveis."

---

### Gap 6: Créditos → XP quebra a função do banco (Fase 6)

O plano diz "renomear `creditsReward` para `xpReward`". Mas a DB function `register_gamification_event` (código real):

```sql
ELSIF p_event_type = 'insight_claimed' THEN
    v_xp_delta := 10;
    v_coins_delta := COALESCE((p_payload->>'credits')::INTEGER, 10);
```

Se o campo mudar para `xpReward` no front, o `payload` enviado usará `xp` em vez de `credits`, e `v_coins_delta` cairá no fallback `10` em vez de ler o valor real.

**Correção do plano:** A mudança deve ser **apenas cosmética na UI** — manter o campo `creditsReward` nos dados e `credits` no payload, mas trocar a label exibida de "créditos" para "XP". Alternativamente, atualizar a DB function para ler `(p_payload->>'xp')` junto com o rename.

---

### Gap 7: Rotação de quizzes sem ordenação por afterSectionIndex (Fase 2)

O plano diz "se dois quizzes consecutivos têm o mesmo quizType, rotacionar". Mas "consecutivos" no array gerado pode não corresponder à ordem real da timeline. Quizzes devem ser ordenados por `afterSectionIndex` **antes** de verificar consecutividade.

**Correção do plano:** Após geração, ordenar `generatedQuizzes.sort((a, b) => a.afterSectionIndex - b.afterSectionIndex)` e então aplicar rotação nos consecutivos do mesmo tipo.

---

## Plano Consolidado Corrigido (versão final)


| Fase | Escopo                                                                            | Arquivos                                                                                                           | Gap corrigido |
| ---- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------- |
| 1    | Sanitização + mapa de correções + re-geração condicional                          | `v8-generate-lesson-content/index.ts`                                                                              | Gap 1         |
| 2    | Rotação quiz com sort por afterSectionIndex                                       | `v8-generate-lesson-content/index.ts`                                                                              | Gap 7         |
| 3    | Playground forçado na última seção (pós-processamento)                            | `v8-generate-lesson-content/index.ts`                                                                              | Gap 2         |
| 4    | Insight condicional com `playgroundScores` map                                    | `useV8Player.ts`, `V8LessonPlayer.tsx`, `V8InsightReward.tsx`                                                      | Gap 3         |
| 5    | Confetti no desbloqueio XP                                                        | `V8InsightReward.tsx`                                                                                              | —             |
| 6    | Label "créditos" → "XP" (cosmético, sem rename de campo)                          | `V8InsightReward.tsx`                                                                                              | Gap 6         |
| 7    | Fill-blank: narração engajamento + chipOptions no schema + `V8QuizFillBlankChips` | `V8QuizFillBlank.tsx`, `v8-generate-lesson-content/index.ts`                                                       | Gap 5         |
| 8    | Complete-sentence inline (novo tipo timeline)                                     | `useV8Player.ts`, `V8LessonPlayer.tsx`, `v8-generate-lesson-content/index.ts`, novo `V8CompleteSentenceInline.tsx` | Gap 4         |


**Escopo total:** ~8 arquivos, ~200 linhas de mudança. Fases 1-3 são backend (pipeline), Fases 4-8 são frontend (player/components).