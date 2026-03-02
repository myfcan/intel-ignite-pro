/**
 * Shared V8 scroll utilities — deterministic geometric scroll for CTAs.
 * Used by V8PlaygroundInline and V8QuizInline to guarantee CTA visibility.
 */

/** Safe margins (px) */
export const V8_SAFE_TOP = 88;   // header (56) + breathing room (32)
export const V8_SAFE_BOTTOM = 120; // fixed bottom bar area
export const V8_DELTA_PADDING = 16; // extra breathing below CTA

/**
 * Ensures an element is fully visible within the safe viewport area.
 * Uses deterministic geometric calculation — never relies on `block: "nearest"`.
 *
 * @returns `true` if the element was found (visible or scrolled-to), `false` if ref is null.
 */
export function ensureElementVisible(
  el: HTMLElement | null,
  options?: { safeTop?: number; safeBottom?: number; padding?: number }
): boolean {
  if (!el) return false;

  const safeTop = options?.safeTop ?? V8_SAFE_TOP;
  const safeBottom = options?.safeBottom ?? V8_SAFE_BOTTOM;
  const padding = options?.padding ?? V8_DELTA_PADDING;

  const rect = el.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const maxVisible = viewportHeight - safeBottom;

  // CTA is below the visible safe area
  if (rect.bottom > maxVisible) {
    window.scrollBy({
      top: rect.bottom - maxVisible + padding,
      behavior: "smooth",
    });
    return true;
  }

  // CTA is above the visible safe area (scrolled past)
  if (rect.top < safeTop) {
    window.scrollBy({
      top: rect.top - safeTop - padding,
      behavior: "smooth",
    });
    return true;
  }

  return true; // already visible
}

/**
 * Schedules a CTA visibility check after AnimatePresence transitions.
 * Runs primary check at 300ms and safety-net re-check at 600ms.
 *
 * @returns cleanup function to clear timers.
 */
export function scheduleCTAScroll(
  getElement: () => HTMLElement | null,
  fallbackElement?: () => HTMLElement | null
): () => void {
  const attempt = () => {
    const el = getElement();
    if (ensureElementVisible(el)) return true;

    // Geometric fallback on the fallback element
    const fb = fallbackElement?.();
    if (fb) {
      ensureElementVisible(fb);
      return true;
    }
    return false;
  };

  const timer1 = setTimeout(attempt, 300);
  const timer2 = setTimeout(() => {
    // Safety-net: re-check in case layout reflowed
    ensureElementVisible(getElement());
  }, 600);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
  };
}
