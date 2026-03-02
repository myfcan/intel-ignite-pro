

# Harmonizacao Proporcional do Dashboard — Design System com Grid de 8pt

## Diagnostico Real do Problema

O problema NAO e apenas "tamanho" — e a **ausencia de um sistema de espacamento consistente**. Hoje cada bloco usa valores arbitrarios:

- Hero: `p-10`, `minHeight: 180px`, `rounded-3xl`
- Trail containers: `p-8`, `rounded-3xl`, `boxShadow: 16px 48px`
- Cards internos: header `h-[148px]`, body `py-5 px-5`
- Gaps entre secoes: `mb-6` (24px) — mesmo valor para tudo

Isso cria a sensacao de "blocos soltos de tamanhos diferentes jogados na tela". Nao existe ritmo vertical.

## Solucao Profissional: 8pt Grid System + Hierarquia Visual

A industria (Google Material, Apple HIG, Linear, Stripe) usa o **8pt grid system**: todos os espacamentos sao multiplos de 8 (8, 16, 24, 32, 40, 48). Isso cria ritmo visual previsivel.

Alem disso, a hierarquia precisa de **diferenciacao por papel**, nao por tamanho arbitrario:

```text
Nivel 1 (HERO) — CTA principal, gradiente, UNICO bloco de destaque
Nivel 2 (SECOES) — Containers de trilha, fundo NEUTRO, titulo colorido
Nivel 3 (CARDS) — Dentro dos containers, todos com mesma altura
```

Hoje, Hero e Containers estao no MESMO nivel visual (todos com gradiente forte + sombra pesada). Isso e o problema central.

## Mudancas Concretas

### 1. Sistema de Espacamento Unificado (8pt grid)

| Token | Valor | Uso |
|---|---|---|
| `space-sm` | 16px (gap-4) | Entre cards dentro de container |
| `space-md` | 24px (gap-6 / p-6) | Padding interno dos containers |
| `space-lg` | 32px (mb-8) | Entre secoes principais |
| `radius-section` | 20px (rounded-[20px]) | Todos os containers de secao |
| `radius-card` | 14px (rounded-[14px]) | Todos os cards internos |

### 2. Hero Banner — Manter como Nivel 1 (unico destaque)

| Propriedade | Atual | Novo |
|---|---|---|
| minHeight | 180px | removido (natural) |
| padding | `p-6 sm:p-8 md:p-10` | `p-6 sm:p-7 md:p-8` (48/56/64) |
| border-radius | `rounded-2xl sm:rounded-3xl` | `rounded-[20px]` |
| Titulo | `text-2xl sm:text-3xl md:text-4xl` | `text-2xl sm:text-2xl md:text-3xl` |
| Icones flutuantes | 36-48px | 32-40px |

Resultado: hero compacta ~25%, continua sendo o bloco de destaque.

### 3. Containers de Trilha — Rebaixar para Nivel 2 (fundo neutro)

TODAS as 3 secoes (V8, IA Pro, V7) passam do modelo "bloco gradiente pesado" para **card branco com titulo colorido**:

| Propriedade | Atual | Novo |
|---|---|---|
| background | gradiente forte (roxo/azul) | `white` |
| border | nenhum | `1px solid hsl(230, 15%, 92%)` |
| boxShadow | `0 16px 48px -12px rgba(...)` | `0 2px 16px rgba(0,0,0,0.04)` |
| border-radius | `rounded-3xl` | `rounded-[20px]` |
| padding | `p-5 sm:p-7 md:p-8` | `p-5 sm:p-6` (uniforme) |
| titulo cor | `text-white` | cor tematica (indigo/violet/blue) |
| icone titulo | sobre gradiente | cor tematica solida |
| botao "Ver todos" | glass branco sobre gradiente | `bg-{theme}-50 text-{theme}-600 border` |
| setas paginacao | `text-white/30` | `text-slate-400` (desabilitado), `text-{theme}-600` (ativo) |
| contador pagina | `text-white/60` | `text-slate-400` |

Cores tematicas por secao:
- **Seu Caminho de Maestria**: titulo `text-indigo-800`, Crown `text-amber-500`, botoes `bg-indigo-50 text-indigo-600`
- **IA para Profissionais**: titulo `text-violet-800`, Briefcase `text-violet-500`, botoes `bg-violet-50 text-violet-600`
- **Renda Extra PRO**: titulo `text-blue-800`, Rocket `text-blue-500`, botoes `bg-blue-50 text-blue-600`

### 4. Trail Cards — Header Compactado

O header colorido dos cards (que fica DENTRO dos containers) mantem o gradiente — e aqui que a cor vive agora.

| Propriedade | Atual | Novo |
|---|---|---|
| Header height | `h-[120px] sm:h-[148px]` | `h-[96px] sm:h-[120px]` |
| Glass icon | `w-12 h-12 sm:w-16 sm:h-16` | `w-10 h-10 sm:w-14 sm:h-14` |
| Icon interno | `w-6 h-6 sm:w-8 sm:h-8` | `w-5 h-5 sm:w-7 sm:h-7` |
| Body padding | `px-3.5 py-3.5 sm:px-5 sm:py-5` | `px-3 py-3 sm:px-4 sm:py-4` |
| Circulos decorativos | w-20 sm:w-28 | w-16 sm:w-22 |

### 5. Espacamento entre Secoes

| Entre | Atual | Novo |
|---|---|---|
| Hero -> Stats | mb-6 (24px) | mb-8 (32px) |
| Stats -> Continue | mb-6 (24px) | mb-6 (24px) |
| Continue -> Trilhas title | mb-6 (24px) | mb-8 (32px) |
| Entre containers trilha | mb-6 (24px) | mb-6 (24px) |

Isso cria agrupamento visual: blocos de mesmo tipo ficam mais juntos, blocos de tipo diferente tem mais respiro.

### 6. Continue Aprendendo — Alinhar

| Propriedade | Atual | Novo |
|---|---|---|
| minHeight | 120px | removido |
| padding | `p-5 sm:p-7` | `p-4 sm:p-5` |
| border-radius | rounded-2xl | `rounded-[20px]` |
| Icone | `w-16 h-16 sm:w-20 sm:h-20` | `w-14 h-14 sm:w-16 sm:h-16` |

## Resultado Visual Esperado

```text
+--[HERO roxo gradiente — UNICO bloco de cor]---+
|  Pronto para aprender? (compacto, ~160px)      |
+-------------------------------------------------+
        32px gap
+--[4 stat cards brancos]---+---+---+---+
        24px gap
+--[Continue Aprendendo — card branco]---+
        32px gap
  Trilhas (titulo)
        16px gap
+--[CARD BRANCO, borda sutil]--------------------+
|  Crown(indigo) Seu Caminho de Maestria(indigo) |
|  [card com header colorido] [card] [card]       |
+-------------------------------------------------+
        24px gap
+--[CARD BRANCO, borda sutil]--------------------+
|  Briefcase(violet) IA para Profissionais       |
|  [card com header colorido] [card] [card]       |
+-------------------------------------------------+
        24px gap
+--[CARD BRANCO, borda sutil]--------------------+
|  Rocket(blue) Renda Extra PRO                  |
|  [card com header colorido] [card] [card]       |
+-------------------------------------------------+
```

## Por que isso e profissional e nao "remendo"

1. **8pt grid system** — padrao da industria (Google, Apple, Linear)
2. **Hierarquia por funcao** — hero = CTA (cor), containers = organizacao (neutro), cards = conteudo (cor no header)
3. **Valores consistentes** — todo espacamento e multiplo de 8, todo radius e 20px ou 14px, sem valores arbitrarios
4. **Diferenciacao semantica** — cada secao tem sua cor NO TITULO, nao no fundo inteiro
5. **Principio de "contenção"** — a cor forte vive nos cards pequenos (onde cria impacto), nao nos containers grandes (onde cria fadiga)

## Arquivos Modificados

1. **`src/pages/Dashboard.tsx`** — Hero compactado, containers de trilha com fundo branco, espacamentos 8pt grid, botoes/setas adaptados para fundo claro
2. **`src/components/lessons/v8/V8TrailCard.tsx`** — Header height reduzido, icones compactados
3. **`src/components/TrailCard.tsx`** — Header height reduzido, icones compactados

Nenhum arquivo novo. Nenhuma mudanca no banco de dados.
