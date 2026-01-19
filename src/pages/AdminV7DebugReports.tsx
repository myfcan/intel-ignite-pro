/**
 * Admin V7 Debug Reports Panel
 * =============================
 * 
 * Painel para visualizar e filtrar debug reports do pipeline e player V7.
 * 
 * Features:
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

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
              <h1 className="text-2xl font-bold">V7 Debug Reports</h1>
              <p className="text-muted-foreground">Análise de pipeline e player</p>
            </div>
          </div>
        </div>

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
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum debug report encontrado</p>
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
                              navigate(`/v7-cinematic/${report.lesson_id}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Aula
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
