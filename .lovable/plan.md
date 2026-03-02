
Diagnóstico confirmado: sim, eu percebi o problema e ele está reproduzível com evidência real de sessão.

1) Evidências reais (código + replay)
- Arquivo real: `src/components/lessons/v8/V8LessonPlayer.tsx` (linhas 77–87)
```tsx
useEffect(() => {
  if (state.phase === "content" && state.currentIndex > 0) {
    const timer = setTimeout(() => {
      itemRefs.current[state.currentIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
    return () => clearTimeout(timer);
  }
}, [state.currentIndex, state.phase]);
```
Leitura técnica: o auto-scroll só dispara quando `state.currentIndex` muda (troca de item do timeline).

- Arquivo real: `src/components/lessons/v8/V8PlaygroundInline.tsx`
  - NÃO existe `useEffect` com `scrollIntoView`.
  - NÃO existe `ref` âncora de scroll (como no quiz).
  - A troca “Agora o Profissional” → “professional” acontece por estado local:
```tsx
const [phase, setPhase] = useState<Phase>("intro");
...
setPhase(nextPhase);
```

- Arquivo real: `src/components/lessons/v8/V8QuizInline.tsx` (linhas 24–36) já tem o padrão correto interno:
```tsx
const bottomRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (selected || state !== "answering") {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 150);
    return () => clearTimeout(timer);
  }
}, [selected, state]);
```

- Replay real (`tool-results://lov-read-session-replay/20260302-010935-097576`):
  - Clique no botão em `timestamp: 1772413703156` (eventos pointer/click no id 7118).
  - Troca de DOM para fase profissional em `timestamp: 1772413703582` (aparecem nós com “Profissional”, “Resultado” e botão “Comparar”).
  - Primeiro evento de scroll (`source:3`) só em `timestamp: 1772413744773` (depois `1772413744873`, `1772413744977`), ~41.6s após o clique.
  - Conclusão objetiva: no clique de troca de fase do playground, não houve autoajuste de scroll.

- Console do preview: `No logs found`.
  - Timestamp de erro de console: NÃO LOCALIZADO NO CÓDIGO / NÃO HOUVE LOG CAPTURADO.

2) Causa raiz (precisa)
- O scroll global do player já foi corrigido para seções/timeline (`block: "start"` + `scrollMarginTop`), mas isso não cobre transições internas do playground.
- Em playground, “Ver prompt profissional” altera apenas `phase` local; como `currentIndex` não muda, o `useEffect` do `V8LessonPlayer` não executa.
- Resultado: conteúdo muda de altura e o CTA pode ficar fora do viewport sem ajuste automático.

3) Gaps identificados
- Gap 1: ausência de âncora e efeito de scroll no `V8PlaygroundInline`.
- Gap 2: ausência de regra explícita “garantir CTA visível após troca de fase”.
- Gap 3: sem telemetria interna de scroll no playground (não há logs instrumentados para esse componente).
- Banco de dados para esse bug: NÃO LOCALIZADO NO CÓDIGO (não há dependência de backend para a falha observada).

4) Plano de correção (implementação proposta)
Arquivo alvo único: `src/components/lessons/v8/V8PlaygroundInline.tsx`

Passo A — adicionar âncora de scroll no rodapé do playground
- Incluir `const bottomRef = useRef<HTMLDivElement>(null);`
- Renderizar `<div ref={bottomRef} />` ao final do componente (padrão igual ao quiz).

Passo B — adicionar efeito de autoajuste nas mudanças de fase
- Criar `useEffect` para disparar após mudanças relevantes do playground:
  - dependências: `phase`, `isLoadingResult`, `isEvaluating`, `feedback`, `challengeScore`
- Regra:
  - só executar quando a fase não for `"intro"` e não estiver carregando avaliação/resultado.
  - `setTimeout` curto (150–180ms) para esperar `AnimatePresence` finalizar layout.
  - chamar:
```tsx
bottomRef.current?.scrollIntoView({
  behavior: "smooth",
  block: "nearest",
});
```

Passo C — manter comportamento atual já aprovado
- Não alterar `onContinue` do playground (transição para item seguinte continua igual).
- Não alterar `advance` do `V8LessonPlayer`.
- Não alterar fluxo de quizzes e seções que já está correto.

5) Critérios de aceite (objetivos)
- Ao clicar “Agora o Profissional”, o botão da fase atual (“Comparar”) deve ficar visível sem scroll manual.
- Ao clicar “Comparar” e entrar em “Sua Vez!/Continuar”, CTA também deve ficar visível.
- Nenhuma regressão no fluxo:
  - seção → playground,
  - playground → próximo item,
  - modo leitura/escuta,
  - quiz com seu próprio ajuste de scroll.

6) Risco e probabilidade de êxito
- Probabilidade estimada de sucesso desta técnica: 93%.
- Justificativa:
  - Usa padrão já validado no projeto (`V8QuizInline` com `bottomRef + scrollIntoView nearest`).
  - Atua exatamente no ponto onde o bug acontece (transição interna do playground).
- Risco residual (7%):
  - variação de viewport muito baixa + conteúdo excepcionalmente alto pode exigir ajuste fino do delay (150→220ms) ou ajuste de estratégia para `block: "start"` em casos específicos.

7) Validação pós-correção (com evidência real)
- Repetir o mesmo clique no playground e confirmar no replay:
  - clique “Agora o Profissional” + evento de scroll `source:3` em até ~500ms após o clique.
- Confirmar visualmente que o CTA da nova fase aparece no viewport sem interação manual adicional.
