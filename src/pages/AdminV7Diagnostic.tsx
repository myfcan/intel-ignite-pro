/**
 * AdminV7Diagnostic - Interface de Diagnóstico Profundo V7
 * =========================================================
 * 
 * Dashboard para análise de aulas V7 com identificação de causas raiz
 * e geração de ações de correção executáveis.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  Search, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Copy,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Target,
  Zap,
  FileJson,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { V7DiagnosticEngine, type V7DiagnosticReport, type V7Finding, type V7CorrectionAction } from '@/lib/v7Diagnostic';

interface LessonOption {
  id: string;
  title: string;
  created_at: string;
  is_active: boolean;
}

export default function AdminV7Diagnostic() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<V7DiagnosticReport | null>(null);
  const [expandedFindings, setExpandedFindings] = useState<Set<string>>(new Set());
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  // Fetch V7 lessons
  useEffect(() => {
    async function fetchLessons() {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, created_at, is_active')
        .or('model.eq.v7,model.eq.v7-vv,lesson_type.eq.v7-cinematic')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lessons:', error);
        toast.error('Erro ao carregar aulas');
        return;
      }

      setLessons(data || []);
    }

    fetchLessons();
  }, []);

  // Run diagnostic
  const runDiagnostic = async () => {
    if (!selectedLessonId) {
      toast.error('Selecione uma aula');
      return;
    }

    setIsAnalyzing(true);
    setReport(null);

    try {
      const engine = new V7DiagnosticEngine();
      const result = await engine.analyze(selectedLessonId);
      setReport(result);
      
      if (result.summary.healthScore >= 80) {
        toast.success(`Diagnóstico completo: Score ${result.summary.healthScore}/100`);
      } else if (result.summary.healthScore >= 50) {
        toast.warning(`Diagnóstico completo: Score ${result.summary.healthScore}/100`);
      } else {
        toast.error(`Diagnóstico completo: Score ${result.summary.healthScore}/100`);
      }
    } catch (error) {
      console.error('Error running diagnostic:', error);
      toast.error('Erro ao executar diagnóstico');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy report to clipboard
  const copyReportForAI = () => {
    if (!report) return;

    const textReport = `
# V7 Diagnostic Report
## Aula: ${report.lessonTitle}
## Health Score: ${report.summary.healthScore}/100

### Sumário
- Total de Problemas: ${report.summary.totalFindings}
- Críticos: ${report.summary.criticalCount}
- Erros: ${report.summary.errorCount}
- Avisos: ${report.summary.warningCount}

### Causas Raiz
${report.rootCauses.map(c => `
**${c.type}**
${c.description}
Afeta: ${c.affectedFindings.length} elementos
`).join('\n')}

### Ações Necessárias
${report.actions.map((a, i) => `
${i + 1}. [Prioridade ${a.priority}] ${a.instruction}
   Resolve: ${a.resolvesFindings.join(', ')}
`).join('\n')}

### Detalhes dos Problemas
${report.findings.map(f => `
- [${f.severity.toUpperCase()}] ${f.problem}
  Esperado: ${f.evidence.expected}
  Encontrado: ${f.evidence.actual}
`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(textReport);
    toast.success('Diagnóstico copiado para clipboard');
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'warning':
        return <Info className="w-4 h-4 text-yellow-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      error: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return variants[severity] || variants.info;
  };

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Toggle finding expansion
  const toggleFinding = (id: string) => {
    const newExpanded = new Set(expandedFindings);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFindings(newExpanded);
  };

  // Toggle action expansion
  const toggleAction = (id: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedActions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/manual')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              V7 Diagnóstico Profundo
            </h1>
            <p className="text-sm text-muted-foreground">
              Análise de causas raiz e ações de correção para aulas V7
            </p>
          </div>
        </div>

        {/* Lesson Selector */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Selecionar Aula</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Selecione uma aula V7..." />
              </SelectTrigger>
              <SelectContent>
                {lessons.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    <div className="flex items-center gap-2">
                      <span className={lesson.is_active ? 'text-green-400' : 'text-muted-foreground'}>
                        {lesson.is_active ? '●' : '○'}
                      </span>
                      <span>{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({new Date(lesson.created_at).toLocaleDateString('pt-BR')})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={runDiagnostic} 
              disabled={!selectedLessonId || isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Analisar
            </Button>
          </CardContent>
        </Card>

        {/* Report Results */}
        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Health Score */}
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(report.summary.healthScore)}`}>
                    {report.summary.healthScore}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Health Score</p>
                </CardContent>
              </Card>

              {/* Critical Count */}
              <Card className={report.summary.criticalCount > 0 ? 'border-red-500/30' : ''}>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-red-400">
                    {report.summary.criticalCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Críticos</p>
                </CardContent>
              </Card>

              {/* Error Count */}
              <Card className={report.summary.errorCount > 0 ? 'border-orange-500/30' : ''}>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-orange-400">
                    {report.summary.errorCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Erros</p>
                </CardContent>
              </Card>

              {/* Warning Count */}
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400">
                    {report.summary.warningCount}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Avisos</p>
                </CardContent>
              </Card>
            </div>

            {/* Root Causes */}
            {report.rootCauses.length > 0 && (
              <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-red-400" />
                    Causas Raiz Identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.rootCauses.map((cause, index) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                          {cause.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Afeta {cause.affectedFindings.length} elementos
                        </span>
                      </div>
                      <p className="text-sm">{cause.description}</p>
                      {cause.evidence.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <strong>Evidências:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {cause.evidence.slice(0, 3).map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                            {cause.evidence.length > 3 && (
                              <li>... e mais {cause.evidence.length - 3}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {report.actions.length > 0 && (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Ações para Correção ({report.actions.length})
                  </CardTitle>
                  <CardDescription>
                    {report.summary.primaryAction}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {report.actions.map((action) => (
                        <Collapsible 
                          key={action.id} 
                          open={expandedActions.has(action.id)}
                          onOpenChange={() => toggleAction(action.id)}
                        >
                          <div className="p-3 bg-background/50 rounded-lg border">
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-start gap-3">
                                <Badge 
                                  variant="outline" 
                                  className={
                                    action.priority === 1 
                                      ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                                      : action.priority === 2
                                        ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  }
                                >
                                  P{action.priority}
                                </Badge>
                                <div className="flex-1 text-left">
                                  <p className="text-sm font-medium">{action.instruction}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Tipo: {action.type} | Resolve: {action.resolvesFindings.length} problema(s)
                                  </p>
                                </div>
                                {expandedActions.has(action.id) ? (
                                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-3 pt-3 border-t text-xs space-y-2">
                                {action.target && (
                                  <div>
                                    <strong>De:</strong> {action.target.from} → <strong>Para:</strong> {action.target.to}
                                  </div>
                                )}
                                {action.suggestedPatch && (
                                  <div className="p-2 bg-muted rounded font-mono text-xs">
                                    {JSON.stringify(action.suggestedPatch, null, 2)}
                                  </div>
                                )}
                                <div className="text-muted-foreground">
                                  Findings resolvidos: {action.resolvesFindings.join(', ')}
                                </div>
                              </div>
                            </CollapsibleContent>
                          </div>
                        </Collapsible>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* All Findings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileJson className="w-5 h-5" />
                  Todos os Problemas ({report.findings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {report.findings.map((finding) => (
                      <Collapsible 
                        key={finding.id}
                        open={expandedFindings.has(finding.id)}
                        onOpenChange={() => toggleFinding(finding.id)}
                      >
                        <div className={`p-3 rounded-lg border ${getSeverityBadge(finding.severity)}`}>
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(finding.severity)}
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium">{finding.problem}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {finding.type}
                                  </Badge>
                                  {finding.location.phaseId && (
                                    <span className="text-xs text-muted-foreground">
                                      Fase: {finding.location.phaseId}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {expandedFindings.has(finding.id) ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-3 pt-3 border-t text-xs space-y-2">
                              <div>
                                <strong>Esperado:</strong> {finding.evidence.expected}
                              </div>
                              <div>
                                <strong>Encontrado:</strong> {finding.evidence.actual}
                              </div>
                              {Object.keys(finding.evidence.data).length > 0 && (
                                <div className="p-2 bg-muted/50 rounded font-mono overflow-x-auto">
                                  <pre>{JSON.stringify(finding.evidence.data, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={copyReportForAI} variant="outline" className="gap-2">
                <Copy className="w-4 h-4" />
                Copiar Diagnóstico para IA
              </Button>
              <Button onClick={runDiagnostic} variant="outline" className="gap-2">
                <RotateCw className="w-4 h-4" />
                Re-analisar
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!report && !isAnalyzing && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Selecione uma aula V7 e clique em "Analisar" para executar o diagnóstico profundo.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analyzing State */}
        {isAnalyzing && (
          <Card>
            <CardContent className="py-12 text-center">
              <RotateCw className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">
                Analisando aula... Executando 60+ verificações...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
