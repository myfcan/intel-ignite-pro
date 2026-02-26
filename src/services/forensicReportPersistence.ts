export type ForensicAuditGate = {
  checked: boolean;
  passed: boolean;
  httpStatus: number | null;
  requiredFailed: number | null;
  scorecardHash: string | null;
};

export type ReleaseForensicReportLike = {
  runId: string;
  pipelineVersion: string;
  mode: 'create' | 'reprocess' | 'dry_run';
  generatedAt: string;
  auditGate: ForensicAuditGate;
};

export type FailedForensicMergeParams = {
  currentOutputData?: Record<string, unknown> | null;
  lessonId?: string | null;
  releaseForensicReport: ReleaseForensicReportLike;
  errorCode: string;
  contractVersion: string;
  activeContracts: string[];
  forceTestBatchId?: string;
  forceTestRunTag?: string;
};

export function mergeFailedForensicMeta(params: FailedForensicMergeParams): Record<string, unknown> {
  const current = params.currentOutputData ?? {};
  const currentMeta = (current.meta as Record<string, unknown> | undefined) ?? {};

  return {
    ...current,
    lesson_id: (current.lesson_id as string | undefined) ?? params.lessonId ?? null,
    meta: {
      ...currentMeta,
      contractVersion: params.contractVersion,
      contracts: params.activeContracts,
      triggerContract: 'anchorActions',
      failedAt: params.releaseForensicReport.generatedAt,
      errorCode: params.errorCode,
      auditGate: {
        checked: params.releaseForensicReport.auditGate.checked,
        passed: params.releaseForensicReport.auditGate.passed,
        httpStatus: params.releaseForensicReport.auditGate.httpStatus,
        scorecardHash: params.releaseForensicReport.auditGate.scorecardHash,
      },
      releaseForensicReport: params.releaseForensicReport,
      ...(params.forceTestBatchId ? { forceTestBatchId: params.forceTestBatchId } : {}),
      ...(params.forceTestRunTag ? { forceTestRunTag: params.forceTestRunTag } : {}),
    },
  };
}
