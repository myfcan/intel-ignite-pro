

## Problema Identificado

O LIV FAB no V10 tem problemas visuais evidentes:

1. **Animação `liv-pulse` conflitante** — o keyframe em `index.css` (linha 528-537) usa `transform: scale(1.5)` a `scale(1.8)`, o que distorce o avatar massivamente. O botão do avatar tem `w-14 h-14` mas o LivAvatar interno já é `scale-[0.72]`, criando uma combinação visual desconexa.

2. **Espaçamento amador** — `gap-2` (8px) entre avatar e menu é insuficiente. O avatar com `w-14` (56px) fica visualmente colado ao botão de menu `w-11` (44px).

3. **Efeito de pulsar sem refinamento** — O `liv-pulse` do `index.css` faz scale de 1.5 a 1.8 com opacidade, pensado para outro contexto (mobile overlay), não para um FAB compacto.

4. **Sem sombra/glow no avatar** — O botão do menu tem `shadow-lg` e gradiente, mas o avatar não tem nenhum efeito de profundidade, criando desbalanceamento visual.

## Plano de Correção

### 1. Criar animação `liv-fab-pulse` dedicada no `LIVFab.tsx`
- Pulso suave: `scale(1)` → `scale(1.04)` com `box-shadow` índigo gradual (não o scale 1.5 do index.css)
- Versão intense: manter escala moderada `scale(1.08)` com glow esmeralda

### 2. Refinar layout e espaçamento
- Aumentar `gap-2` para `gap-3` (12px)
- Reduzir o botão do avatar de `w-14 h-14` para `w-12 h-12` para proporção melhor com o menu `w-11`
- Ajustar `scale-[0.72]` do LivAvatar para `scale-[0.65]` para caber no container menor
- Adicionar `shadow-md` e um `ring` sutil no botão do avatar para dar profundidade

### 3. Adicionar glow sutil ao avatar
- Box-shadow com glow índigo suave no estado normal: `0 0 12px rgba(139, 92, 246, 0.3)`
- Background semi-transparente no botão do avatar para isolar visualmente

### 4. Refinar badge do menu
- Manter como está (já funcional)

### Arquivo afetado
- `src/components/lessons/v10/PartB/LIVFab.tsx` — único arquivo a ser editado

### Impacto sistêmico
- **Sem efeito colateral** — o keyframe `liv-pulse` do `index.css` NÃO será alterado (usado em outros contextos). A nova animação `liv-fab-pulse` será definida inline no `<style>` do componente.
- O componente `LivAvatar` não será modificado — apenas props de estilo.

