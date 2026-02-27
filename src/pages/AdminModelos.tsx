import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  FileJson, 
  BookOpen, 
  Copy, 
  CheckCircle,
  FolderOpen,
  Rocket,
  FileText,
  Code,
  Shield,
  Zap,
  Database,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Camera,
  Eye,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

// JSON Modelo INPUT para Pipeline V7-vv
import V7Aula1InputModelo from '@/data/v7-aula1-input-modelo.json';

// ============================================================================
// INTERACTIVE SCENE TYPES
// ============================================================================

const INTERACTIVE_SCENE_TYPES = [
  { 
    type: 'interaction', 
    requiresPauseAt: true, 
    mapsTo: 'interaction',
    desc: 'Cena de quiz/escolha. O áudio pausa para o usuário responder.',
    example: {
      id: "cena-05-quiz",
      title: "Quiz Interativo",
      type: "interaction",
      narration: "Qual dessas ferramentas é usada para gerar imagens? Escolha agora.",
      anchorText: { pauseAt: "agora" },
      visual: { type: "quiz", content: { question: "Qual ferramenta gera imagens?" } },
      interaction: {
        type: "quiz",
        options: [
          { id: "a", text: "Midjourney", isCorrect: true },
          { id: "b", text: "Excel", isCorrect: false }
        ]
      }
    }
  },
  { 
    type: 'playground', 
    requiresPauseAt: true, 
    mapsTo: 'playground',
    desc: 'Cena de prática livre. Usuário experimenta prompts na IA.',
    example: {
      id: "cena-08-playground",
      title: "Hora de Praticar",
      type: "playground",
      narration: "Agora é sua vez de criar um prompt profissional. Pratique agora.",
      anchorText: { pauseAt: "agora" },
      visual: { type: "playground", content: { hookQuestion: "Crie seu prompt" } },
      interaction: {
        type: "playground",
        challengePrompt: "Crie um prompt para gerar uma logo",
        evaluationCriteria: ["Clareza", "Especificidade"]
      }
    }
  },
  { 
    type: 'secret-reveal', 
    requiresPauseAt: true, 
    mapsTo: 'revelation',
    desc: 'Cena de revelação dramática. O áudio pausa antes de revelar um segredo.',
    example: {
      id: "cena-06-reveal",
      title: "Revelação",
      type: "secret-reveal",
      narration: "E o segredo que poucos conhecem é este: veja agora.",
      anchorText: { pauseAt: "agora" },
      visual: { type: "secret-reveal", content: { hookQuestion: "O segredo é..." } }
    }
  },
  { 
    type: 'gamification', 
    requiresPauseAt: false, 
    mapsTo: 'narrative',
    desc: 'Cena de celebração/progresso. NÃO pausa o áudio.',
    example: {
      id: "cena-10-game",
      title: "Parabéns!",
      type: "gamification",
      narration: "Você completou esta etapa com sucesso!",
      visual: { type: "achievement", content: { title: "Etapa Concluída", xp: 50 } }
    }
  },
];

// ============================================================================
// MICRO VISUAL TYPES (13 canônicos — V7Contract.ts SSOT)
// ============================================================================

const MICRO_VISUAL_TYPES = [
  // ── ORIGINAIS (7) ──
  { 
    input: 'image', 
    output: 'image-flash', 
    desc: 'Flash de imagem — exibe uma imagem com efeito de entrada',
    rules: ['Requer anchorText com keyword no narration', 'Máx 1 por frase'],
    isNew: false,
    example: {
      microVisuals: [{ type: "image", anchorText: "Midjourney", content: { src: "/images/midjourney.png", alt: "Logo Midjourney" } }]
    }
  },
  { 
    input: 'text', 
    output: 'text-pop', 
    desc: 'Pop de texto — destaca uma frase ou conceito chave',
    rules: ['anchorText obrigatório', 'Texto curto (máx 50 chars)', 'Máx 1 por frase'],
    isNew: false,
    example: {
      microVisuals: [{ type: "text", anchorText: "inteligência", content: { text: "Inteligência Artificial", style: "highlight" } }]
    }
  },
  { 
    input: 'number', 
    output: 'number-count', 
    desc: 'Contador numérico — anima um número com contagem progressiva',
    rules: ['anchorText obrigatório', 'Número deve ser string', 'Máx 1 por frase'],
    isNew: false,
    example: {
      microVisuals: [{ type: "number", anchorText: "bilhões", content: { number: "3.5", suffix: "bilhões", subtitle: "de usuários de IA" } }]
    }
  },
  { 
    input: 'badge', 
    output: 'card-reveal', 
    desc: 'Card/badge — revela um card com informação contextual',
    rules: ['anchorText obrigatório', 'Máx 1 por frase'],
    isNew: false,
    example: {
      microVisuals: [{ type: "badge", anchorText: "certificado", content: { title: "Certificado IA", subtitle: "Nível Profissional" } }]
    }
  },
  { 
    input: 'highlight', 
    output: 'highlight', 
    desc: 'Destaque visual — passthrough, mantém tipo no output',
    rules: ['anchorText obrigatório', 'Máx 1 por frase'],
    isNew: false,
    example: {
      microVisuals: [{ type: "highlight", anchorText: "importante", content: { text: "Este conceito é fundamental", color: "cyan" } }]
    }
  },
  { 
    input: 'letter-reveal', 
    output: 'letter-reveal', 
    desc: 'Revelação letra a letra — passthrough, ideal para método/acrônimo',
    rules: ['anchorText obrigatório', 'Usado para revelar método passo a passo', 'Máx 1 por frase'],
    isNew: false,
    example: {
      microVisuals: [{ type: "letter-reveal", anchorText: "método", content: { letters: ["P","R","O","M","P","T"], meanings: ["Preciso","Relevante","Objetivo","Mensurável","Prático","Testável"] } }]
    }
  },
  // ── NOVOS (6) — adicionados ao V7Contract.ts ──
  { 
    input: 'stat', 
    output: 'stat', 
    desc: 'Métrica de impacto — count-up animado com label e valor',
    rules: ['anchorText obrigatório', 'Campos: value, label (obrigatórios)', 'Máx 1 por frase'],
    isNew: true,
    example: {
      microVisuals: [{ type: "stat", anchorText: "cinquenta mil", content: { value: "R$ 50k", label: "renda mensal com IA", color: "#10B981" } }]
    }
  },
  { 
    input: 'step', 
    output: 'step', 
    desc: 'Passo numerado sequencial — com borda timeline visual',
    rules: ['anchorText obrigatório', 'Campos: stepNumber, text (obrigatórios)', 'Máx 1 por frase'],
    isNew: true,
    example: {
      microVisuals: [{ type: "step", anchorText: "primeiro passo", content: { stepNumber: 1, text: "Defina o output que você quer gerar com IA", color: "#22D3EE" } }]
    }
  },
  { 
    input: 'quote', 
    output: 'quote', 
    desc: 'Citação editorial — com efeito typewriter stagger',
    rules: ['anchorText obrigatório', 'Campos: quote, author (obrigatórios)', 'Máx 1 por frase'],
    isNew: true,
    example: {
      microVisuals: [{ type: "quote", anchorText: "domina", content: { quote: "Quem domina prompts, domina o futuro do trabalho.", author: "AIliv", color: "#818CF8" } }]
    }
  },
  { 
    input: 'pill-tag', 
    output: 'pill-tag', 
    desc: 'Tag/etiqueta contextual — com dot pulsante',
    rules: ['anchorText obrigatório', 'Campos: tag (obrigatório), dot (opcional)', 'Máx 1 por frase'],
    isNew: true,
    example: {
      microVisuals: [{ type: "pill-tag", anchorText: "produtividade", content: { tag: "Produtividade", dot: true, color: "#38BDF8" } }]
    }
  },
  { 
    input: 'comparison-bar', 
    output: 'comparison-bar', 
    desc: 'Barras de comparação antes/depois — animadas lado a lado',
    rules: ['anchorText obrigatório', 'Campos: leftLabel, leftValue, rightLabel, rightValue (obrigatórios)', 'Máx 1 por frase'],
    isNew: true,
    example: {
      microVisuals: [{ type: "comparison-bar", anchorText: "diferença", content: { leftLabel: "Amador", leftValue: 20, rightLabel: "Profissional", rightValue: 95, leftColor: "#EF4444", rightColor: "#10B981" } }]
    }
  },
  { 
    input: 'alert', 
    output: 'alert', 
    desc: 'Alerta urgente — com shake físico e glow vermelho',
    rules: ['anchorText obrigatório', 'Campos: text, highlight (obrigatórios)', 'Máx 1 por frase'],
    isNew: true,
    example: {
      microVisuals: [{ type: "alert", anchorText: "cuidado", content: { text: "Nunca compartilhe dados sensíveis com IA pública", highlight: "dados sensíveis", icon: "⚠️" } }]
    }
  },
];

// ============================================================================
// VISUAL EFFECTS
// ============================================================================

const VISUAL_EFFECTS = [
  { name: 'mood', values: ['dramatic', 'calm', 'danger', 'success', 'energetic'], desc: 'Define a atmosfera visual da cena' },
  { name: 'particles', values: ['confetti', 'sparks', 'ember', 'snow'], desc: 'Partículas animadas de fundo' },
  { name: 'glow', values: ['true'], desc: 'Efeito de brilho/aura nos elementos visuais' },
  { name: 'shake', values: ['true'], desc: 'Tremor de câmera para impacto dramático' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminModelos() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copiedV8, setCopiedV8] = useState(false);
  const [expandedMV, setExpandedMV] = useState<string | null>(null);
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const [expandedVisualSection, setExpandedVisualSection] = useState<string | null>('microvisuals');
  const [expandedEPPBlock, setExpandedEPPBlock] = useState<string | null>(null);

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(V7Aula1InputModelo, null, 2));
      setCopied(true);
      toast.success('JSON copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error('Erro ao copiar JSON');
    }
  };

  const copyToClipboard = async (obj: any, label: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      toast.success(`${label} copiado!`);
    } catch (err) {
      toast.error('Erro ao copiar');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <FolderOpen className="w-7 h-7 text-emerald-500" />
              Guia de Modelos V7 + V8
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Templates JSON e documentação técnica dos formatos V7-vv e V8 Read & Listen
            </p>
          </div>
        </div>

        {/* GUIA RÁPIDO V8 */}
        <Card className="border-2 border-indigo-500/50 bg-gradient-to-r from-indigo-500/10 to-violet-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-7 h-7 text-indigo-500" />
              Modelo V8 — Read & Listen
              <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">NOVO</span>
            </CardTitle>
            <CardDescription>
              Formato simplificado: trilha → aula direta, com áudio por seção e modo Ler/Ouvir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1.5">
              <p>✅ Hierarquia 2 níveis (sem curso/jornada)</p>
              <p>✅ Aula V8 com <code>model: "v8"</code> e <code>course_id: null</code></p>
              <p>✅ Seções com áudio curto (15–30s) e avanço determinístico por fim de áudio</p>
              <p>✅ Modo Ler (manual) e Ouvir (autoplay)</p>
            </div>
            <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 p-3">
              <p className="text-xs font-semibold text-indigo-400 mb-2">🏆 JSON Golden Template V8 — Referência Completa</p>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap text-foreground/90 max-h-[600px] overflow-y-auto">{`{
  "contentVersion": "v8",
  "title": "Fundamentos de Prompts com I.A.",
  "description": "Aprenda a criar prompts eficazes para gerar resultados profissionais com Inteligência Artificial.",

  "sections": [
    {
      "id": "section-01",
      "title": "O que é um Prompt?",
      "content": "## O que é um Prompt?\\n\\nUm **prompt** é a instrução que você dá para uma Inteligência Artificial. É como uma pergunta ou comando que guia a IA para gerar exatamente o que você precisa.\\n\\n> Pense no prompt como uma receita: quanto mais detalhada, melhor o resultado.\\n\\n### Por que isso importa?\\n\\n- Prompts vagos = resultados genéricos\\n- Prompts específicos = resultados profissionais\\n- A diferença entre amador e profissional está no prompt",
      "imageUrl": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
      "audioUrl": "https://storage.example.com/v8/aula-01/section-01.mp3",
      "audioDurationSeconds": 25
    },
    {
      "id": "section-02",
      "title": "Anatomia de um Bom Prompt",
      "content": "## Anatomia de um Bom Prompt\\n\\nTodo prompt profissional tem **4 elementos**:\\n\\n1. **Contexto** — Quem você é e qual o cenário\\n2. **Tarefa** — O que você quer que a IA faça\\n3. **Formato** — Como o resultado deve ser entregue\\n4. **Restrições** — Limites e regras específicas\\n\\n### Exemplo Prático\\n\\n\`\`\`\\nContexto: Sou um freelancer de design\\nTarefa: Crie 5 nomes para uma marca de café artesanal\\nFormato: Lista numerada com explicação de cada nome\\nRestrição: Nomes curtos, máximo 2 palavras\\n\`\`\`\\n\\nEsse prompt gera resultados **10x melhores** que simplesmente pedir \\"me dê nomes para café\\".",
      "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
      "audioUrl": "https://storage.example.com/v8/aula-01/section-02.mp3",
      "audioDurationSeconds": 30
    },
    {
      "id": "section-03",
      "title": "Erros Comuns e Como Evitar",
      "content": "## Erros Comuns e Como Evitar\\n\\n### ❌ Erro 1: Prompt Vago\\n\\"Escreva um texto sobre marketing\\"\\n\\n### ✅ Correção:\\n\\"Escreva um post de LinkedIn com 150 palavras sobre marketing digital para dentistas, tom profissional mas acessível\\"\\n\\n### ❌ Erro 2: Sem Formato\\n\\"Me dê dicas de produtividade\\"\\n\\n### ✅ Correção:\\n\\"Liste 7 dicas de produtividade para home office em formato de checklist com emoji\\"\\n\\n### ❌ Erro 3: Contexto Ausente\\n\\"Faça uma proposta comercial\\"\\n\\n### ✅ Correção:\\n\\"Atue como um consultor de marketing. Crie uma proposta comercial para um cliente do ramo alimentício, orçamento de R$5.000/mês\\"\\n\\n> 💡 **Regra de ouro**: Se um humano precisaria de mais contexto para executar a tarefa, a IA também precisa.",
      "audioUrl": "https://storage.example.com/v8/aula-01/section-03.mp3",
      "audioDurationSeconds": 28
    }
  ],

  "inlineQuizzes": [
    {
      "id": "quiz-01",
      "afterSectionIndex": 1,
      "question": "Quais são os 4 elementos de um prompt profissional?",
      "options": [
        { "id": "opt-a", "text": "Contexto, Tarefa, Formato e Restrições", "isCorrect": true },
        { "id": "opt-b", "text": "Título, Corpo, Rodapé e Assinatura", "isCorrect": false },
        { "id": "opt-c", "text": "Início, Meio, Fim e Revisão", "isCorrect": false }
      ],
      "explanation": "Correto! Os 4 elementos são: Contexto (quem/cenário), Tarefa (o que fazer), Formato (como entregar) e Restrições (limites e regras).",
      "reinforcement": "Releia a seção 'Anatomia de um Bom Prompt' — os 4 elementos estão destacados em negrito.",
      "audioUrl": "https://storage.example.com/v8/aula-01/quiz-01.mp3"
    }
  ],

  "exercises": [
    {
      "id": "ex-01",
      "type": "true-false",
      "title": "Verdadeiro ou Falso — Prompts",
      "instruction": "Avalie cada afirmação sobre prompts e marque V ou F.",
      "data": {
        "statements": [
          {
            "id": "stmt-1",
            "text": "Um prompt vago gera resultados mais criativos que um prompt detalhado.",
            "correct": false,
            "explanation": "Falso. Prompts vagos geram resultados genéricos. Detalhamento guia a IA para respostas mais úteis e específicas."
          },
          {
            "id": "stmt-2",
            "text": "Incluir o formato desejado no prompt melhora significativamente o resultado.",
            "correct": true,
            "explanation": "Verdadeiro! Especificar formato (lista, tabela, post, e-mail) ajuda a IA a estruturar a resposta exatamente como você precisa."
          },
          {
            "id": "stmt-3",
            "text": "Dar contexto sobre quem você é ajuda a IA a personalizar a resposta.",
            "correct": true,
            "explanation": "Verdadeiro! Quando a IA sabe que você é freelancer, professor ou empreendedor, ela adapta linguagem e exemplos."
          }
        ],
        "feedback": {
          "perfect": "🏆 Perfeito! Você domina os fundamentos de prompts!",
          "good": "👏 Muito bem! Quase lá — revise os pontos que errou.",
          "needsReview": "📖 Releia a aula com atenção. Os conceitos são simples mas importantes."
        }
      }
    },
    {
      "id": "ex-02",
      "type": "multiple-choice",
      "title": "Qual o Melhor Prompt?",
      "instruction": "Escolha o prompt mais eficaz para gerar um post de LinkedIn.",
      "data": {
        "question": "Qual destes prompts geraria o melhor post de LinkedIn?",
        "options": [
          "Escreva um post sobre IA",
          "Crie um post de LinkedIn com 150 palavras sobre como freelancers podem usar IA para dobrar sua produtividade, tom inspirador com dados reais",
          "Faça um texto de IA para rede social",
          "Post LinkedIn IA produtividade freelancer"
        ],
        "correctAnswer": "Crie um post de LinkedIn com 150 palavras sobre como freelancers podem usar IA para dobrar sua produtividade, tom inspirador com dados reais",
        "explanation": "Este prompt inclui os 4 elementos: contexto (freelancers), tarefa (post LinkedIn), formato (150 palavras, tom inspirador) e restrições (dados reais). Os outros são vagos demais."
      }
    }
  ]
}`}</pre>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="flex-1 min-w-[160px] bg-indigo-600 hover:bg-indigo-700"
                onClick={async () => {
                  try {
                    const goldenV8 = {
                      contentVersion: "v8",
                      title: "Fundamentos de Prompts com I.A.",
                      description: "Aprenda a criar prompts eficazes para gerar resultados profissionais com Inteligência Artificial.",
                      sections: [
                        { id: "section-01", title: "O que é um Prompt?", content: "## O que é um Prompt?\n\nUm **prompt** é a instrução que você dá para uma Inteligência Artificial...", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800", audioUrl: "https://storage.example.com/v8/aula-01/section-01.mp3", audioDurationSeconds: 25 },
                        { id: "section-02", title: "Anatomia de um Bom Prompt", content: "## Anatomia de um Bom Prompt\n\nTodo prompt profissional tem **4 elementos**...", imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800", audioUrl: "https://storage.example.com/v8/aula-01/section-02.mp3", audioDurationSeconds: 30 },
                        { id: "section-03", title: "Erros Comuns e Como Evitar", content: "## Erros Comuns e Como Evitar\n\n### ❌ Erro 1: Prompt Vago...", audioUrl: "https://storage.example.com/v8/aula-01/section-03.mp3", audioDurationSeconds: 28 }
                      ],
                      inlineQuizzes: [{ id: "quiz-01", afterSectionIndex: 1, question: "Quais são os 4 elementos de um prompt profissional?", options: [{ id: "opt-a", text: "Contexto, Tarefa, Formato e Restrições", isCorrect: true }, { id: "opt-b", text: "Título, Corpo, Rodapé e Assinatura", isCorrect: false }, { id: "opt-c", text: "Início, Meio, Fim e Revisão", isCorrect: false }], explanation: "Correto! Os 4 elementos são: Contexto, Tarefa, Formato e Restrições.", reinforcement: "Releia a seção 'Anatomia de um Bom Prompt'.", audioUrl: "https://storage.example.com/v8/aula-01/quiz-01.mp3" }],
                      exercises: [
                        { id: "ex-01", type: "true-false", title: "Verdadeiro ou Falso — Prompts", instruction: "Avalie cada afirmação.", data: { statements: [{ id: "stmt-1", text: "Um prompt vago gera resultados mais criativos.", correct: false, explanation: "Falso." }, { id: "stmt-2", text: "Incluir formato melhora o resultado.", correct: true, explanation: "Verdadeiro!" }, { id: "stmt-3", text: "Dar contexto ajuda a personalizar.", correct: true, explanation: "Verdadeiro!" }], feedback: { perfect: "🏆 Perfeito!", good: "👏 Muito bem!", needsReview: "📖 Releia a aula." } } },
                        { id: "ex-02", type: "multiple-choice", title: "Qual o Melhor Prompt?", instruction: "Escolha o prompt mais eficaz.", data: { question: "Qual prompt geraria o melhor post?", options: ["Escreva um post sobre IA", "Crie um post de LinkedIn com 150 palavras...", "Faça um texto de IA", "Post LinkedIn IA"], correctAnswer: "Crie um post de LinkedIn com 150 palavras...", explanation: "Inclui os 4 elementos." } }
                      ]
                    };
                    await navigator.clipboard.writeText(JSON.stringify(goldenV8, null, 2));
                    setCopiedV8(true);
                    toast.success('JSON Golden V8 copiado!');
                    setTimeout(() => setCopiedV8(false), 3000);
                  } catch (err) {
                    toast.error('Erro ao copiar JSON V8');
                  }
                }}
              >
                {copiedV8 ? (
                  <><CheckCircle className="w-5 h-5 mr-2" /> Copiado!</>
                ) : (
                  <><Copy className="w-5 h-5 mr-2" /> Copiar JSON V8 Golden</>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 min-w-[160px] border-indigo-500/50 hover:bg-indigo-500/10"
                onClick={() => navigate('/admin/v8/create')}
              >
                <Rocket className="w-5 h-5 mr-2" /> Abrir Criador V8
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JSON MODELO — DESTAQUE */}
        <Card className="border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-green-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileJson className="w-7 h-7 text-emerald-500" />
              JSON Modelo Padrão — Aula 1 V7-vv
              <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">REFERÊNCIA</span>
            </CardTitle>
            <CardDescription>
              Espelho exato da Aula 1 funcionando — Use como base para criar novas aulas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-1.5">
              <p>✅ 11 cenas completas (dramatic, narrative, interaction, playground, revelation, cta, gamification)</p>
              <p>✅ anchorText.pauseAt APENAS em cenas interativas (C10 compliance)</p>
              <p>✅ 13 tipos canônicos de MicroVisual (image, text, number, badge, highlight, letter-reveal, stat, step, quote, pill-tag, comparison-bar, alert)</p>
              <p>✅ Quiz 4 opções com feedback narrado</p>
              <p>✅ Playground amador vs profissional</p>
              <p>✅ CTA via scene.type="narrative" + visual.type="cta" (C10B compliance)</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                className="flex-1 min-w-[160px] bg-emerald-600 hover:bg-emerald-700"
                onClick={copyJsonToClipboard}
              >
                {copied ? (
                  <><CheckCircle className="w-5 h-5 mr-2" /> Copiado!</>
                ) : (
                  <><Copy className="w-5 h-5 mr-2" /> Copiar JSON Modelo</>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 min-w-[160px] border-emerald-500/50 hover:bg-emerald-500/10"
                onClick={() => navigate('/admin/v7-vv')}
              >
                <Rocket className="w-5 h-5 mr-2" /> Usar no Pipeline
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* EFEITOS VISUAIS — Card Unificado */}
        {/* ============================================================ */}
        <Card className="border-2 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-7 h-7 text-amber-500" />
              Efeitos Visuais
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">COMPLETO</Badge>
            </CardTitle>
            <CardDescription>
              Todos os modelos visuais do sistema V7: MicroVisuals, Scene Types, Visual Effects, Animations e Transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* SUB: MicroVisual Types */}
            <Collapsible open={expandedVisualSection === 'microvisuals'} onOpenChange={(open) => setExpandedVisualSection(open ? 'microvisuals' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                  {expandedVisualSection === 'microvisuals' ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronRight className="w-4 h-4 text-amber-500" />}
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-semibold">MicroVisual Types (13 canônicos)</span>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px] ml-auto">13 TIPOS</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-2">
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    <p>⚠️ Máximo <strong>1 microVisual por frase</strong> na narração</p>
                    <p>⚠️ <strong>anchorText obrigatório</strong> — deve existir literalmente na narração</p>
                    <p>⛔ <strong>icon</strong> é REJEITADO — use image ou badge</p>
                  </div>
                  {MICRO_VISUAL_TYPES.map(mv => (
                    <Collapsible key={mv.input} open={expandedMV === mv.input} onOpenChange={(open) => setExpandedMV(open ? mv.input : null)}>
                      <CollapsibleTrigger className="w-full text-left">
                        <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                          {expandedMV === mv.input ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <span className="text-sm font-mono text-emerald-500 font-bold">{mv.input}</span>
                          <span className="text-xs text-muted-foreground">→ {mv.output}</span>
                          {mv.isNew && <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-[9px]">NOVO</Badge>}
                          <span className="text-xs text-muted-foreground ml-auto">{mv.desc}</span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-5 p-3 bg-muted/30 rounded-lg space-y-2 border border-border/50">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Regras:</p>
                            {mv.rules.map((r, i) => (
                              <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                            ))}
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-muted-foreground">Exemplo JSON:</p>
                              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard(mv.example, mv.input)}>
                                <Copy className="w-3 h-3 mr-1" /> Copiar
                              </Button>
                            </div>
                            <pre className="text-[11px] font-mono bg-background/50 p-2 rounded overflow-x-auto border border-border/30">
                              {JSON.stringify(mv.example, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* SUB: Interactive Scene Types */}
            <Collapsible open={expandedVisualSection === 'scenes'} onOpenChange={(open) => setExpandedVisualSection(open ? 'scenes' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 transition-colors">
                  {expandedVisualSection === 'scenes' ? <ChevronDown className="w-4 h-4 text-purple-500" /> : <ChevronRight className="w-4 h-4 text-purple-500" />}
                  <Code className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-semibold">Interactive Scene Types</span>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-[10px] ml-auto">4 TIPOS</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 pl-2">
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    <p>⚠️ CTA = <code className="bg-muted px-1 rounded">scene.type="narrative"</code> + <code className="bg-muted px-1 rounded">visual.type="cta"</code> (NÃO é interativo)</p>
                    <p>⚠️ pauseAt deve ser a <strong>última palavra relevante</strong> da narração (C10B: máx 1.5s do fim)</p>
                  </div>
                  {INTERACTIVE_SCENE_TYPES.map(s => (
                    <Collapsible key={s.type} open={expandedScene === s.type} onOpenChange={(open) => setExpandedScene(open ? s.type : null)}>
                      <CollapsibleTrigger className="w-full text-left">
                        <div className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                          {expandedScene === s.type ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          <span className={`text-sm font-mono font-bold ${s.requiresPauseAt ? 'text-emerald-500' : 'text-yellow-500'}`}>
                            {s.type}
                          </span>
                          <span className="text-xs text-muted-foreground">→ {s.mapsTo}</span>
                          <span className="text-xs ml-auto">{s.requiresPauseAt ? '✅ pauseAt' : '❌ no pause'}</span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="ml-5 p-3 bg-muted/30 rounded-lg space-y-2 border border-border/50">
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-muted-foreground">Exemplo JSON:</p>
                              <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard(s.example, s.type)}>
                                <Copy className="w-3 h-3 mr-1" /> Copiar
                              </Button>
                            </div>
                            <pre className="text-[11px] font-mono bg-background/50 p-2 rounded overflow-x-auto border border-border/30">
                              {JSON.stringify(s.example, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* SUB: Visual Effects */}
            <Collapsible open={expandedVisualSection === 'effects'} onOpenChange={(open) => setExpandedVisualSection(open ? 'effects' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors">
                  {expandedVisualSection === 'effects' ? <ChevronDown className="w-4 h-4 text-cyan-500" /> : <ChevronRight className="w-4 h-4 text-cyan-500" />}
                  <Zap className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-semibold">Visual Effects</span>
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-[10px] ml-auto">ATMOSFERA</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-2 space-y-3">
                  {VISUAL_EFFECTS.map(vf => (
                    <div key={vf.name} className="flex items-start gap-3">
                      <span className="text-sm font-mono text-cyan-500 font-bold min-w-[80px]">{vf.name}</span>
                      <div>
                        <p className="text-xs text-muted-foreground">{vf.desc}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {vf.values.map(v => (
                            <span key={v} className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">{v}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* SUB: V7 Visual Types (Player) */}
            <Collapsible open={expandedVisualSection === 'vtypes'} onOpenChange={(open) => setExpandedVisualSection(open ? 'vtypes' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                  {expandedVisualSection === 'vtypes' ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-blue-500" />}
                  <Eye className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-semibold">V7 Visual Types (Player)</span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-[10px] ml-auto">13 TIPOS</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-2 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Tipos visuais que o Player renderiza (V7Contract.ts):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['number-reveal', 'text-reveal', 'split-screen', 'letter-reveal', 'cards-reveal', 'quiz', 'quiz-feedback', 'playground', 'result', 'cta', '3d-dual-monitors', '3d-abstract', '3d-number-reveal'].map(t => (
                      <div key={t} className="text-[11px] font-mono bg-blue-500/10 text-blue-400 px-2 py-1.5 rounded border border-blue-500/20">{t}</div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* SUB: Animations, Moods & Transitions */}
            <Collapsible open={expandedVisualSection === 'animations'} onOpenChange={(open) => setExpandedVisualSection(open ? 'animations' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-pink-500/5 border border-pink-500/20 hover:bg-pink-500/10 transition-colors">
                  {expandedVisualSection === 'animations' ? <ChevronDown className="w-4 h-4 text-pink-500" /> : <ChevronRight className="w-4 h-4 text-pink-500" />}
                  <Palette className="w-5 h-5 text-pink-500" />
                  <span className="text-sm font-semibold">Animations, Moods & Transitions</span>
                  <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-[10px] ml-auto">CINEMA</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-2 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Animation Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {['fade', 'slide-up', 'slide-left', 'slide-right', 'explode', 'count-up', 'letter-by-letter', 'scale-up', 'particle-burst', 'zoom-in', 'letterbox', 'glitch'].map(a => (
                        <span key={a} className="text-[10px] font-mono bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded">{a}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Mood Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {['danger', 'success', 'neutral', 'warning', 'dramatic', 'mysterious'].map(m => (
                        <span key={m} className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Transition Types:</p>
                    <div className="flex flex-wrap gap-1">
                      {['fadeFromBlack', 'fadeToBlack', 'fadeToNext', 'slideLeft', 'slideRight', 'zoomIn', 'zoomOut', 'dissolve'].map(tr => (
                        <span key={tr} className="text-[10px] font-mono bg-violet-500/10 text-violet-400 px-1.5 py-0.5 rounded">{tr}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Particles:</p>
                    <div className="flex flex-wrap gap-1">
                      {['confetti', 'sparks', 'ember', 'stars', 'snow', 'none'].map(p => (
                        <span key={p} className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

          </CardContent>
        </Card>

        {/* ============================================================ */}
        {/* PROMPT CINEMATOGRÁFICO EPP */}
        {/* ============================================================ */}
        <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Camera className="w-7 h-7 text-orange-500" />
              🎬 Prompt Cinematográfico EPP
              <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-[10px]">SISTEMA MODULAR</Badge>
            </CardTitle>
            <CardDescription>
              Sistema em 5 blocos para geração de imagens cinematográficas EPP (adulto 38+)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">

            {/* Estrutura Geral */}
            <div className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
              <p className="text-xs font-semibold text-orange-400 mb-2">📐 Estrutura em 5 Blocos:</p>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[11px]">
                <div className="bg-muted/30 p-2 rounded text-center"><strong className="text-emerald-400">[1]</strong> Contexto Pedagógico <span className="text-muted-foreground">(variável)</span></div>
                <div className="bg-muted/30 p-2 rounded text-center"><strong className="text-blue-400">[2]</strong> Personagem <span className="text-muted-foreground">(semi-var)</span></div>
                <div className="bg-muted/30 p-2 rounded text-center"><strong className="text-purple-400">[3]</strong> Ação Específica <span className="text-muted-foreground">(variável)</span></div>
                <div className="bg-muted/30 p-2 rounded text-center"><strong className="text-cyan-400">[4]</strong> Dir. Cinematográfica <span className="text-muted-foreground">(fixo)</span></div>
                <div className="bg-muted/30 p-2 rounded text-center"><strong className="text-red-400">[5]</strong> Restrições <span className="text-muted-foreground">(obrigatório)</span></div>
              </div>
            </div>

            {/* BLOCO 1 */}
            <Collapsible open={expandedEPPBlock === 'b1'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'b1' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                  {expandedEPPBlock === 'b1' ? <ChevronDown className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-emerald-500" />}
                  <span className="text-sm font-semibold">🔹 Bloco 1 — Contexto Pedagógico</span>
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-[10px] ml-auto">VARIÁVEL</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Define o problema real da cena.</p>
                    <p className="text-xs font-medium mb-2">Formato:</p>
                    <pre className="text-[11px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap">{`Scene context: adult learner facing [PROBLEMA REAL],\nemotional tone: [EMOÇÃO SUTIL],\nmoment of reflection before taking action`}</pre>
                    <p className="text-xs font-medium mt-3 mb-1">Exemplos:</p>
                    <div className="space-y-1">
                      {['facing procrastination at the end of the day', 'overwhelmed by too many unread messages', 'stuck starting an important task', 'struggling to define a clear goal', 'feeling mental clutter before planning'].map((ex, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground font-mono">• {ex}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* BLOCO 2 */}
            <Collapsible open={expandedEPPBlock === 'b2'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'b2' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                  {expandedEPPBlock === 'b2' ? <ChevronDown className="w-4 h-4 text-blue-500" /> : <ChevronRight className="w-4 h-4 text-blue-500" />}
                  <span className="text-sm font-semibold">🔹 Bloco 2 — Personagem</span>
                  <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-[10px] ml-auto">SEMI-VARIÁVEL</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Mantém consistência com persona 38+.</p>
                    <pre className="text-[11px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap">{`Adult [gender optional] 38-48 years old,\nnatural appearance, subtle realism,\nno exaggerated expressions, focused but human`}</pre>
                    <p className="text-xs font-medium mt-3 mb-1">Variações de expressão:</p>
                    <div className="flex flex-wrap gap-2">
                      {['thoughtful expression', 'slightly tired eyes', 'calm determination', 'mild tension in posture'].map(v => (
                        <span key={v} className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded">{v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* BLOCO 3 */}
            <Collapsible open={expandedEPPBlock === 'b3'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'b3' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 hover:bg-purple-500/10 transition-colors">
                  {expandedEPPBlock === 'b3' ? <ChevronDown className="w-4 h-4 text-purple-500" /> : <ChevronRight className="w-4 h-4 text-purple-500" />}
                  <span className="text-sm font-semibold">🔹 Bloco 3 — Ação Específica</span>
                  <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-[10px] ml-auto">FUNDAMENTAL</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">⚡ O que evita banco de imagens. Sempre descreva uma <strong>micro-ação concreta</strong>.</p>
                    <pre className="text-[11px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap">{`Writing a short problem statement in a notebook,\npen touching paper mid-sentence,\nlaptop open beside with minimalist AI chat interface softly glowing,\nno readable text on screen,\nproblem-solving moment`}</pre>
                    <p className="text-xs font-medium mt-3 mb-1">Variações:</p>
                    <div className="space-y-1">
                      {['pausing before typing into AI interface', 'reviewing a handwritten sentence and underlining a word', 'closing messaging apps and opening notebook', 'looking at AI response while holding pen', 'crossing out a vague sentence and rewriting it more clearly'].map((ex, i) => (
                        <p key={i} className="text-[11px] text-muted-foreground font-mono">• {ex}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* BLOCO 4 */}
            <Collapsible open={expandedEPPBlock === 'b4'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'b4' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 hover:bg-cyan-500/10 transition-colors">
                  {expandedEPPBlock === 'b4' ? <ChevronDown className="w-4 h-4 text-cyan-500" /> : <ChevronRight className="w-4 h-4 text-cyan-500" />}
                  <span className="text-sm font-semibold">🔹 Bloco 4 — Direção Cinematográfica</span>
                  <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 text-[10px] ml-auto">PADRÃO FIXO</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">🎥 DNA visual oficial.</p>
                    <pre className="text-[11px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap">{`Warm natural side lighting from window,\nsoft shadows,\neditorial photography,\n35mm or 50mm lens,\nshallow depth of field,\nrealistic skin texture,\nsubtle film grain,\ncinematic realism,\nadult learning environment,\nminimalist desk,\nno futuristic holograms,\nnatural color grading,\nhigh detail, tactile realism`}</pre>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] mt-2" onClick={() => copyToClipboard('Warm natural side lighting from window, soft shadows, editorial photography, 35mm or 50mm lens, shallow depth of field, realistic skin texture, subtle film grain, cinematic realism, adult learning environment, minimalist desk, no futuristic holograms, natural color grading, high detail, tactile realism', 'Bloco 4')}>
                      <Copy className="w-3 h-3 mr-1" /> Copiar Bloco 4
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* BLOCO 5 */}
            <Collapsible open={expandedEPPBlock === 'b5'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'b5' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                  {expandedEPPBlock === 'b5' ? <ChevronDown className="w-4 h-4 text-red-500" /> : <ChevronRight className="w-4 h-4 text-red-500" />}
                  <span className="text-sm font-semibold">🔹 Bloco 5 — Restrições Negativas</span>
                  <Badge variant="outline" className="border-red-500/50 text-red-400 text-[10px] ml-auto">OBRIGATÓRIO</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-3">
                  <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <p className="text-xs text-muted-foreground mb-2">🚫 Sempre incluir no prompt.</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['No sci-fi', 'No neon blue glow', 'No holograms', 'No floating digital panels', 'No visible interface text', 'No corporate staged pose', 'No stock photography smile', 'No watermark'].map(neg => (
                        <div key={neg} className="text-[11px] font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded">🚫 {neg}</div>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] mt-2" onClick={() => copyToClipboard('No sci-fi. No neon blue glow. No holograms. No floating digital panels. No visible interface text. No corporate staged pose. No stock photography smile. No watermark.', 'Bloco 5')}>
                      <Copy className="w-3 h-3 mr-1" /> Copiar Bloco 5
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* PADRÃO OFICIAL — CENA COMPARAÇÃO DUAL MONITOR */}
            <Collapsible open={expandedEPPBlock === 'dual-monitor'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'dual-monitor' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                  {expandedEPPBlock === 'dual-monitor' ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronRight className="w-4 h-4 text-amber-500" />}
                  <span className="text-sm font-semibold">🖥️ Padrão Oficial — Cena "Resultado de Prompt Eficiente"</span>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px] ml-auto">FRAMEWORK VISUAL FIXO</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-4">

                  {/* Estrutura Obrigatória */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-amber-400 mb-3">📐 Estrutura Obrigatória — Toda Cena de Comparação</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                        <p className="text-xs font-semibold text-red-400 mb-2">❌ Lado Esquerdo (Genérico)</p>
                        <div className="space-y-1 text-[11px] text-muted-foreground">
                          <p>• Layout fraco / flat</p>
                          <p>• Texto sem proposta</p>
                          <p>• Sem benefício</p>
                          <p>• Sem CTA</p>
                          <p>• Sem prova social</p>
                          <p>• Cores desaturadas / baixo contraste</p>
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                        <p className="text-xs font-semibold text-emerald-400 mb-2">✅ Lado Direito (Estruturado via Método)</p>
                        <div className="space-y-1 text-[11px] text-muted-foreground">
                          <p>• Headline estratégica</p>
                          <p>• Subheadline com benefício</p>
                          <p>• Prova social (estrelas ou selo)</p>
                          <p>• Escassez OU garantia</p>
                          <p>• CTA visível ("Comprar Agora")</p>
                          <p>• Preço com ancoragem (De R$X por R$Y)</p>
                          <p>• Hierarquia clara / alto contraste</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Padrão Cinematográfico */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-cyan-400 mb-2">🎥 Padrão Cinematográfico Oficial</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">📷 Câmera frontal ortográfica</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">🔭 85mm lens simulation</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">📐 Sensor paralelo ao plano</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">🚫 Sem distorção / keystone</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">🪑 Mesa minimalista</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">☀️ Luz quente lateral (tarde)</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">🏞️ Fundo neutro bege</div>
                      <div className="bg-cyan-500/5 p-2 rounded border border-cyan-500/10">🎞️ Film grain sutil</div>
                    </div>
                  </div>

                  {/* Paleta Oficial */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-yellow-400 mb-2">🎨 Paleta Oficial</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-2 bg-zinc-800/50 rounded border border-zinc-700/50">
                        <p className="text-[11px] font-semibold text-zinc-400 mb-1">Genérico (Esquerdo)</p>
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          <span className="bg-zinc-600 text-white px-2 py-0.5 rounded">Cinza claro</span>
                          <span className="bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">Baixo contraste</span>
                          <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Layout flat</span>
                        </div>
                      </div>
                      <div className="p-2 bg-zinc-900/80 rounded border border-amber-500/30">
                        <p className="text-[11px] font-semibold text-amber-400 mb-1">Profissional (Direito)</p>
                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                          <span className="bg-zinc-950 text-white px-2 py-0.5 rounded border border-amber-500/30">Preto profundo</span>
                          <span className="bg-amber-900/50 text-amber-300 px-2 py-0.5 rounded">Dourado premium</span>
                          <span className="bg-white/10 text-white px-2 py-0.5 rounded">Alto contraste + Glow</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modelo Universal */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-xs font-semibold text-purple-400 mb-2">🧠 Modelo Universal — Template Adaptável</p>
                    <p className="text-[11px] text-muted-foreground mb-2">Substitua o produto mantendo a estrutura visual:</p>
                    <div className="flex flex-wrap gap-2">
                      {['Curso', 'SaaS', 'Consultoria', 'E-commerce', 'Landing Page', 'Email', 'Anúncio', 'Proposta Comercial'].map(item => (
                        <span key={item} className="text-[10px] font-mono bg-purple-500/10 text-purple-400 px-2 py-1 rounded">{item}</span>
                      ))}
                    </div>
                  </div>

                  {/* Upgrade Premium */}
                  <div className="p-3 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-lg border border-amber-500/20">
                    <p className="text-xs font-semibold text-amber-400 mb-2">🔥 Upgrade Premium (Nível Avançado)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-muted-foreground">
                      <div className="bg-amber-500/10 p-2 rounded">✨ Crossfade transição</div>
                      <div className="bg-amber-500/10 p-2 rounded">💰 Preço contando 1200→500</div>
                      <div className="bg-amber-500/10 p-2 rounded">🏷️ Badge com glow sutil</div>
                      <div className="bg-amber-500/10 p-2 rounded">🔘 CTA com micro pulse</div>
                    </div>
                  </div>

                  {/* Prompt Completo Copiável */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-orange-400">🎯 Prompt Completo — Dual Monitor Comparison</p>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard(`Ultra realistic cinematic frontal shot, orthographic perspective, dual monitor setup perfectly parallel to camera sensor, no perspective distortion, no keystone, 85mm lens simulation, sensor aligned flat to screen plane.

Scene: modern executive desk, warm natural side lighting (late afternoon), soft shadows, neutral beige wall background, minimal decor.

Left monitor:
Flat generic social media post mockup.
Gray placeholder layout.
Weak headline.
No branding.
No hierarchy.
No CTA.
Desaturated colors.
Minimal contrast.

Right monitor:
Premium luxury watch campaign.
Headline: "Relógio Executivo 2026"
Subheadline: "Precisão Suíça • Garantia 2 anos • Frete Expresso"
Price anchor glowing: "De R$1.200 por R$500"
Five-star rating subtly visible.
Small badge: "Últimas 12 unidades"
Refined gold typography.
Deep black background.
High contrast.
Professional layout grid.
Visible CTA button: "Comprar Agora"

A human hand in foreground pointing from left screen to right screen, sharp focus on right screen.

Cinematic depth control:
Foreground soft blur.
Right screen razor sharp.
Left screen slightly softer.
Subtle film grain.
Professional commercial photography.
No watermarks.
No random text.
Clean typography.
High-end brand aesthetic.`, 'Prompt Dual Monitor')}>
                        <Copy className="w-3 h-3 mr-1" /> Copiar Prompt
                      </Button>
                    </div>
                    <pre className="text-[10px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap max-h-[300px] overflow-y-auto">{`Ultra realistic cinematic frontal shot, orthographic perspective,
dual monitor setup perfectly parallel to camera sensor,
no perspective distortion, no keystone, 85mm lens simulation,
sensor aligned flat to screen plane.

Scene: modern executive desk, warm natural side lighting (late afternoon),
soft shadows, neutral beige wall background, minimal decor.

Left monitor:
Flat generic social media post mockup.
Gray placeholder layout. Weak headline. No branding.
No hierarchy. No CTA. Desaturated colors. Minimal contrast.

Right monitor:
Premium luxury watch campaign.
Headline: "Relógio Executivo 2026"
Subheadline: "Precisão Suíça • Garantia 2 anos • Frete Expresso"
Price anchor glowing: "De R$1.200 por R$500"
Five-star rating subtly visible.
Small badge: "Últimas 12 unidades"
Refined gold typography. Deep black background.
High contrast. Professional layout grid.
Visible CTA button: "Comprar Agora"

A human hand in foreground pointing from left screen to right screen,
sharp focus on right screen.

Cinematic depth control:
Foreground soft blur. Right screen razor sharp.
Left screen slightly softer. Subtle film grain.
Professional commercial photography.
No watermarks. No random text.
Clean typography. High-end brand aesthetic.`}</pre>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* EXEMPLOS EPP ORIGINAIS */}
            <Collapsible open={expandedEPPBlock === 'examples'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'examples' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                  {expandedEPPBlock === 'examples' ? <ChevronDown className="w-4 h-4 text-amber-500" /> : <ChevronRight className="w-4 h-4 text-amber-500" />}
                  <span className="text-sm font-semibold">🎯 Exemplos EPP Clássicos</span>
                  <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px] ml-auto">3 PROMPTS</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-4">
                  {/* Exemplo 1 — Detalhado */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-emerald-400">🎯 Exemplo 1 — EPP Detalhado</p>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard('Pedagogical problem-solving moment.\n\nAdult male around 42 years old, natural face, subtle skin imperfections, realistic hair, slightly tired but focused expression.\n\nLeaning forward at a wooden desk, writing a short personal problem statement in a notebook.\nPen touching paper mid-sentence.\nOne word lightly crossed out.\nLaptop open on the right side with a minimal AI chat interface softly glowing.\nNo readable text on screen.\nHe pauses as if thinking before typing.\n\nWarm natural daylight coming from left window.\nSoft curtain diffusion.\n50mm lens.\nShallow depth of field.\nFocus on hand and notebook.\nBackground gently blurred.\nEditorial photography style.\nSubtle cinematic film grain.\nNatural color grading.\nBalanced exposure.\nRealistic skin tones.\nHigh tactile realism.\n\nNo sci-fi.\nNo neon blue glow.\nNo holograms.\nNo floating digital panels.\nNo visible interface text.\nNo corporate staged pose.\nNo stock photography smile.\nNo watermark.', 'Exemplo 1')}>
                        <Copy className="w-3 h-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <pre className="text-[10px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap max-h-[200px] overflow-y-auto">{`Pedagogical problem-solving moment.

Adult male around 42 years old, natural face, subtle skin imperfections,
realistic hair, slightly tired but focused expression.

Leaning forward at a wooden desk, writing a short personal problem statement in a notebook.
Pen touching paper mid-sentence. One word lightly crossed out.
Laptop open on the right side with a minimal AI chat interface softly glowing.
No readable text on screen. He pauses as if thinking before typing.

Warm natural daylight coming from left window. Soft curtain diffusion.
50mm lens. Shallow depth of field. Focus on hand and notebook.
Background gently blurred. Editorial photography style.
Subtle cinematic film grain. Natural color grading.
Balanced exposure. Realistic skin tones. High tactile realism.

No sci-fi. No neon blue glow. No holograms. No floating digital panels.
No visible interface text. No corporate staged pose.
No stock photography smile. No watermark.`}</pre>
                  </div>

                  {/* Exemplo 2 — Dramático */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-red-400">🎯 Exemplo 2 — EPP Dramático</p>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard('Pedagogical tension moment before action.\n\nAdult learner around 40–45 years old.\nNatural face with subtle skin texture.\nSlight tension in jaw. Focused eyes.\nSerious but not exaggerated expression.\n\nLeaning forward over a wooden desk.\nWriting a real problem statement in a notebook.\nOne word scratched out. Pen pressing slightly harder on paper.\nLaptop open with minimal AI interface softly glowing.\nNo readable text.\n\nStrong lateral natural light from one side.\nOpposite side in soft shadow.\nHigher contrast. Dramatic but realistic. No artificial lighting.\n\n85mm lens. Shallow depth of field.\nForeground sharp. Background darker and softly blurred.\n\nCinematic tension. Quiet pressure. Serious focus.\nSubtle film grain.\n\nNo sci-fi. No neon. No corporate stock pose. No watermark.', 'Exemplo 2')}>
                        <Copy className="w-3 h-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <pre className="text-[10px] font-mono bg-background/50 p-2 rounded border border-border/30 whitespace-pre-wrap max-h-[200px] overflow-y-auto">{`Pedagogical tension moment before action.

Adult learner around 40–45 years old.
Natural face with subtle skin texture.
Slight tension in jaw. Focused eyes.
Serious but not exaggerated expression.

Leaning forward over a wooden desk.
Writing a real problem statement in a notebook.
One word scratched out. Pen pressing slightly harder on paper.
Laptop open with minimal AI interface softly glowing. No readable text.

Strong lateral natural light from one side. Opposite side in soft shadow.
Higher contrast. Dramatic but realistic. No artificial lighting.

85mm lens. Shallow depth of field.
Foreground sharp. Background darker and softly blurred.

Cinematic tension. Quiet pressure. Serious focus. Subtle film grain.

No sci-fi. No neon. No corporate stock pose. No watermark.`}</pre>
                  </div>

                  {/* Exemplo 3 — Dual Monitor (Novo) */}
                  <div className="p-3 bg-muted/30 rounded-lg border border-amber-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-amber-400">🎯 Exemplo 3 — Dual Monitor Comparison (NOVO)</p>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => copyToClipboard(`Ultra realistic cinematic frontal shot, orthographic perspective, dual monitor setup perfectly parallel to camera sensor, no perspective distortion, no keystone, 85mm lens simulation, sensor aligned flat to screen plane.\n\nScene: modern executive desk, warm natural side lighting (late afternoon), soft shadows, neutral beige wall background, minimal decor.\n\nLeft monitor:\nFlat generic social media post mockup. Gray placeholder layout. Weak headline. No branding. No hierarchy. No CTA. Desaturated colors. Minimal contrast.\n\nRight monitor:\nPremium luxury watch campaign.\nHeadline: "Relógio Executivo 2026"\nSubheadline: "Precisão Suíça • Garantia 2 anos • Frete Expresso"\nPrice anchor glowing: "De R$1.200 por R$500"\nFive-star rating subtly visible. Small badge: "Últimas 12 unidades"\nRefined gold typography. Deep black background. High contrast.\nProfessional layout grid. Visible CTA button: "Comprar Agora"\n\nA human hand in foreground pointing from left screen to right screen, sharp focus on right screen.\n\nCinematic depth control: Foreground soft blur. Right screen razor sharp. Left screen slightly softer. Subtle film grain. Professional commercial photography. No watermarks. No random text. Clean typography. High-end brand aesthetic.`, 'Exemplo 3 - Dual Monitor')}>
                        <Copy className="w-3 h-3 mr-1" /> Copiar
                      </Button>
                    </div>
                    <pre className="text-[10px] font-mono bg-background/50 p-2 rounded border border-amber-500/20 whitespace-pre-wrap max-h-[200px] overflow-y-auto">{`Ultra realistic cinematic frontal shot, orthographic perspective,
dual monitor setup perfectly parallel to camera sensor,
no perspective distortion, no keystone, 85mm lens simulation.

Scene: modern executive desk, warm natural side lighting (late afternoon),
soft shadows, neutral beige wall background, minimal decor.

Left monitor:
Flat generic social media post mockup. Gray placeholder layout.
Weak headline. No branding. No hierarchy. No CTA.

Right monitor:
Premium luxury watch campaign.
Headline: "Relógio Executivo 2026"
Subheadline: "Precisão Suíça • Garantia 2 anos • Frete Expresso"
Price anchor glowing: "De R$1.200 por R$500"
Five-star rating. Badge: "Últimas 12 unidades"
Refined gold typography. Deep black background.
CTA button: "Comprar Agora"

Human hand pointing left→right. Sharp focus on right screen.
Foreground soft blur. Subtle film grain. No watermarks.`}</pre>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* VISUAL DNA */}
            <Collapsible open={expandedEPPBlock === 'dna'} onOpenChange={(open) => setExpandedEPPBlock(open ? 'dna' : null)}>
              <CollapsibleTrigger className="w-full text-left">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20 hover:bg-violet-500/10 transition-colors">
                  {expandedEPPBlock === 'dna' ? <ChevronDown className="w-4 h-4 text-violet-500" /> : <ChevronRight className="w-4 h-4 text-violet-500" />}
                  <span className="text-sm font-semibold">🧬 Visual DNA Oficial — EPP Adulto 38+</span>
                  <Badge variant="outline" className="border-violet-500/50 text-violet-400 text-[10px] ml-auto">REFERÊNCIA</Badge>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 pl-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold text-cyan-400 mb-2">🎥 Fotografia</p>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <p>• Lente padrão: <strong className="text-foreground">50mm</strong></p>
                        <p>• Lente tensão: <strong className="text-foreground">85mm</strong></p>
                        <p>• Ação dinâmica: <strong className="text-foreground">35mm</strong></p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold text-yellow-400 mb-2">🌤 Luz</p>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <p>• Sempre <strong className="text-foreground">natural</strong> e <strong className="text-foreground">lateral</strong></p>
                        <p>• Nunca frontal dura</p>
                        <p>• Temperatura: <strong className="text-foreground">3900K–4800K</strong></p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold text-amber-400 mb-2">🎨 Paleta</p>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <p>• Tons quentes suaves • Madeira natural</p>
                        <p>• Cinza neutro • Azul apenas no brilho da tela</p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                      <p className="text-xs font-semibold text-emerald-400 mb-2">🧬 Elementos Recorrentes</p>
                      <div className="space-y-1 text-[11px] text-muted-foreground">
                        <p>• Notebook físico • Caneta real</p>
                        <p>• Laptop minimalista • Textura de pele real • Film grain</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                    <p className="text-xs font-semibold text-red-400 mb-2">🚫 Proibições Permanentes</p>
                    <div className="flex flex-wrap gap-2">
                      {['Hologramas', 'Neon', 'Interface futurista', 'Pessoas sorrindo p/ câmera', 'Fundo corporativo', 'Tela com texto legível'].map(p => (
                        <span key={p} className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded">🚫 {p}</span>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-violet-500/5 rounded-lg border border-violet-500/20">
                    <p className="text-xs font-semibold text-violet-400 mb-2">🔁 Consistência Entre Aulas</p>
                    <pre className="text-[11px] font-mono bg-background/50 p-2 rounded border border-border/30">{`globalVisualStyle: "EPP_realistic_editorial_v1"`}</pre>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] mt-2" onClick={() => copyToClipboard({ globalVisualStyle: 'EPP_realistic_editorial_v1' }, 'globalVisualStyle')}>
                      <Copy className="w-3 h-3 mr-1" /> Copiar
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

          </CardContent>
        </Card>

        {/* CONTRATOS ATIVOS — LINK */}
        <Card className="border-2 border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-colors cursor-pointer" onClick={() => navigate('/admin/contracts')}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-5 h-5 text-emerald-500" />
              Contratos Ativos C01–C12
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-[10px] ml-auto">12 contratos</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Regras do pipeline e runtime — C01 (Reprocess) até C12 (Image Lab) + BoundaryFixGuard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full border-emerald-500/50 hover:bg-emerald-500/10"
              onClick={(e) => { e.stopPropagation(); navigate('/admin/contracts'); }}
            >
              <Shield className="w-4 h-4 mr-2" /> Ver Contratos Ativos
            </Button>
          </CardContent>
        </Card>

        {/* AUDIT GATE */}
        <Card className="border border-border/50 bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Audit Gate Protocol</p>
                <p className="text-xs text-muted-foreground font-mono mb-2">
                  Force Test → 12 runs → audit-contracts(batch_id) → HTTP 200 = PASS / HTTP 422 = BLOCKED
                </p>
                <p className="text-xs text-muted-foreground">
                  O audit gate valida: C01 (no duplicates), EXEC_STATE (0 stuck, canonical JSON), C05 (hash), C06 (triggerContract), 
                  BOUNDARY_FIX (duration &gt; 0, monotonic), C10/C10B (pause dentro de 1.5s), CONTRACT_META (version match).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LINKS RÁPIDOS */}
        <div className="grid gap-3 md:grid-cols-2">
          <Button
            variant="outline"
            className="w-full border-blue-500/50 hover:bg-blue-500/10"
            onClick={() => navigate('/admin/v7/docs')}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Documentação V7-vv
          </Button>
          <Button
            variant="outline"
            className="w-full border-orange-500/50 hover:bg-orange-500/10"
            onClick={() => navigate('/admin/c10-report')}
          >
            <Database className="w-4 h-4 mr-2" /> C10 Report (Forensic)
          </Button>
        </div>
      </div>
    </div>
  );
}
