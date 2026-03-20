

## Plano: Corrigir ícones dos Intro Slides — Pipeline + Player + Dados

### Problema
Os intro slides da Part A mostram texto literal ("Wrench", "Rocket", "BookOpen") em vez de emojis visuais. O `Stage6Assembly.tsx` salva nomes de ícones Lucide como strings, e o `IntroSlide.tsx` renderiza como texto puro.

### Mudanças

**1. `src/components/admin/v10/stages/Stage6Assembly.tsx`** (Pipeline)
- Linha 401: `'BookOpen'` → `'📖'`
- Linha 416: `'Wrench'` → `'🔧'`
- Linha 430: `'Rocket'` → `'🚀'`

**2. `src/components/lessons/v10/PartA/IntroSlide.tsx`** (Player)
- Adicionar mapa de fallback para dados já existentes no banco:
```
{ Wrench: '🔧', BookOpen: '📖', Rocket: '🚀', Calendar: '📅', Brain: '🧠', Zap: '⚡', Settings: '⚙️', Target: '🎯', Globe: '🌐', Shield: '🛡️' }
```
- Na linha 38, converter `slide.icon` pelo mapa antes de renderizar

**3. SQL Update** (Dados existentes via insert tool)
```sql
UPDATE v10_lesson_intro_slides SET icon = '🔧' WHERE icon = 'Wrench';
UPDATE v10_lesson_intro_slides SET icon = '📖' WHERE icon = 'BookOpen';
UPDATE v10_lesson_intro_slides SET icon = '🚀' WHERE icon = 'Rocket';
```

### Cobertura
- Pipeline (novas lições) — Stage6Assembly corrigido
- Player (renderização) — fallback automático no IntroSlide
- Dados existentes — SQL update direto

