import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  assertTransition,
  checkConcurrencyLock,
  canStartGeneration,
  canApprove,
  classifyProviderError,
  type JobStatus,
} from "@/lib/imageLabStateMachine";

describe("C12_JOB_STATE_MACHINE", () => {
  describe("Valid transitions", () => {
    const validCases: [JobStatus, JobStatus][] = [
      ["queued", "processing"],
      ["processing", "completed"],
      ["processing", "failed"],
      ["completed", "approved"],
      ["completed", "rejected"],
      ["failed", "queued"],
      ["rejected", "queued"],
    ];

    it.each(validCases)("%s → %s should be valid", (from, to) => {
      expect(isValidTransition(from, to)).toBe(true);
      expect(() => assertTransition(from, to)).not.toThrow();
    });
  });

  describe("Invalid transitions", () => {
    const invalidCases: [JobStatus, JobStatus][] = [
      ["processing", "queued"],     // C12: Never go back to queued from processing
      ["completed", "queued"],
      ["completed", "processing"],
      ["approved", "queued"],
      ["approved", "completed"],
      ["queued", "completed"],      // Must go through processing
      ["queued", "failed"],
      ["queued", "approved"],
      ["failed", "processing"],     // Must go through queued first
      ["failed", "completed"],
    ];

    it.each(invalidCases)("%s → %s should be INVALID", (from, to) => {
      expect(isValidTransition(from, to)).toBe(false);
      expect(() => assertTransition(from, to)).toThrow(`Invalid state transition: ${from} → ${to}`);
    });
  });

  describe("C12_CONCURRENCY_LOCK", () => {
    it("processing → returns LOCKED", () => {
      expect(checkConcurrencyLock("processing")).toBe("LOCKED");
    });

    it("queued → returns null (not locked)", () => {
      expect(checkConcurrencyLock("queued")).toBeNull();
    });

    it("failed → returns null (not locked)", () => {
      expect(checkConcurrencyLock("failed")).toBeNull();
    });

    it("completed → returns null", () => {
      expect(checkConcurrencyLock("completed")).toBeNull();
    });
  });

  describe("canStartGeneration", () => {
    it("queued → true", () => expect(canStartGeneration("queued")).toBe(true));
    it("failed → true", () => expect(canStartGeneration("failed")).toBe(true));
    it("rejected → true", () => expect(canStartGeneration("rejected")).toBe(true));
    it("processing → false", () => expect(canStartGeneration("processing")).toBe(false));
    it("completed → false", () => expect(canStartGeneration("completed")).toBe(false));
    it("approved → false", () => expect(canStartGeneration("approved")).toBe(false));
  });

  describe("canApprove", () => {
    it("admin + completed + has asset → allowed", () => {
      const result = canApprove("completed", "admin", true);
      expect(result.allowed).toBe(true);
    });

    it("supervisor + completed → FORBIDDEN", () => {
      const result = canApprove("completed", "supervisor", true);
      expect(result.allowed).toBe(false);
      expect(result.errorCode).toBe("FORBIDDEN");
    });

    it("admin + processing → INVALID_STATUS", () => {
      const result = canApprove("processing", "admin", true);
      expect(result.allowed).toBe(false);
      expect(result.errorCode).toBe("INVALID_STATUS");
    });

    it("admin + completed + no asset → INVALID_STATUS", () => {
      const result = canApprove("completed", "admin", false);
      expect(result.allowed).toBe(false);
      expect(result.errorCode).toBe("INVALID_STATUS");
    });
  });

  describe("classifyProviderError", () => {
    it("429 → RATE_LIMIT", () => {
      expect(classifyProviderError(429, "rate limit exceeded")).toBe("RATE_LIMIT");
    });

    it("408 → TIMEOUT", () => {
      expect(classifyProviderError(408, "request timeout")).toBe("TIMEOUT");
    });

    it("500 → PROVIDER_5XX", () => {
      expect(classifyProviderError(500, "internal server error")).toBe("PROVIDER_5XX");
    });

    it("content_policy in body → CONTENT_POLICY", () => {
      expect(classifyProviderError(400, "content_policy_violation")).toBe("CONTENT_POLICY");
    });

    it("unknown 400 → GENERATION_FAILED", () => {
      expect(classifyProviderError(400, "something else")).toBe("GENERATION_FAILED");
    });
  });
});
