/**
 * C12_JOB_STATE_MACHINE — Image Lab state machine + concurrency lock + idempotency
 * 
 * This module defines the valid state transitions, error codes, and hash logic
 * for the AI Image Lab, as specified in docs/contracts/C12_IMAGE_LAB.md
 */

// === Normalized Error Codes ===
export type ImageLabErrorCode =
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

// === Job Status ===
export type JobStatus = "queued" | "processing" | "completed" | "failed" | "approved" | "rejected";

// === Valid Transitions ===
const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  queued: ["processing"],
  processing: ["completed", "failed"],
  completed: ["approved", "rejected"],
  failed: ["queued"],     // retry
  approved: [],           // terminal
  rejected: ["queued"],   // retry
};

/**
 * Check if a state transition is valid per the C12 contract.
 */
export function isValidTransition(from: JobStatus, to: JobStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Assert a state transition is valid. Throws if invalid.
 */
export function assertTransition(from: JobStatus, to: JobStatus): void {
  if (!isValidTransition(from, to)) {
    throw new Error(`Invalid state transition: ${from} → ${to}`);
  }
}

/**
 * Check if a job can start generation (concurrency lock).
 * Returns error code if locked, null if OK.
 */
export function checkConcurrencyLock(currentStatus: string): ImageLabErrorCode | null {
  if (currentStatus === "processing") {
    return "LOCKED";
  }
  return null;
}

/**
 * Check if a job status allows generation to start.
 * Only queued, failed, rejected can start generation.
 */
export function canStartGeneration(status: string): boolean {
  return ["queued", "failed", "rejected"].includes(status);
}

/**
 * Check if a job can be approved.
 * Only admin role, only completed status, requires asset.
 */
export function canApprove(jobStatus: string, userRole: string, hasCompletedAsset: boolean): { allowed: boolean; errorCode?: ImageLabErrorCode; reason?: string } {
  if (userRole !== "admin") {
    return { allowed: false, errorCode: "FORBIDDEN", reason: "Only admin can approve" };
  }
  if (jobStatus !== "completed") {
    return { allowed: false, errorCode: "INVALID_STATUS", reason: `Job status is ${jobStatus}, expected completed` };
  }
  if (!hasCompletedAsset) {
    return { allowed: false, errorCode: "INVALID_STATUS", reason: "No completed asset to approve" };
  }
  return { allowed: true };
}

/**
 * Compute the idempotency hash input string.
 * Hash = SHA256(provider|model|size|preset_key|preset_version|prompt_final)
 */
export function buildHashInput(params: {
  provider: string;
  model: string;
  size: string;
  presetKey: string;
  presetVersion: string;
  promptFinal: string;
}): string {
  return `${params.provider}|${params.model}|${params.size}|${params.presetKey}|${params.presetVersion}|${params.promptFinal}`;
}

/**
 * Classify a provider error into a normalized error code.
 */
export function classifyProviderError(statusCode: number, errorBody: string): ImageLabErrorCode {
  if (statusCode === 429) return "RATE_LIMIT";
  if (statusCode === 408 || errorBody.toLowerCase().includes("timeout")) return "TIMEOUT";
  if (errorBody.toLowerCase().includes("content_policy") || errorBody.toLowerCase().includes("safety")) return "CONTENT_POLICY";
  if (statusCode >= 500) return "PROVIDER_5XX";
  if (errorBody.toLowerCase().includes("invalid") && errorBody.toLowerCase().includes("prompt")) return "INVALID_PROMPT";
  return "GENERATION_FAILED";
}
