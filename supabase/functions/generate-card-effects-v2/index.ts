import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CardToGenerate {
  cardType: string;
  title: string;
  subtitle: string;
  sectionIndex: number;
  cardIndex: number;
}

// Template base para cada componente de card effect
const generateCardEffectCode = (cardType: string, title: string, subtitle: string): string => {
  const componentName = cardType
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  return `import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ${getIconsForCard(cardType)} } from 'lucide-react';

interface CardEffectProps {
  isActive?: boolean;
  duration?: number;
}

export const CardEffect${componentName}: React.FC<CardEffectProps> = ({ isActive = false, duration = 15 }) => {
  const [scene, setScene] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  
  // Scale baseado na duração
  const scale = useMemo(() => duration / 15, [duration]);
  
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };
  
  const startAnimation = () => {
    clearTimers();
    setScene(0);
    
    // Timeline de cenas (5 cenas, 3s cada = 15s base)
    const sceneTimes = [0, 3, 6, 9, 12].map(t => t * scale * 1000);
    
    sceneTimes.forEach((time, idx) => {
      timersRef.current.push(setTimeout(() => setScene(idx + 1), time));
    });
    
    // Reiniciar após término (loop 2x)
    timersRef.current.push(setTimeout(() => {
      setScene(0);
      setTimeout(startAnimation, 500);
    }, 15 * scale * 1000));
  };
  
  useEffect(() => {
    if (isActive) {
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
    }
    return clearTimers;
  }, [isActive, scale]);
  
  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950">
      {/* Background effects */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
        <AnimatePresence mode="wait">
          {scene >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-8"
            >
              <motion.div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">${title}</h2>
              <p className="text-purple-200">${subtitle}</p>
            </motion.div>
          )}
          
          {scene >= 2 && (
            <motion.div
              key="content1"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-medium">Transformação em ação</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2 * scale, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}
          
          {scene >= 3 && (
            <motion.div
              key="content2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4 mb-6"
            >
              {['Ideia', 'Ação', 'Resultado'].map((step, idx) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-2 shadow-lg">
                    <span className="text-white font-bold">{idx + 1}</span>
                  </div>
                  <span className="text-white text-sm">{step}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {scene >= 4 && (
            <motion.div
              key="highlight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl px-8 py-4 shadow-xl shadow-purple-500/30"
            >
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" />
                <span className="text-white font-semibold text-lg">O poder está em suas mãos</span>
              </div>
            </motion.div>
          )}
          
          {scene >= 5 && (
            <motion.div
              key="badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="mt-6"
            >
              <div className="flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/40 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Conceito dominado!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((s) => (
          <motion.div
            key={s}
            className={\`w-2.5 h-2.5 rounded-full \${scene >= s ? 'bg-purple-400' : 'bg-white/30'}\`}
            animate={{ scale: scene === s ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: scene === s ? Infinity : 0 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffect${componentName};
`;
};

// Determina quais ícones usar baseado no tipo de card
const getIconsForCard = (cardType: string): string => {
  const iconSets: Record<string, string> = {
    'hype': 'Sparkles, Zap, Star, CheckCircle',
    'game': 'Gamepad2, Sparkles, Star, CheckCircle',
    'trend': 'TrendingUp, Sparkles, Star, CheckCircle',
    'pattern': 'Layers, Sparkles, Star, CheckCircle',
    'data': 'Database, Sparkles, Zap, CheckCircle',
    'machine': 'Cpu, Sparkles, Star, CheckCircle',
    'everyday': 'Calendar, Sparkles, Star, CheckCircle',
    'recommendation': 'ThumbsUp, Sparkles, Star, CheckCircle',
    'strategic': 'Target, Sparkles, Star, CheckCircle',
    'genai': 'Brain, Sparkles, Star, CheckCircle',
    'media': 'Image, Sparkles, Star, CheckCircle',
    'recombination': 'Shuffle, Sparkles, Star, CheckCircle',
    'strength': 'Zap, Sparkles, Star, CheckCircle',
    'weakness': 'AlertTriangle, Sparkles, Star, CheckCircle',
    'human': 'User, Sparkles, Star, CheckCircle',
    'default': 'Sparkles, Zap, Star, CheckCircle'
  };
  
  for (const [key, icons] of Object.entries(iconSets)) {
    if (cardType.includes(key)) return icons;
  }
  return iconSets.default;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cards, lessonTitle } = await req.json() as { 
      cards: CardToGenerate[];
      lessonTitle: string;
    };

    if (!cards || cards.length === 0) {
      throw new Error('Nenhum card para gerar');
    }

    console.log(`📦 Gerando ${cards.length} card effects para: ${lessonTitle}`);

    const generatedComponents: { cardType: string; code: string; componentName: string }[] = [];

    for (const card of cards) {
      const code = generateCardEffectCode(card.cardType, card.title, card.subtitle);
      const componentName = 'CardEffect' + card.cardType
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      
      generatedComponents.push({
        cardType: card.cardType,
        code,
        componentName
      });
      
      console.log(`✅ Gerado: ${componentName}`);
    }

    // Gerar código para adicionar ao index.tsx
    const indexAdditions = {
      imports: generatedComponents.map(c => 
        `import { ${c.componentName} } from './${c.componentName}';`
      ).join('\n'),
      exports: generatedComponents.map(c => 
        `export { ${c.componentName} } from './${c.componentName}';`
      ).join('\n'),
      types: generatedComponents.map(c => `'${c.cardType}'`).join(' | '),
      mappings: generatedComponents.map(c => 
        `  '${c.cardType}': ${c.componentName},`
      ).join('\n'),
      labels: generatedComponents.map(c => 
        `  '${c.cardType}': '${cards.find(card => card.cardType === c.cardType)?.title || c.cardType}',`
      ).join('\n')
    };

    return new Response(
      JSON.stringify({
        success: true,
        generatedCount: generatedComponents.length,
        components: generatedComponents,
        indexAdditions,
        message: `${generatedComponents.length} componentes gerados com sucesso!`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
