

# Fix: Playground CTA visibility after phase transitions

## Problem (verified from code)

In `V8PlaygroundInline.tsx` (lines 111-138), the auto-scroll effect uses double RAF to find and scroll to the CTA button. However, `AnimatePresence mode="wait"` (line 161) first unmounts the old phase, THEN mounts the new one. During the 2 RAF window, the new `ctaRef` button may not exist in the DOM yet because AnimatePresence hasn't finished its exit/enter cycle.

**Current code (lines 111-138):**
```tsx
useEffect(() => {
  if (phase !== "intro" && !isLoadingResult && !isEvaluating) {
    const SAFE_BOTTOM = 120;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const cta = ctaRef.current;
        if (cta) {
          const ctaRect = cta.getBoundingClientRect();
          const maxVisible = window.innerHeight - SAFE_BOTTOM;
          if (ctaRect.bottom > maxVisible) {
            window.scrollBy({
              top: ctaRect.bottom - maxVisible + 16,
              behavior: "smooth",
            });
            return;
          }
        }
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      });
    });
  }
}, [phase, isLoadingResult, isEvaluating, feedback, challengeScore]);
```

The `ctaRef.current` is `null` at the time of check because AnimatePresence hasn't mounted the new phase's button yet. Fallback `bottomRef` also may not be positioned correctly.

## Solution

Replace the double RAF with a `setTimeout(300)` -- this gives AnimatePresence enough time to complete exit animation + mount + enter animation. Then perform the geometric CTA check. Also add a secondary correction at 600ms as a safety net.

### File: `src/components/lessons/v8/V8PlaygroundInline.tsx`

Replace lines 111-138 with:

```tsx
useEffect(() => {
  if (phase === "intro") return;
  if (isLoadingResult || isEvaluating) return;

  const SAFE_BOTTOM = 120;

  const scrollToCTA = () => {
    const cta = ctaRef.current;
    if (cta) {
      const ctaRect = cta.getBoundingClientRect();
      const maxVisible = window.innerHeight - SAFE_BOTTOM;
      if (ctaRect.bottom > maxVisible) {
        window.scrollBy({
          top: ctaRect.bottom - maxVisible + 16,
          behavior: "smooth",
        });
        return true;
      }
      return true; // CTA is already visible
    }
    return false;
  };

  // Primary attempt: 300ms after phase change (AnimatePresence exit+enter)
  const timer1 = setTimeout(() => {
    if (!scrollToCTA()) {
      // Fallback: bottomRef
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, 300);

  // Safety net: re-check at 600ms in case layout shifted
  const timer2 = setTimeout(() => {
    scrollToCTA();
  }, 600);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
  };
}, [phase, isLoadingResult, isEvaluating, feedback, challengeScore]);
```

### Why this works

- 300ms delay accounts for AnimatePresence exit (opacity 0) + enter (opacity 0 to 1) transitions
- `scrollToCTA()` does geometric validation: measures `ctaRect.bottom` vs viewport minus safe area
- 600ms safety net catches late reflows (e.g., from loaded content expanding the card)
- No dependency on framer-motion transforms since we use `getBoundingClientRect` after animations complete

### No changes needed to V8LessonPlayer.tsx

The section-level scroll (anchor-based with `scroll-margin-top: 88px`) is working correctly for section transitions. The bug is isolated to the Playground's internal phase transitions.

