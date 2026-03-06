

## Plano: Separar Completion Screen e Rating Modal

### Problema Atual
O rating (V8LessonRating) esta embutido inline na tela de conclusao. O usuario quer **dois momentos separados**:

1. **Tela de conclusao** - gamificacao + confetti + som de sucesso + botao "Proxima Aula"
2. **Modal de avaliacao** - aparece APOS clicar "Proxima Aula", com estrelas + campo de texto + botao enviar

### Mudancas

**`V8CompletionScreen.tsx`**:
- Remover `<V8LessonRating />` do inline
- Adicionar som de sucesso via `useV7SoundEffects` (`playSound('success')`) ao montar a tela
- Adicionar mais confetti (segundo burst com delay)
- Ao clicar "Proxima Aula": abrir o modal de rating ao inves de chamar `onContinue` diretamente
- Gerenciar estado `showRatingModal` — apos submeter/pular rating, ai sim chamar `onContinue`

**`V8LessonRating.tsx`**:
- Converter para funcionar como **modal** (overlay fullscreen com backdrop)
- Adicionar botao "Pular" para quem nao quer avaliar
- Receber `onClose` callback que chama `onContinue` original
- O campo de texto (Textarea) ja existe no componente atual, nao precisa alterar o banco

**Banco de dados**: Nenhuma alteracao necessaria — a tabela `lesson_ratings` ja tem a coluna `comment text`.

**Admin**: Nenhuma alteracao necessaria — `AdminLessonRatings.tsx` ja exibe o campo de comentario.

### Fluxo Final

```text
[Aula termina]
    ↓
[Tela Conclusao: Trophy + Confetti + Som + XP/Moedas/Streak]
    ↓
[Botao "Proxima Aula"]
    ↓
[Modal Rating: Estrelas + Textarea + "Enviar" / "Pular"]
    ↓
[onContinue → proxima aula]
```

### Arquivos Afetados
| Arquivo | Acao |
|---------|------|
| `V8CompletionScreen.tsx` | Remover rating inline, add som, add estado modal |
| `V8LessonRating.tsx` | Converter para modal com overlay + botao pular |

