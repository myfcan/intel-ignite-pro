

## Plan: Swap Missões Diárias and MobileQuickAccess positions

The user wants to swap the vertical order of two mobile elements:
- **Currently:** Missões Diárias (collapsible) → MobileQuickAccess (3 shortcut buttons)
- **Desired:** MobileQuickAccess (3 shortcut buttons) → Missões Diárias (collapsible)

### Changes

**`src/pages/Dashboard.tsx`** (~lines 598-602):
- Move the `MobileQuickAccess` block **above** the `MobileQuickStats` missions section by swapping the render order — place `<div id="tour-quick-access"><MobileQuickAccess /></div>` **before** `<MobileQuickStats>`, but after the greeting card.

However, since the Missões Diárias collapsible is **embedded inside** `MobileQuickStats`, the cleanest approach is:

1. In **`src/pages/Dashboard.tsx`**: Simply swap lines — move the `MobileQuickAccess` block (lines 599-602) to appear **before** `MobileQuickStats` (before line 589), and move the missions collapsible section to render **after** MobileQuickAccess.

Actually the simplest: since both are separate visual blocks stacked vertically, and missions is the second block inside MobileQuickStats while MobileQuickAccess is a standalone component:

**Approach**: In `MobileQuickStats.tsx`, move the collapsible missions section out. In `Dashboard.tsx`, reorder so MobileQuickAccess renders first, then missions.

**Simplest approach**: Just swap their order in Dashboard.tsx:
1. Render `MobileQuickAccess` right after the greeting card
2. Render the missions collapsible after MobileQuickAccess

This requires:
- **`src/pages/Dashboard.tsx`**: Move `<MobileQuickAccess />` block above `<MobileQuickStats />`... but the greeting card is inside MobileQuickStats too.

**Final clean approach**: Inside `MobileQuickStats.tsx`, the component renders two blocks: (1) greeting card, (2) collapsible missions. In `Dashboard.tsx`, MobileQuickAccess comes after. To swap just the missions and quick access positions:

- **`src/components/dashboard/MobileQuickStats.tsx`**: Remove the collapsible missions section from this component. Add a new prop or just remove it.
- **`src/pages/Dashboard.tsx`**: Reorder to: MobileQuickStats (greeting only) → MobileQuickAccess → Missions collapsible (as standalone).

**Even simpler**: Just swap the two in Dashboard.tsx by rendering MobileQuickAccess **between** the greeting card and missions inside MobileQuickStats via a slot/prop.

**Simplest implementation**: Add a `quickAccessContent` prop to MobileQuickStats that renders between the greeting card and missions section. Pass `<MobileQuickAccess />` through it.

### Final Plan

1. **`src/components/dashboard/MobileQuickStats.tsx`**: Add optional `quickAccessContent` prop. Render it between the greeting card and the missions collapsible section.

2. **`src/pages/Dashboard.tsx`**: 
   - Pass `quickAccessContent={<div id="tour-quick-access"><MobileQuickAccess /></div>}` to MobileQuickStats
   - Remove the standalone `<div id="tour-quick-access"><MobileQuickAccess /></div>` block that currently sits after MobileQuickStats

This swaps the visual order so Quick Access (Guia de bolso, Diretório de IA, Super Prompts) appears before Missões Diárias, while keeping all existing design, routes, icons, and functionality intact.

