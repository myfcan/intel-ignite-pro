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
    console.log("📕 Livro carregado!");
    const timer = setTimeout(() => {
      console.log("🔓 Abrindo livro...");
      setIsOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto py-12" style={{ perspective: '2500px' }}>
      <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
        
        {/* LIVRO FECHADO - Capa que vira para trás */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl shadow-2xl flex items-center justify-center p-12 min-h-[600px] w-[400px] mx-auto"
          initial={{ rotateY: 0, z: 100 }}
          animate={isOpen ? { 
            rotateY: -160,
            x: -300,
            z: -50
          } : { 
            rotateY: 0,
            x: 0,
            z: 100
          }}
          transition={{ 
            duration: 1.8,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'right center',
            backfaceVisibility: 'visible',
            pointerEvents: isOpen ? 'none' : 'auto'
          }}
        >
          <div className="relative z-10 text-center space-y-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
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
                    delay: 0.4 + (index * 0.1), 
                    duration: 0.4
                  }}
                >
                  {line}
                </motion.h2>
              ))}
            </div>
          </div>
        </motion.div>

        {/* LIVRO ABERTO - Duas páginas lado a lado */}
        <motion.div
          className="grid grid-cols-2 gap-0 shadow-2xl rounded-2xl overflow-hidden relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isOpen ? { 
            opacity: 1,
            scale: 1
          } : { 
            opacity: 0,
            scale: 0.8
          }}
          transition={{ 
            delay: isOpen ? 0.8 : 0,
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
        >
          {/* Sombra da lombada (centro do livro) */}
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 pointer-events-none z-20"
            initial={{ opacity: 0 }}
            animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            style={{
              background: 'linear-gradient(90deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.1) 100%)',
              boxShadow: '0 0 20px rgba(0,0,0,0.15)'
            }}
          />
          {/* Página esquerda */}
          <motion.div
            className="bg-card p-10 min-h-[600px] flex items-center justify-center border-r border-border/50"
            initial={{ rotateY: 20 }}
            animate={isOpen ? { rotateY: 0 } : { rotateY: 20 }}
            transition={{ delay: 1.0, duration: 1.0 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="text-center space-y-4 text-muted-foreground">
              <p className="text-lg italic">Página em branco...</p>
              <p className="text-sm">O ChatGPT vai escrever aqui</p>
            </div>
          </motion.div>

          {/* Página direita - Conteúdo */}
          <motion.div
            className="bg-card p-10 min-h-[600px] relative"
            initial={{ rotateY: -20 }}
            animate={isOpen ? { rotateY: 0 } : { rotateY: -20 }}
            transition={{ delay: 1.0, duration: 1.0 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 1.8, duration: 0.6 }}
            >
              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <motion.div
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 2.0 }}
                />
                <span className="text-xs font-medium text-primary">Resposta da I.A.</span>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Estrutura do Livro
                </h3>
                <p className="text-sm text-muted-foreground">
                  Índice gerado automaticamente
                </p>
              </div>

              {/* Chapters list */}
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/40 transition-all"
                    initial={{ opacity: 0, x: -10 }}
                    animate={isOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ 
                      delay: 2.0 + (index * 0.15), 
                      duration: 0.4
                    }}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground leading-relaxed pt-0.5">
                      {chapter}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Final note */}
              <motion.p
                className="text-xs text-muted-foreground italic text-center pt-4 border-t border-border"
                initial={{ opacity: 0 }}
                animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: 3.0, duration: 0.5 }}
              >
                ✨ Estrutura criada em segundos pela I.A.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}
