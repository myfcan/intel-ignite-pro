# C12 — AI Image Lab Contract v1.0

> **Status**: ACTIVE  
> **Owner**: AIliv Engineering  
> **Created**: 2026-02-13  
> **Scope**: Edge Functions `image-lab-generate`, `image-lab-generate-batch` + Admin UI  

---

## 1. C12_AUTH_GATE

### Invariants

| Rule | Detail |
|------|--------|
| JWT Required | Every edge function requires `Authorization: Bearer <JWT>` |
| Validation Method | `supabase.auth.getClaims(token)` — extracts `sub` (user_id) |
| Role: generate | `admin` OR `supervisor` |
| Role: approve/reject | `admin` ONLY |
| Missing JWT | → HTTP 401 + `{ error_code: "AUTH_MISSING" }` |
| Invalid JWT | → HTTP 401 + `{ error_code: "AUTH_INVALID" }` |
| Wrong role | → HTTP 403 + `{ error_code: "FORBIDDEN" }` |

### `verify_jwt` Decision

`verify_jwt = false` in `supabase/config.toml` — incompatible with Lovable Cloud signing-keys.  
Auth is enforced **in-code** via `getClaims()` + role check against `user_roles` table.

### Tests

- `tests/e2e/imageLabSecurity.spec.ts`: Request without JWT → 401
- `tests/e2e/imageLabSecurity.spec.ts`: Supervisor cannot approve → 403 (UI enforced)

---

## 2. C12_STORAGE_PRIVACY

### Invariants

| Rule | Detail |
|------|--------|
| Bucket `image-lab` | `public = false` |
| No public_read policy | Zero `SELECT` policies without auth check |
| UI access | Via `createSignedUrl(path, 3600)` only |
| DB persistence | `storage_path` stored, **never** signed URL |

### Tests

- Direct storage URL access → 403
- `SignedImage` component fetches signed URL on-demand

---

## 3. C12_JOB_STATE_MACHINE

### Valid Transitions

```
queued → processing → completed
                    → failed
completed → approved (admin only)
          → rejected (admin only)
failed → queued (retry)
rejected → queued (retry)
```

### Rules

| Rule | Detail |
|------|--------|
| No backward to queued from processing | ❌ `processing → queued` forbidden |
| No retry while processing | If `status = processing` → error `LOCKED` |
| Approve requires asset | `approved_asset_id` must reference `asset.status = 'completed'` |
| Single approval | Max 1 `approved_asset_id` per job |
| Admin-only approval | `approve/reject` operations check `role = 'admin'` |

### Error Codes (Normalized Enum)

```typescript
type ImageLabErrorCode =
  | "AUTH_MISSING"
  | "AUTH_INVALID"
  | "FORBIDDEN"
  | "MISSING_JOB_ID"
  | "JOB_NOT_FOUND"
  | "PRESET_NOT_FOUND"
  | "INVALID_STATUS"
  | "LOCKED"
  | "RATE_LIMIT"
  | "TIMEOUT"
  | "CONTENT_POLICY"
  | "PROVIDER_5XX"
  | "INVALID_PROMPT"
  | "GENERATION_FAILED"
  | "BATCH_FAILED"
  | "UNKNOWN";
```

### Tests

- `tests/unit/imageLabStateMachine.test.ts`: All valid transitions pass
- `tests/unit/imageLabStateMachine.test.ts`: Invalid transitions throw

---

## 4. C12_IDEMPOTENCY

### Hash Formula

```
SHA256(provider | model | size | preset_key | preset_version | prompt_final)
```

### Rules

| Rule | Detail |
|------|--------|
| Cache lookup | Before generation, check `image_assets` for matching `hash` with `status IN ('approved', 'completed')` |
| Cache hit | Set `cache_hit = true` on job, skip generation, return cached asset |
| No duplication | Retry with identical prompt must NOT create duplicate assets |

### Tests

- `tests/unit/imageLabIdempotency.test.ts`: Same hash → returns cached, no new asset
- `tests/unit/imageLabIdempotency.test.ts`: Different hash → generates new asset

---

## 5. C12_CONCURRENCY_LOCK

### Rules

| Rule | Detail |
|------|--------|
| Pre-generate check | If `job.status = 'processing'` → return error `LOCKED` |
| Atomicity | Status transition `queued → processing` must be guarded |

### Tests

- `tests/unit/imageLabStateMachine.test.ts`: Concurrent calls → only 1 executes
- Edge function returns `{ error_code: "LOCKED" }` for second caller

---

## 6. Acceptance Checklist

- [ ] Bucket `image-lab` is `public = false`
- [ ] `verify_jwt = false` + in-code auth via `getClaims()`
- [ ] Concurrency lock validated
- [ ] State machine protected (no invalid transitions)
- [ ] Cache hash working (idempotent generation)
- [ ] E2E: no JWT → 401
- [ ] E2E: supervisor cannot approve
- [ ] E2E: admin can approve
- [ ] CI blocks regression
- [ ] This document exists and is versioned

---

## 7. Out of Scope (v1.0)

- ❌ Pipeline integration
- ❌ Multi-provider automatic fallback
- ❌ Image quality tuning
- ❌ Preset modification
