import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  V7ImmersivePlayer,
  V7ActDramatic,
  V7ActComparison,
  V7ActInteraction,
  V7ActResult,
  V7ActPlayground
} from "@/components/lessons/v7/cinematic";
import { toast } from "sonner";

const V7CinematicDemo = () => {
  const navigate = useNavigate();

  // Interaction handlers
  const handleQuizReveal = useCallback((selectedIds: string[]) => {
    console.log("Selected options:", selectedIds);
    // The act will auto-advance via parent
  }, []);

  const handleGenerateAmateur = useCallback((prompt: string) => {
    return {
      text: `
        <strong>Resposta Genérica da IA:</strong><br><br>
        "Olá! Aqui estão algumas ideias de posts para sua loja:<br>
        1. Promoção imperdível! 🛍️<br>
        2. Novidades chegaram! ✨<br>
        3. Compre agora! 💳<br>
        4. Produtos em destaque 🌟<br>
        5. Não perca! ⏰"<br><br>
        <em style="color: #ff6b6b;">❌ Genérico, sem personalidade, sem valor</em>
      `,
      scoreLabel: "Valor Comercial:",
      scoreValue: 0,
      maxScore: 500,
      isHighScore: false
    };
  }, []);

  const handleGeneratePro = useCallback((prompt: string) => {
    return {
      text: `
        <strong>Resposta Profissional da IA:</strong><br><br>
        "✨ <strong>O Pretinho Básico Reimaginado</strong><br>
        Aquele vestido que transita do board meeting para o happy hour sem pedir licença.<br><br>
        
        🌙 <strong>After Dark Collection</strong><br>
        Quando o sol se põe, sua personalidade brilha. Peças que conversam com a lua.<br><br>
        
        💼 <strong>Power Dressing 2.0</strong><br>
        Esqueça o terninho óbvio. O novo poder veste seda e sussurra confiança.<br><br>
        
        <em style="color: #4ecdc4;">✅ Sofisticado, vendedor, pronto para usar</em>
      `,
      scoreLabel: "Valor Comercial:",
      scoreValue: 500,
      maxScore: 500,
      isHighScore: true
    };
  }, []);

  const handleComplete = useCallback(() => {
    toast.success("🎬 Experiência V7 Cinematic concluída!");
  }, []);

  // Define all 5 acts
  const acts = [
    {
      id: "act-1-dramatic",
      type: "dramatic" as const,
      autoAdvanceMs: 4000,
      content: (
        <V7ActDramatic
          mainValue="98%"
          subtitle="das pessoas usam IA como BRINQUEDO"
          highlightWord="BRINQUEDO"
        />
      )
    },
    {
      id: "act-2-comparison",
      type: "comparison" as const,
      autoAdvanceMs: 6000,
      content: (
        <V7ActComparison
          title="Enquanto isso..."
          leftCard={{
            label: "OS 98% BRINCANDO",
            value: "R$ 0",
            isPositive: false,
            details: [
              "😂 \"Conta uma piada\"",
              "🎮 \"Faz um poema\"",
              "💭 Curiosidade",
              "😴 8 horas/dia trabalhando",
              "🐌 Mesmos resultados sempre"
            ]
          }}
          rightCard={{
            label: "OS 2% QUE DOMINAM",
            value: "R$ 30.000",
            isPositive: true,
            details: [
              "💰 Renda extra mensal",
              "⏰ 2 horas/dia de trabalho",
              "🚀 10x produtividade",
              "📈 Crescimento exponencial",
              "🎯 Resultados reais"
            ]
          }}
        />
      )
    },
    {
      id: "act-3-interaction",
      type: "interaction" as const,
      content: (
        <V7ActInteraction
          title="⚡ TESTE RELÂMPAGO"
          subtitle="Suas últimas 5 interações com IA foram para:"
          options={[
            { id: "work", text: "Resolver um problema real de trabalho" },
            { id: "automate", text: "Automatizar uma tarefa repetitiva" },
            { id: "content", text: "Criar conteúdo para ganhar dinheiro" },
            { id: "time", text: "Economizar tempo significativo" },
            { id: "curiosity", text: "Curiosidade / Teste / Brincadeira", isDefault: true }
          ]}
          buttonText="REVELAR MEU RESULTADO"
          onReveal={handleQuizReveal}
        />
      )
    },
    {
      id: "act-4-result",
      type: "result" as const,
      content: (
        <V7ActResult
          emoji="😱"
          title="VOCÊ ESTÁ NO GRUPO 98%"
          message={`
            Você está literalmente <strong>perdendo R$ 2.000 por mês</strong> 
            por não saber usar IA estrategicamente.<br><br>
            Mas calma... <strong>isso muda HOJE.</strong>
          `}
          metrics={[
            { label: "Potencial Desperdiçado", value: "R$ 2.000" },
            { label: "Tempo para Mudar", value: "AGORA" },
            { label: "Seu Nível Atual", value: "😴" },
            { label: "Potencial Real", value: "🚀" }
          ]}
        />
      )
    },
    {
      id: "act-5-playground",
      type: "playground" as const,
      content: (
        <V7ActPlayground
          title="🎮 DESAFIO: R$ 0 vs R$ 500"
          leftSide={{
            label: "❌ MODO AMADOR",
            placeholder: `Digite como você normalmente pediria...\n\nExemplo: 'me ajuda com posts para loja'`
          }}
          rightSide={{
            label: "✅ MODO PROFISSIONAL",
            placeholder: `Use o Método PERFEITO...\n\nP - PAPEL: Atue como especialista em moda feminina\nE - ESPECIFICIDADE: Crie 5 posts para Instagram\nR - REFERÊNCIA: Loja de roupas, público 25-40 anos\nF - FORMATO: Lista com emoji + título + texto\nE - EXEMPLO: Tom Vogue Brasil\nI - INTENÇÃO: Vender coleção nova\nT - TOM: Sofisticado mas acessível\nO - OBSTÁCULOS: Evitar clichês`,
            isPro: true
          }}
          onGenerateLeft={handleGenerateAmateur}
          onGenerateRight={handleGeneratePro}
        />
      )
    }
  ];

  return (
    <V7ImmersivePlayer
      acts={acts}
      totalDuration="8:00"
      onComplete={handleComplete}
    />
  );
};

export default V7CinematicDemo;
