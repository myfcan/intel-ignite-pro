

# Plano: Adicionar modal de confirmação de saída no V8

## Situação atual

O `V8Header` tem um botão de voltar (seta ←) que chama `onBack` diretamente, navegando para fora da aula **sem nenhuma confirmação**. Isso pode causar saída acidental e perda de contexto.

## O que será feito

Adicionar o mesmo padrão de confirmação de saída usado no V10 (`ExitButton.tsx`) ao fluxo V8, interceptando o clique no botão de voltar do `V8Header`.

## Mudanças

### 1. Modificar `V8Header.tsx`
- Adicionar estado `showExitModal` ao header
- No clique do botão ← (ArrowLeft), em vez de chamar `onBack()` diretamente, abrir um `AlertDialog` de confirmação
- O modal terá:
  - **Título:** "Sair da aula?"
  - **Descrição:** "Seu progresso foi salvo automaticamente. Você poderá continuar de onde parou a qualquer momento."
  - **Botão primário:** "Continuar aula" (fecha o modal)
  - **Botão secundário:** "Sair da aula" (chama `onBack()`)
- Usar o mesmo componente `AlertDialog` do shadcn/ui já existente no projeto
- Manter o visual consistente com o padrão V10 (gradiente indigo/violet no botão de sair)

### 2. Nenhuma mudança em `V8LessonPlayer.tsx` ou `V8Lesson.tsx`
- A prop `onBack` continua igual — apenas o header agora intercepta o clique antes de executá-la

## Detalhes técnicos
- Importar `AlertDialog` e seus subcomponentes de `@/components/ui/alert-dialog`
- O modal será renderizado dentro do próprio `V8Header`, mantendo o componente autocontido
- Estilo do botão "Sair da aula" com `background: linear-gradient(135deg, #6366F1, #8B5CF6)` para consistência visual

