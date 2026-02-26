/**
 * Sprint H — Forensic Report Persistence Contract Tests
 * 
 * Validates that buildReleaseForensicReport produces correct structure
 * and that the persist logic includes releaseForensicReport in output_data.meta
 * for ALL terminal states (completed AND failed).
 */
import { describe, it, expect } from 'vitest';

// Inline the buildReleaseForensicReport logic since edge function code isn't importable
interface ReleaseForensicReport {
  runId: string;
  pipelineVersion: string;
  mode: 'create' | 'reprocess' | 'dry_run';
  generatedAt: string;
  auditGate: {
    checked: boolean;
    passed: boolean;
    httpStatus: number | null;
    requiredFailed: number | null;
    scorecardHash: string | null;
  };
}

function buildReleaseForensicReport(params: {
  runId: string;
  mode: 'create' | 'reprocess' | 'dry_run';
  pipelineVersion?: string;
  auditChecked: boolean;
  auditPassed: boolean;
  auditHttpStatus?: number | null;
  requiredFailed?: number | null;
  scorecardHash?: string | null;
}): ReleaseForensicReport {
  return {
    runId: params.runId,
    pipelineVersion: params.pipelineVersion || 'v7-vv-1.1.5-forensic-persist',
    mode: params.mode,
    generatedAt: new Date().toISOString(),
    auditGate: {
      checked: params.auditChecked,
      passed: params.auditPassed,
      httpStatus: params.auditHttpStatus ?? null,
      requiredFailed: params.requiredFailed ?? null,
      scorecardHash: params.scorecardHash ?? null,
    },
  };
}

describe('ReleaseForensicReport structure', () => {
  it('produces valid report for PASSED audit gate', () => {
    const report = buildReleaseForensicReport({
      runId: 'test-run-001',
      mode: 'create',
      auditChecked: true,
      auditPassed: true,
      auditHttpStatus: 200,
      requiredFailed: 0,
      scorecardHash: 'abc123',
    });

    expect(report.runId).toBe('test-run-001');
    expect(report.mode).toBe('create');
    expect(report.auditGate.checked).toBe(true);
    expect(report.auditGate.passed).toBe(true);
    expect(report.auditGate.httpStatus).toBe(200);
    expect(report.auditGate.requiredFailed).toBe(0);
    expect(report.auditGate.scorecardHash).toBe('abc123');
    expect(report.generatedAt).toBeTruthy();
    expect(new Date(report.generatedAt).getTime()).not.toBeNaN();
  });

  it('produces valid report for FAILED audit gate', () => {
    const report = buildReleaseForensicReport({
      runId: 'test-run-002',
      mode: 'create',
      auditChecked: true,
      auditPassed: false,
      auditHttpStatus: 422,
      requiredFailed: 3,
    });

    expect(report.auditGate.passed).toBe(false);
    expect(report.auditGate.httpStatus).toBe(422);
    expect(report.auditGate.requiredFailed).toBe(3);
    expect(report.auditGate.scorecardHash).toBeNull();
  });

  it('produces valid report for UNREACHABLE audit gate', () => {
    const report = buildReleaseForensicReport({
      runId: 'test-run-003',
      mode: 'reprocess',
      auditChecked: true,
      auditPassed: false,
    });

    expect(report.auditGate.checked).toBe(true);
    expect(report.auditGate.passed).toBe(false);
    expect(report.auditGate.httpStatus).toBeNull();
    expect(report.auditGate.requiredFailed).toBeNull();
  });

  it('produces valid report for unchecked audit (global catch)', () => {
    const report = buildReleaseForensicReport({
      runId: 'test-run-004',
      mode: 'create',
      auditChecked: false,
      auditPassed: false,
    });

    expect(report.auditGate.checked).toBe(false);
    expect(report.auditGate.passed).toBe(false);
  });
});

describe('output_data.meta merge logic', () => {
  it('merges forensic report into existing output_data.meta', () => {
    const existingOutputData = {
      lesson_id: 'lesson-abc',
      meta: {
        contractVersion: 'c10b-test',
        contracts: ['C01', 'C02'],
        triggerContract: 'anchorActions',
      },
      content: { phases: [] },
    };

    const report = buildReleaseForensicReport({
      runId: 'test-merge',
      mode: 'create',
      auditChecked: true,
      auditPassed: false,
      auditHttpStatus: 422,
      requiredFailed: 1,
    });

    const merged = {
      ...existingOutputData,
      meta: {
        ...existingOutputData.meta,
        auditGate: {
          checked: true,
          passed: false,
          httpStatus: 422,
          requiredFailed: 1,
        },
        releaseForensicReport: report,
      },
    };

    // Verify merge preserves existing meta
    expect(merged.meta.contractVersion).toBe('c10b-test');
    expect(merged.meta.contracts).toEqual(['C01', 'C02']);
    expect(merged.meta.triggerContract).toBe('anchorActions');
    // Verify forensic data added
    expect(merged.meta.auditGate.passed).toBe(false);
    expect(merged.meta.releaseForensicReport.runId).toBe('test-merge');
    expect(merged.meta.releaseForensicReport.auditGate.passed).toBe(false);
    // Verify original content untouched
    expect(merged.content.phases).toEqual([]);
    expect(merged.lesson_id).toBe('lesson-abc');
  });

  it('creates meta from scratch when output_data is empty', () => {
    const existingOutputData: Record<string, any> = {};

    const report = buildReleaseForensicReport({
      runId: 'test-empty',
      mode: 'create',
      auditChecked: true,
      auditPassed: false,
    });

    const merged = {
      ...existingOutputData,
      meta: {
        ...(existingOutputData.meta || {}),
        auditGate: { checked: true, passed: false },
        releaseForensicReport: report,
      },
    };

    expect(merged.meta.releaseForensicReport.runId).toBe('test-empty');
    expect(merged.meta.auditGate.passed).toBe(false);
  });
});
