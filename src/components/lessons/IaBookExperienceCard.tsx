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
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("🎬 IaBookExperienceCard MONTADO - Livro vai abrir!");
    // Aguarda um momento e então abre o livro
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto perspective-[2000px]" style={{ perspective: '2000px' }}>
      <motion.div
        className="relative mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        style={{ 
          transformStyle: 'preserve-3d',
          maxWidth: isOpen ? '100%' : '400px',
          transition: 'max-width 1.5s ease-out'
        }}
      >
        <div 
          className="relative grid gap-0 items-stretch shadow-2xl rounded-2xl"
          style={{ 
            transformStyle: 'preserve-3d',
            gridTemplateColumns: isOpen ? '1fr 1fr' : '1fr'
          }}
        >
          
          {/* LEFT: Book Cover */}
          <motion.div
            className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-l-2xl p-12 flex flex-col justify-center items-center overflow-hidden min-h-[600px]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            <div className="relative z-10 text-center space-y-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">I.A. BOOK</span>
              </motion.div>

              <div className="space-y-3">
                {titleLines.map((line, index) => (
                  <motion.h2
                    key={index}
                    className="text-4xl md:text-5xl font-bold text-primary-foreground"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.5 + (index * 0.15), 
                      duration: 0.5
                    }}
                  >
                    {line}
                  </motion.h2>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Página interna que abre */}
          <motion.div
            className="bg-card rounded-r-2xl p-10 relative min-h-[600px]"
            initial={{ 
              rotateY: -180,
              opacity: 0
            }}
            animate={isOpen ? { 
              rotateY: 0,
              opacity: 1
            } : {
              rotateY: -180,
              opacity: 0
            }}
            transition={{ 
              duration: 1.8,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.2
            }}
            style={{ 
              transformStyle: 'preserve-3d',
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden'
            }}
            onAnimationStart={() => console.log("📖 PÁGINA ABRINDO!")}
            onAnimationComplete={() => console.log("✅ Página aberta")}
          >
            {/* Sombra da lombada */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/15 to-transparent pointer-events-none rounded-l-2xl" />
            
            <motion.div 
              className="space-y-6 relative"
              initial={{ opacity: 0 }}
              animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              
              {/* Status badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                initial={{ opacity: 0, y: 10 }}
                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 2.0, duration: 0.5 }}
              >
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 2.5 }}
                />
                <span className="text-xs font-medium text-primary">Resposta da I.A.</span>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ delay: 2.3, duration: 0.5 }}
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
                    animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ 
                      delay: 2.6 + (index * 0.2), 
                      duration: 0.5
                    }}
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
                animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 3.8, duration: 0.6 }}
              >
                ✨ Estrutura criada em segundos pela I.A.
              </motion.p>
            </motion.div>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  );
}
