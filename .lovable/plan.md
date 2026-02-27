

# Correção Definitiva: gradient-hero text-clipping quebrado

## Causa Raiz

A classe `.gradient-hero` em `src/index.css` (L229) usa `background: var(--gradient-hero)` (shorthand). Quando combinada com as classes Tailwind `bg-clip-text text-transparent`, o resultado e imprevisivel entre browsers -- o texto pode aparecer como um bloco solido roxo em vez de texto com gradiente.

A classe `.gradient-text-hero` (L233-240) foi criada corretamente com `background-image` + `background-clip: text` + `-webkit-text-fill-color: transparent`, mas so foi aplicada em 1 lugar (L115, "28 Dias"). Os outros 6 lugares continuam usando o padrao quebrado.

## Ocorrencias Quebradas (dados reais)

| Linha | Conteudo renderizado | Classe atual (QUEBRADA) |
|-------|---------------------|------------------------|
| 649 | Income values (oportunidades) | `gradient-hero bg-clip-text text-transparent` |
| 663 | "R$2.847/mes" | `gradient-hero bg-clip-text text-transparent` |
| 669 | "67%" | `gradient-hero bg-clip-text text-transparent` |
| 675 | "Ilimitado" | `gradient-hero bg-clip-text text-transparent` |
| 759 | Plan price | `gradient-hero bg-clip-text text-transparent` |
| 850 | "Inteligencia Ignite" | `gradient-hero bg-clip-text text-transparent` |

## Plano de Correcao

### Arquivo: `src/pages/Index.tsx`

Substituir todas as 6 ocorrencias de `gradient-hero bg-clip-text text-transparent` por `gradient-text-hero`.

Cada linha sera editada para trocar:
```text
ANTES: className="... gradient-hero bg-clip-text text-transparent ..."
DEPOIS: className="... gradient-text-hero ..."
```

### Validacao

- As classes `bg-clip-text` e `text-transparent` do Tailwind se tornam redundantes quando `gradient-text-hero` e usado (ja inclui `background-clip`, `color: transparent` e `-webkit-text-fill-color`), portanto devem ser removidas.
- Nenhum outro arquivo precisa ser alterado -- a busca confirmou que todas as ocorrencias estao em `Index.tsx`.

### Resultado esperado

Todos os textos com gradiente na landing page renderizam corretamente como texto transparente com gradiente visivel por tras, sem blocos solidos de cor.

