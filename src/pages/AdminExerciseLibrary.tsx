import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, BookOpen, Timer, Layers, GripVertical, PenLine, CheckSquare, Target, ToggleLeft, BarChart3, ListChecks, Sparkles, Play, Code, X, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Exercise components
import { DragDropLesson } from '@/components/lessons/DragDropLesson';
import { CompleteSentenceExercise } from '@/components/lessons/CompleteSentenceExercise';
import { ScenarioSelectionExercise } from '@/components/lessons/ScenarioSelectionExercise';
import { FillInBlanksExercise } from '@/components/lessons/FillInBlanksExercise';
import { TrueFalseExercise } from '@/components/lessons/TrueFalseExercise';
import { PlatformMatchExercise } from '@/components/lessons/PlatformMatchExercise';
import { DataCollectionExercise } from '@/components/lessons/DataCollectionExercise';
import { MultipleChoiceExercise } from '@/components/lesson/MultipleChoiceExercise';
import { FlipCardQuizExercise } from '@/components/lessons/FlipCardQuizExercise';
import { TimedQuizExercise } from '@/components/lessons/TimedQuizExercise';

// ── JSON Models ──────────────────────────────────────────────

const JSON_MODELS: Record<string, object> = {
  'multiple-choice': {
    id: 'ex-mc-1',
    type: 'multiple-choice',
    title: 'Quiz de Conceitos',
    instruction: 'Escolha a alternativa correta:',
    data: {
      question: 'Qual modelo de IA é especializado em gerar imagens a partir de texto?',
      options: ['GPT-4', 'Midjourney', 'Whisper', 'BERT'],
      correctAnswer: 'Midjourney',
      explanation: 'O Midjourney é um dos principais modelos especializados em geração de imagens a partir de prompts de texto.',
    },
  },
  'timed-quiz': {
    id: 'ex-tq-1',
    type: 'timed-quiz',
    title: 'Desafio Relâmpago',
    instruction: 'Responda antes do tempo acabar!',
    data: {
      timePerQuestion: 15,
      bonusPerSecondLeft: 5,
      timeoutPenalty: 'wrong',
      visualTheme: 'cyber',
      questions: [
        { id: 'q1', question: 'O que é um token em LLMs?', options: [{ id: 'a', text: 'Uma moeda digital', isCorrect: false }, { id: 'b', text: 'Um pedaço de texto processado', isCorrect: true }, { id: 'c', text: 'Um tipo de API key', isCorrect: false }], explanation: 'Tokens são unidades básicas de texto processadas por LLMs.' },
        { id: 'q2', question: 'O que significa LLM?', options: [{ id: 'a', text: 'Large Language Model', isCorrect: true }, { id: 'b', text: 'Low Latency Machine', isCorrect: false }, { id: 'c', text: 'Linear Logic Module', isCorrect: false }], explanation: 'LLM = Large Language Model.' },
      ],
      feedback: { perfect: '🏆 Perfeito!', good: '👏 Bom trabalho!', needsReview: '📚 Revise!', timeBonus: '⚡ Bônus de velocidade!' },
    },
  },
  'flipcard-quiz': {
    id: 'ex-fc-1',
    type: 'flipcard-quiz',
    title: 'Quiz de Cards',
    instruction: 'Vire cada card e responda!',
    data: {
      cards: [
        { id: 'fc1', front: { icon: 'Brain', label: 'Conceito 1', color: 'cyan' }, back: { text: 'Qual modelo gera imagens a partir de texto?' }, options: [{ id: 'a', text: 'GPT-4', isCorrect: false }, { id: 'b', text: 'Midjourney', isCorrect: true }], explanation: 'Midjourney é especializado em geração de imagens.' },
        { id: 'fc2', front: { icon: 'Zap', label: 'Conceito 2', color: 'emerald' }, back: { text: 'O que é Chain of Thought?' }, options: [{ id: 'a', text: 'Pensar passo a passo', isCorrect: true }, { id: 'b', text: 'Few-shot', isCorrect: false }], explanation: 'Chain of Thought pede à IA para raciocinar passo a passo.' },
      ],
      feedback: { perfect: '🏆 Perfeito!', good: '👏 Bom!', needsReview: '📚 Revise!' },
    },
  },
  'drag-drop': {
    id: 'ex-dd-1',
    type: 'drag-drop',
    title: 'Organizar Conceitos',
    instruction: 'Arraste os itens para a ordem correta',
    data: {
      items: [
        { id: 'i1', text: 'Definir o objetivo do prompt', category: 'Etapa 1' },
        { id: 'i2', text: 'Adicionar contexto relevante', category: 'Etapa 2' },
        { id: 'i3', text: 'Especificar o formato de saída', category: 'Etapa 3' },
      ],
      categories: [
        { id: 'c1', title: 'Etapa 1' },
        { id: 'c2', title: 'Etapa 2' },
        { id: 'c3', title: 'Etapa 3' },
      ],
    },
  },
  'fill-in-blanks': {
    id: 'ex-fib-1',
    type: 'fill-in-blanks',
    title: 'Preencher Lacunas',
    instruction: 'Complete as frases com as palavras corretas',
    data: {
      sentences: [
        { id: 's1', text: 'A IA aprende com _______ para gerar respostas.', correctAnswers: ['dados', 'data'], hint: 'Pense na matéria-prima da IA', explanation: 'A IA precisa de dados para treinar seus modelos.' },
        { id: 's2', text: 'O _______ é usado para comunicar instruções à IA.', correctAnswers: ['prompt'], hint: 'Como você fala com a IA?', explanation: 'O prompt é o texto que instrui a IA.' },
      ],
      feedback: { allCorrect: '🏆 Todas corretas!', someCorrect: '👏 Quase lá!', needsReview: '📚 Revise os conceitos.' },
    },
  },
  'complete-sentence': {
    id: 'ex-cs-1',
    type: 'complete-sentence',
    title: 'Completar Sentença',
    instruction: 'Escolha a palavra correta para completar',
    data: {
      sentences: [
        { id: 's1', text: 'O Prompt _______ adapta a explicação ao nível do aluno.', correctAnswers: ['Pedagógico'], options: ['Pedagógico', 'Técnico', 'Criativo'], hints: ['Relacionado ao ensino'] },
        { id: 's2', text: 'A técnica de _______ melhora respostas complexas.', correctAnswers: ['Chain of Thought'], options: ['Chain of Thought', 'Zero-shot', 'Fine-tuning'] },
      ],
    },
  },
  'scenario-selection': {
    id: 'ex-ss-1',
    type: 'scenario-selection',
    title: 'Seleção de Cenário',
    instruction: 'Escolha o cenário mais adequado',
    data: {
      scenarios: [
        { id: 'sc1', title: 'Usar IA para criar conteúdo', description: 'Gerar posts para redes sociais automaticamente', emoji: '📱', isCorrect: true, feedback: 'Correto! IA pode gerar conteúdo para redes sociais.' },
        { id: 'sc2', title: 'Substituir médicos por IA', description: 'Usar IA para diagnósticos sem supervisão', emoji: '🏥', isCorrect: false, feedback: 'Incorreto. IA deve assistir, não substituir profissionais de saúde.' },
        { id: 'sc3', title: 'Automatizar emails repetitivos', description: 'Usar IA para respostas padronizadas', emoji: '✉️', isCorrect: true, feedback: 'Correto! Automação de emails é um ótimo uso de IA.' },
      ],
      correctExplanation: 'A IA é excelente para tarefas repetitivas e criação de conteúdo, mas deve ser usada com supervisão em áreas críticas.',
    },
  },
  'true-false': {
    id: 'ex-tf-1',
    type: 'true-false',
    title: 'Verdadeiro ou Falso',
    instruction: 'Avalie cada afirmação',
    data: {
      statements: [
        { id: 'st1', text: 'A IA pode aprender sozinha sem dados de treinamento.', correct: false, explanation: 'A IA precisa de grandes volumes de dados para treinar.' },
        { id: 'st2', text: 'GPT significa Generative Pre-trained Transformer.', correct: true, explanation: 'GPT = Generative Pre-trained Transformer.' },
        { id: 'st3', text: 'Prompts mais longos sempre geram melhores respostas.', correct: false, explanation: 'A qualidade do prompt importa mais que o tamanho.' },
      ],
      feedback: { perfect: '🏆 Perfeito!', good: '👏 Bom!', needsReview: '📚 Revise!' },
    },
  },
  'platform-match': {
    id: 'ex-pm-1',
    type: 'platform-match',
    title: 'Match de Plataformas',
    instruction: 'Associe cada cenário à plataforma correta',
    data: {
      scenarios: [
        { id: 'pm1', text: 'Gerar imagens artísticas a partir de texto', correctPlatform: 'midjourney', emoji: '🎨' },
        { id: 'pm2', text: 'Transcrever áudio para texto', correctPlatform: 'whisper', emoji: '🎙️' },
        { id: 'pm3', text: 'Criar chatbot de atendimento', correctPlatform: 'chatgpt', emoji: '💬' },
      ],
      platforms: [
        { id: 'midjourney', name: 'Midjourney', icon: '🎨', color: 'purple' },
        { id: 'whisper', name: 'Whisper', icon: '🎙️', color: 'blue' },
        { id: 'chatgpt', name: 'ChatGPT', icon: '💬', color: 'green' },
      ],
    },
  },
  'data-collection': {
    id: 'ex-dc-1',
    type: 'data-collection',
    title: 'Coleta de Dados',
    instruction: 'Selecione os dados relevantes para o cenário',
    data: {
      scenario: {
        id: 'dc1',
        emoji: '📊',
        platform: 'Google Analytics',
        situation: 'Você precisa analisar o desempenho de uma loja virtual. Selecione os dados mais relevantes.',
        context: 'A loja está com queda de 30% nas vendas no último mês.',
        dataPoints: [
          { id: 'dp1', label: 'Taxa de conversão', isCorrect: true, explanation: 'Essencial para entender se visitantes estão comprando.' },
          { id: 'dp2', label: 'Cor do logo', isCorrect: false, explanation: 'Não relevante para análise de vendas.' },
          { id: 'dp3', label: 'Taxa de rejeição', isCorrect: true, explanation: 'Indica se os visitantes saem rapidamente.' },
          { id: 'dp4', label: 'Fonte de tráfego', isCorrect: true, explanation: 'Mostra de onde vêm os visitantes.' },
        ],
      },
      feedback: { allCorrect: '🏆 Perfeito!', someCorrect: '👏 Quase lá!', needsReview: '📚 Revise!' },
    },
  },
  'playground': {
    id: 'ex-pg-1',
    type: 'playground',
    title: 'Playground Interativo',
    instruction: 'Pratique criando prompts para a IA',
    data: {
      systemPrompt: 'Você é um assistente educacional que ajuda a criar prompts eficientes.',
      contextTitle: 'Criando Prompts Eficientes',
      challenge: 'Crie um prompt para gerar um post no Instagram sobre produtividade.',
      hints: ['Defina o objetivo', 'Adicione contexto', 'Especifique o formato'],
    },
  },
};

// ── Demo Data (reusable) ─────────────────────────────────────

const DEMO_CONFIGS: Record<string, any> = {
  'multiple-choice': JSON_MODELS['multiple-choice'],
  'timed-quiz': JSON_MODELS['timed-quiz'],
  'flipcard-quiz': JSON_MODELS['flipcard-quiz'],
  'drag-drop': JSON_MODELS['drag-drop'],
  'fill-in-blanks': JSON_MODELS['fill-in-blanks'],
  'complete-sentence': JSON_MODELS['complete-sentence'],
  'scenario-selection': JSON_MODELS['scenario-selection'],
  'true-false': JSON_MODELS['true-false'],
  'platform-match': JSON_MODELS['platform-match'],
  'data-collection': JSON_MODELS['data-collection'],
  'playground': JSON_MODELS['playground'],
};

// ── Exercise Type Registry ───────────────────────────────────

interface ExerciseTypeEntry {
  type: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  version: ('V5' | 'V7')[];
  features: string[];
  color: string;
}

const EXERCISE_TYPES: ExerciseTypeEntry[] = [
  { type: 'multiple-choice', name: 'Múltipla Escolha', icon: <ListChecks className="w-5 h-5" />, description: 'Pergunta com opções de resposta e feedback.', version: ['V5', 'V7'], features: ['Feedback imediato', 'Explicação pós-resposta', 'Score automático'], color: 'blue' },
  { type: 'timed-quiz', name: 'Timed Quiz (Desafio Relâmpago)', icon: <Timer className="w-5 h-5" />, description: 'Quiz com timer regressivo, bônus por velocidade e urgência visual.', version: ['V7'], features: ['Timer com urgência', 'Bônus velocidade', 'Sons dinâmicos'], color: 'red' },
  { type: 'flipcard-quiz', name: 'FlipCard Quiz', icon: <Layers className="w-5 h-5" />, description: 'Cards com flip 3D para antecipação e recordação ativa.', version: ['V5', 'V7'], features: ['Flip 3D', 'Glow reveal', 'Confetti', 'Sons vitória/derrota'], color: 'purple' },
  { type: 'drag-drop', name: 'Drag & Drop', icon: <GripVertical className="w-5 h-5" />, description: 'Arrastar itens para a ordem ou categoria correta.', version: ['V5', 'V7'], features: ['Categorias dinâmicas', 'Validação visual', 'Score por categoria'], color: 'emerald' },
  { type: 'fill-in-blanks', name: 'Preencher Lacunas', icon: <PenLine className="w-5 h-5" />, description: 'Completar frases com palavras corretas.', version: ['V5', 'V7'], features: ['Input de texto', 'Validação case-insensitive', 'Feedback por sentença'], color: 'amber' },
  { type: 'complete-sentence', name: 'Completar Sentença', icon: <PenLine className="w-5 h-5" />, description: 'Escolher a palavra certa para completar sentenças.', version: ['V5', 'V7'], features: ['Opções por lacuna', 'Feedback instantâneo'], color: 'teal' },
  { type: 'scenario-selection', name: 'Seleção de Cenário', icon: <Target className="w-5 h-5" />, description: 'Escolher cenários adequados entre opções contextuais.', version: ['V5', 'V7'], features: ['Cenários contextuais', 'Explicação do correto'], color: 'pink' },
  { type: 'true-false', name: 'Verdadeiro ou Falso', icon: <ToggleLeft className="w-5 h-5" />, description: 'Avaliar afirmações como V ou F com explicações.', version: ['V5', 'V7'], features: ['Toggle V/F', 'Explicação por item', 'Score automático'], color: 'orange' },
  { type: 'platform-match', name: 'Platform Match', icon: <BarChart3 className="w-5 h-5" />, description: 'Associar cenários à plataforma mais adequada.', version: ['V5', 'V7'], features: ['Match cenário↔plataforma', 'Validação visual'], color: 'indigo' },
  { type: 'data-collection', name: 'Coleta de Dados', icon: <CheckSquare className="w-5 h-5" />, description: 'Exercício com coleta e análise de dados em cenário.', version: ['V5', 'V7'], features: ['Cenário contextual', 'Coleta estruturada'], color: 'cyan' },
  { type: 'playground', name: 'Playground Interativo', icon: <Sparkles className="w-5 h-5" />, description: 'Espaço para experimentar prompts com IA.', version: ['V5', 'V7'], features: ['Chat com IA', 'Contexto da aula', 'Token tracking'], color: 'violet' },
];

// ── Demo Renderer Component ──────────────────────────────────

function ExerciseDemo({ type, onClose }: { type: string; onClose: () => void }) {
  const [key, setKey] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const config = DEMO_CONFIGS[type];

  const handleComplete = (scoreOrBool: number | boolean) => {
    const finalScore = typeof scoreOrBool === 'boolean' ? (scoreOrBool ? 100 : 0) : scoreOrBool;
    setScore(finalScore);
  };

  const handleReset = () => {
    setScore(null);
    setKey(k => k + 1);
  };

  if (score !== null) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-5xl font-bold">{Math.round(score)}%</div>
        <p className="text-muted-foreground">Score final do exercício</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Rodar Novamente
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  switch (type) {
    case 'multiple-choice':
      return (
        <MultipleChoiceExercise
          key={key}
          question={config.data.question}
          options={config.data.options}
          correctAnswer={config.data.correctAnswer}
          explanation={config.data.explanation}
          onComplete={handleComplete}
        />
      );
    case 'timed-quiz':
      return (
        <TimedQuizExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          data={config.data}
          onComplete={handleComplete}
        />
      );
    case 'flipcard-quiz':
      return (
        <FlipCardQuizExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          data={config.data}
          onComplete={handleComplete}
        />
      );
    case 'drag-drop':
      return (
        <DragDropLesson
          key={key}
          content={{
            items: config.data.items.map((i: any) => i.text),
            correctOrder: config.data.items.map((i: any) => i.text),
            instruction: config.instruction,
          }}
          onSubmit={async (items: string[]) => {
            const correctCount = items.filter((item: string, index: number) =>
              item === config.data.items[index].text
            ).length;
            const s = (correctCount / items.length) * 100;
            handleComplete(s);
            return { passed: s >= 70, score: s, feedback: s >= 70 ? 'Correto!' : 'Tente novamente.', isLastLesson: false };
          }}
          submitting={false}
        />
      );
    case 'fill-in-blanks':
      return (
        <FillInBlanksExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          sentences={config.data.sentences}
          feedback={config.data.feedback}
          onComplete={handleComplete}
        />
      );
    case 'complete-sentence':
      return (
        <CompleteSentenceExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          sentences={config.data.sentences}
          onComplete={handleComplete}
        />
      );
    case 'scenario-selection':
      return (
        <ScenarioSelectionExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          data={config.data}
          onComplete={handleComplete}
        />
      );
    case 'true-false':
      return (
        <TrueFalseExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          statements={config.data.statements}
          feedback={config.data.feedback}
          onComplete={handleComplete}
        />
      );
    case 'platform-match':
      return (
        <PlatformMatchExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          scenarios={config.data.scenarios}
          platforms={config.data.platforms}
          onComplete={handleComplete}
        />
      );
    case 'data-collection':
      return (
        <DataCollectionExercise
          key={key}
          title={config.title}
          instruction={config.instruction}
          scenario={config.data.scenario}
          onComplete={handleComplete}
        />
      );
    case 'playground':
      return (
        <div className="text-center py-8 space-y-4">
          <Sparkles className="w-12 h-12 mx-auto text-violet-500" />
          <h3 className="text-lg font-semibold">Playground Interativo</h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            O Playground requer contexto de aula e conexão com IA. 
            Ele funciona integrado ao player V5/V7 durante uma aula real.
          </p>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      );
    default:
      return <p className="text-muted-foreground">Demo não disponível.</p>;
  }
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminExerciseLibrary() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [jsonModal, setJsonModal] = useState<string | null>(null);

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
              <BookOpen className="w-7 h-7 text-violet-500" />
              Exercícios & Gaming
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Catálogo completo dos {EXERCISE_TYPES.length} tipos · Demos · JSON Modelo
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
            <div className="text-3xl font-bold text-emerald-500">{EXERCISE_TYPES.filter(e => e.type !== 'playground').length}</div>
            <div className="text-xs text-muted-foreground mt-1">Com Demo</div>
          </Card>
          <Card className="text-center py-4">
            <div className="text-3xl font-bold text-blue-500">{EXERCISE_TYPES.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Com JSON Modelo</div>
          </Card>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {EXERCISE_TYPES.map((exercise, index) => (
            <Card key={exercise.type} className="border border-border/60 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-mono w-6">{String(index + 1).padStart(2, '0')}</span>
                    {exercise.icon}
                    {exercise.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {exercise.version.map(v => (
                      <Badge key={v} variant="outline" className="text-xs font-mono">
                        {v}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-muted-foreground">{exercise.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {exercise.features.map(f => (
                    <span key={f} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                      {f}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => setActiveDemo(exercise.type)}
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Demo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJsonModal(exercise.type)}
                  >
                    <Code className="w-3.5 h-3.5 mr-1.5" />
                    JSON Modelo
                  </Button>
                  <span className="ml-auto text-xs font-mono text-muted-foreground/60">
                    type: "{exercise.type}"
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Demo Dialog */}
      <Dialog open={!!activeDemo} onOpenChange={(open) => !open && setActiveDemo(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Demo: {EXERCISE_TYPES.find(e => e.type === activeDemo)?.name}
            </DialogTitle>
          </DialogHeader>
          {activeDemo && (
            <ExerciseDemo
              type={activeDemo}
              onClose={() => setActiveDemo(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* JSON Model Dialog */}
      <Dialog open={!!jsonModal} onOpenChange={(open) => !open && setJsonModal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              JSON Modelo: {EXERCISE_TYPES.find(e => e.type === jsonModal)?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto font-mono">
              {jsonModal && JSON.stringify(JSON_MODELS[jsonModal], null, 2)}
            </pre>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (jsonModal) {
                  navigator.clipboard.writeText(JSON.stringify(JSON_MODELS[jsonModal], null, 2));
                }
              }}
            >
              Copiar JSON
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
