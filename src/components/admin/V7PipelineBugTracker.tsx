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

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitBranch,
  Wrench,
  Bug,
  Zap,
  Plus,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

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
const INITIAL_PIPELINE_BUGS: PipelineBug[] = [
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

const categoryConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  audio: { icon: Zap, color: 'text-purple-400', label: 'Áudio' },
  timeline: { icon: Clock, color: 'text-blue-400', label: 'Timeline' },
  anchors: { icon: GitBranch, color: 'text-cyan-400', label: 'Âncoras' },
  phases: { icon: Wrench, color: 'text-orange-400', label: 'Fases' },
  ids: { icon: Bug, color: 'text-pink-400', label: 'IDs' },
  general: { icon: Bug, color: 'text-gray-400', label: 'Geral' },
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
              {bug.discoveredIn && bug.status !== 'fixed' && (
                <p className="text-xs text-purple-400/70 mt-1">
                  Descoberto em: {bug.discoveredIn}
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

interface AddBugFormProps {
  onAddBug: (bug: PipelineBug) => void;
  lessonContext?: string;
}

function AddBugForm({ onAddBug, lessonContext }: AddBugFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PipelineBug['category']>('general');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Título e descrição são obrigatórios');
      return;
    }

    const newBug: PipelineBug = {
      id: `bug-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      status: 'pending',
      category,
      discoveredIn: lessonContext || `Debug ${new Date().toLocaleDateString('pt-BR')}`,
      notes: notes.trim() || undefined,
    };

    onAddBug(newBug);
    toast.success('Bug registrado como PENDENTE');
    
    // Reset form
    setTitle('');
    setDescription('');
    setCategory('general');
    setNotes('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="border-red-500/50 text-red-400 hover:bg-red-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Bug
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Registrar Novo Bug do Pipeline
          </DialogTitle>
          <DialogDescription>
            Adicione um novo bug descoberto durante análise de aula. Será registrado como PENDENTE.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="bug-title">Título do Bug *</Label>
            <Input
              id="bug-title"
              placeholder="Ex: Âncoras não encontradas em fases interativas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bug-description">Descrição *</Label>
            <Textarea
              id="bug-description"
              placeholder="Descreva o comportamento incorreto do pipeline..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bug-category">Categoria</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as PipelineBug['category'])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="bug-notes">Notas Adicionais</Label>
            <Textarea
              id="bug-notes"
              placeholder="Detalhes técnicos, referências, sugestões de fix..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          
          {lessonContext && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              🔍 Contexto: {lessonContext}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-red-600 hover:bg-red-700"
          >
            <Bug className="w-4 h-4 mr-2" />
            Registrar Bug
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface V7PipelineBugTrackerProps {
  lessonContext?: string; // Título da aula sendo analisada
}

export function V7PipelineBugTracker({ lessonContext }: V7PipelineBugTrackerProps) {
  const [bugs, setBugs] = useState<PipelineBug[]>(INITIAL_PIPELINE_BUGS);

  const handleAddBug = (newBug: PipelineBug) => {
    setBugs(prev => [newBug, ...prev]);
  };

  const fixedBugs = bugs.filter(b => b.status === 'fixed');
  const pendingBugs = bugs.filter(b => b.status === 'pending');
  const inProgressBugs = bugs.filter(b => b.status === 'in-progress');
  
  const stats = {
    total: bugs.length,
    fixed: fixedBugs.length,
    pending: pendingBugs.length,
    inProgress: inProgressBugs.length,
  };
  
  return (
    <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
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
          </div>
          <AddBugForm onAddBug={handleAddBug} lessonContext={lessonContext} />
        </div>
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
              Use o botão "Registrar Bug" para adicionar novos bugs descobertos
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

// Re-export bugs for external access
export const PIPELINE_BUGS = INITIAL_PIPELINE_BUGS;
