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
  ChevronRight
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
// MICRO VISUAL TYPES (7 canônicos)
// ============================================================================

const MICRO_VISUAL_TYPES = [
  { 
    input: 'image', 
    output: 'image-flash', 
    desc: 'Flash de imagem — exibe uma imagem com efeito de entrada',
    rules: ['Requer anchorText com keyword no narration', 'Máx 1 por frase'],
    example: {
      microVisuals: [{ type: "image", anchorText: "Midjourney", content: { src: "/images/midjourney.png", alt: "Logo Midjourney" } }]
    }
  },
  { 
    input: 'text', 
    output: 'text-pop', 
    desc: 'Pop de texto — destaca uma frase ou conceito chave',
    rules: ['anchorText obrigatório', 'Texto curto (máx 50 chars)', 'Máx 1 por frase'],
    example: {
      microVisuals: [{ type: "text", anchorText: "inteligência", content: { text: "Inteligência Artificial", style: "highlight" } }]
    }
  },
  { 
    input: 'number', 
    output: 'number-count', 
    desc: 'Contador numérico — anima um número com contagem progressiva',
    rules: ['anchorText obrigatório', 'Número deve ser string', 'Máx 1 por frase'],
    example: {
      microVisuals: [{ type: "number", anchorText: "bilhões", content: { number: "3.5", suffix: "bilhões", subtitle: "de usuários de IA" } }]
    }
  },
  { 
    input: 'badge', 
    output: 'card-reveal', 
    desc: 'Card/badge — revela um card com informação contextual',
    rules: ['anchorText obrigatório', 'Máx 1 por frase'],
    example: {
      microVisuals: [{ type: "badge", anchorText: "certificado", content: { title: "Certificado IA", subtitle: "Nível Profissional" } }]
    }
  },
  { 
    input: 'highlight', 
    output: 'highlight', 
    desc: 'Destaque visual — passthrough, mantém tipo no output',
    rules: ['anchorText obrigatório', 'Máx 1 por frase'],
    example: {
      microVisuals: [{ type: "highlight", anchorText: "importante", content: { text: "Este conceito é fundamental", color: "cyan" } }]
    }
  },
  { 
    input: 'letter-reveal', 
    output: 'letter-reveal', 
    desc: 'Revelação letra a letra — passthrough, ideal para método/acrônimo',
    rules: ['anchorText obrigatório', 'Usado para revelar método passo a passo', 'Máx 1 por frase'],
    example: {
      microVisuals: [{ type: "letter-reveal", anchorText: "método", content: { letters: ["P","R","O","M","P","T"], meanings: ["Preciso","Relevante","Objetivo","Mensurável","Prático","Testável"] } }]
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
  const [expandedMV, setExpandedMV] = useState<string | null>(null);
  const [expandedScene, setExpandedScene] = useState<string | null>(null);

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
              Guia de Modelos V7
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Templates JSON, tipos canônicos e documentação técnica
            </p>
          </div>
        </div>

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
              <p>✅ Método PERFEITO com letter-reveal (7 tipos canônicos de microVisual)</p>
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

        {/* MICRO VISUAL TYPES — EXPANDIDO */}
        <Card className="border-2 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-6 h-6 text-amber-500" />
              MicroVisual Types (7 canônicos)
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">APENAS ESTES</Badge>
            </CardTitle>
            <CardDescription>
              Tipos visuais permitidos no JSON. Qualquer outro tipo será rejeitado pelo pipeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {/* INTERACTIVE SCENE TYPES — EXPANDIDO */}
        <Card className="border-2 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="w-6 h-6 text-purple-500" />
              Interactive Scene Types
              <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-[10px]">4 TIPOS</Badge>
            </CardTitle>
            <CardDescription>
              Tipos de cena que controlam pausa de áudio e interatividade. Apenas 3 exigem pauseAt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
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
          </CardContent>
        </Card>

        {/* VISUAL EFFECTS */}
        <Card className="border-2 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-6 h-6 text-cyan-500" />
              Visual Effects
            </CardTitle>
            <CardDescription>
              Efeitos visuais aplicáveis às cenas para criar atmosfera cinematográfica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {VISUAL_EFFECTS.map(vf => (
                <div key={vf.name} className="flex items-start gap-3">
                  <span className="text-sm font-mono text-cyan-500 font-bold min-w-[80px]">{vf.name}</span>
                  <div>
                    <p className="text-xs text-muted-foreground">{vf.desc}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vf.values.map(v => (
                        <span key={v} className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
