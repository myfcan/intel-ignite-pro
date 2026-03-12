

# Plano: Skeleton Loading para CourseDetail (Mobile)

## Situação Atual
Linhas 145-154 de `CourseDetail.tsx` mostram um spinner genérico durante o carregamento. Isso causa percepção de lentidão no mobile.

## Solução
Criar um componente `CourseDetailSkeleton` que replica a estrutura real da página (header + context card + certificate card + lesson cards) usando o mesmo `Skeleton` component já existente. Como a página tem dois layouts (V8 e default), o skeleton focará no layout V8 (fluxo mobile principal) com fallback para o default.

## Arquivos

### 1. Criar `src/components/skeletons/CourseDetailSkeleton.tsx`
- Header sticky com back button + título + badge de progresso (skeletons)
- Context card (trilha + título + descrição)
- Certificate card placeholder (rounded-2xl com skeleton)
- 5 lesson cards, cada um com: ícone 11x11, label "Aula X", título, descrição, badge de status, tempo, progress bar

### 2. Editar `src/components/skeletons/index.ts`
- Exportar `CourseDetailSkeleton`

### 3. Editar `src/pages/CourseDetail.tsx`
- Linhas 145-154: substituir o spinner pelo `CourseDetailSkeleton`

