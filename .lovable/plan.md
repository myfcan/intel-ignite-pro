

# Fix: Usar LivAvatar real e alinhar elementos

## Problemas identificados

1. **Robô emoji** (`🤖`) está sendo usado no lugar do componente `LivAvatar` real
2. **Desalinhamento** — avatar e botão de menu não estão centralizados verticalmente entre si porque usam valores `right` diferentes (44 vs 51) sem considerar a diferença de tamanho

## Mudanças em `src/components/lessons/v10/PartB/LIVFab.tsx`

1. **Importar `LivAvatar`** do `@/components/LivAvatar`
2. **Substituir o emoji** `🤖` pelo componente `<LivAvatar size="small" showHalo={false} enableHover={false} animate={false} />` 
3. **Dar tamanho fixo** ao botão do avatar (`w-14 h-14`) para que o alinhamento seja previsível
4. **Centralizar ambos os elementos** — usar o mesmo valor `right` para ambos e ajustar com `transform: translateX(...)` se necessário, ou calcular o `right` do botão de menu para que seu centro coincida com o centro do avatar

### Alinhamento corrigido

O avatar tem `w-14` (56px) e o botão de menu tem `w-11` (44px). Diferença = 12px, metade = 6px. Então o botão de menu precisa de `right + 6px` a mais que o avatar para ficarem centralizados.

| Breakpoint | avatarRight | buttonRight (avatar+6) | avatarBottom | buttonBottom |
|---|---|---|---|---|
| ≥1024 | 80 | 86 | 185 | 130 |
| ≥768 | 68 | 74 | 180 | 125 |
| ≥480 | 56 | 62 | 175 | 120 |
| <480 | 44 | 50 | 175 | 120 |

O `buttonBottom` fica ~55px abaixo do `avatarBottom` (avatar 56px altura + ~gap) para que o menu fique logo abaixo do avatar sem sobreposição.

