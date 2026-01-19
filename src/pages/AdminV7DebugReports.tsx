/**
 * Admin V7 Debug Reports Panel
 * =============================
 * 
 * Painel para visualizar e filtrar debug reports do pipeline e player V7.
 * 
 * Features:
 * - Seletor de aula para análise
 * - Botão para enviar para análise AI
 * - Checklist de correções aplicadas
 * - Lista de todos os reports com filtros por severidade
 * - Detalhes expandíveis de cada report
 * - Health score visual
 * - Issues agrupadas por categoria
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronRight,
  Activity,
  FileAudio,
  Clock,
  Play,
  Layers,
  Eye,
  Send,
  ClipboardCheck,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DebugReport {
  id: string;
  lesson_id: string;
  lesson_title: string;
  generated_at: string;
  source: 'pipeline' | 'player' | 'combined';
  schema_version: string;
  health_score: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  total_issues: number;
  audio_report: any;
  timeline_report: any;
  execution_report: any;
  rendering_report: any;
  player_report: any;
  summary_report: any;
  all_issues: any[];
  created_at: string;
}

interface V7Lesson {
  id: string;
  title: string;
  model: string;
  is_active: boolean;
  created_at: string;
}

interface CorrectionItem {
  id: string;
  label: string;
  checked: boolean;
  category: 'audio' | 'timeline' | 'rendering' | 'anchors' | 'player';
}

const severityColors: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
  info: 'bg-gray-500',
};

const severityBadgeVariants: Record<string, 'destructive' | 'secondary' | 'default' | 'outline'> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
  info: 'outline',
};

const healthScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
};

const defaultCorrections: CorrectionItem[] = [
  { id: 'truncation', label: 'Truncamento de narração corrigido', checked: false, category: 'audio' },
  { id: 'timestamps', label: 'Timestamps word-level sincronizados', checked: false, category: 'audio' },
  { id: 'phase-overlap', label: 'Overlaps de fases eliminados', checked: false, category: 'timeline' },
  { id: 'anchor-found', label: 'Todas as âncoras encontradas', checked: false, category: 'anchors' },
  { id: 'revelation-render', label: 'Revelation renderiza no first-play', checked: false, category: 'rendering' },
  { id: 'seek-rewind', label: 'Eventos funcionam após seek/rewind', checked: false, category: 'player' },
  { id: 'quiz-trigger', label: 'Quiz dispara corretamente', checked: false, category: 'player' },
  { id: 'playground-loads', label: 'Playground carrega com dados', checked: false, category: 'player' },
];

const HealthScoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-muted/30"
        />
        <circle
          cx="48"
          cy="48"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={healthScoreColor(score)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${healthScoreColor(score)}`}>{score}</span>
      </div>
    </div>
  );
};

const IssueCard = ({ issue }: { issue: any }) => (
  <div className="p-3 bg-muted/50 rounded-lg border border-muted">
    <div className="flex items-start gap-3">
      <Badge variant={severityBadgeVariants[issue.level] || 'outline'} className="mt-0.5">
        {issue.level}
      </Badge>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{issue.message}</p>
        <p className="text-xs text-muted-foreground mt-1">{issue.details}</p>
        {issue.suggestedFix && (
          <p className="text-xs text-cyan-500 mt-2">
            💡 {issue.suggestedFix}
          </p>
        )}
      </div>
    </div>
  </div>
);

const ReportSection = ({ 
  title, 
  icon: Icon, 
  data, 
  issues 
}: { 
  title: string; 
  icon: React.ElementType; 
  data: any; 
  issues: any[] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!data) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{title}</span>
            {issues.length > 0 && (
              <Badge variant="secondary">{issues.length} issues</Badge>
            )}
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2 pl-8">
        {issues.map((issue, idx) => (
          <IssueCard key={idx} issue={issue} />
        ))}
        {issues.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum issue nesta seção</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default function AdminV7DebugReports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [corrections, setCorrections] = useState<CorrectionItem[]>(defaultCorrections);
  const [analysisJson, setAnalysisJson] = useState<string>('');

  // Fetch V7 lessons for selector
  const { data: v7Lessons } = useQuery({
    queryKey: ['v7-lessons-selector'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, model, is_active, created_at')
        .or('model.like.v7%,lesson_type.eq.v7')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as V7Lesson[];
    },
  });

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['v7-debug-reports', severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('v7_debug_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DebugReport[];
    },
  });

  // Get selected lesson's latest report
  const selectedLessonReport = reports?.find(r => r.lesson_id === selectedLessonId);
  const selectedLesson = v7Lessons?.find(l => l.id === selectedLessonId);

  const filteredReports = reports?.filter(report => 
    report.lesson_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.lesson_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: reports?.length || 0,
    critical: reports?.filter(r => r.severity === 'critical').length || 0,
    high: reports?.filter(r => r.severity === 'high').length || 0,
    avgHealth: reports?.length 
      ? Math.round(reports.reduce((sum, r) => sum + r.health_score, 0) / reports.length)
      : 0,
  };

  const handleCorrectionToggle = (id: string) => {
    setCorrections(prev => prev.map(c => 
      c.id === id ? { ...c, checked: !c.checked } : c
    ));
  };

  const handleSendForAnalysis = () => {
    if (!selectedLessonId) {
      toast.error('Selecione uma aula primeiro');
      return;
    }

    if (!selectedLessonReport) {
      toast.warning('Nenhum debug report encontrado para esta aula. Execute o pipeline primeiro.');
      return;
    }

    // Generate analysis JSON
    const analysisPayload = {
      lesson_id: selectedLessonId,
      lesson_title: selectedLesson?.title,
      report_id: selectedLessonReport.id,
      health_score: selectedLessonReport.health_score,
      severity: selectedLessonReport.severity,
      total_issues: selectedLessonReport.total_issues,
      audio_report: selectedLessonReport.audio_report,
      timeline_report: selectedLessonReport.timeline_report,
      summary_report: selectedLessonReport.summary_report,
      all_issues: selectedLessonReport.all_issues,
      corrections_applied: corrections.filter(c => c.checked).map(c => c.label),
      corrections_pending: corrections.filter(c => !c.checked).map(c => c.label),
      generated_at: new Date().toISOString(),
    };

    setAnalysisJson(JSON.stringify(analysisPayload, null, 2));
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(analysisPayload, null, 2));
    toast.success('JSON copiado para a área de transferência! Cole na próxima mensagem.');
  };

  const correctionsByCategory = {
    audio: corrections.filter(c => c.category === 'audio'),
    timeline: corrections.filter(c => c.category === 'timeline'),
    anchors: corrections.filter(c => c.category === 'anchors'),
    rendering: corrections.filter(c => c.category === 'rendering'),
    player: corrections.filter(c => c.category === 'player'),
  };

  const completedCount = corrections.filter(c => c.checked).length;
  const totalCount = corrections.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/v7-vv')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">V7 Debug Hardcore</h1>
              <p className="text-muted-foreground">Análise profunda de pipeline e player</p>
            </div>
          </div>
        </div>

        {/* === NOVO: Painel de Análise === */}
        <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Análise de Aula V7
              <Badge variant="outline" className="ml-2 bg-orange-500/10 text-orange-400 border-orange-500/30">
                Debug Hardcore
              </Badge>
            </CardTitle>
            <CardDescription>
              Selecione uma aula, marque as correções aplicadas e envie para análise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1: Seletor de Aula */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Selecionar Aula V7</label>
                  <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                    <SelectTrigger className="w-full">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Escolha uma aula..." />
                    </SelectTrigger>
                    <SelectContent>
                      {v7Lessons?.map((lesson) => {
                        // Contar quantos debug reports existem para esta aula
                        const lessonReportsCount = reports?.filter(r => r.lesson_id === lesson.id).length || 0;
                        const createdDate = format(new Date(lesson.created_at), 'dd/MM/yyyy');
                        
                        return (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[180px]">{lesson.title}</span>
                              <span className="text-xs text-muted-foreground">({createdDate})</span>
                              <Badge 
                                variant={lesson.is_active ? "default" : "outline"} 
                                className={`text-xs ${lesson.is_active ? 'bg-green-600' : ''}`}
                              >
                                {lesson.is_active ? 'Ativa' : 'Inativa'}
                              </Badge>
                              {lessonReportsCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {lessonReportsCount} reports
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedLessonReport && (
                  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Health Score</span>
                      <span className={`text-lg font-bold ${healthScoreColor(selectedLessonReport.health_score)}`}>
                        {selectedLessonReport.health_score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Severidade</span>
                      <Badge variant={severityBadgeVariants[selectedLessonReport.severity]}>
                        {selectedLessonReport.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Issues</span>
                      <span className="text-sm">{selectedLessonReport.total_issues}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Source</span>
                      <Badge variant="outline">{selectedLessonReport.source}</Badge>
                    </div>
                  </div>
                )}

                {selectedLessonId && !selectedLessonReport && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Nenhum debug report encontrado para esta aula. Execute o pipeline V7-VV primeiro.
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  onClick={handleSendForAnalysis}
                  disabled={!selectedLessonId}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para Análise
                </Button>
              </div>

              {/* Coluna 2: Checklist de Correções */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-green-500" />
                    Correções Aplicadas
                  </label>
                  <Badge variant="outline" className={completedCount === totalCount ? 'bg-green-500/10 text-green-400' : ''}>
                    {completedCount}/{totalCount}
                  </Badge>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(correctionsByCategory).map(([category, items]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                        {category}
                      </p>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <Checkbox 
                              id={item.id}
                              checked={item.checked}
                              onCheckedChange={() => handleCorrectionToggle(item.id)}
                            />
                            <label 
                              htmlFor={item.id}
                              className={`text-sm cursor-pointer ${item.checked ? 'text-green-400 line-through' : ''}`}
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 3: JSON Preview */}
              <div className="space-y-4">
                <label className="text-sm font-medium">JSON para Análise</label>
                {analysisJson ? (
                  <div className="relative">
                    <pre className="p-4 bg-black/50 rounded-lg text-xs text-green-400 max-h-[300px] overflow-auto font-mono">
                      {analysisJson}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        navigator.clipboard.writeText(analysisJson);
                        toast.success('JSON copiado!');
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 bg-muted/20 rounded-lg border-2 border-dashed border-muted text-center">
                    <Activity className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Selecione uma aula e clique em "Enviar para Análise" para gerar o JSON
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-cyan-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.high}</p>
                  <p className="text-sm text-muted-foreground">High</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-8 h-8 ${healthScoreColor(stats.avgHealth)}`} />
                <div>
                  <p className="text-2xl font-bold">{stats.avgHealth}%</p>
                  <p className="text-sm text-muted-foreground">Avg Health</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Severidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reports List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-red-500">Erro ao carregar reports: {(error as Error).message}</p>
            </CardContent>
          </Card>
        ) : filteredReports?.length === 0 ? (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="p-12 text-center space-y-4">
              <Activity className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground">Nenhum Debug Report Encontrado</h3>
                <p className="text-sm text-muted-foreground/70 mt-2 max-w-md mx-auto">
                  Os debug reports são gerados automaticamente quando uma aula V7 é processada pelo pipeline 
                  ou quando um usuário assiste uma aula no player.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/v7-vv')}
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Ir para Pipeline V7-VV
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.location.reload()}
                >
                  Atualizar Página
                </Button>
              </div>
              <div className="mt-6 p-4 bg-muted/30 rounded-lg text-left max-w-lg mx-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2">Como gerar debug reports:</p>
                <ol className="text-xs text-muted-foreground/70 space-y-1 list-decimal list-inside">
                  <li>Execute o pipeline V7-VV para criar/atualizar uma aula</li>
                  <li>O debug report é salvo automaticamente após conclusão</li>
                  <li>Ou assista uma aula V7 - o player também gera reports</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReports?.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <Collapsible 
                  open={expandedReport === report.id} 
                  onOpenChange={(open) => setExpandedReport(open ? report.id : null)}
                >
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <HealthScoreRing score={report.health_score} />
                          <div className="text-left">
                            <CardTitle className="text-lg">{report.lesson_title}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={severityBadgeVariants[report.severity]}>
                                {report.severity}
                              </Badge>
                              <Badge variant="outline">{report.source}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {report.total_issues} issues
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/v7-lesson/${report.lesson_id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Aula
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLessonId(report.lesson_id);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                              toast.info('Aula selecionada para análise');
                            }}
                          >
                            <Sparkles className="w-4 h-4 mr-1" />
                            Analisar
                          </Button>
                          {expandedReport === report.id ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-4">
                      {/* Summary */}
                      {report.summary_report && (
                        <div className="p-4 bg-muted/20 rounded-lg">
                          <p className="font-medium mb-2">Recomendação Principal:</p>
                          <p className="text-sm text-muted-foreground">
                            {report.summary_report.primaryRecommendation}
                          </p>
                          {report.summary_report.rootCauseCandidates?.length > 0 && (
                            <div className="mt-3">
                              <p className="font-medium text-sm mb-1">Possíveis Causas Raiz:</p>
                              <ul className="text-sm text-muted-foreground list-disc list-inside">
                                {report.summary_report.rootCauseCandidates.slice(0, 3).map((cause: string, idx: number) => (
                                  <li key={idx}>{cause}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sections */}
                      <div className="space-y-2">
                        <ReportSection
                          title="Áudio"
                          icon={FileAudio}
                          data={report.audio_report}
                          issues={report.audio_report?.issues || []}
                        />
                        <ReportSection
                          title="Timeline"
                          icon={Clock}
                          data={report.timeline_report}
                          issues={report.timeline_report?.issues || []}
                        />
                        <ReportSection
                          title="Execução"
                          icon={Play}
                          data={report.execution_report}
                          issues={report.execution_report?.issues || []}
                        />
                        <ReportSection
                          title="Renderização"
                          icon={Layers}
                          data={report.rendering_report}
                          issues={report.rendering_report?.issues || []}
                        />
                      </div>

                      {/* All Issues */}
                      {report.all_issues?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Todos os Issues ({report.all_issues.length})</h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {report.all_issues.map((issue, idx) => (
                              <IssueCard key={idx} issue={issue} />
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
