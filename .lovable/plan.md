
# Compactar o TrailCard (Cards de Trilha)

## Problema
O `TrailCard` tem uma area de header colorida com altura fixa de **144px (h-36)** a **160px (h-40)** apenas para exibir um icone pequeno. Isso desperdiça espaço vertical e faz o card parecer desproporcional.

## Solucao
Reduzir a altura do header colorido e ajustar proporcionalmente os elementos decorativos, mantendo o design aurora/gradient intacto.

### Mudancas no arquivo `src/components/TrailCard.tsx`:

1. **Header height**: de `h-36 sm:h-40` para `h-24 sm:h-28` (reduzir ~40%)
2. **Icone container**: de `w-16 h-16 sm:w-20 sm:h-20` para `w-12 h-12 sm:w-14 sm:h-14`
3. **Icone interno**: de `w-8 h-8 sm:w-10 sm:h-10` para `w-6 h-6 sm:w-7 sm:h-7`
4. **Circulos decorativos**: reduzir proporcionalmente para caber no header menor
5. **Lock icon**: de `w-10 h-10` para `w-7 h-7`

Nenhuma mudanca de cor, gradiente, animacao ou estrutura. Apenas dimensoes para um card mais compacto e elegante.
