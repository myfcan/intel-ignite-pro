import { describe, expect, it } from 'vitest';

import { mergeFailedForensicMeta, type ReleaseForensicReportLike } from './forensicReportPersistence';

const baseForensic = (): ReleaseForensicReportLike => ({
  runId: 'run-1',
  pipelineVersion: 'v7-vv-1.1.5-forensic-persist',
  mode: 'create',
  generatedAt: '2026-02-25T00:00:00.000Z',
  auditGate: {
    checked: true,
    passed: false,
    httpStatus: 422,
    requiredFailed: 2,
    scorecardHash: 'hash-abc',
  },
});

describe('mergeFailedForensicMeta', () => {
  it('persiste releaseForensicReport em meta', () => {
    const merged = mergeFailedForensicMeta({
      currentOutputData: { content: [] },
      lessonId: 'lesson-1',
      releaseForensicReport: baseForensic(),
      errorCode: 'AUDIT_GATE_FAILED',
      contractVersion: 'c10b',
      activeContracts: ['C05'],
    });

    expect((merged.meta as any).releaseForensicReport.pipelineVersion).toBe('v7-vv-1.1.5-forensic-persist');
  });

  it('persiste auditGate derivado do releaseForensicReport', () => {
    const merged = mergeFailedForensicMeta({
      currentOutputData: {},
      lessonId: 'lesson-1',
      releaseForensicReport: baseForensic(),
      errorCode: 'AUDIT_GATE_FAILED',
      contractVersion: 'c10b',
      activeContracts: ['C05'],
    });

    expect((merged.meta as any).auditGate).toEqual({
      checked: true,
      passed: false,
      httpStatus: 422,
      scorecardHash: 'hash-abc',
    });
  });

  it('mantém fields existentes em output_data', () => {
    const merged = mergeFailedForensicMeta({
      currentOutputData: { content: [{ id: 'p1' }], something: 123 },
      lessonId: 'lesson-1',
      releaseForensicReport: baseForensic(),
      errorCode: 'AUDIT_GATE_FAILED',
      contractVersion: 'c10b',
      activeContracts: ['C05'],
    });

    expect((merged as any).content).toHaveLength(1);
    expect((merged as any).something).toBe(123);
  });

  it('usa lesson_id existente quando disponível', () => {
    const merged = mergeFailedForensicMeta({
      currentOutputData: { lesson_id: 'existing-lesson' },
      lessonId: 'incoming-lesson',
      releaseForensicReport: baseForensic(),
      errorCode: 'AUDIT_GATE_FAILED',
      contractVersion: 'c10b',
      activeContracts: ['C05'],
    });

    expect((merged as any).lesson_id).toBe('existing-lesson');
  });

  it('adiciona forceTest metadados quando informados', () => {
    const merged = mergeFailedForensicMeta({
      currentOutputData: {},
      lessonId: 'lesson-1',
      releaseForensicReport: baseForensic(),
      errorCode: 'AUDIT_GATE_FAILED',
      contractVersion: 'c10b',
      activeContracts: ['C05'],
      forceTestBatchId: 'batch-1',
      forceTestRunTag: 'tag-1',
    });

    expect((merged.meta as any).forceTestBatchId).toBe('batch-1');
    expect((merged.meta as any).forceTestRunTag).toBe('tag-1');
  });

  it('preenche errorCode e contract metadata', () => {
    const merged = mergeFailedForensicMeta({
      currentOutputData: {},
      lessonId: null,
      releaseForensicReport: baseForensic(),
      errorCode: 'UNSTRUCTURED_ERROR',
      contractVersion: 'c10b-boundaryfix-execstate-c11-c03-1.0',
      activeContracts: ['C01', 'C05', 'C10B'],
    });

    expect((merged.meta as any).errorCode).toBe('UNSTRUCTURED_ERROR');
    expect((merged.meta as any).contractVersion).toContain('c10b-boundaryfix');
    expect((merged.meta as any).contracts).toContain('C10B');
  });
});
