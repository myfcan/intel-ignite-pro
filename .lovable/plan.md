

## Auditoria Forense do Plano Consolidado — Dados Reais do Código

Analisei cada fase do plano contra o código-fonte real. Abaixo, os gaps reais encontrados, sem omissão.

---

### FASE 0 — Regra PASS_SCORE = 81

**Status: Plano correto, mas incompleto na cobertura.**

O plano diz "aplicar em V8PlaygroundInline e V8LessonPlayer". Mas o código real tem **4 pontos distintos** com threshold `>= 70` em `V8PlaygroundInline.tsx`:

1. **Linha 106**: `if (score >= 70)` — SFX de sucesso
2. **Linha 111**: `if (score >= 70)` — feedback message choice
3. **Linha 120-122**: `if (score >= 70)` — `onScore?.(score)` (propaga score para player)
4. **Linha 133**: `challengeScore < 70` — controle de retry
5. **Linha 438**: `challengeScore < 70` — hint on fail
6. **Linha 466**: `challengeScore < 70` — retry button visibility
7. **Linha 493**: `challengeScore >= 70` — continue button
8. **Linha 523**: `challengeScore >= 70` — "Tarefa concluída" badge
9. **Linha 535-536**: `challengeScore >= 70` — success message
10. **Linha 539**: `challengeScore >= 70` — success audio
11. **Linha 542**: `challengeScore < 70` — tryAgain audio

**Gap real:** O plano não lista esses 11 pontos. Se a constante for criada mas aplicada só em 2-3 locais, o sistema fica inconsistente. Precisa de um find-and-replace exaustivo de `>= 70` e `< 70` neste arquivo.

Adicionalmente, em `V8LessonPlayer.tsx` linha 89-95, `isInsightUnlockable` usa `score >= 70`:
```typescript
const score = state.playgroundScores[prevItem.playground.id];
return score !== undefined && score >= 70;
```
Esse é o **12o ponto** que precisa mudar.

---

### FASE 1 — UX Insight Bloqueado + Refazer Desafio

**Status: Plano correto em conceito, mas tem um gap de implementação de scroll.**

O plano diz: "V8LessonPlayer localiza playground anterior no timeline e faz scrollIntoView no retry".

**Gap real:** O `itemRefs` no `V8LessonPlayer.tsx` (linha 46) armazena refs **por índice do timeline**, não por tipo. Para o scroll funcionar, o `onRetryPlayground` precisa:

1. Encontrar o índice do playground anterior no `timeline` a partir do índice do insight atual
2. Usar `itemRefs.current[playgroundIdx]` para scroll

Isso é viável com o código atual, mas **o plano não especifica que o playground precisa ser "reativado"**. Quando o usuário scrolla de volta ao playground, ele já estará no estado `done` (phase = "done") e o `isActive` será `false`. O playground **não reseta automaticamente** — o usuário verá o card de "Tarefa concluída" sem possibilidade de refazer.

**Correção necessária:** O scroll sozinho **não basta**. O `V8PlaygroundInline` tem um botão "Repetir tarefa" (linha 548-556) que reseta o estado interno, mas ele só aparece quando `onContinue` existe (ou seja, quando é o item ativo). Com `isActive=false`, esse botão pode não estar visível.

Opções reais:
- (A) Ao clicar "Refazer Desafio" no insight, **resetar o currentIndex do player** para o índice do playground (via novo callback `goToIndex`), tornando-o o item ativo novamente. Isso tem side-effect: o timeline "retrocede".
- (B) Manter scroll visual + forçar re-render do playground com um `retryKey` incrementado. Mais complexo.

A opção (A) é mais simples e alinhada com a UX desejada. O plano precisa incluir um `goToIndex(idx)` no `useV8Player`.

---

### FASE 2 — Remover Falso Positivo de Claim

**Status: Plano correto. O código real confirma o problema.**

Linha 74-77 de `V8InsightReward.tsx`:
```typescript
} catch (err) {
  console.warn("[V8InsightReward] Claim timeout/error, applying optimistic:", err);
  setClaimed(true);
  confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
}
```

O catch **marca como claimed** e **dispara confetti** em caso de erro/timeout. Isso é o falso positivo. Remover é direto.

Sem gaps adicionais.

---

### FASE 3 — Anti-Cópia no Avaliador

**Status: Gap grave — o plano não envia os dados de contexto do frontend.**

O código real de `V8PlaygroundInline.tsx` (linhas 91-98) envia ao `v8-evaluate-prompt`:
```typescript
body: {
  mode: "evaluate",
  userPrompt: userPrompt.trim(),
  evaluationCriteria: playground.userChallenge.evaluationCriteria,
  rubric: playground.userChallenge.scoring?.rubric,
  maxScore: playground.userChallenge.scoring?.maxScore ?? 100,
}
```

**Faltam no body atual:** `professionalPrompt`, `amateurPrompt`, `professionalResult`, `amateurResult`, `challengePrompt`. Sem esses campos, o backend **não tem contra o que comparar** para detectar cópia.

O plano diz "enviar contexto completo" mas não detalha **quais campos exatos** precisam ser adicionados ao body. Isso pode ser esquecido na implementação.

**Além disso:** O `v8-evaluate-prompt` (linhas 59-105) atualmente **não recebe** esses campos e o system prompt não instrui a IA a detectar cópia. O plano precisa de:
1. Frontend: adicionar ao body `{ professionalPrompt, amateurPrompt, professionalResult, amateurResult }`
2. Backend: receber esses campos, fazer comparação de similaridade server-side **antes** de chamar a IA (normalizar + Levenshtein/Jaccard simples em Deno)
3. Se similaridade > threshold: retornar `{ score: 0, passed: false, is_copy: true }` sem gastar chamada de IA

A detecção **não pode depender da IA** para ser confiável — deve ser algorítmica no servidor.

---

### FASE 4 — Backend como Fonte de Verdade

**Status: Gap estrutural — tabela `user_playground_sessions` já existe mas com schema incompatível.**

Schema atual de `user_playground_sessions`:
```
- id uuid (PK)
- user_id uuid
- lesson_id uuid       ← tipo UUID, não text
- tokens_used integer
- user_prompt text
- ai_response text
- ai_feedback text
- created_at timestamp
```

**Colunas faltantes para o plano:**
- `playground_id text` — não existe
- `score integer` — não existe
- `passed boolean` — não existe
- `is_copy boolean` — não existe
- `similarity numeric` — não existe
- `evaluation_payload jsonb` — não existe

O plano diz "adicionar colunas estruturais". Isso é correto. Mas tem um detalhe: `lesson_id` é do tipo `uuid`, e o `V8PlaygroundInline` **não recebe** `lessonId` como prop atualmente. Para persistir a tentativa, o frontend precisa passar `lessonId` ao `v8-evaluate-prompt`, que hoje também não o recebe.

**Correção:** Propagar `lessonId` do `V8LessonPlayer` → `V8PlaygroundInline` → body do `v8-evaluate-prompt`.

**Segundo gap:** O `register_gamification_event` é uma DB function PL/pgSQL. Para validar a última tentativa, ela precisaria fazer um `SELECT` em `user_playground_sessions`. Mas o `insight_claimed` event recebe `event_reference_id` (que é o `insight.id`), **não o `playground_id`**. A function precisaria:
1. Receber `playground_id` no payload (`p_payload->>'playground_id'`)
2. Fazer lookup: `SELECT score, is_copy FROM user_playground_sessions WHERE user_id = v_user_id AND playground_id = p_payload->>'playground_id' ORDER BY created_at DESC LIMIT 1`
3. Se `score < 81 OR is_copy = true`: setar `v_xp_delta = 0, v_coins_delta = 0`

O plano menciona isso vagamente mas não especifica que o `playground_id` precisa ser adicionado ao payload do `handleClaim` em `V8InsightReward.tsx`. Atualmente (linha 59):
```typescript
registerGamificationEvent("insight_claimed", insight.id, {
  credits: insight.creditsReward,
})
```
Falta `playground_id` no objeto de payload. E o `V8InsightReward` **não recebe** `playgroundId` como prop.

**Cadeia de propagação necessária:**
`V8LessonPlayer` → calcula `playgroundId` do playground anterior → passa como prop para `V8InsightReward` → inclui no payload de `registerGamificationEvent`.

---

### FASE 5 — Playground Clímax na Última Seção

**Status: Plano quase correto, mas tem gap no caso "apenas manuais".**

Código real (linhas 471-516):
- Linha 477: `if (!hasPlaygroundAtLast && generatedPlaygrounds.length > 0)` — **só move gerados**
- Linha 495: `else if (!hasPlaygroundAtLast && allPg.length === 0 && sections.length >= 4)` — cria placeholder se **zero playgrounds**

**Gap confirmado:** Se `manualPlaygrounds.length > 0` e `generatedPlaygrounds.length === 0` e nenhum está no `lastIdx`:
- Condição 1 falha (`generatedPlaygrounds.length > 0` é false)
- Condição 2 falha (`allPg.length === 0` é false, porque existem manuais)
- Resultado: **nenhuma ação**. Playground manual fica onde está.

O plano propõe "duplicar/mover o manual de maior índice". Isso é correto como conceito, mas "duplicar" gera um playground com os mesmos dados na última seção E na posição original. Isso pode confundir o aluno (vê o mesmo desafio duas vezes). **Mover** é mais limpo.

**Risco adicional:** O código usa `manualPlaygrounds` e `generatedPlaygrounds` como arrays separados. Mover um manual requer alterar `manualPlaygrounds[i].afterSectionIndex`, que é uma referência direta ao objeto no `lessonData.inlinePlaygrounds`. Isso funciona, mas precisa ser feito com cuidado para não corromper dados que serão persistidos.

---

### FASE 6 — Imagem com Loading Profissional

**Status: Gap real confirmado no código.**

O `V8TrimmedImage` atual (linhas 29-156 de `V8ContentSection.tsx`) tem estes problemas reais:

1. **Linha 147**: Quando `resolvedSrc` é null (processing), renderiza `<div className="w-full max-w-[300px] aspect-square mx-auto" />` — um div **vazio e transparente**. Sem skeleton, sem shimmer, sem indicação visual de loading. Isso é o "amador".

2. **Sem `decode()`**: O código faz `requestAnimationFrame` para atrasar `setVisible(true)`, mas **não usa `img.decode()`**. Isso significa que em browsers rápidos com cache, a imagem pode renderizar parcialmente antes do fade completar.

3. **Cache hit com rAF desnecessário**: Nas linhas 39-41, quando há cache hit, o componente seta `visible=true` sincronamente. Porém, no `useState` inicial (linhas 31-32), se o cache já existe, `visible` começa como `true` — ou seja, **não há transição nenhuma** no cache hit (correto, não é um bug, mas o plano propõe "sempre iniciar em opacidade 0" o que quebraria isso).

**Correção do plano para imagem:**
- Adicionar skeleton/shimmer visual no estado `resolvedSrc === null`
- Usar `img.decode()` antes de `setVisible(true)` para garantir que o frame de opacidade 0 ocorra antes do browser pintar pixels
- **Não** forçar fade em cache hit (seria regressão visual — a imagem já processada deve aparecer imediatamente)

---

### GAPS ADICIONAIS NÃO COBERTOS PELO PLANO

**Gap A — `onScore` só é chamado com `score >= 70`**

`V8PlaygroundInline.tsx` linha 120-122:
```typescript
if (score >= 70) {
  onScore?.(score);
}
```

Se o score for < 70, `onScore` **nunca é chamado**, e `playgroundScores` no player **nunca recebe o valor**. Isso significa que `isInsightUnlockable` no `V8LessonPlayer` (que checa `state.playgroundScores[prevItem.playground.id]`) vai ter `score === undefined` e retornar `true` pelo fallback "No preceding playground found".

**Consequência:** Se o usuário tira 50, o insight aparece como **desbloqueável** porque o score nunca foi registrado. O guard falha silenciosamente.

**Correção:** `onScore` deve ser chamado **sempre**, independente do score. A decisão de unlock deve ser feita no `isInsightUnlockable` baseada no valor real.

**Gap B — Temperatura da IA não está configurada**

O `v8-evaluate-prompt` (linha 122-126) usa:
```typescript
body: JSON.stringify({
  model: "google/gemini-2.5-flash-lite",
  messages,
}),
```

**Não há `temperature`** no body. O plano propõe "temperatura baixa/zero" mas o modelo `gemini-2.5-flash-lite` pode não suportar `temperature: 0` via Lovable AI gateway (depende da API). Precisa ser testado. Se não suportar, a variância permanece.

---

### RESUMO: GAPS REAIS ENCONTRADOS

| # | Gap | Severidade | Fase afetada |
|---|-----|-----------|-------------|
| 1 | 11 pontos de `>= 70` em V8PlaygroundInline, plano não enumera | Média | Fase 0 |
| 2 | Scroll de retry não reseta estado do playground (precisa `goToIndex`) | **Alta** | Fase 1 |
| 3 | Frontend não envia `professionalPrompt`/`amateurPrompt` ao avaliador | **Alta** | Fase 3 |
| 4 | Anti-cópia depende de IA no plano, deveria ser algorítmico server-side | Média | Fase 3 |
| 5 | `playground_id` não propagado: LessonPlayer → InsightReward → gamification payload | **Alta** | Fase 4 |
| 6 | `lessonId` não propagado: LessonPlayer → PlaygroundInline → evaluate body | **Alta** | Fase 4 |
| 7 | Manual playgrounds: "duplicar" cria confusão, "mover" é mais limpo | Baixa | Fase 5 |
| 8 | Skeleton/shimmer ausente no placeholder de loading da imagem | Média | Fase 6 |
| 9 | `onScore` condicionado a `>= 70` — scores baixos nunca registrados, guard falha | **Crítica** | Fase 0/4 |
| 10 | Temperatura da IA não configurada no body da request | Média | Fase 3 |

**Veredicto:** O plano cobre os problemas certos mas tem **4 gaps de severidade alta/crítica** que causariam falhas silenciosas na implementação. O Gap 9 é o mais grave: todo o sistema de insight lock/unlock depende de `playgroundScores`, mas scores < 70 nunca são registrados, então o guard **sempre retorna true** para tentativas fracassadas.

