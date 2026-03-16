

# Plan: V5-Style Floating LivAvatar + Menu Button for V10

## Summary

Replace the current `LIVFab.tsx` (robot emoji button) with the V5 `MobileSectionDrawer` visual pattern: a floating **LivAvatar** (play/pause toggle) above a **gradient menu button** (opens LIVSheet). Convert the `LIVSheet` from a custom overlay to a shadcn `Drawer`. All internal LIVSheet content (5 items ⚠️→👆→💡→✅→💬) remains untouched.

## Files to change: 3

### 1. `LIVFab.tsx` — Full rewrite

**New interface:**
```typescript
interface LIVFabProps {
  hasWarnings: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onOpenSheet: () => void;
  stepNumber: number;
}
```

**Two floating elements (copied from V5 MobileSectionDrawer pattern):**

- **LivAvatar** (top): Fixed position, `z-[9999]`, click toggles play/pause. Uses `<LivAvatar size="small" state={isPlaying ? 'speaking' : 'idle'} theme="automacoes" />` with grayscale when paused. Green/gray status dot top-left (green pulse when playing).

- **Gradient menu button** (below avatar): `w-11 h-11` rounded-full `bg-gradient-to-br from-cyan-500 to-purple-600` with `<List>` icon. Badge: green pulsing `!` dot when `hasWarnings`, otherwise step number badge (white circle, purple text). Click calls `onOpenSheet`.

**Responsive positioning** via `useResponsivePosition()` hook (same as V5):
- Desktop 1024+: avatarRight 60, buttonRight 67
- Tablet 768-1023: avatarRight 48, buttonRight 55
- Mobile 480-767: avatarRight 36, buttonRight 43
- Mobile <480: avatarRight 24, buttonRight 31
- Bottom values adjusted for V10's PlayerBar (~155-160px avatar, ~104-109px button)

### 2. `PartBScreen.tsx` — Update LIVFab call (lines 294-302)

Replace:
```tsx
<LIVFab
  hasWarnings={!!currentStep.warnings?.warn}
  onClick={() => { audioRef.current?.pause(); setIsPlaying(false); setLivOpen(true); }}
/>
```

With:
```tsx
<LIVFab
  hasWarnings={!!currentStep.warnings?.warn}
  isPlaying={isPlaying}
  onTogglePlay={handlePlayPause}
  onOpenSheet={() => { audioRef.current?.pause(); setIsPlaying(false); setLivOpen(true); }}
  stepNumber={currentStep.step_number}
/>
```

### 3. `LIVSheet.tsx` — Convert container from custom overlay to shadcn Drawer

**What changes:** Only the outer wrapper (lines 294-401). Replace the manual `fixed inset-0` overlay + sheet div with:
```tsx
<Drawer open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
  <DrawerContent className="bg-[#1E1B2E] border-t border-indigo-500/30 max-h-[80vh]">
    {/* existing drag handle, title row, scrollable content — unchanged */}
  </DrawerContent>
</Drawer>
```

**What stays identical:** Title row (🤖 LIV | AJUDA), 5 option items, expanded content views, chat, back button, all props and logic.

**New imports added:** `Drawer, DrawerContent` from `@/components/ui/drawer`.

## Dependencies
- `LivAvatar` from `@/components/LivAvatar` (exists)
- `Drawer` from `@/components/ui/drawer` (exists)
- `List` from `lucide-react` (exists)
- `useResponsivePosition` — new local hook inside LIVFab (not shared)

## What does NOT change
- LIVSheet internal content (5 items, order, expanded views, chat, all props)
- PartBScreen audio logic, sidebar, StepContent
- No database or type changes

