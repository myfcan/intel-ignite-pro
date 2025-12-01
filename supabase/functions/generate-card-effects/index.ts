import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CardSpecification {
  sectionIndex: number;
  cardIndex: number;
  cardType: string;
  anchorText: string;
  title: string;
  subtitle: string;
  icon?: string;
  colorScheme?: string;
  effectDescription?: string;
  chapters?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cards } = await req.json() as { cards: CardSpecification[] };
    
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      throw new Error('Cards array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`🎨 Generating ${cards.length} card effect(s)...`);

    const generatedCards = [];

    for (const card of cards) {
      console.log(`  → Generating ${card.cardType} (Section ${card.sectionIndex}, Card ${card.cardIndex})`);
      
      const prompt = `Você é um especialista em React, TypeScript e Framer Motion. Crie um componente React COMPLETO e FUNCIONAL baseado nestas especificações:

**Card Type:** ${card.cardType}
**Título:** ${card.title}
**Subtítulo:** ${card.subtitle}
**Ícone:** ${card.icon || 'nenhum'}
**Cor/Tema:** ${card.colorScheme || 'usar design system HSL tokens'}
**Descrição do Efeito Visual:** ${card.effectDescription || 'animação padrão suave'}
${card.chapters && card.chapters.length > 0 ? `**Capítulos/Páginas (conteúdo sequencial):**\n${card.chapters.map((c, i) => `${i + 1}. ${c}`).join('\n')}` : '**Sem capítulos internos** (animação única)'}

**REQUISITOS CRÍTICOS:**
1. Componente React completo com todos imports necessários
2. TypeScript com tipagem correta
3. Framer Motion para TODAS animações (motion.div, animate, transition)
4. Design system: usar tokens HSL do Tailwind (hsl(var(--primary)), hsl(var(--foreground)), etc.) - NUNCA cores hardcoded
5. Props: interface com onComplete?: () => void
6. Animações suaves, elegantes, não agressivas
7. Responsivo (mobile-friendly)
8. Nome do componente: ${card.cardType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}Card
9. Ícones Lucide React quando necessário (import { IconName } from "lucide-react")
10. Se tiver capítulos: implemente transições automáticas entre eles (useEffect + setInterval)

**FORMATO DE RESPOSTA:**
Retorne APENAS o código TypeScript/React completo, SEM markdown, SEM explicações. Comece direto com "import" e termine com "export".

**EXEMPLO DE ESTRUTURA:**
\`\`\`tsx
import { motion } from "framer-motion";
import { IconName } from "lucide-react";
import { useState, useEffect } from "react";

interface MyCardProps {
  onComplete?: () => void;
}

export const MyCard = ({ onComplete }: MyCardProps) => {
  // estado, lógica, timers
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-background to-primary/5"
    >
      {/* conteúdo do card com animações */}
    </motion.div>
  );
};
\`\`\`

Gere o componente agora:`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "Você é um expert em criar componentes React visuais com Framer Motion. Retorne APENAS código, sem explicações." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`❌ AI error for ${card.cardType}:`, aiResponse.status, errorText);
        throw new Error(`AI generation failed: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      let generatedCode = aiData.choices?.[0]?.message?.content || "";

      // Limpar markdown se vier envolvido
      generatedCode = generatedCode.replace(/```tsx?\n?/g, '').replace(/```\n?$/g, '').trim();

      console.log(`  ✅ ${card.cardType} generated (${generatedCode.length} chars)`);

      generatedCards.push({
        ...card,
        componentCode: generatedCode,
        componentName: card.cardType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') + 'Card'
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        cards: generatedCards,
        message: `${generatedCards.length} card effect(s) gerado(s) com sucesso!`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Error generating card effects:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to generate card effects" 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
