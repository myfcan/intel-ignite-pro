
Objetivo: corrigir de forma determinística o auto-scroll do V8 para (1) ancorar o topo da seção com respiro fixo e (2) garantir visibilidade do CTA no Playground após transições de fase, sem depender de timing frágil de animação.

Diagnóstico forense (dados reais)

1) Código atual que ainda está em produção:
- `src/components/lessons/v8/V8LessonPlayer.tsx` (linhas 77–91)
```tsx
useEffect(() => {
  if (state.phase === "content" && state.currentIndex > 0) {
    const timer = setTimeout(() => {
      const el = itemRefs.current[state.currentIndex];
      if (el) {
        const scrollTarget = el.offsetTop - 80;
        window.scrollTo({
          top: Math.max(0, scrollTarget),
          behavior: "smooth",
        });
      }
    }, 150);
    return () => clearTimeout(timer);
  }
}, [state.currentIndex, state.phase]);
```

- O `ref` ainda está no nó animado:
```tsx
<motion.div
  ref={(el) => { itemRefs.current[idx] = el; }}
  initial={idx === state.currentIndex ? { opacity: 0, y: 30 } : false}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
```

- Há animação adicional dentro da própria seção:
`src/components/lessons/v8/V8ContentSection.tsx` (linhas 159–165), também com `motion.div` + `y:30`.

2) Playground atual:
- `src/components/lessons/v8/V8PlaygroundInline.tsx` (linhas 110–120)
```tsx
useEffect(() => {
  if (phase !== "intro" && !isLoadingResult && !isEvaluating) {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 150);
    return () => clearTimeout(timer);
  }
}, [phase, isLoadingResult, isEvaluating, feedback, challengeScore]);
```
- Hoje o ajuste é “nearest” no rodapé do bloco; isso não impõe alinhamento de topo da seção e nem garante CTA visível em todos os tamanhos de viewport.

3) Replay e timestamps reais
- Replay anterior com clique identificado:
  - `tool-results://lov-read-session-replay/20260302-010935-097576`
  - Clique no botão (id 7118): `timestamp 1772413703156`
  - DOM da fase profissional montado: `1772413703582` (nós com “Profissional”, “Resultado”, botão “Comparar”)
  - Primeiro scroll (`source:3`): `1772413744773`
  - Gap: ~41.6s sem autoajuste imediato.
- Replay mais recente:
  - `tool-results://lov-read-session-replay/20260302-013401-295798`
  - Há eventos `source:3` (scroll) em sequência (`1772414973678`...).
  - Clique exato (`source:2`) nesta captura: NÃO LOCALIZADO NO CÓDIGO.

4) Banco de dados / conteúdo (dados reais)
- Query real da aula: `92da570a-32c0-4df0-ac24-be6de43e3e0f`
- Resultado: `model=v8`, `sections_count=4`, `quizzes_count=2`, `playgrounds_count=1`.
- Título da seção reportada pelo usuário está no conteúdo real:
  - `Seção 2 — O conceito essencial: previsão de palavras`.
- Conclusão: falha é de UX/UI no player (cliente), não de persistência de dados.

5) Console
- Logs recebidos nesta execução: sem erro de runtime associado ao scroll V8.
- “stack trace de erro JS do scroll”: NÃO LOCALIZADO NO CÓDIGO.

Plano de correção (implementação)

Arquivo 1: `src/components/lessons/v8/V8LessonPlayer.tsx` (correção estrutural principal)

A. Separar “âncora de scroll” do nó animado
- Criar `anchorRefs` dedicado (não usar o `motion.div` como alvo de scroll).
- No `map` do timeline, renderizar antes do `motion.div`:
```tsx
<div
  ref={(el) => { anchorRefs.current[idx] = el; }}
  className="h-px scroll-mt-[88px]"
  aria-hidden="true"
/>
```
- Manter animação no `motion.div` visual (sem ref de scroll).

B. Trocar efeito para rolagem por âncora estática com sincronização de layout
- Substituir `setTimeout(150)+window.scrollTo(offsetTop)` por:
  - `requestAnimationFrame` duplo (2 RAF) para garantir commit/layout.
  - `anchorRefs.current[state.currentIndex]?.scrollIntoView({ behavior: "smooth", block: "start" })`.

C. Passo corretivo pós-animação (anti-deriva)
- Após ~420ms (duração da animação + margem), medir:
  - `const top = anchor.getBoundingClientRect().top`
  - alvo visual = 88px
  - se `Math.abs(top - 88) > 4`, aplicar `window.scrollBy({ top: top - 88, behavior: "auto" })`.
- Isso fecha os casos de drift residual por reflow tardio.

D. Regra de escopo
- Aplicar ancoragem “topo com respiro” para itens `section`.
- Para `quiz/playground` no avanço de timeline, manter comportamento suave sem forçar topo (evita saltos agressivos em interações).

Arquivo 2: `src/components/lessons/v8/V8PlaygroundInline.tsx` (garantia de CTA visível)

A. Preservar o `bottomRef`, mas adicionar validação geométrica de CTA
- Introduzir `ctaRef` no botão primário da fase ativa (“Agora o Profissional”, “Comparar”, “Sua Vez!/Continuar”, “Continuar Aula”).
- Após transição de fase e fim de loading/evaluating:
  - medir `ctaRect.bottom` versus `window.innerHeight - safeBottom`.
  - se CTA estiver fora, `window.scrollBy` apenas o delta necessário.

B. Timing robusto
- Disparo por `phase`, `isLoadingResult`, `isEvaluating`, `feedback`, `challengeScore`.
- Execução com 2 RAF + fallback timeout curto.
- Mantém o comportamento atual de fluxo pedagógico (sem alterar estados de negócio).

Por que essa abordagem é a mais segura
- Remove dependência do alvo animado (transform/y).
- Define referência estática de topo (scroll-margin-top) com semântica clara.
- Adiciona “correção de erro residual” baseada em medição real de viewport.
- Não altera contrato JSON, timeline do backend, nem regras de progressão.

Critérios de aceite (objetivos)

1) Seção
- Ao avançar para “O conceito essencial: previsão de palavras”, o topo do título deve parar com respiro visual no topo (target ~88px, tolerância ±4px).
- Não pode sobrar card anterior ocupando o topo da viewport acima do título alvo.

2) Playground
- Clique em “Agora o Profissional” => botão “Comparar” deve estar visível sem scroll manual.
- Clique em “Comparar” => CTA seguinte (“Sua Vez!” ou “Continuar”) deve estar visível sem scroll manual.

3) Regressão
- Sem quebrar:
  - fluxo de áudio/continuar em seções,
  - quizzes inline,
  - progressão `advance` do timeline.

Validação forense pós-fix (que vou executar após aprovação)
- Capturar novo replay e registrar:
  - timestamp do clique,
  - timestamp da mutação DOM da nova fase/seção,
  - timestamp do primeiro `source:3`,
  - delta clique→scroll esperado: curto (ordem de centenas de ms, não dezenas de segundos).
- Confirmar visualmente os 2 cenários enviados nas imagens (âncora do título + CTA visível).

Risco e mitigação
- Risco baixo: calibração do `scroll-mt` (88px) pode exigir ajuste fino por viewport.
- Mitigação: manter constante centralizada (ex.: `SECTION_TOP_OFFSET`) e ajustar uma vez após validação móvel.
- Mudanças de banco de dados: nenhuma.
