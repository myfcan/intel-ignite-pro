/**
 * Logger especializado para Pipeline V7-VV
 */

import { supabase } from '@/integrations/supabase/client';

export interface V7LogEntry {
  timestamp: string;
  step: number;
  stepName: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
  details?: Record<string, any>;
}

export class V7PipelineLogger {
  private logs: V7LogEntry[] = [];
  private executionId: string;

  constructor(executionId: string) {
    this.executionId = executionId;
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private async persistLog(entry: V7LogEntry): Promise<void> {
    // Salvar log no banco
    try {
      const currentLogs = await this.getPersistedLogs();
      const updatedLogs = [...currentLogs, entry];
      
      await supabase
        .from('pipeline_executions')
        .update({ logs: updatedLogs as unknown as any })
        .eq('id', this.executionId);
    } catch (error) {
      console.warn('Falha ao persistir log:', error);
    }
  }

  private async getPersistedLogs(): Promise<V7LogEntry[]> {
    const { data } = await supabase
      .from('pipeline_executions')
      .select('logs')
      .eq('id', this.executionId)
      .single();
    
    return (data?.logs as unknown as V7LogEntry[]) || [];
  }

  async info(step: number, stepName: string, message: string, details?: Record<string, any>): Promise<void> {
    const entry: V7LogEntry = {
      timestamp: this.formatTimestamp(),
      step,
      stepName,
      level: 'info',
      message,
      details
    };
    
    this.logs.push(entry);
    console.log(`ℹ️ [V7 Step ${step}] ${stepName}: ${message}`, details || '');
    await this.persistLog(entry);
  }

  async success(step: number, stepName: string, message: string, details?: Record<string, any>): Promise<void> {
    const entry: V7LogEntry = {
      timestamp: this.formatTimestamp(),
      step,
      stepName,
      level: 'success',
      message,
      details
    };
    
    this.logs.push(entry);
    console.log(`✅ [V7 Step ${step}] ${stepName}: ${message}`, details || '');
    await this.persistLog(entry);
  }

  async warn(step: number, stepName: string, message: string, details?: Record<string, any>): Promise<void> {
    const entry: V7LogEntry = {
      timestamp: this.formatTimestamp(),
      step,
      stepName,
      level: 'warn',
      message,
      details
    };
    
    this.logs.push(entry);
    console.warn(`⚠️ [V7 Step ${step}] ${stepName}: ${message}`, details || '');
    await this.persistLog(entry);
  }

  async error(step: number, stepName: string, message: string, details?: Record<string, any>): Promise<void> {
    const entry: V7LogEntry = {
      timestamp: this.formatTimestamp(),
      step,
      stepName,
      level: 'error',
      message,
      details
    };
    
    this.logs.push(entry);
    console.error(`❌ [V7 Step ${step}] ${stepName}: ${message}`, details || '');
    await this.persistLog(entry);
  }

  getLogs(): V7LogEntry[] {
    return [...this.logs];
  }

  getLogsByStep(step: number): V7LogEntry[] {
    return this.logs.filter(l => l.step === step);
  }

  getErrors(): V7LogEntry[] {
    return this.logs.filter(l => l.level === 'error');
  }

  hasErrors(): boolean {
    return this.logs.some(l => l.level === 'error');
  }
}
