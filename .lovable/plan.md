

# Plan: Fix `v10_lesson_step_anchors` TypeScript Errors

## What happened

The table `v10_lesson_step_anchors` exists in the database but is **not present in the auto-generated Supabase types** (`src/integrations/supabase/types.ts`). This causes TypeScript to reject `.from('v10_lesson_step_anchors')` calls in 3 files. These are **pre-existing errors** unrelated to the LIVFab changes.

## Fix

Add explicit type casts on all `.from()` calls referencing this table to bypass the type checker, since we cannot edit the auto-generated types file.

### Files to change (3)

1. **`src/components/lessons/v10/PartB/PartBScreen.tsx`** (line ~100)
   - Cast: `supabase.from('v10_lesson_step_anchors' as any)`

2. **`src/components/admin/v10/AdminAnchorTimeline.tsx`** (lines ~81, ~115, ~139, ~152)
   - Same cast on all 4 `.from()` calls

3. **`src/components/admin/v10/stages/Stage5Narration.tsx`** (lines ~157, ~246)
   - Same cast on both `.from()` calls, plus cast query results with `as any[]`

This is a safe workaround — the table exists in the DB, it's just not yet reflected in the generated types.

