import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const chapters = [
  "1. O Que É Inteligência Artificial",
  "2. Primeiros Passos com ChatGPT",
  "3. Criando Conteúdo de Valor",
  "4. Automatizando Tarefas Diárias"
];

const titleLines = ["Seu Primeiro Livro", "com Inteligência", "Artificial"];

export function IaBookExperienceCard() {
  return (
    // SCENE 1: Card entrance (0.0s - 0.4s)
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="grid md:grid-cols-[45%_55%] gap-0 items-stretch shadow-2xl rounded-2xl overflow-hidden">
        
        {/* LEFT: Book Cover */}
        <motion.div
          className="relative bg-gradient-to-br from-primary via-primary to-primary/80 p-12 flex flex-col justify-center items-center overflow-hidden min-h-[600px]"
          // SCENE 2: Book cover appears (0.4s - 0.8s)
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
        >
          {/* SCENE 6: Subtle glow pulse */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/40 via-transparent to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut"
            }}
          />

          <div className="relative z-10 text-center space-y-8">
            {/* SCENE 3: Badge (0.8s) */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">I.A. BOOK</span>
            </motion.div>

            {/* SCENE 3: Title lines (0.8s - 1.5s) */}
            <div className="space-y-3">
              {titleLines.map((line, index) => (
                <motion.h2
                  key={index}
                  className="text-4xl md:text-5xl font-bold text-primary-foreground"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.8 + (index * 0.12), 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                >
                  {line}
                </motion.h2>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Opened Page - SCENE 4 (1.5s - 2.1s) */}
        <motion.div
          className="bg-card p-10 relative border-l-4 border-primary/10"
          style={{ transformOrigin: 'left center' }}
          initial={{ opacity: 0, scaleX: 0, x: -20 }}
          animate={{ opacity: 1, scaleX: 1, x: 0 }}
          transition={{ 
            delay: 1.5, 
            duration: 0.6, 
            ease: [0.16, 1, 0.3, 1]
          }}
        >
          {/* Book binding shadow effect */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/10 via-black/5 to-transparent pointer-events-none" />
          
          <div className="space-y-6 relative">
            
            {/* Status badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.3 }}
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
              transition={{ delay: 1.8, duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Estrutura do Livro
              </h3>
              <p className="text-sm text-muted-foreground">
                Índice gerado automaticamente
              </p>
            </motion.div>

            {/* SCENE 5: Chapters list (2.1s - 2.7s) */}
            <div className="space-y-4 pt-2">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 2.1 + (index * 0.15), 
                    duration: 0.3, 
                    ease: "easeOut" 
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
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8, duration: 0.4 }}
            >
              ✨ Estrutura criada em segundos pela I.A.
            </motion.p>
          </div>
        </motion.div>
        
      </div>
    </motion.div>
  );
}
