import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

console.log("🔥🔥🔥 ARQUIVO IaBookExperienceCard.tsx FOI CARREGADO 🔥🔥🔥");

const chapters = [
  "1. O Que É Inteligência Artificial",
  "2. Primeiros Passos com ChatGPT",
  "3. Criando Conteúdo de Valor",
  "4. Automatizando Tarefas Diárias"
];

const titleLines = ["Seu Primeiro Livro", "com Inteligência", "Artificial"];

export function IaBookExperienceCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    console.log("🎬 IaBookExperienceCard MONTADO - Iniciando animações");
    setMounted(true);
  }, []);

  // Força remount quando a página carrega
  if (!mounted) {
    return <div className="w-full h-[600px] bg-muted animate-pulse" />;
  }

  return (
    <motion.div
      className="w-full max-w-6xl mx-auto perspective-[2000px]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="relative grid md:grid-cols-2 gap-0 items-stretch shadow-2xl rounded-2xl" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* LEFT: Book Cover - Fixa */}
        <motion.div
          className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-l-2xl p-12 flex flex-col justify-center items-center overflow-hidden min-h-[600px] z-10"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        >
          {/* SCENE 6: Subtle glow pulse */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatDelay: 8,
              ease: "easeInOut"
            }}
          />

          <div className="relative z-10 text-center space-y-8">
            {/* SCENE 3: Badge (1.6s) */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.4 }}
              onAnimationStart={() => console.log("🏷️ Animação do BADGE iniciou")}
            >
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">I.A. BOOK</span>
            </motion.div>

            {/* SCENE 3: Title lines (1.6s - 3.0s) */}
            <div className="space-y-3">
              {titleLines.map((line, index) => (
                <motion.h2
                  key={index}
                  className="text-4xl md:text-5xl font-bold text-primary-foreground"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 1.6 + (index * 0.24), 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  onAnimationStart={() => console.log(`📝 Animação TÍTULO linha ${index + 1} iniciou`)}
                >
                  {line}
                </motion.h2>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Página que ABRE como livro de verdade */}
        <motion.div
          className="bg-card rounded-r-2xl p-10 relative min-h-[600px] origin-left"
          style={{ 
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden'
          }}
          initial={{ 
            rotateY: -90,
            opacity: 0,
            transformOrigin: 'left center'
          }}
          animate={{ 
            rotateY: 0,
            opacity: 1
          }}
          transition={{ 
            delay: 1.5,
            duration: 2.0,
            ease: [0.16, 1, 0.3, 1]
          }}
          onAnimationStart={() => console.log("📖 PÁGINA ABRINDO - Virando da lombada!")}
          onAnimationComplete={() => console.log("✅ Página aberta completamente")}
        >
          {/* Sombra da lombada */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/20 to-transparent pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
          />
          
          <div className="space-y-6 relative">
            
            {/* Status badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.8, duration: 0.6 }}
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-primary">Resposta da I.A.</span>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4.2, duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Estrutura do Livro
              </h3>
              <p className="text-sm text-muted-foreground">
                Índice gerado automaticamente
              </p>
            </motion.div>

            {/* Chapters list */}
            <div className="space-y-4 pt-2">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 4.8 + (index * 0.3), 
                    duration: 0.6, 
                    ease: "easeOut" 
                  }}
                  onAnimationStart={() => console.log(`📋 Capítulo ${index + 1} animando`)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  <p className="text-base font-medium text-foreground leading-relaxed pt-1">
                    {chapter}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Final note */}
            <motion.p
              className="text-sm text-muted-foreground italic text-center pt-6 border-t-2 border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 6.2, duration: 0.8 }}
            >
              ✨ Estrutura criada em segundos pela I.A.
            </motion.p>
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}
