import { describe, it, expect } from "vitest";
import { buildHashInput } from "@/lib/imageLabStateMachine";

describe("C12_IDEMPOTENCY", () => {
  const baseParams = {
    provider: "openai",
    model: "gpt-image-1",
    size: "1024x1024",
    presetKey: "cinematic-01",
    presetVersion: "1.0",
    promptFinal: "A man looking at a glowing screen with wonder",
  };

  describe("buildHashInput", () => {
    it("produces deterministic output", () => {
      const hash1 = buildHashInput(baseParams);
      const hash2 = buildHashInput(baseParams);
      expect(hash1).toBe(hash2);
    });

    it("produces correct pipe-separated format", () => {
      const result = buildHashInput(baseParams);
      expect(result).toBe(
        "openai|gpt-image-1|1024x1024|cinematic-01|1.0|A man looking at a glowing screen with wonder"
      );
    });

    it("different provider → different hash input", () => {
      const h1 = buildHashInput(baseParams);
      const h2 = buildHashInput({ ...baseParams, provider: "gemini" });
      expect(h1).not.toBe(h2);
    });

    it("different model → different hash input", () => {
      const h1 = buildHashInput(baseParams);
      const h2 = buildHashInput({ ...baseParams, model: "dall-e-3" });
      expect(h1).not.toBe(h2);
    });

    it("different size → different hash input", () => {
      const h1 = buildHashInput(baseParams);
      const h2 = buildHashInput({ ...baseParams, size: "1536x1024" });
      expect(h1).not.toBe(h2);
    });

    it("different preset version → different hash input", () => {
      const h1 = buildHashInput(baseParams);
      const h2 = buildHashInput({ ...baseParams, presetVersion: "2.0" });
      expect(h1).not.toBe(h2);
    });

    it("different prompt → different hash input", () => {
      const h1 = buildHashInput(baseParams);
      const h2 = buildHashInput({ ...baseParams, promptFinal: "A woman smiling" });
      expect(h1).not.toBe(h2);
    });

    it("whitespace matters in prompt", () => {
      const h1 = buildHashInput(baseParams);
      const h2 = buildHashInput({ ...baseParams, promptFinal: baseParams.promptFinal + " " });
      expect(h1).not.toBe(h2);
    });
  });

  describe("Cache hit scenario (contract verification)", () => {
    it("identical params always produce identical hash input — guarantees idempotency", () => {
      // Simulate N retries with same params
      const results = Array.from({ length: 10 }, () => buildHashInput(baseParams));
      const unique = new Set(results);
      expect(unique.size).toBe(1);
    });
  });
});
