import { supabase } from "@/integrations/supabase/client";

export interface UnlockStatus {
  isLocked: boolean;
  reason?: string;
  requiredProgress?: number;
}

/**
 * Verifica se uma aula está desbloqueada para o usuário
 * Regras:
 * 1. Primeira aula de cada trilha está sempre desbloqueada
 * 2. Aula libera quando anterior teve 30%+ assistida
 * 3. Aula anterior incompleta não bloqueia (pode pular)
 */
export async function verificarAulaDesbloqueada(
  userId: string,
  aulaId: string
): Promise<UnlockStatus> {
  try {
    // Buscar dados da aula atual
    const { data: aulaAtual, error: aulaError } = await supabase
      .from('lessons')
      .select('order_index, trail_id, course_id')
      .eq('id', aulaId)
      .single();

    if (aulaError || !aulaAtual) {
      return { isLocked: true, reason: 'Aula não encontrada' };
    }

    // Primeira aula da trilha está sempre desbloqueada
    if (aulaAtual.order_index === 1) {
      return { isLocked: false };
    }

    // Buscar aula anterior (dentro do mesmo curso se houver, senão da trilha)
    const filterColumn = aulaAtual.course_id ? 'course_id' : 'trail_id';
    const filterValue = aulaAtual.course_id || aulaAtual.trail_id;
    
    const { data: aulaAnterior, error: anteriorError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq(filterColumn, filterValue)
      .eq('order_index', aulaAtual.order_index - 1)
      .single();

    if (anteriorError || !aulaAnterior) {
      // Se não há aula anterior, desbloqueia
      return { isLocked: false };
    }

    // Verificar progresso da aula anterior
    const { data: progresso, error: progressoError } = await supabase
      .from('user_progress')
      .select('audio_progress_percentage, status')
      .eq('user_id', userId)
      .eq('lesson_id', aulaAnterior.id)
      .maybeSingle();

    if (progressoError) {
      console.error('Erro ao verificar progresso:', progressoError);
      return { isLocked: true, reason: 'Erro ao verificar progresso' };
    }

    // Se não iniciou aula anterior, bloqueia
    if (!progresso) {
      return {
        isLocked: true,
        reason: `Complete pelo menos 30% de "${aulaAnterior.title}"`,
        requiredProgress: 30
      };
    }

    // Verifica se atingiu 30% ou mais
    if (progresso.audio_progress_percentage >= 30) {
      return { isLocked: false };
    }

    return {
      isLocked: true,
      reason: `Complete pelo menos 30% de "${aulaAnterior.title}"`,
      requiredProgress: 30
    };

  } catch (error: any) {
    console.error('Erro ao verificar desbloqueio:', error);
    return { isLocked: true, reason: 'Erro ao verificar desbloqueio' };
  }
}

/**
 * Verifica se uma trilha está desbloqueada para o usuário
 * Regra: Todas as aulas da trilha anterior devem estar completas
 */
export async function verificarTrilhaDesbloqueada(
  userId: string,
  trilhaId: string
): Promise<UnlockStatus> {
  try {
    // Buscar dados da trilha atual
    const { data: trilhaAtual, error: trilhaError } = await supabase
      .from('trails')
      .select('order_index')
      .eq('id', trilhaId)
      .single();

    if (trilhaError || !trilhaAtual) {
      return { isLocked: true, reason: 'Trilha não encontrada' };
    }

    // Primeira trilha está sempre desbloqueada
    if (trilhaAtual.order_index === 1) {
      return { isLocked: false };
    }

    // Buscar trilha anterior
    const { data: trilhaAnterior, error: anteriorError } = await supabase
      .from('trails')
      .select('id, title')
      .eq('order_index', trilhaAtual.order_index - 1)
      .single();

    if (anteriorError || !trilhaAnterior) {
      // Se não há trilha anterior, desbloqueia
      return { isLocked: false };
    }

    // Buscar todas as aulas da trilha anterior
    const { data: aulasAnteriores, error: aulasError } = await supabase
      .from('lessons')
      .select('id, title')
      .eq('trail_id', trilhaAnterior.id)
      .eq('is_active', true)
      .order('order_index');

    if (aulasError) {
      console.error('Erro ao buscar aulas anteriores:', aulasError);
      return { isLocked: true, reason: 'Erro ao verificar aulas anteriores' };
    }

    if (!aulasAnteriores || aulasAnteriores.length === 0) {
      // Se trilha anterior não tem aulas, desbloqueia
      return { isLocked: false };
    }

    // Verificar se todas as aulas da trilha anterior estão completas
    const { data: progressos, error: progressosError } = await supabase
      .from('user_progress')
      .select('lesson_id, status')
      .eq('user_id', userId)
      .in('lesson_id', aulasAnteriores.map(a => a.id));

    if (progressosError) {
      console.error('Erro ao verificar progressos:', progressosError);
      return { isLocked: true, reason: 'Erro ao verificar progressos' };
    }

    const aulasCompletas = progressos?.filter(p => p.status === 'completed').length || 0;
    const totalAulas = aulasAnteriores.length;

    if (aulasCompletas < totalAulas) {
      return {
        isLocked: true,
        reason: `Complete todas as ${totalAulas} aulas de "${trilhaAnterior.title}" (${aulasCompletas}/${totalAulas})`,
        requiredProgress: Math.round((aulasCompletas / totalAulas) * 100)
      };
    }

    return { isLocked: false };

  } catch (error: any) {
    console.error('Erro ao verificar desbloqueio de trilha:', error);
    return { isLocked: true, reason: 'Erro ao verificar desbloqueio' };
  }
}

/**
 * Notifica o usuário quando uma nova aula/trilha é desbloqueada
 */
export async function notificarDesbloqueio(
  tipo: 'aula' | 'trilha',
  titulo: string
) {
  // Implementar notificação toast ou push
  console.log(`🎉 Nova ${tipo} desbloqueada: ${titulo}`);
}
