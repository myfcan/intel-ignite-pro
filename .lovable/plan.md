
# Update Image Generation Prompts for Coursiv-Style Transparent PNGs

## Problem

The current prompts in `v8-generate-section-image` generate generic "professional educational illustrations" with opaque backgrounds, which look out of place on the light-mode Coursiv layout.

## Changes

### File: `supabase/functions/v8-generate-section-image/index.ts`

**Change 1 -- `buildAutoPrompt` function (lines 10-18)**

Replace the current generic prompt with a Coursiv-compatible prompt that requests:
- Flat/3D illustration style
- Transparent PNG background (no background, isolated object)
- Clean, minimal, icon-like aesthetic
- No text rendered in the image

New prompt template:
```typescript
function buildAutoPrompt(content: string): string {
  const cleaned = content
    .replace(/^#{1,3}\s+.*$/gm, "")
    .replace(/[*_`~\[\]()>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  const words = cleaned.split(/\s+/).slice(0, 150).join(" ");
  return `Create a single isolated 3D illustration object representing this educational concept: ${words}.

Style requirements:
- Modern flat 3D render, clean and minimal
- Single object or small composition, centered
- TRANSPARENT BACKGROUND (no background at all, PNG transparency)
- Soft gradients, smooth surfaces, rounded edges
- Vibrant but not neon colors (indigo, violet, sky blue, warm tones)
- No text, no labels, no UI elements in the image
- Think Apple/Notion style icons: polished, friendly, professional
- Subtle shadow underneath the object for depth`;
}
```

**Change 2 -- Custom prompt template (line 57)**

Update the custom mode prompt to also request transparent background:
```typescript
prompt = `Create a 3D illustration based on this description: ${customPrompt}.

Style: modern flat 3D render, single isolated object, TRANSPARENT BACKGROUND (PNG transparency), soft gradients, smooth surfaces, vibrant colors, no text in image, polished and professional like Apple/Notion icons.`;
```

### No other files need changes

- `V8SectionSetup.tsx` -- no changes needed, it just passes content/prompt to the edge function
- `V8ContentSection.tsx` -- already uses `object-contain` for floating image style (from previous plan)
- The edge function already uploads as `image/png` with upsert

### Systemic Effects

| Effect | Risk |
|--------|------|
| All NEW generated images will have transparent backgrounds | LOW -- this is the desired outcome |
| Existing images remain unchanged (already uploaded to storage) | NONE |
| Gemini may not always produce perfect transparency | LOW -- the prompt strongly requests it, but AI image gen isn't deterministic |
| Image preview in V8SectionSetup uses `object-cover` with bg-slate-100 | LOW -- transparent PNGs will show the slate-100 background in preview, which is fine |
