

## Transition Effect on Step/Frame Change

**Problem**: When steps or frames change, the content swaps instantly with no visual feedback. This causes the user to lose focus — there's no "signal" that something changed.

**Solution**: Add a subtle flash/fade transition effect on `StepContent` triggered by step or frame changes. Two layers:

### 1. CSS Animation in StepContent
- Use a `key` prop on the main content wrapper tied to `${currentStepIndex}-${currentFrameIndex}`
- This forces React to remount the wrapper, triggering a CSS entrance animation
- Animation: quick fade-in + slight upward slide (`opacity 0→1, translateY 8px→0`) over ~300ms
- Already available in project as `animate-fade-in`

### 2. Subtle screen flash overlay in PartBScreen
- Add a thin overlay `<div>` that flashes briefly (opacity 0→0.06→0, white, ~400ms) on step change only (not frame change)
- Acts as a subconscious "blink" signal that something changed — keeps attention
- Uses inline `@keyframes` or a simple state toggle with `setTimeout`

### Files to modify:
- **`StepContent.tsx`**: Add `key` prop on the outer wrapper so content re-enters with `animate-fade-in`
- **`PartBScreen.tsx`**: Add a flash overlay div that triggers on `currentStepIndex` change

This is lightweight, no new dependencies, and stays subtle as requested.

