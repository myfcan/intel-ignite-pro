

## Duas Melhorias V8

### 1. Skill Tree Duolingo-style para Jornadas V8

**Onde**: `CourseDetail.tsx` (linhas 142-228) — substituir a lista flat de cards pelo `V8SkillTree` redesenhado.

**Mudanças no `CourseDetail.tsx`**:
- Importar `V8SkillTree`
- Mapear lessons para o formato `LessonItem` com status convertido (`unlocked` → `available`)
- Substituir o bloco `<div className="flex-1 min-w-0 space-y-3">` pelo `<V8SkillTree>`
- Manter o `V8CertificateCard` acima da skill tree (empilhado em mobile)

**Redesign do `V8SkillNode.tsx`** (inspirado na referência):
- Nodes circulares (em vez de `rounded-2xl`) com efeito 3D: pseudo-camada inferior mais escura (4px offset bottom)
- Completed: violeta sólido com checkmark branco + sombra bottom escura
- Available/in_progress: violeta claro com ícone, glow pulsante
- Locked: cinza empilhado com Lock icon, opacity reduzida
- Tamanho aumentado para `w-[72px] h-[72px]` com border mais grossa

**Redesign do `V8SkillTree.tsx`**:
- Remover labels laterais (cards com border) — usar apenas texto centralizado abaixo de cada node (título curto + "X min")
- Connectors mais grossos e suaves (strokeWidth 5-6 para completed)
- Adicionar barra de progresso horizontal no topo (completedCount/totalLessons)
- Manter zigzag pattern existente mas com amplitude menor (mais compacto em mobile)

### 2. Modal de Streak após 1ª Aula

**Novo componente**: `V8StreakCelebration.tsx`
- Modal fullscreen overlay com backdrop blur
- Card central com: número grande estilizado do streak (e.g. "1"), texto "dia de aprendizado consecutivo", raios decorativos animados (motion divs rotacionais)
- Botão "Continuar" gradient
- Confetti burst ao abrir
- Animação de entrada: scale 0→1 com spring

**Trigger em `V8CompletionScreen.tsx`**:
- Novo state `showStreakCelebration`
- Após fetch do streak, se `streakDays >= 1`, mostrar o modal de streak ANTES do rating
- Flow: Completion → click "Próxima Aula" → Streak Modal → Rating Modal → onContinue
- Verificar contagem de aulas completadas via query ao `user_progress` (se count === 1, é primeira aula)

### Arquivos

| Arquivo | Ação |
|---|---|
| `V8SkillTree.tsx` | Redesign: labels abaixo, progress bar topo, connectors mais grossos |
| `V8SkillNode.tsx` | Redesign: circular 3D, sombra bottom |
| `CourseDetail.tsx` | Usar V8SkillTree em vez de lista flat |
| `V8StreakCelebration.tsx` | Novo componente — modal celebração streak |
| `V8CompletionScreen.tsx` | Trigger streak modal antes do rating |

