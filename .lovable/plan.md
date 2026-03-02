
Diagnóstico objetivo (com dados reais do código atual)

1) O padding/alinhamento do título NÃO foi alterado no motor de rolagem principal.
Trechos reais:
```ts
// src/components/lessons/v8/v8ScrollUtils.ts
export const V8_SAFE_TOP = 88;      // linha 7
```
```ts
// src/components/lessons/v8/V8LessonPlayer.tsx
const SECTION_TOP_OFFSET = 88;      // linha 49
style={{ scrollMarginTop: `${SECTION_TOP_OFFSET}px` }} // linha 153
```
Conclusão: a régua de topo continua 88px.

2) O “rolo” mantém itens anteriores montados (comportamento cumulativo), então efeitos atrasados de itens anteriores podem disparar depois do avanço.
Trecho real:
```tsx
// src/components/lessons/v8/V8LessonPlayer.tsx
{timeline.slice(0, state.currentIndex + 1).map((item, idx) => { ... }} // linha 144
```

3) Hoje, Quiz e Playground agendam auto-scroll interno com timer (300ms/600ms), mas sem trava de “item ativo”.
Trechos reais:
```tsx
// src/components/lessons/v8/V8PlaygroundInline.tsx
useEffect(() => {
  if (phase === "intro" || phase === "done") return;
  if (isLoadingResult || isEvaluating) return;
  return scheduleCTAScroll(() => ctaRef.current, () => bottomRef.current);
}, [phase, isLoadingResult, isEvaluating, feedback, challengeScore]); // linhas 129-137
```
```tsx
// src/components/lessons/v8/V8QuizInline.tsx
useEffect(() => {
  if (!selected && state === "answering") return;
  return scheduleCTAScroll(() => ctaRef.current);
}, [selected, state]); // linhas 28-32
```

4) Prova de rolagem automática em runtime (replay real):
- eventos de scroll automáticos (`source:3`) em sequência com timestamps:
  - `1772475350002` (y=2460.5)
  - `1772475350328` (y=2465.5)
  - `1772475350428` (y=2588.5)
  - `1772475350528` (y=3111)
  - `1772475350628` (y=3418)
  - `1772475350728` (y=3562.5)
  - `1772475350828` (y=3643.5)
  - `1772475350928` (y=3689)
  - `1772475351028` (y=3712)
  - `1772475351128` (y=3719)
- inserção do card “Boa! Você colocou contexto e objetivo...” em `1772475354811`.

Causa raiz provável (precisa e alinhada ao código)

- A regressão não é “padding do título”.
- O problema é concorrência entre:
  1) scroll externo de âncora do rolo (V8LessonPlayer),
  2) timers de auto-scroll interno (Quiz/Playground) que continuam válidos e podem disparar quando o item já deixou de ser o item ativo.
- Como os itens anteriores permanecem montados no rolo cumulativo, esse conflito ficou mais visível no mobile.

Plano de correção (sem banco, sem backend, apenas frontend)

Arquivos a alterar:
- `src/components/lessons/v8/V8LessonPlayer.tsx`
- `src/components/lessons/v8/V8QuizInline.tsx`
- `src/components/lessons/v8/V8PlaygroundInline.tsx`

Passo 1 — Introduzir noção explícita de “item ativo”
- Passar `isActive={isLast}` para Quiz e Playground no `V8LessonPlayer`.
- Hoje já existe `isLast` (linha 145), então só propagar.

Passo 2 — Bloquear auto-scroll interno quando item não está ativo
- Em `V8QuizInline`, adicionar guarda no effect:
  - se `!isActive`, não agendar `scheduleCTAScroll`.
- Em `V8PlaygroundInline`, idem:
  - se `!isActive`, não agendar;
  - manter regra atual de não rolar em `intro` e `done`.

Passo 3 — Cancelamento defensivo de timer antes de avançar
- Guardar retorno de `scheduleCTAScroll` em ref de cleanup.
- Antes de chamar `onContinue` (ou `setPhase("done")`), limpar timer pendente.
- Isso elimina a janela de corrida quando o usuário avança muito rápido (<300ms).

Passo 4 — Não mexer nas regras estruturais do rolo
- Não alterar:
  - `SECTION_TOP_OFFSET = 88`
  - `scrollMarginTop`
  - double `requestAnimationFrame`
  - anti-drift de 420ms.
- Assim preserva o setup que já funciona.

Validação pós-correção (obrigatória)

1) Mobile:
- Fluxo Playground até feedback (“Boa!...”).
- Esperar 1-2s sem tocar: tela não deve “subir sozinha” para título.

2) Transição rápida:
- Clicar “Continuar” imediatamente após aparecer CTA.
- Deve permanecer no item novo, sem snap de retorno.

3) Alinhamento de topo:
- Ao entrar no novo item, título deve ficar respeitando offset do header (88px), sem cortar.

4) Regressão cruzada:
- Repetir no Quiz (correto/errado + continuar), porque usa mesmo mecanismo de timer.

Escopo e risco

- Escopo: 3 arquivos frontend.
- Banco de dados: 0 mudanças.
- Funções backend: 0 mudanças.
- Risco: baixo/médio (ajuste de coordenação de scroll).
- Benefício: elimina jump aleatório sem tocar no padrão de padding/âncora do rolo.

Observação de integridade técnica

- “Qual timer específico causou o salto exato em cada frame” com rastreio completo de stack não está visível no replay truncado em um ponto (`data.truncated`); detalhe forense de call stack: NÃO LOCALIZADO NO CÓDIGO/LOG DISPONÍVEL.
- Mesmo assim, o padrão de conflito entre timer interno e item não ativo está diretamente comprovado pelos trechos reais acima e pela arquitetura cumulativa atual.
