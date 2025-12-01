import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

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
    // SCENE 1: Card entrance (0.0s - 0.8s)
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      onAnimationStart={() => console.log("🎬 Animação do CARD iniciou")}
      onAnimationComplete={() => console.log("✅ Animação do CARD completou")}
    >
      <div className="grid md:grid-cols-[45%_55%] gap-0 items-stretch shadow-2xl rounded-2xl overflow-visible">
        
        {/* LEFT: Book Cover */}
        <motion.div
          className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-l-2xl p-12 flex flex-col justify-center items-center overflow-hidden min-h-[600px]"
          // SCENE 2: Book cover appears (0.8s - 1.4s)
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          onAnimationStart={() => console.log("📕 Animação da CAPA iniciou")}
          onAnimationComplete={() => console.log("✅ Animação da CAPA completou")}
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

        {/* RIGHT: Opened Page - SCENE 4 (3.0s - 5.4s) - ABERTURA DRAMÁTICA */}
        <motion.div
          className="bg-card rounded-r-2xl p-10 relative border-l-4 border-primary/10 overflow-hidden"
          style={{ 
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d'
          }}
          initial={{ 
            opacity: 0, 
            scaleX: 0,
            rotateY: -25,
            x: -40
          }}
          animate={{ 
            opacity: 1, 
            scaleX: 1,
            rotateY: 0,
            x: 0
          }}
          transition={{ 
            delay: 3.0, 
            duration: 2.4,
            ease: [0.22, 1, 0.36, 1],
            opacity: { duration: 1.6 }
          }}
          onAnimationStart={() => console.log("📄 Animação PÁGINA ABRINDO iniciou - OLHE AGORA!")}
          onAnimationComplete={() => console.log("✅ Animação PÁGINA completou")}
        >
          {/* Book binding shadow - CRESCE COM A ABERTURA */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/20 via-black/10 to-transparent pointer-events-none"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "80px", opacity: 1 }}
            transition={{ 
              delay: 3.0, 
              duration: 2.4,
              ease: [0.22, 1, 0.36, 1]
            }}
          />

          {/* Sombra dinâmica 3D que cresce */}
          <motion.div
            className="absolute -left-4 top-4 bottom-4 w-8 blur-xl pointer-events-none"
            initial={{ 
              background: "transparent",
              scaleY: 0
            }}
            animate={{ 
              background: "linear-gradient(to right, rgba(0,0,0,0.3), transparent)",
              scaleY: 1
            }}
            transition={{ 
              delay: 3.0, 
              duration: 2.4,
              ease: [0.22, 1, 0.36, 1]
            }}
          />
          
          <div className="space-y-6 relative">
            
            {/* Status badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5.8, duration: 0.6 }}
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
              transition={{ delay: 6.2, duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Estrutura do Livro
              </h3>
              <p className="text-sm text-muted-foreground">
                Índice gerado automaticamente
              </p>
            </motion.div>

            {/* SCENE 5: Chapters list (7.0s - 9.4s) */}
            <div className="space-y-4 pt-2">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 7.0 + (index * 0.6), 
                    duration: 0.8, 
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
              transition={{ delay: 10.0, duration: 0.8 }}
            >
              ✨ Estrutura criada em segundos pela I.A.
            </motion.p>
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}
