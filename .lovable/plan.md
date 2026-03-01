

# Ajuste de Espacamento: 7px entre elementos no rolo V8

## Problema

Os elementos (conteudo, imagem, audio player, botao "Continuar") estao com espacamento excessivo entre si. O padrao definido e de **7px** entre cada elemento.

## Mudancas

### 1. `V8ContentSection.tsx` -- Espacamento interno da secao

Tres ajustes de margem:

| Elemento | Classe atual | Classe nova |
|---|---|---|
| Markdown body (mt do titulo) | `mt-3` (12px) | `mt-[7px]` |
| Imagem wrapper | `mt-4 mb-2` (16px / 8px) | `mt-[7px] mb-[7px]` |
| Audio player wrapper | `mt-2` (8px) | `mt-[7px]` |

Tambem remover o `mb-4` do ultimo paragrafo do markdown para evitar espaco extra antes da imagem. Isso pode ser feito removendo o `mb-4` da class do componente `p` e usando `last:mb-0` ou simplesmente aceitando que o markdown ja gera um pouco de espaco. A abordagem mais limpa: manter `mb-4` nos paragrafos intermediarios mas o container do markdown tera margem negativa compensada -- ou mais simples, apenas ajustar as margens externas como descrito acima.

### 2. `V8LessonPlayer.tsx` -- Espacamento entre secoes e botao

| Elemento | Classe atual | Classe nova |
|---|---|---|
| Container das secoes | `gap-8` (32px) | `gap-[7px]` |
| Separador `<hr>` | `mb-8` (32px) | `mb-[7px]` |

O botao "Continuar" ja esta dentro do `flex flex-col gap-[7px]`, entao ficara a 7px do ultimo elemento automaticamente.

### Arquivos modificados

- `src/components/lessons/v8/V8ContentSection.tsx` -- linhas 43, 106, 118
- `src/components/lessons/v8/V8LessonPlayer.tsx` -- linhas 108, 113

### O que NAO muda

- Estrutura do rolo (scroll continuo) permanece identica
- Ordem dos elementos (Titulo -> Markdown -> Imagem -> Audio) permanece
- Logica de auto-scroll, refs, quiz/playground -- tudo intacto

