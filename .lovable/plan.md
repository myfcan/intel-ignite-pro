

# Correcao do Scroll V8: block:start + scrollMarginTop

## Problema diagnosticado

O `scrollIntoView({ block: "center" })` centraliza o ponto medio do elemento no viewport. Para secoes altas (titulo + imagem 300px + markdown = 500-800px total), o topo fica cortado pelo header fixo de ~56px. Afeta tanto secoes quanto playgrounds.

## Evidencia no codigo

**Linha 82 de V8LessonPlayer.tsx:**
```text
block: "center"  ← causa raiz
```

**Linha 124-129 — sem scrollMarginTop:**
```text
<motion.div ref={...} className="flex flex-col">  ← sem compensacao do header
```

## Solucao (2 alteracoes no mesmo arquivo)

**Arquivo:** `src/components/lessons/v8/V8LessonPlayer.tsx`

### Alteracao 1 — Linha 82

Trocar `block: "center"` por `block: "start"`

### Alteracao 2 — Linha 124-125

Adicionar `style={{ scrollMarginTop: "80px" }}` no `motion.div` que recebe o ref

O valor 80px = 56px (header real) + 24px de respiro visual

## Analise de risco

- Conflito com scroll do V8QuizInline: NENHUM (refs diferentes, `block: "nearest"`)
- Timing 100ms vs animacao 400ms: RISCO BAIXO (y:30 e pequeno, scrollMarginTop absorve)
- Impacto em outros phases (exercises, completion): NENHUM (guard `state.phase === "content"`)

## Probabilidade de exito: 95%
