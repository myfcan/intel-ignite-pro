import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Activity, MessageSquare, Zap, TrendingUp, Search, Calendar, X } from 'lucide-react';
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

interface UserInfo {
  id: string;
  email: string;
  name: string;
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
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchSessionsAndAnalytics();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  const fetchSessionsAndAnalytics = async () => {
    try {
      setLoading(true);

      // Buscar todas as sessões (usando policy de admin)
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('user_playground_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

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

  // Aplicar filtros
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Filtro por usuário
      if (filterUserId !== 'all' && session.user_id !== filterUserId) {
        return false;
      }

      // Filtro por data início
      if (filterStartDate) {
        const sessionDate = session.created_at.split('T')[0];
        if (sessionDate < filterStartDate) return false;
      }

      // Filtro por data fim
      if (filterEndDate) {
        const sessionDate = session.created_at.split('T')[0];
        if (sessionDate > filterEndDate) return false;
      }

      // Filtro por busca (prompt)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return session.user_prompt.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }, [sessions, filterUserId, filterStartDate, filterEndDate, searchTerm]);

  const clearFilters = () => {
    setFilterUserId('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setSearchTerm('');
  };

  const hasActiveFilters = filterUserId !== 'all' || filterStartDate || filterEndDate || searchTerm;

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'N/A';
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

        {/* Filtros */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filtros</CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Filtro por Usuário */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Usuário</label>
                <Select value={filterUserId} onValueChange={setFilterUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os usuários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os usuários</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email} ({user.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Data Início */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Data Início
                </label>
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Filtro Data Fim */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Data Fim
                </label>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Busca por Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Search className="h-4 w-4" />
                  Buscar no Prompt
                </label>
                <Input
                  type="text"
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Sessões</CardTitle>
            <CardDescription>
              {hasActiveFilters 
                ? `${filteredSessions.length} sessões filtradas de ${sessions.length} totais`
                : `Últimas ${sessions.length} sessões de playground`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Lesson ID</TableHead>
                    <TableHead>Prompt do Usuário</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {hasActiveFilters 
                          ? 'Nenhuma sessão encontrada com os filtros aplicados'
                          : 'Nenhuma sessão encontrada'
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {formatDate(session.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {getUserEmail(session.user_id)}
                            </div>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {session.user_id.substring(0, 8)}...
                            </code>
                          </div>
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
