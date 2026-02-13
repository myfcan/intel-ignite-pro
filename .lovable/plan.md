

# Redesign do Dashboard AIliv -- Estilo Learning Platform Refinado

## Analise da Nova Referencia

A referencia mostra um dashboard de plataforma educacional com estas caracteristicas-chave:

- **Fundo roxo/purple gradient** como container principal (nao a pagina toda)
- **Cards assimetricos** com tamanhos variados em grid nao-uniforme
- **"My Courses" card** grande e branco com mini grafico de progresso e percentual
- **Card de Pontos** em cor vibrante (cyan) com icone 3D de trofeu e CTA
- **Stat cards pequenos** coloridos (rosa e branco) com numero grande + label + icone
- **Secao "Special Offer"** com detalhes do curso, lista de modulos com horas, avatares de participantes
- **"Top Courses"** como lista horizontal de cards brancos compactos (icone + titulo + preco)
- **Tabs de navegacao** dentro do container roxo (Analytics, Courses, Planning, Statistic)

## O Que Muda no Dashboard

### 1. Container Principal com Fundo Roxo
O hero atual vira um **container roxo expandido** que engloba o card "My Courses" e os stat cards (como na referencia), criando uma area imersiva no topo.

### 2. Card "Meu Curso Atual" (hero card grande)
Substitui o hero de texto atual. Card branco dentro do container roxo mostrando:
- Nome da trilha ativa
- Categoria (badge)
- Mini grafico de progresso (linha sparkline usando Recharts)
- Percentual de progresso grande e destacado
- Icone decorativo da trilha

### 3. Card de Gamificacao (Points/Power Score)
Card colorido (gradiente roxo-para-cyan ou similar) ao lado do "Meu Curso Atual" com:
- Power Score em numero grande
- Icone de trofeu estilizado
- CTA "Ver Ranking"

### 4. Stat Cards Compactos
2 cards menores abaixo do card principal (dentro do container roxo):
- **Streak**: fundo rosa/pink, numero grande, icone de calendario
- **Aulas Completas**: fundo branco, numero grande, icone de livro

### 5. Secao "Suas Trilhas" Redesenhada
Sai do grid atual para um layout tipo "Top Courses" da referencia:
- Cards brancos horizontais com icone colorido arredondado, titulo, categoria badge, e barra de progresso
- Lista vertical mais limpa e scannable

### 6. Feature Cards e Quick Actions
Mantem o estilo dark atual mas reposicionados abaixo das trilhas, como secao "Special Offer" / "For You".

## Layout Desktop

```text
+--------------------------------------------------+
|  DashboardHeader + GamificationHeader            |
+--------------------------------------------------+
|  +----- Container Roxo (gradient) ---------------+|
|  |                                               ||
|  |  +--- Meu Curso (branco) ---+ +-- Points ---+ ||
|  |  | Categoria badge          | | 1300        | ||
|  |  | Trilha Ativa             | | Power Score | ||
|  |  | Sparkline + 68%          | | [Trofeu]    | ||
|  |  +--------------------------+ | Ver Ranking | ||
|  |                               +-------------+ ||
|  |  +-- Streak (rosa) --+ +-- Aulas (branco) --+ ||
|  |  | 12 dias            | | 10 completas      | ||
|  |  +--------------------+ +--------------------+ ||
|  +-----------------------------------------------+|
|                                                    |
|  Suas Trilhas                                      |
|  +-- Card horizontal branco: Trilha 1 ----------+ |
|  +-- Card horizontal branco: Trilha 2 ----------+ |
|  +-- Card horizontal branco: Trilha 3 ----------+ |
|                                                    |
|  Destaques (Feature Cards + Quick Actions)         |
|  +-- AI Playground --+ +-- Curso Renda Extra ---+ |
|  +-- Ranking --------+ +-- Conquistas ----------+ |
|                                                    |
|  Missoes Diarias                                   |
+----------------------------------------------------+
```

## Layout Mobile

```text
+-------------------------+
| Header                  |
+-------------------------+
| Container Roxo          |
| +-- Meu Curso ---------+|
| | Trilha + 68%         ||
| +-----------------------+|
| +-- Points (colorido) -+|
| | Power Score + CTA    ||
| +-----------------------+|
| +- Streak -+ +- Aulas -+|
| | 12 dias  | | 10      ||
| +----------+ +---------+|
+-------------------------+
| Suas Trilhas            |
| [Card horizontal 1]    |
| [Card horizontal 2]    |
+-------------------------+
| Destaques              |
| [AI Playground]        |
| [Curso Renda Extra]    |
+-------------------------+
| Missoes Diarias        |
+-------------------------+
```

## Detalhes Tecnicos

### Arquivos Modificados

1. **`src/pages/Dashboard.tsx`**
   - Reestruturar o topo: container roxo gradient que engloba o card "Meu Curso Atual", card de Points e 2 stat cards menores
   - Grid assimetrico dentro do container: `grid-cols-[2fr_1fr]` para desktop (curso grande + points ao lado), `grid-cols-2` para os 2 stat cards abaixo
   - Redesenhar secao "Suas Trilhas" como lista de cards horizontais brancos
   - Manter Feature Cards e Quick Actions abaixo, reordenados

2. **`src/components/TrailCard.tsx`**
   - Criar variante horizontal (white card): icone colorido arredondado a esquerda, titulo + categoria badge no meio, barra de progresso + CTA a direita
   - Estilo limpo: fundo branco, border sutil, sombra leve
   - Lock state com opacidade reduzida

3. **`src/components/gamification/AnimatedStatCard.tsx`**
   - Redesenhar para 2 variantes:
     - **Colorida (rosa/pink)**: fundo com gradiente suave, numero grande branco, label, icone
     - **Neutra (branca)**: fundo branco, numero grande colorido, label cinza, icone
   - Remover sparkles e efeitos hover complexos para um look mais clean

4. **Novo: `src/components/dashboard/CourseProgressCard.tsx`**
   - Card branco "Meu Curso Atual" com sparkline (Recharts LineChart simplificado)
   - Mostra trilha ativa, categoria, progresso percentual, mini grafico

5. **Novo: `src/components/dashboard/PointsCard.tsx`**
   - Card colorido com Power Score, icone de trofeu (Lucide Trophy), CTA "Ver Ranking"
   - Gradiente cyan/roxo vibrante

### Paleta de Cores

- Container principal: `linear-gradient(135deg, #6C63FF 0%, #9333EA 100%)` (roxo)
- Card Points: `linear-gradient(135deg, #67E8F9 0%, #22D3EE 100%)` (cyan) ou variante roxo
- Stat rosa: `linear-gradient(145deg, #FBCFE8 0%, #F9A8D4 100%)`
- Stat branco: `#FFFFFF` com border `rgba(0,0,0,0.06)`
- Cards trilha: `#FFFFFF` com hover shadow

### Dependencias

Nenhuma nova. Usa React, framer-motion, lucide-react, Recharts (ja instalado para sparkline).

### Responsividade

- Desktop: grid assimetrico `grid-cols-[2fr_1fr]` no topo, trilhas em lista vertical
- Mobile: coluna unica, cards empilhados, stat cards em `grid-cols-2`

