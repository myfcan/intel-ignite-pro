import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useUserGamification } from '@/hooks/useUserGamification';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Camera, 
  Bell, 
  Shield, 
  Trash2, 
  CreditCard,
  Trophy,
  Zap,
  Coins,
  Target,
  Sparkles
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stats } = useUserGamification();
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profession: '',
    avatar_url: '',
    notifications_enabled: true,
    plan: 'basico',
    total_lessons_completed: 0,
    streak_days: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setCurrentUser(data);
      setProfile({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        profession: data.profession || '',
        avatar_url: data.avatar_url || '',
        notifications_enabled: data.notifications_enabled ?? true,
        plan: data.plan || 'basico',
        total_lessons_completed: data.total_lessons_completed || 0,
        streak_days: data.streak_days || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada"
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('users')
        .update({
          name: profile.name,
          phone: profile.phone,
          profession: profile.profession,
          notifications_enabled: profile.notifications_enabled,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado"
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Aqui você pode adicionar lógica adicional para deletar dados do usuário
      await supabase.auth.signOut();
      navigate('/');
      
      toast({
        title: "Conta deletada",
        description: "Sua conta foi removida com sucesso"
      });
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conta",
        variant: "destructive"
      });
    }
  };

  const planNames = {
    basico: 'Básico',
    pro: 'Pro',
    ultra: 'Ultra'
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
            >
              ← Voltar ao Dashboard
            </button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações e preferências</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Pessoais */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={profile.email}
                      disabled
                      className="opacity-60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Profissão
                    </Label>
                    <Input
                      id="profession"
                      value={profile.profession}
                      onChange={(e) => setProfile(prev => ({ ...prev, profession: e.target.value }))}
                      placeholder="Sua profissão"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            </Card>

            {/* Preferências */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Notificações</p>
                    <p className="text-sm text-muted-foreground">Receber emails sobre novidades e conquistas</p>
                  </div>
                  <Switch
                    checked={profile.notifications_enabled}
                    onCheckedChange={(checked) => setProfile(prev => ({ ...prev, notifications_enabled: checked }))}
                  />
                </div>
              </div>
            </Card>

            {/* Segurança */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança e Privacidade
              </h3>
              
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Alterar Senha
                </Button>
                
                <Separator />
                
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
                  </p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Conta
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Coluna Direita */}
          <div className="space-y-6">
            {/* Estatísticas */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Suas Estatísticas
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="font-medium">Power Score</span>
                  </div>
                  <span className="text-lg font-bold">{stats?.powerScore || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <span className="font-medium">Créditos</span>
                  </div>
                  <span className="text-lg font-bold">{stats?.coins || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="font-medium">Aulas Completas</span>
                  </div>
                  <span className="text-lg font-bold">{profile.total_lessons_completed}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium">Sequência</span>
                  </div>
                  <span className="text-lg font-bold">{profile.streak_days} dias</span>
                </div>
              </div>
            </Card>

            {/* Plano Atual */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plano Atual
              </h3>
              
              <div className="text-center py-6">
                <Badge className="text-lg px-4 py-2 mb-4">
                  {planNames[profile.plan as keyof typeof planNames]}
                </Badge>
                <p className="text-sm text-muted-foreground mb-6">
                  Você está no plano {planNames[profile.plan as keyof typeof planNames]}
                </p>
                <Button 
                  className="w-full"
                  onClick={() => navigate('/curso-exclusivo')}
                >
                  Gerenciar Plano
                </Button>
              </div>
            </Card>

            {/* Upsell */}
            <div 
              className="rounded-2xl p-6 relative overflow-hidden transition-all"
              style={{
                background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                backgroundImage: `
                  linear-gradient(135deg, #1F2937 0%, #111827 100%),
                  radial-gradient(circle, rgba(139, 92, 246, 0.15) 2px, transparent 2px)
                `,
                backgroundSize: 'cover, 20px 20px',
                backgroundPosition: 'center, 0 0',
                borderColor: 'rgba(139, 92, 246, 0.3)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.2)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              <h3 className="text-xl font-bold text-gray-100 mb-2 flex items-center gap-2">
                🚀 Potencialize seus Resultados
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Descubra produtos exclusivos para acelerar sua jornada com IA
              </p>
              
              <div className="space-y-3">
                <button 
                  className="w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 group"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#A78BFA'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  }}
                  onClick={() => navigate('/prompts')}
                >
                  <span className="group-hover:scale-110 transition-transform">⚡</span>
                  <span>Super Prompts Premium</span>
                </button>
                <button 
                  className="w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 group"
                  style={{
                    background: 'rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.4)',
                    color: '#A78BFA'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                  }}
                  onClick={() => navigate('/curso-exclusivo')}
                >
                  <span className="group-hover:scale-110 transition-transform">💰</span>
                  <span>Curso Renda Extra com IA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente sua conta
              e remover todos os seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, deletar conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
