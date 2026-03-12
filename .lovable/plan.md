

## Upgrade Visual do Texto V8 — Design Editorial Premium

### Problema
O conteúdo das seções V8 está visualmente "flat" — parágrafos simples com bold ocasional. Falta hierarquia visual, ritmo e elementos que quebrem a monotonia de um bloco de texto corrido.

### Mudanças no `V8ContentSection.tsx`

**1. Título da seção** — adicionar um accent line (barra lateral ou underline gradient) e espaçamento mais generoso:
```
Antes: text-xl font-bold leading-snug
Depois: text-[22px] font-bold leading-tight + gradient underline decorativo (2px, primary→violet)
```

**2. Primeiro parágrafo (lead paragraph)** — destaque automático: o primeiro `<p>` dentro do markdown terá tamanho maior (`text-[17.5px]`), cor mais forte (`text-foreground/90`) e `leading-[1.9]`, criando um efeito editorial de "lede".

**3. Parágrafos normais** — aumentar espaçamento entre parágrafos (`mb-[18px]`) e usar `text-foreground/75` para contraste mais suave, com `first-letter` do primeiro parágrafo em destaque (drop cap sutil via CSS).

**4. Bold (`strong`)** — manter cor primary mas adicionar um micro-background sutil (`bg-primary/[0.06] px-0.5 rounded`) para criar visual de "highlight marker" mais visível.

**5. Listas (`ul/ol`)** — adicionar ícone gradient nos bullets em vez do círculo sólido cinza. Mover de `bg-muted/50` para `bg-gradient-to-br from-primary/[0.03] to-violet-500/[0.03]` para um toque mais premium. Bullet points com `bg-gradient-to-br from-primary to-violet-500`.

**6. Blockquotes** — upgrade para "callout card": adicionar ícone decorativo (aspas ou lightbulb), border-left gradient (`from-primary to-violet-500`), e shadow sutil (`shadow-sm`).

**7. `<hr>` separadores** — substituir linha simples por um separador decorativo (3 dots centralizados ou linha gradient fina).

**8. Itálico/highlight (`em`)** — manter o highlight marker mas usar gradient background (`from-primary/10 to-violet-500/10`) em vez de cor sólida.

**9. Espaçamento geral** — ajustar `gap-[7px]` entre timeline items para `gap-4` (16px) para mais respiro entre seções.

### Arquivo afetado
- `src/components/lessons/v8/V8ContentSection.tsx` — reescrever os componentes do ReactMarkdown
- `src/components/lessons/v8/V8LessonPlayer.tsx` — ajustar gap do container de timeline (linha 214)

### O que NÃO muda
- Estrutura de dados / tipos V8
- Lógica do player (timeline, audio, quizzes)
- Sanitização de texto
- Imagem trimming

