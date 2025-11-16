import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Activity, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PlaygroundSession {
  id: string;
  user_id: string;
  lesson_id: string;
  user_prompt: string;
  ai_response: string | null;
  ai_feedback: string | null;
  tokens_used: number | null;
  created_at: string;
}

interface Analytics {
  totalSessions: number;
  totalTokens: number;
  avgTokensPerSession: number;
  uniqueUsers: number;
  sessionsToday: number;
}

export default function AdminPlaygroundSessions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<PlaygroundSession[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionsAndAnalytics();
  }, []);

  const fetchSessionsAndAnalytics = async () => {
    try {
      setLoading(true);

      // Buscar todas as sessões (usando policy de admin)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_playground_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      setSessions(sessionsData || []);

      // Calcular analytics
      const totalSessions = sessionsData?.length || 0;
      const totalTokens = sessionsData?.reduce((sum, s) => sum + (s.tokens_used || 0), 0) || 0;
      const uniqueUsers = new Set(sessionsData?.map(s => s.user_id)).size;
      const today = new Date().toISOString().split('T')[0];
      const sessionsToday = sessionsData?.filter(s => 
        s.created_at.split('T')[0] === today
      ).length || 0;

      setAnalytics({
        totalSessions,
        totalTokens,
        avgTokensPerSession: totalSessions > 0 ? Math.round(totalTokens / totalSessions) : 0,
        uniqueUsers,
        sessionsToday
      });

    } catch (error: any) {
      console.error('Erro ao buscar sessões:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Playground Sessions</h1>
              <p className="text-muted-foreground">Analytics e histórico de uso do playground</p>
            </div>
          </div>
          <Button onClick={fetchSessionsAndAnalytics}>
            Atualizar
          </Button>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Sessões</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.sessionsToday} hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Usados</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ~{analytics.avgTokensPerSession} por sessão
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalSessions > 0 
                    ? (analytics.totalSessions / analytics.uniqueUsers).toFixed(1)
                    : 0} sessões/usuário
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalSessions > 0
                    ? Math.round((sessions.filter(s => s.ai_feedback).length / analytics.totalSessions) * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {sessions.filter(s => s.ai_feedback).length} com feedback
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sessões</CardTitle>
            <CardDescription>
              Últimas 100 sessões de playground ({sessions.length} carregadas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Lesson ID</TableHead>
                    <TableHead>Prompt do Usuário</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Nenhuma sessão encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {formatDate(session.created_at)}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {session.lesson_id.substring(0, 8)}
                          </code>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm" title={session.user_prompt}>
                            {truncateText(session.user_prompt, 50)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {session.tokens_used || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {session.ai_response && (
                              <Badge variant="default" className="text-xs">
                                Resposta
                              </Badge>
                            )}
                            {session.ai_feedback && (
                              <Badge variant="secondary" className="text-xs">
                                Feedback
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
