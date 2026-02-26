import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, AlertCircle } from "lucide-react";
import { usePrefetchMainPages } from "@/hooks/usePrefetch";
import { AuthBackground3D } from "@/components/backgrounds";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BuildBadge } from "@/components/BuildBadge";

const Auth = () => {
  // Prefetch Dashboard and Onboarding while user fills login form
  usePrefetchMainPages();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  // Session redirect params
  const reason = searchParams.get('reason');
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup' || modeParam === 'login') {
      setMode(modeParam);
    }

    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Session check error:', error.message);
          // Clear potentially corrupted session
          await supabase.auth.signOut();
        } else if (session) {
          // Valid session exists, redirect to dashboard
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (err) {
        console.error('[Auth] Unexpected error:', err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [navigate, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Erro ao fazer login",
            description: "Email ou senha incorretos. Verifique seus dados e tente novamente.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.session) {
        // Check if user is suspended
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed, is_active')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (userData?.is_active === false) {
          await supabase.auth.signOut();
          toast({
            title: "Conta suspensa",
            description: "Sua conta foi suspensa. Entre em contato com o suporte para mais informações.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });

        if (!userData?.onboarding_completed) {
          navigate('/onboarding');
        } else {
          // Respect redirect param (validate it's a local path)
          const dest = redirectTo.startsWith('/') ? redirectTo : '/dashboard';
          navigate(dest);
        }
      }
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (signupPassword.length < 6) {
        toast({
          title: "Senha muito curta",
          description: "A senha deve ter pelo menos 6 caracteres.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          data: {
            name: signupName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Email já cadastrado",
            description: "Este email já está em uso. Faça login ou use outro email.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.session) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Vamos começar sua jornada! 🚀",
        });
        // New users always go to onboarding
        navigate('/onboarding');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session to prevent flash
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <Loader2 className="w-8 h-8 animate-spin text-primary-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-primary relative overflow-hidden">
      <AuthBackground3D />
      <Card className="w-full max-w-md shadow-medium relative z-10">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl">IA Academy</CardTitle>
          <CardDescription>
            {mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta gratuitamente'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Session expiry alert */}
          {reason === 'session_missing' && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Sua sessão expirou. Faça login para voltar ao dashboard.
              </AlertDescription>
            </Alert>
          )}
          {reason === 'error' && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 text-sm">
                Ocorreu um erro ao carregar seus dados. Faça login novamente.
              </AlertDescription>
            </Alert>
          )}
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'login' | 'signup')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nome Completo</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="João Silva"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Mínimo de 6 caracteres</p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    'Criar Conta Gratuita'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-sm"
            >
              ← Voltar para home
            </Button>
          </div>
        </CardContent>
      </Card>
      <BuildBadge />
    </div>
  );
};

export default Auth;