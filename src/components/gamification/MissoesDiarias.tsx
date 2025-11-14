import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Target, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Missao {
  tipo: string;
  meta: number;
  progresso: number;
  completa: boolean;
  pontos: number;
  descricao: string;
}

interface MissoesDiariasData {
  missoes: Missao[];
  todas_completas: boolean;
  bonus_resgatado: boolean;
}

export function MissoesDiarias() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [missoes, setMissoes] = useState<MissoesDiariasData | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadMissoes();
  }, []);

  const loadMissoes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserId(session.user.id);

      const hoje = new Date().toISOString().split('T')[0];

      let { data, error } = await supabase
        .from('missoes_diarias')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('data', hoje)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Criar missões do dia
        const novasMissoes: Missao[] = [
          { tipo: 'assistir_aulas', meta: 3, progresso: 0, completa: false, pontos: 50, descricao: 'Assista 3 aulas' },
          { tipo: 'acertar_exercicios', meta: 10, progresso: 0, completa: false, pontos: 30, descricao: 'Acerte 10 exercícios' },
          { tipo: 'tempo_estudo', meta: 30, progresso: 0, completa: false, pontos: 40, descricao: 'Estude por 30 minutos' },
          { tipo: 'completar_aula', meta: 1, progresso: 0, completa: false, pontos: 60, descricao: 'Complete 1 aula' }
        ];

        const { data: novaMissao, error: createError } = await supabase
          .from('missoes_diarias')
          .insert({
            user_id: session.user.id,
            data: hoje,
            missoes: novasMissoes as any,
            todas_completas: false,
            bonus_resgatado: false
          })
          .select()
          .single();

        if (createError) throw createError;
        data = novaMissao;
      }

      const missoesData: MissoesDiariasData = {
        missoes: Array.isArray(data.missoes) ? (data.missoes as unknown as Missao[]) : [],
        todas_completas: data.todas_completas || false,
        bonus_resgatado: data.bonus_resgatado || false
      };

      setMissoes(missoesData);
    } catch (error: any) {
      console.error('Erro ao carregar missões:', error);
      toast({
        title: "Erro ao carregar missões",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resgatarBonus = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      await supabase
        .from('missoes_diarias')
        .update({ bonus_resgatado: true })
        .eq('user_id', userId)
        .eq('data', hoje);

      // Adicionar pontos bônus
      await supabase.from('points_history').insert({
        user_id: userId,
        points: 100,
        reason: 'Bônus por completar todas as missões diárias'
      });

      // Atualizar total de pontos
      const { data: userData } = await supabase
        .from('users')
        .select('total_points')
        .eq('id', userId)
        .single();

      await supabase
        .from('users')
        .update({ total_points: (userData?.total_points || 0) + 100 })
        .eq('id', userId);

      toast({
        title: "🎉 Bônus Resgatado!",
        description: "+100 pontos por completar todas as missões!",
      });

      loadMissoes();
    } catch (error: any) {
      console.error('Erro ao resgatar bônus:', error);
      toast({
        title: "Erro ao resgatar bônus",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Carregando missões...</div>;
  }

  const todasCompletas = missoes?.missoes.every(m => m.completa);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Missões Diárias</CardTitle>
              <CardDescription>Complete para ganhar pontos extras</CardDescription>
            </div>
          </div>
          {todasCompletas && !missoes?.bonus_resgatado && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <Button onClick={resgatarBonus} className="bg-gradient-accent">
                <Trophy className="w-4 h-4 mr-2" />
                Resgatar Bônus (+100pts)
              </Button>
            </motion.div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {missoes?.missoes.map((missao, index) => (
            <motion.div
              key={missao.tipo}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${
                missao.completa ? 'bg-success/10 border-success' : 'bg-card border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {missao.completa && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  <span className="font-medium">{missao.descricao}</span>
                </div>
                <span className="text-sm text-muted-foreground">+{missao.pontos} pts</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress 
                  value={(missao.progresso / missao.meta) * 100} 
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {missao.progresso}/{missao.meta}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
