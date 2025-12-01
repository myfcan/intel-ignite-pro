import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const chapters = [
  "1. O Que É Inteligência Artificial",
  "2. Primeiros Passos com ChatGPT",
  "3. Criando Conteúdo de Valor",
  "4. Automatizando Tarefas Diárias"
];

export function IaBookExperienceCard() {
  const [showCover, setShowCover] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [showTitle, setShowTitle] = useState(0);
  const [showPage, setShowPage] = useState(false);
  const [showChapters, setShowChapters] = useState(0);

  useEffect(() => {
    const sequence = async () => {
      // SCENE 2: Book cover (0.4s)
      await new Promise(r => setTimeout(r, 400));
      setShowCover(true);
      
      // SCENE 3: Badge (0.8s)
      await new Promise(r => setTimeout(r, 400));
      setShowBadge(true);
      
      // SCENE 3: Title lines (0.8s - 1.5s)
      for (let i = 1; i <= 3; i++) {
        await new Promise(r => setTimeout(r, 120));
        setShowTitle(i);
      }
      
      // SCENE 4: Page opens (1.5s)
      await new Promise(r => setTimeout(r, 350));
      setShowPage(true);
      
      // SCENE 5: Chapters (2.1s)
      await new Promise(r => setTimeout(r, 600));
      for (let i = 1; i <= 4; i++) {
        await new Promise(r => setTimeout(r, 100));
        setShowChapters(i);
      }
    };
    
    sequence();
  }, []);

  return (
    // SCENE 1: Card entrance (0.0s - 0.4s)
    <motion.div
      className="w-full max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="grid md:grid-cols-2 gap-0 items-stretch">
        
        {/* LEFT: Book Cover */}
        <AnimatePresence>
          {showCover && (
            <motion.div
              className="relative bg-gradient-to-br from-primary via-primary to-primary/80 rounded-l-2xl p-8 flex flex-col justify-center items-center shadow-2xl border-y border-l border-primary/20 overflow-hidden min-h-[500px]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
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

              <div className="relative z-10 text-center space-y-6">
                {/* Badge */}
                <AnimatePresence>
                  {showBadge && (
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Sparkles className="w-4 h-4 text-primary-foreground" />
                      <span className="text-sm font-medium text-primary-foreground">I.A. BOOK</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Title lines */}
                <div className="space-y-2">
                  {["Seu Primeiro Livro", "com Inteligência", "Artificial"].map((line, index) => (
                    <AnimatePresence key={index}>
                      {showTitle > index && (
                        <motion.h2
                          className="text-3xl md:text-4xl font-bold text-primary-foreground"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {line}
                        </motion.h2>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT: Opened Page */}
        <AnimatePresence>
          {showPage && (
            <motion.div
              className="bg-card rounded-r-2xl p-8 shadow-2xl border-y border-r border-border relative"
              style={{ transformOrigin: 'left center' }}
              initial={{ opacity: 0, scaleX: 0.9, x: 8 }}
              animate={{ opacity: 1, scaleX: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {/* Book binding shadow */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
              
              <div className="space-y-6 relative">
                
                {/* Status badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
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
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Estrutura do Livro
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Índice gerado automaticamente
                  </p>
                </motion.div>

                {/* Chapters list */}
                <div className="space-y-3">
                  {chapters.map((chapter, index) => (
                    <AnimatePresence key={index}>
                      {showChapters > index && (
                        <motion.div
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground leading-relaxed">
                            {chapter}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                {/* Final note */}
                <AnimatePresence>
                  {showChapters >= 4 && (
                    <motion.p
                      className="text-xs text-muted-foreground italic text-center pt-4 border-t border-border"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      ✨ Estrutura criada em segundos pela I.A.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </motion.div>
  );
}
