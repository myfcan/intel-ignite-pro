

# Add V8 Badge to Exercise Library

## Problem

The `/admin/exercise-library` page shows only "V5" and "V7" badges for each exercise type, but all 11 types are also integrated into V8. The badges should reflect this.

## Changes

### File: `src/pages/AdminExerciseLibrary.tsx`

**1. Update the type definition (line 215)**

Change `version` type from `('V5' | 'V7')[]` to `('V5' | 'V7' | 'V8')[]`.

**2. Add 'V8' to every exercise entry (lines 221-231)**

Add `'V8'` to the `version` array of all 11 exercise types. For example:
- `version: ['V5', 'V7']` becomes `version: ['V5', 'V7', 'V8']`
- `version: ['V7']` (timed-quiz) becomes `version: ['V7', 'V8']`

This is a data-only change -- the rendering logic already maps the `version` array to Badge components, so the V8 badges will appear automatically.

