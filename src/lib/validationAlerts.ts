/**
 * Sistema de alertas para validações
 * Salva notificações automáticas no banco quando testes falharem
 */

import { supabase } from '@/integrations/supabase/client';
import type { GuaranteeReport } from './validationSystem';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface ValidationAlert {
  id: string;
  created_at: string;
  guarantee_name: string;
  test_name: string;
  severity: AlertSeverity;
  message: string;
  details: any;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
}

/**
 * Cria alertas no banco baseado nos resultados dos testes
 */
export async function createAlertsFromReport(report: GuaranteeReport): Promise<void> {
  const failedTests = report.details.filter(t => !t.passed);
  
  if (failedTests.length === 0) return;

  const alerts = failedTests.map(test => ({
    guarantee_name: report.guarantee,
    test_name: test.name,
    severity: determineSeverity(report.guarantee, test.name),
    message: `Teste "${test.name}" falhou na garantia "${report.guarantee}"`,
    details: {
      duration: test.duration,
      testDetails: test.details,
      error: test.error,
      timestamp: new Date().toISOString()
    }
  }));

  const { error } = await supabase
    .from('validation_alerts')
    .insert(alerts);

  if (error) {
    console.error('❌ Erro ao criar alertas:', error);
  } else {
    console.log(`✅ ${alerts.length} alertas criados com sucesso`);
  }
}

/**
 * Determina a severidade do alerta baseado na garantia e teste
 */
function determineSeverity(guarantee: string, testName: string): AlertSeverity {
  // Testes de TypeScript são críticos
  if (guarantee.includes('TypeScript')) {
    return 'critical';
  }
  
  // Testes de sync blocking são críticos
  if (guarantee.includes('sync')) {
    return 'critical';
  }
  
  // Validação defensiva é warning (não quebra, mas pode ter problemas)
  if (guarantee.includes('defensiva')) {
    return 'warning';
  }
  
  // Sistema de versão é info
  if (guarantee.includes('versão')) {
    return 'info';
  }
  
  return 'warning';
}

/**
 * Busca alertas não resolvidos
 */
export async function getUnresolvedAlerts(): Promise<any[]> {
  const { data, error } = await supabase
    .from('validation_alerts')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar alertas:', error);
    return [];
  }

  return data || [];
}

/**
 * Marca um alerta como resolvido
 */
export async function resolveAlert(alertId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase
    .from('validation_alerts')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: user?.id || null
    })
    .eq('id', alertId);

  if (error) {
    console.error('❌ Erro ao resolver alerta:', error);
    throw error;
  }
}

/**
 * Busca estatísticas de alertas
 */
export async function getAlertStats() {
  const { data, error } = await supabase
    .from('validation_alerts')
    .select('severity, resolved');

  if (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    return { total: 0, unresolved: 0, critical: 0, warning: 0, info: 0 };
  }

  const stats = {
    total: data.length,
    unresolved: data.filter(a => !a.resolved).length,
    critical: data.filter(a => a.severity === 'critical' && !a.resolved).length,
    warning: data.filter(a => a.severity === 'warning' && !a.resolved).length,
    info: data.filter(a => a.severity === 'info' && !a.resolved).length
  };

  return stats;
}
