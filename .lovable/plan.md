
Você está certo em cobrar padrão. Hoje o comportamento ficou híbrido, e isso explica por que funcionou em alguns pontos e falhou de novo no “Teste na Prática — Vago vs Útil”.

Diagnóstico real do código (sem suposição)

1) O V8LessonPlayer está com padrão robusto de seção (âncora estática + anti-deriva):
Arquivo: `src/components/lessons/v8/V8LessonPlayer.tsx`
- Âncora estática:
```tsx
<div
  ref={(el) => { anchorRefs.current[idx] = el; }}
  className="h-px"
  style={{ scrollMarginTop: `${SECTION_TOP_OFFSET}px` }}
  aria-hidden="true"
/>
```
- Scroll com 2 RAF + correção:
```tsx
anchor.scrollIntoView({ behavior: "smooth", block: "start" });
...
const drift = rect.top - SECTION_TOP_OFFSET;
if (Math.abs(drift) > 4) {
  window.scrollBy({ top: drift, behavior: "auto" });
}
```

2) No Playground, a lógica ainda não está 100% padronizada nas fases:
Arquivo: `src/components/lessons/v8/V8PlaygroundInline.tsx`
- Efeito atual usa timers 300/600ms e fallback:
```tsx
const timer1 = setTimeout(() => {
  if (!scrollToCTA()) {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }
}, 300);
```
- `ctaRef` existe, mas só está ligado em botões de fases intermediárias:
  - fase amateur: `ref={ctaRef}` em “Agora o Profissional”
  - fase professional: `ref={ctaRef}` em “Comparar”
  - fase compare: `ref={ctaRef}` em “Sua Vez!/Continuar”
- Nas fases em que você relatou problema visual (“Teste na Prática”, challenge), os botões principais NÃO têm `ref={ctaRef}`:
```tsx
<button
  onClick={handleEvaluate}
  ...
>
  Avaliar Meu Prompt
</button>
```
e
```tsx
<button
  onClick={() => setPhase("done")}
  ...
>
  Continuar
</button>
```
Sem `ctaRef`, cai no fallback `bottomRef + block: "nearest"` (não determinístico para garantir CTA visível).

3) Evidência de replay desta sessão:
- Clique detectado: `timestamp 1772456921937`
- Montagem do bloco challenge (textarea + botão “Avaliar Meu Prompt”): `timestamp 1772456922242`
- Scroll determinístico do CTA nessa transição: NÃO LOCALIZADO NO TRECHO DISPONÍVEL DO REPLAY RETORNADO

Resposta direta à sua pergunta “por que não é padrão?”
- Porque hoje coexistem 3 estratégias diferentes:
  1. Seção: âncora estática + compensação fixa (robusta)
  2. Playground: timer + tentativa por `ctaRef` + fallback `nearest`
  3. Quiz: timer curto + `bottomRef nearest`
- Isso não é um padrão único de UX de rolagem; é um conjunto misto por componente.

Plano de padronização (implementação proposta)

Objetivo
Unificar o V8 inteiro em um padrão único: “scroll geométrico determinístico por alvo real de CTA/âncora, sem dependência de `nearest`”.

Mudanças planejadas

A) `src/components/lessons/v8/V8PlaygroundInline.tsx`
1. Conectar `ctaRef` em TODOS os CTAs de progressão por fase:
   - intro (Ver Prompt Amador)
   - amateur (Agora o Profissional)
   - professional (Comparar)
   - compare (Sua Vez!/Continuar)
   - challenge (Avaliar Meu Prompt e Continuar)
   - done (Continuar Aula, quando existir)
2. Substituir fallback `bottomRef.scrollIntoView({ block: "nearest" })` por ajuste geométrico explícito:
   - medir `ctaRect.top/bottom`
   - garantir janela útil com `safeTop/safeBottom`
   - aplicar `window.scrollBy` com delta exato (para cima ou para baixo)
3. Manter janela de rechecagem (300/600ms), mas com guard de idempotência para evitar sobre-scroll.

B) `src/components/lessons/v8/V8QuizInline.tsx`
1. Remover dependência de `bottomRef nearest`.
2. Aplicar a mesma função geométrica para garantir visibilidade do botão “Confirmar” e dos CTAs de continuidade após feedback.

C) Padronização interna
1. Extrair helper compartilhado para V8 (ex.: util local/hook de viewport check) usado por Quiz + Playground.
2. Padronizar constantes:
   - `SAFE_TOP` (header/respiro)
   - `SAFE_BOTTOM` (área protegida inferior)
   - `DELTA_PADDING`

Critérios de aceite (objetivos)
1. Ao entrar em “Teste na Prática — Vago vs Útil”, o botão de ação principal aparece sem scroll manual.
2. Em challenge:
   - botão “Avaliar Meu Prompt” visível na entrada de fase
   - após avaliação/retry, CTA visível sem intervenção manual
3. Em done:
   - “Continuar Aula” visível automaticamente
4. Sem regressão no scroll de seção já corrigido por âncora estática.

Risco e mitigação
- Risco: microajustes por viewport menor.
- Mitigação: cálculo geométrico baseado em `getBoundingClientRect` + margens seguras, evitando `nearest` e offsets mágicos inconsistentes.

Escopo de backend/banco
- Não há mudanças de banco ou backend para esta correção (somente front-end V8 UX/UI).
