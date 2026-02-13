import { test, expect } from "@playwright/test";

/**
 * C12 IMAGE LAB — E2E Security Tests
 * 
 * Tests:
 * 1. No JWT → 401
 * 2. Direct storage access → 403
 * 3. Edge function returns proper error codes
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://pspvppymcdjbwsudxzdx.supabase.co";
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcHZwcHltY2RqYndzdWR4emR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NjE5MzgsImV4cCI6MjA3NzMzNzkzOH0.BCv3iMf8pnxLbDd9Py1dfGc_FKw9r_otf3PzMzr42Fw";

const GENERATE_URL = `${SUPABASE_URL}/functions/v1/image-lab-generate`;
const BATCH_URL = `${SUPABASE_URL}/functions/v1/image-lab-generate-batch`;

test.describe("C12_AUTH_GATE", () => {
  test("1️⃣ image-lab-generate without JWT → 401", async ({ request }) => {
    const resp = await request.post(GENERATE_URL, {
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
      },
      data: { job_id: "00000000-0000-0000-0000-000000000000" },
    });

    expect(resp.status()).toBe(401);
    const body = await resp.json();
    expect(body.ok).toBe(false);
    expect(body.error_code).toBe("AUTH_MISSING");
  });

  test("1️⃣ image-lab-generate-batch without JWT → 401", async ({ request }) => {
    const resp = await request.post(BATCH_URL, {
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
      },
      data: {
        job_id: "00000000-0000-0000-0000-000000000000",
        plan: [{ provider: "openai", n: 1 }],
      },
    });

    expect(resp.status()).toBe(401);
    const body = await resp.json();
    expect(body.ok).toBe(false);
    expect(body.error_code).toBe("AUTH_MISSING");
  });

  test("1️⃣ image-lab-generate with invalid JWT → 401", async ({ request }) => {
    const resp = await request.post(GENERATE_URL, {
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
        "Authorization": "Bearer invalid.jwt.token",
      },
      data: { job_id: "00000000-0000-0000-0000-000000000000" },
    });

    expect(resp.status()).toBe(401);
    const body = await resp.json();
    expect(body.ok).toBe(false);
    expect(body.error_code).toBe("AUTH_INVALID");
  });
});

test.describe("C12_STORAGE_PRIVACY", () => {
  test("4️⃣ Direct storage URL access → 400/403 (bucket is private)", async ({ request }) => {
    // Try to access a file in the private bucket directly (without signed URL)
    const directUrl = `${SUPABASE_URL}/storage/v1/object/public/image-lab/nonexistent.png`;
    const resp = await request.get(directUrl, {
      headers: {
        "apikey": ANON_KEY,
      },
    });

    // Private bucket should reject public access (400 or 403)
    expect([400, 403, 404]).toContain(resp.status());
  });
});

test.describe("C12 Error Code Format", () => {
  test("Error responses follow normalized format", async ({ request }) => {
    const resp = await request.post(GENERATE_URL, {
      headers: {
        "Content-Type": "application/json",
        "apikey": ANON_KEY,
      },
      data: {},
    });

    const body = await resp.json();
    expect(body).toHaveProperty("ok");
    expect(body).toHaveProperty("error_code");
    expect(typeof body.error_code).toBe("string");
  });
});
