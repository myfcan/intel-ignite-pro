

## Melhorando a Barra de Gamificação (GamificationHeader)

### Problema Identificado
A barra roxa com os stats (Power Score, Créditos, Nível) no topo do Dashboard está com aparência estranha — visualmente pesada, com a borda inferior criando um corte abrupto, e o layout dos badges não segue o padrão premium do resto da interface.

### Investigação
O componente `GamificationHeader` (`src/components/gamification/GamificationHeader.tsx`) renderiza:
- Uma faixa com gradiente roxo (135deg, #6C63FF → #7C3AED → #9333EA)
- Textura de pontos radiais (radial-gradient)
- Um ícone Zap à esquerda com label "Seu Progresso" (hidden no mobile)
- 3 badges: Power Score, Créditos, Patente (Nv)
- Borda inferior (`border-b`) que cria o corte visual estranho

A barra cinza que aparece no screenshot parece ser o efeito visual da borda inferior + o fundo da página criando um gap visual desagradável.

### Solução Proposta
Redesenhar o `GamificationHeader` para ficar mais integrado e elegante:

1. **Remover a borda inferior** — usar sombra suave em vez de `border-b`
2. **Reduzir altura** — padding menor no mobile (py-2 → py-1.5)
3. **Melhorar os badges** — usar design pill mais refinado com ícones menores e tipografia mais limpa
4. **Remover a textura de pontos** — simplificar o fundo para gradiente puro
5. **Adicionar cantos arredondados inferiores** — `rounded-b-2xl` para transição suave com o conteúdo abaixo
6. **Sombra suave inferior** — `shadow-lg` com cor do gradiente para continuidade visual

### Arquivo alterado
- `src/components/gamification/GamificationHeader.tsx` — redesign completo do componente

### Resultado Visual
A barra ficará mais sutil, integrada ao design premium light do Dashboard, sem cortes visuais abruptos, e com uma transição suave para o conteúdo abaixo.

