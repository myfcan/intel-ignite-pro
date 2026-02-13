import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Users, Shield, ShieldCheck, User, Loader2, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AppRole = 'admin' | 'supervisor' | 'user';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  created_at: string | null;
  total_lessons_completed: number | null;
  power_score: number | null;
  coins: number | null;
  role: AppRole;
}

const ROLE_CONFIG: Record<AppRole, { label: string; color: string; icon: typeof Shield; description: string }> = {
  admin: {
    label: 'Admin',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: Shield,
    description: 'Acesso total ao sistema completo',
  },
  supervisor: {
    label: 'Supervisor',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    icon: ShieldCheck,
    description: 'Aulas, trilhas, admin (criar aulas, gestão manual, debugs, guias)',
  },
  user: {
    label: 'Usuário',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: User,
    description: 'Acesso padrão: aulas, pagamentos, créditos, navegação',
  },
};

export default function AdminUserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | AppRole>('all');
  const [changingRole, setChangingRole] = useState<{ userId: string; newRole: AppRole } | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, plan, created_at, total_lessons_completed, power_score, coins')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Map roles to users
      const roleMap = new Map<string, AppRole>();
      rolesData?.forEach((r) => {
        // Priority: admin > supervisor > user
        const existing = roleMap.get(r.user_id);
        if (!existing || (r.role === 'admin') || (r.role === 'supervisor' && existing === 'user')) {
          roleMap.set(r.user_id, r.role as AppRole);
        }
      });

      const usersWithRoles: UserWithRole[] = (usersData || []).map((u) => ({
        ...u,
        role: roleMap.get(u.id) || 'user',
      }));

      setUsers(usersWithRoles);
    } catch (err) {
      console.error('[UserManagement] Error:', err);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async () => {
    if (!changingRole) return;
    setUpdating(true);

    const { userId, newRole } = changingRole;

    try {
      // Remove existing roles for this user
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Insert new role (only if not 'user' - 'user' is the default when no role exists)
      if (newRole !== 'user') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });

        if (insertError) throw insertError;
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      const userName = users.find((u) => u.id === userId)?.name || 'Usuário';
      toast.success(`${userName} agora é ${ROLE_CONFIG[newRole].label}`);
    } catch (err) {
      console.error('[UserManagement] Role change error:', err);
      toast.error('Erro ao alterar permissão');
    } finally {
      setUpdating(false);
      setChangingRole(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    supervisors: users.filter((u) => u.role === 'supervisor').length,
    users: users.filter((u) => u.role === 'user').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Admin
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie permissões e papéis de todos os usuários do sistema
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="!bg-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="!bg-card border-red-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.admins}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card className="!bg-card border-amber-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{stats.supervisors}</p>
              <p className="text-xs text-muted-foreground">Supervisores</p>
            </CardContent>
          </Card>
          <Card className="!bg-card border-emerald-500/30">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.users}</p>
              <p className="text-xs text-muted-foreground">Usuários</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as typeof roleFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>XP / Coins</TableHead>
                    <TableHead>Aulas</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleConfig = ROLE_CONFIG[user.role];
                      const RoleIcon = roleConfig.icon;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.plan || 'basico'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {user.power_score || 0} XP / {user.coins || 0} 🪙
                            </span>
                          </TableCell>
                          <TableCell>{user.total_lessons_completed || 0}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('pt-BR')
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${roleConfig.color} border text-xs`}>
                              <RoleIcon className="w-3 h-3 mr-1" />
                              {roleConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={user.role}
                              onValueChange={(newRole: string) =>
                                setChangingRole({ userId: user.id, newRole: newRole as AppRole })
                              }
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">
                                  <span className="flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Admin
                                  </span>
                                </SelectItem>
                                <SelectItem value="supervisor">
                                  <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Supervisor
                                  </span>
                                </SelectItem>
                                <SelectItem value="user">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> Usuário
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Role Legend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Legenda de Permissões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.entries(ROLE_CONFIG) as [AppRole, typeof ROLE_CONFIG[AppRole]][]).map(
              ([role, config]) => {
                const Icon = config.icon;
                return (
                  <div key={role} className="flex items-start gap-3">
                    <Badge className={`${config.color} border text-xs shrink-0`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </div>
                );
              }
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!changingRole} onOpenChange={() => setChangingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração de permissão</AlertDialogTitle>
            <AlertDialogDescription>
              {changingRole && (
                <>
                  Deseja alterar o papel de{' '}
                  <strong>{users.find((u) => u.id === changingRole.userId)?.name}</strong> para{' '}
                  <strong>{ROLE_CONFIG[changingRole.newRole].label}</strong>?
                  <br />
                  <span className="text-xs mt-2 block">
                    {ROLE_CONFIG[changingRole.newRole].description}
                  </span>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange} disabled={updating}>
              {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
