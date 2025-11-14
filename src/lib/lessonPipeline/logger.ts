import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  timestamp: string;
  step: number;
  stepName: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  data?: any;
}

export interface StepProgress {
  status: 'pending' | 'running' | 'completed' | 'failed';
  message: string;
  timestamp: string;
  duration?: number;
  startTime?: number;
}

export class PipelineLogger {
  private executionId: string;
  private logs: LogEntry[] = [];
  private stepProgress: Record<number, StepProgress> = {};

  constructor(executionId: string) {
    this.executionId = executionId;
  }

  private async saveToDatabase() {
    try {
      await supabase.from('pipeline_executions').update({
        logs: this.logs as any,
        step_progress: this.stepProgress as any,
        updated_at: new Date().toISOString()
      }).eq('id', this.executionId);
    } catch (error) {
      console.error('[Logger] Erro ao salvar no banco:', error);
    }
  }

  async log(step: number, stepName: string, level: LogEntry['level'], message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      step,
      stepName,
      level,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    // Console colorido
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      success: '✅'
    }[level];
    
    console.log(`${emoji} [STEP ${step}] ${stepName}: ${message}`, data || '');

    // Atualizar progresso do step
    if (!this.stepProgress[step]) {
      this.stepProgress[step] = {
        status: 'running',
        message: '',
        timestamp: logEntry.timestamp,
        startTime: Date.now()
      };
    }

    this.stepProgress[step].message = message;
    this.stepProgress[step].timestamp = logEntry.timestamp;

    if (level === 'error') {
      this.stepProgress[step].status = 'failed';
    } else if (level === 'success') {
      this.stepProgress[step].status = 'completed';
      if (this.stepProgress[step].startTime) {
        this.stepProgress[step].duration = Date.now() - this.stepProgress[step].startTime!;
      }
    }

    await this.saveToDatabase();
  }

  async info(step: number, stepName: string, message: string, data?: any) {
    return this.log(step, stepName, 'info', message, data);
  }

  async success(step: number, stepName: string, message: string, data?: any) {
    return this.log(step, stepName, 'success', message, data);
  }

  async warn(step: number, stepName: string, message: string, data?: any) {
    return this.log(step, stepName, 'warn', message, data);
  }

  async error(step: number, stepName: string, message: string, data?: any) {
    return this.log(step, stepName, 'error', message, data);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  getStepProgress(): Record<number, StepProgress> {
    return this.stepProgress;
  }
}
