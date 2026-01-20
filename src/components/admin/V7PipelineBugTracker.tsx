/**
 * V7 Pipeline Bug Tracker
 * ========================
 * 
 * Lista de bugs CONHECIDOS do Pipeline V7-vv com status FIXED/PENDENTE.
 * 
 * ATEMPORAL: Não depende de dados de aulas específicas.
 * Reflete o estado ATUAL do código do pipeline.
 * 
 * Quando um bug é corrigido no código, atualizar o status aqui.
 * Quando novos bugs são descobertos via debug de aulas, adicionar aqui.
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitBranch,
  Wrench,
  Bug,
  Zap
} from 'lucide-react';

export type BugStatus = 'fixed' | 'pending' | 'in-progress';

export interface PipelineBug {
  id: string;
  title: string;
  description: string;
  status: BugStatus;
  category: 'audio' | 'timeline' | 'anchors' | 'phases' | 'ids' | 'general';
  fixedIn?: string; // merge/commit reference
  fixedDate?: string; // data da correção
  discoveredIn?: string; // qual aula revelou o bug
  notes?: string;
}

/**
 * LISTA DE BUGS CONHECIDOS DO PIPELINE V7-VV
 * 
 * Atualizar quando:
 * 1. Novo bug é descoberto via debug de aula → adicionar com status 'pending'
 * 2. Bug é corrigido no código → mudar status para 'fixed' + adicionar fixedIn/fixedDate
 * 3. Bug está sendo trabalhado → status 'in-progress'
 */
export const PIPELINE_BUGS: PipelineBug[] = [
  // ========================================
  // BUGS CORRIGIDOS (FIXED)
  // ========================================
  {
    id: 'semantic-anchor-ids',
    title: 'IDs de âncoras numéricas',
    description: 'Pipeline gerava IDs como "anchor_0_0" ao invés de semânticos como "anchor_dramatic-hook_endPhrase"',
    status: 'fixed',
    category: 'ids',
    fixedIn: 'v7-vv last-diff',
    fixedDate: '2025-01-20',
    notes: 'Âncoras agora usam format: anchor_{phaseId}_{type}',
  },
  {
    id: 'interactive-duration-min-5s',
    title: 'Duração mínima de fases interativas',
    description: 'Fases interativas (quiz, playground, interaction) tinham duração < 5s, insuficiente para interação',
    status: 'fixed',
    category: 'phases',
    fixedIn: 'v7-vv last-diff',
    fixedDate: '2025-01-20',
    notes: 'Fases interativas agora têm mínimo de 5 segundos garantido',
  },
  {
    id: 'phase-overlap-prevention',
    title: 'Overlaps entre fases consecutivas',
    description: 'Fase[N+1].startTime < Fase[N].endTime causava sobreposição de fases',
    status: 'fixed',
    category: 'timeline',
    fixedIn: 'v7-vv last-diff',
    fixedDate: '2025-01-20',
    notes: 'Garantido que Fase[N+1].startTime >= Fase[N].endTime',
  },
  {
    id: 'first-phase-interactive-check',
    title: 'Primeira fase interativa sem duração mínima',
    description: 'Loop de correção começava em i=1, ignorando primeira fase se fosse interativa',
    status: 'fixed',
    category: 'phases',
    fixedIn: 'v7-vv last-diff',
    fixedDate: '2025-01-20',
    notes: 'Verificação explícita adicionada para phases[0]',
  },
  {
    id: 'leaked-pause-tags',
    title: 'Tags [pause:X] vazando para TTS',
    description: 'ElevenLabs pronunciava literalmente "[pause:3]" na narração',
    status: 'fixed',
    category: 'audio',
    fixedIn: 'merge #145-#146',
    fixedDate: '2025-01-15',
    notes: 'cleanTextForTTS remove tags antes de enviar para ElevenLabs',
  },
  {
    id: 'interactive-to-interaction-mapping',
    title: 'Mapeamento "interactive" → "interaction"',
    description: 'useV7PhaseScript mapeava incorretamente, causando quiz/playground renderizar como dramatic',
    status: 'fixed',
    category: 'phases',
    fixedIn: 'merge #145-#146',
    fixedDate: '2025-01-15',
    notes: 'mapActTypeToPhaseType corrigido: interactive→interaction, celebration→revelation',
  },
  
  // ========================================
  // BUGS PENDENTES (PENDING)
  // ========================================
  // Adicionar novos bugs descobertos aqui
  
  // ========================================
  // EM PROGRESSO (IN-PROGRESS)
  // ========================================
  // Bugs sendo trabalhados atualmente
];

const statusConfig: Record<BugStatus, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  label: string;
}> = {
  fixed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10 border-green-500/30',
    label: 'FIXED',
  },
  pending: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10 border-red-500/30',
    label: 'PENDENTE',
  },
  'in-progress': {
    icon: Clock,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10 border-yellow-500/30',
    label: 'EM PROGRESSO',
  },
};

const categoryConfig: Record<string, { icon: React.ElementType; color: string }> = {
  audio: { icon: Zap, color: 'text-purple-400' },
  timeline: { icon: Clock, color: 'text-blue-400' },
  anchors: { icon: GitBranch, color: 'text-cyan-400' },
  phases: { icon: Wrench, color: 'text-orange-400' },
  ids: { icon: Bug, color: 'text-pink-400' },
  general: { icon: Bug, color: 'text-gray-400' },
};

interface BugItemProps {
  bug: PipelineBug;
}

function BugItem({ bug }: BugItemProps) {
  const status = statusConfig[bug.status];
  const category = categoryConfig[bug.category];
  const StatusIcon = status.icon;
  const CategoryIcon = category.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-start gap-3 p-3 rounded-lg border ${status.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${status.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{bug.title}</p>
                <CategoryIcon className={`w-3.5 h-3.5 ${category.color}`} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {bug.description}
              </p>
              {bug.fixedDate && (
                <p className="text-xs text-green-400/70 mt-1">
                  Corrigido: {bug.fixedDate}
                </p>
              )}
            </div>
            <Badge 
              variant="outline" 
              className={`${status.color} border-current flex-shrink-0`}
            >
              {status.label}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[350px]">
          <div className="space-y-2">
            <p className="font-medium">{bug.title}</p>
            <p className="text-sm text-muted-foreground">{bug.description}</p>
            {bug.fixedIn && (
              <p className="text-xs text-cyan-400">📦 Fix: {bug.fixedIn}</p>
            )}
            {bug.notes && (
              <p className="text-xs text-yellow-400">📝 {bug.notes}</p>
            )}
            {bug.discoveredIn && (
              <p className="text-xs text-purple-400">🔍 Descoberto em: {bug.discoveredIn}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function V7PipelineBugTracker() {
  const fixedBugs = PIPELINE_BUGS.filter(b => b.status === 'fixed');
  const pendingBugs = PIPELINE_BUGS.filter(b => b.status === 'pending');
  const inProgressBugs = PIPELINE_BUGS.filter(b => b.status === 'in-progress');
  
  const stats = {
    total: PIPELINE_BUGS.length,
    fixed: fixedBugs.length,
    pending: pendingBugs.length,
    inProgress: inProgressBugs.length,
  };
  
  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bug className="w-5 h-5 text-purple-500" />
          Pipeline V7-vv Bug Tracker
          <Badge variant="outline" className="ml-2 bg-purple-500/10 text-purple-400 border-purple-500/30">
            Atemporal
          </Badge>
        </CardTitle>
        <CardDescription>
          Status atual do código do pipeline • Não depende de dados de aulas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-400">{stats.fixed} Fixed</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-400">{stats.pending} Pendente</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-400">{stats.inProgress} Em progresso</span>
          </div>
        </div>

        {/* Bug Lists */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {/* Pending First */}
          {pendingBugs.map(bug => (
            <BugItem key={bug.id} bug={bug} />
          ))}
          
          {/* In Progress */}
          {inProgressBugs.map(bug => (
            <BugItem key={bug.id} bug={bug} />
          ))}
          
          {/* Fixed Last */}
          {fixedBugs.map(bug => (
            <BugItem key={bug.id} bug={bug} />
          ))}
        </div>

        {stats.pending === 0 && stats.inProgress === 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-green-400 font-medium">
              ✨ Todos os bugs conhecidos foram corrigidos!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Novos bugs serão adicionados quando descobertos via debug de aulas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Helper para adicionar novo bug programaticamente
 * (para uso futuro em ferramentas de debug)
 */
export function createPipelineBug(
  id: string,
  title: string,
  description: string,
  category: PipelineBug['category'],
  discoveredIn?: string
): PipelineBug {
  return {
    id,
    title,
    description,
    status: 'pending',
    category,
    discoveredIn,
  };
}
