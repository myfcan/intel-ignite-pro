import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Timer, Layers, GripVertical, PenLine, CheckSquare, Target, ToggleLeft, BarChart3, ListChecks, Sparkles, Play, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExerciseTypeEntry {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  version: ('V5' | 'V7')[];
  status: 'active' | 'demo' | 'planned';
  demoRoute?: string;
  features: string[];
  color: string;
}

const EXERCISE_TYPES: ExerciseTypeEntry[] = [
  {
    type: 'multiple-choice',
    name: 'Múltipla Escolha',
    icon: <ListChecks className="w-5 h-5" />,
    description: 'Pergunta com opções de resposta e feedback de acerto/erro.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Feedback imediato', 'Explicação pós-resposta', 'Score automático'],
    color: 'blue',
  },
  {
    type: 'timed-quiz',
    name: 'Timed Quiz (Desafio Relâmpago)',
    icon: <Timer className="w-5 h-5" />,
    description: 'Quiz com timer regressivo, bônus por velocidade e 5 estágios de urgência visual.',
    version: ['V7'],
    status: 'demo',
    demoRoute: '/admin/debugs/timed-quiz',
    features: ['Timer com urgência', 'Bônus por velocidade', 'Sons dinâmicos', 'Stale closure fix'],
    color: 'red',
  },
  {
    type: 'flipcard-quiz',
    name: 'FlipCard Quiz',
    icon: <Layers className="w-5 h-5" />,
    description: 'Cards com flip 3D (rotateY 180°) para estimular antecipação e recordação ativa.',
    version: ['V5', 'V7'],
    status: 'demo',
    demoRoute: '/admin/debugs/flipcard-quiz',
    features: ['Flip 3D', 'Glow reveal', 'Confetti', 'Sons vitória/derrota'],
    color: 'purple',
  },
  {
    type: 'drag-drop',
    name: 'Drag & Drop',
    icon: <GripVertical className="w-5 h-5" />,
    description: 'Arrastar itens para categorias corretas com validação visual.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Categorias dinâmicas', 'Validação visual', 'Score por categoria'],
    color: 'emerald',
  },
  {
    type: 'fill-in-blanks',
    name: 'Preencher Lacunas',
    icon: <PenLine className="w-5 h-5" />,
    description: 'Completar frases com palavras corretas em campos de input.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Input de texto', 'Validação case-insensitive', 'Feedback por sentença'],
    color: 'amber',
  },
  {
    type: 'complete-sentence',
    name: 'Completar Sentença',
    icon: <PenLine className="w-5 h-5" />,
    description: 'Escolher a palavra certa para completar sentenças.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Opções por lacuna', 'Feedback instantâneo', 'Score automático'],
    color: 'teal',
  },
  {
    type: 'scenario-selection',
    name: 'Seleção de Cenário',
    icon: <Target className="w-5 h-5" />,
    description: 'Escolher o cenário mais adequado entre múltiplas opções contextuais.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Cenários contextuais', 'Explicação do correto', 'Análise de decisão'],
    color: 'pink',
  },
  {
    type: 'true-false',
    name: 'Verdadeiro ou Falso',
    icon: <ToggleLeft className="w-5 h-5" />,
    description: 'Avaliar afirmações como verdadeiras ou falsas com explicações.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Toggle V/F', 'Explicação por item', 'Score automático'],
    color: 'orange',
  },
  {
    type: 'platform-match',
    name: 'Platform Match',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Associar cenários à plataforma/ferramenta mais adequada.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Match cenário↔plataforma', 'Validação visual', 'Score por match'],
    color: 'indigo',
  },
  {
    type: 'data-collection',
    name: 'Coleta de Dados',
    icon: <CheckSquare className="w-5 h-5" />,
    description: 'Exercício baseado em cenário com coleta e análise de dados.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Cenário contextual', 'Coleta estruturada', 'Feedback detalhado'],
    color: 'cyan',
  },
  {
    type: 'playground',
    name: 'Playground Interativo',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Espaço livre para experimentar prompts com IA em contexto da aula.',
    version: ['V5', 'V7'],
    status: 'active',
    features: ['Chat com IA', 'Contexto da aula', 'Salvamento de sessão', 'Token tracking'],
    color: 'violet',
  },
];

const statusConfig = {
  active: { label: 'Ativo', variant: 'default' as const, className: 'bg-emerald-600' },
  demo: { label: 'Com Demo', variant: 'default' as const, className: 'bg-blue-600' },
  planned: { label: 'Planejado', variant: 'secondary' as const, className: 'bg-muted' },
};

export default function AdminExerciseLibrary() {
  const navigate = useNavigate();

  const activeCount = EXERCISE_TYPES.filter(e => e.status === 'active').length;
  const demoCount = EXERCISE_TYPES.filter(e => e.status === 'demo').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-primary" />
              Biblioteca de Exercícios
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Catálogo completo dos {EXERCISE_TYPES.length} tipos de exercício V5/V7
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-primary">{EXERCISE_TYPES.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total de Tipos</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-emerald-500">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Ativos</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-blue-500">{demoCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Com Demo</div>
          </Card>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {EXERCISE_TYPES.map((exercise, index) => {
            const statusInfo = statusConfig[exercise.status];
            return (
              <Card key={exercise.type} className="border border-border/60 hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <span className="text-muted-foreground text-sm font-mono w-6">{String(index + 1).padStart(2, '0')}</span>
                      <span className={`text-${exercise.color}-500`}>{exercise.icon}</span>
                      {exercise.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {exercise.version.map(v => (
                        <Badge key={v} variant="outline" className="text-xs font-mono">
                          {v}
                        </Badge>
                      ))}
                      <Badge className={`${statusInfo.className} text-white text-xs`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {exercise.features.map(f => (
                        <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                    {exercise.demoRoute && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-3 shrink-0"
                        onClick={() => navigate(exercise.demoRoute!)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Demo
                      </Button>
                    )}
                  </div>
                  <div className="mt-2 text-xs font-mono text-muted-foreground/60">
                    type: "{exercise.type}"
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
