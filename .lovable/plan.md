

# Fix: Parser Ignoring Opening Content (# Title + Intro Paragraph)

## Problem

The raw content has this structure:

```
# O Cérebro do ChatGPT: Como o GPT "pensa"...

Você já pediu algo ao ChatGPT e recebeu uma resposta genérica...

## Seção 1 — Abertura: o que você vai destravar hoje
...
```

The parser (`v8ContentParser.ts`) extracts the `#` line as `title` and the paragraph below it as `description` (line 30-40). But `description` is **never rendered** in the player — it's stored in the JSON but completely ignored by `V8LessonPlayer.tsx`.

The `parseSections()` function (line 113-146) only matches `## ` headings, so the intro paragraph between `#` and first `##` is **silently discarded** from the sections array.

## Solution

Convert the intro paragraph into the first section automatically. When the parser detects content between `#` (title) and the first `##` (first section), it creates a "Section 0" (Abertura) that includes that intro text.

## Changes

### File: `src/lib/v8ContentParser.ts`

**In `parseFullContent()` (after line 43, before building V8Sections):**

After parsing sections and extracting `description`, check if `description` has meaningful content (more than 20 chars after trimming). If so, prepend a synthetic section to the `parsedSections` array:

```typescript
// If there's intro content between # and first ##, create a "Section 0"
if (description && description.trim().length > 20) {
  const introSection: ParsedSection = {
    title: "Abertura",
    content: description,
    position: 0, // Before all ## sections
  };
  parsedSections.unshift(introSection);
}
```

This ensures:
- The intro paragraph becomes `section-01` (Abertura) in the final JSON
- All `afterSectionIndex` values for quizzes/playgrounds shift correctly because `findAfterSectionIndex` uses position-based logic (position 0 is before all `##` positions)
- The `description` field remains populated for metadata purposes
- Existing content without intro paragraphs is unaffected (the condition checks length > 20)

### Systemic Effects

| Effect | Impact | Risk |
|--------|--------|------|
| Section indices shift by +1 | All quiz/playground `afterSectionIndex` values auto-adjust because they use position-based calculation, not array index | LOW |
| Audio generation gets extra section | The intro section will be included in TTS generation, producing an additional audio file | LOW |
| Existing lessons already saved | No impact — only affects NEW content parsing | NONE |
| Short descriptions (< 20 chars) | Ignored, won't create spurious sections | NONE |
| Title displayed in section | Will show "Abertura" — clean and short per the title cleanup regex already in V8ContentSection | LOW |

### No other files need changes

- `V8ContentSection.tsx` already has the `cleanSectionTitle` regex that strips "Secao X ---" prefixes
- `V8LessonPlayer.tsx` renders all sections from the array — no filter exists
- `v8-generate/index.ts` processes all sections in the array — no skip logic

