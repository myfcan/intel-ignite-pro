/**
 * AdminMicroVisualSandbox — Preview interativo dos 13 tipos de micro-visuais
 *
 * Permite testar cada tipo visualmente sem abrir uma aula completa.
 * Organizado em cards por tipo, com controles de configuração inline.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Layers, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import V7MicroVisualOverlay from '@/components/lessons/v7/visuals/V7MicroVisualOverlay';
import type { V7MicroVisual } from '@/types/V7Contract';

// ============================================================================
// PRESET DEFINITIONS — Um exemplo rico para cada tipo
// ============================================================================

interface VisualPreset {
  type: V7MicroVisual['type'];
  label: string;
  description: string;
  color: string;        // badge/card accent color (tailwind class fragment)
  isNew?: boolean;
  content: V7MicroVisual['content'];
}

const PRESETS: VisualPreset[] = [
  /* ---------- NOVOS ---------- */
  {
    type: 'stat',
    label: 'stat',
    description: 'Métrica de impacto com count-up e label',
    color: 'emerald',
    isNew: true,
    content: { from: 0, to: 50000, prefix: 'R$ ', suffix: '/mês', label: 'Renda Mensal com IA', color: '#10B981' },
  },
  {
    type: 'step',
    label: 'step',
    description: 'Passo numerado sequencial com borda timeline',
    color: 'cyan',
    isNew: true,
    content: { stepNumber: 1, text: 'Defina o output que você quer gerar com IA', color: '#22D3EE' },
  },
  {
    type: 'quote',
    label: 'quote',
    description: 'Citação editorial com typewriter stagger',
    color: 'indigo',
    isNew: true,
    content: { quote: 'Quem domina prompts, domina o futuro do trabalho.', author: 'AIliv', color: '#818CF8' },
  },
  {
    type: 'pill-tag',
    label: 'pill-tag',
    description: 'Tag/etiqueta contextual com dot pulsante',
    color: 'sky',
    isNew: true,
    content: { tag: 'Prompt Engineering', color: '#38BDF8', dot: true },
  },
  {
    type: 'comparison-bar',
    label: 'comparison-bar',
    description: 'Barras de comparação antes/depois animadas',
    color: 'rose',
    isNew: true,
    content: {
      leftLabel: 'Amador', leftValue: 22, leftColor: '#EF4444',
      rightLabel: 'Com IA', rightValue: 87, rightColor: '#10B981',
    },
  },
  {
    type: 'alert',
    label: 'alert',
    description: 'Alerta urgente com shake físico e glow vermelho',
    color: 'red',
    isNew: true,
    content: { icon: '⚠️', text: 'Evite usar IA sem revisar o output — erros custam caro!' },
  },
  /* ---------- LETTER-REVEAL (fixed) ---------- */
  {
    type: 'letter-reveal',
    label: 'letter-reveal',
    description: 'Letra de acrônimo com flip 3D rotateY (FIXED)',
    color: 'violet',
    content: { index: 0, text: 'A', color: '#A78BFA' },
  },
  /* ---------- EXISTENTES ---------- */
  {
    type: 'text-pop',
    label: 'text-pop',
    description: 'Texto com spring bounce e emoji opcional',
    color: 'yellow',
    content: { text: 'Renda Extra Real!', emoji: '🚀', color: '#FBBF24' },
  },
  {
    type: 'number-count',
    label: 'number-count',
    description: 'Contador animado com prefixo/sufixo',
    color: 'teal',
    content: { from: 0, to: 98, suffix: '%', color: '#2DD4BF' },
  },
  {
    type: 'text-highlight',
    label: 'text-highlight',
    description: 'Destaque amarelo com glow pulsante',
    color: 'amber',
    content: { highlight: 'Inteligência Artificial' },
  },
  {
    type: 'highlight',
    label: 'highlight',
    description: 'Ponto colorido com pulse/shake/glow',
    color: 'cyan',
    content: { pulse: true, color: '#22D3EE' },
  },
  {
    type: 'card-reveal',
    label: 'card-reveal',
    description: 'Card glassmorphism com slide-up',
    color: 'blue',
    content: { cardId: 'Conceito: Engenharia de Prompts' },
  },
  {
    type: 'image-flash',
    label: 'image-flash',
    description: 'Imagem com flash de brilho na entrada',
    color: 'purple',
    content: {
      imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
      description: 'IA Generativa',
    },
  },
];

// ============================================================================
// STAGE — área de preview preta cinematográfica
// ============================================================================

function Stage({ active, onReset }: { active: V7MicroVisual | null; onReset: () => void }) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Label */}
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs text-white/30 font-mono tracking-widest uppercase">
          stage · micro-visual preview
        </span>
      </div>

      {/* Reset button */}
      {active && (
        <button
          onClick={onReset}
          className="absolute top-4 right-4 z-10 text-white/40 hover:text-white/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}

      {/* Empty state */}
      {!active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
          <Layers className="w-10 h-10" />
          <p className="text-sm font-medium">Clique em "Testar" para visualizar</p>
        </div>
      )}

      {/* Overlay */}
      {active && (
        <V7MicroVisualOverlay microVisuals={[active]} />
      )}
    </div>
  );
}

// ============================================================================
// PRESET CARD
// ============================================================================

const colorMap: Record<string, string> = {
  emerald: 'border-emerald-500/40 bg-emerald-500/5',
  cyan:    'border-cyan-500/40 bg-cyan-500/5',
  indigo:  'border-indigo-500/40 bg-indigo-500/5',
  sky:     'border-sky-500/40 bg-sky-500/5',
  rose:    'border-rose-500/40 bg-rose-500/5',
  red:     'border-red-500/40 bg-red-500/5',
  violet:  'border-violet-500/40 bg-violet-500/5',
  yellow:  'border-yellow-500/40 bg-yellow-500/5',
  teal:    'border-teal-500/40 bg-teal-500/5',
  amber:   'border-amber-500/40 bg-amber-500/5',
  blue:    'border-blue-500/40 bg-blue-500/5',
  purple:  'border-purple-500/40 bg-purple-500/5',
  pink:    'border-pink-500/40 bg-pink-500/5',
};

const badgeColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cyan:    'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  indigo:  'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  sky:     'bg-sky-500/20 text-sky-400 border-sky-500/30',
  rose:    'bg-rose-500/20 text-rose-400 border-rose-500/30',
  red:     'bg-red-500/20 text-red-400 border-red-500/30',
  violet:  'bg-violet-500/20 text-violet-400 border-violet-500/30',
  yellow:  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  teal:    'bg-teal-500/20 text-teal-400 border-teal-500/30',
  amber:   'bg-amber-500/20 text-amber-400 border-amber-500/30',
  blue:    'bg-blue-500/20 text-blue-400 border-blue-500/30',
  purple:  'bg-purple-500/20 text-purple-400 border-purple-500/30',
  pink:    'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

function PresetCard({
  preset,
  isActive,
  onTest,
}: {
  preset: VisualPreset;
  isActive: boolean;
  onTest: () => void;
}) {
  const borderBg = colorMap[preset.color] || colorMap.blue;
  const badge = badgeColorMap[preset.color] || badgeColorMap.blue;

  return (
    <motion.div
      layout
      className={`relative rounded-xl border-2 p-4 transition-all cursor-pointer ${borderBg} ${
        isActive ? 'ring-2 ring-white/30 shadow-lg shadow-white/5' : 'hover:brightness-110'
      }`}
      onClick={onTest}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active glow */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)' }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${badge}`}>
            {preset.label}
          </span>
          {preset.isNew && (
            <span className="text-xs bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1.5 py-0.5 rounded font-semibold">
              NEW
            </span>
          )}
          {isActive && (
            <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">
              ativo
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant={isActive ? 'default' : 'outline'}
          className="h-7 text-xs shrink-0"
          onClick={(e) => { e.stopPropagation(); onTest(); }}
        >
          <Play className="w-3 h-3 mr-1" />
          Testar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {preset.description}
      </p>
    </motion.div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminMicroVisualSandbox() {
  const navigate = useNavigate();
  const [activePreset, setActivePreset] = useState<VisualPreset | null>(null);
  const [playKey, setPlayKey] = useState(0);

  const newCount = PRESETS.filter(p => p.isNew).length;

  function handleTest(preset: VisualPreset) {
    // Force remount to replay animation
    setActivePreset(null);
    setTimeout(() => {
      setActivePreset(preset);
      setPlayKey(k => k + 1);
    }, 80);
  }

  const activeMicroVisual: V7MicroVisual | null = activePreset
    ? {
        id: `sandbox-${playKey}`,
        type: activePreset.type,
        anchorText: 'sandbox',
        duration: 4000,
        content: activePreset.content,
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight">Micro Visual Sandbox</h1>
              <span className="flex items-center gap-1.5 text-sm bg-pink-500/15 text-pink-400 border border-pink-500/30 px-3 py-1 rounded-full font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                {newCount} novos tipos
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Preview interativo dos {PRESETS.length} tipos de micro-visuais — clique em "Testar" para visualizar qualquer tipo no stage cinematográfico
            </p>
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-medium">
            {PRESETS.length} tipos totais
          </span>
          <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1.5 rounded-full font-medium">
            {newCount} novos (stat, step, quote, pill-tag, comparison-bar, alert)
          </span>
          <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-full font-medium">
            1 fix (letter-reveal 3D flip)
          </span>
          <span className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full font-medium">
            Framer Motion · Spring Physics
          </span>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Stage */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stage Cinematográfico</h2>
            <Stage
              active={activeMicroVisual}
              onReset={() => setActivePreset(null)}
            />

            {/* Active info */}
            <AnimatePresence mode="wait">
              {activePreset && (
                <motion.div
                  key={activePreset.type}
                  className="rounded-xl border border-border/50 bg-muted/30 p-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">Content JSON</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${badgeColorMap[activePreset.color] || badgeColorMap.blue}`}>
                      type: "{activePreset.type}"
                    </span>
                  </div>
                  <pre className="text-xs text-muted-foreground overflow-auto font-mono leading-relaxed">
                    {JSON.stringify(activePreset.content, null, 2)}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Preset list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tipos Disponíveis</h2>
            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {/* New types first */}
              <p className="text-xs text-muted-foreground font-medium px-1 pt-1">✨ Novos</p>
              {PRESETS.filter(p => p.isNew).map(preset => (
                <PresetCard
                  key={preset.type}
                  preset={preset}
                  isActive={activePreset?.type === preset.type}
                  onTest={() => handleTest(preset)}
                />
              ))}

              <p className="text-xs text-muted-foreground font-medium px-1 pt-3">🔧 Fix & Existentes</p>
              {PRESETS.filter(p => !p.isNew).map(preset => (
                <PresetCard
                  key={preset.type}
                  preset={preset}
                  isActive={activePreset?.type === preset.type}
                  onTest={() => handleTest(preset)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer quick tips */}
        <Card className="border-border/40 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Como usar no JSON da aula</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground font-mono overflow-auto leading-relaxed">
{`// Exemplo: micro-visual tipo "stat" em uma cena
{
  "microVisuals": [
    {
      "id": "mv-renda-01",
      "type": "stat",
      "anchorText": "cinquenta mil",
      "duration": 3500,
      "content": {
        "from": 0,
        "to": 50000,
        "prefix": "R$ ",
        "suffix": "/mês",
        "label": "Renda Mensal com IA",
        "color": "#10B981"
      }
    }
  ]
}`}
            </pre>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
