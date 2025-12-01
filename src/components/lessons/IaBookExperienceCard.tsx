import { motion, useAnimation } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export function IaBookExperienceCard() {
  const [showChapters, setShowChapters] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);
  const bookControls = useAnimation();

  const chapters = [
    "Introdução: por que a Inteligência Artificial está em todo lugar",
    "Tipos de I.A. e onde eles aparecem no dia a dia",
    "Como conversar com a I.A.: prompts e boas práticas",
    "Aplicações práticas: trabalho, estudos e negócios"
  ];

  useEffect(() => {
    // Trigger book page flip animation
    const flipPages = async () => {
      await bookControls.start({
        rotateY: [0, -15, 0],
        transition: { duration: 1.2, delay: 0.5, ease: "easeInOut" }
      });
      setShowChapters(true);
    };
    flipPages();
  }, [bookControls]);

  useEffect(() => {
    if (showChapters && typingIndex < chapters.length) {
      const timer = setTimeout(() => {
        setTypingIndex(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [showChapters, typingIndex, chapters.length]);

  return (
    <motion.div
      className="relative w-full rounded-3xl border-2 border-border bg-gradient-to-br from-card via-card to-card/90 p-8 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Animated sparkles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary rounded-full"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: 0,
            scale: 0
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [Math.random() * 100 + "%", (Math.random() * 50) + "%"]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            delay: Math.random() * 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 3
          }}
        />
      ))}

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.2)_0,_transparent_50%),_radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.15)_0,_transparent_50%)]" />

      {/* Main content grid */}
      <div className="relative z-10 grid md:grid-cols-[320px_1fr] gap-10 items-center">
        
        {/* LEFT: Book cover with page flip animation */}
        <motion.div
          className="flex items-center justify-center perspective-1000"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ perspective: "1000px" }}
        >
          <motion.div 
            className="w-56 h-80 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-2xl border-2 border-primary/20 flex flex-col items-center justify-center px-6 py-8 text-center relative overflow-hidden"
            animate={bookControls}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Animated pages effect */}
            <motion.div
              className="absolute inset-2 bg-primary-foreground/5 rounded-xl"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: [0, 1, 0.95] }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-3 bg-primary-foreground/3 rounded-xl"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: [0, 1, 0.9] }}
              transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
            />
            
            {/* Book cover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
                <Sparkles className="w-3 h-3 text-primary-foreground" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-foreground">
                  I.A. Book
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-primary-foreground leading-tight">
                Seu Primeiro Livro
                <br />
                com Inteligência
                <br />
                Artificial
              </h3>
              
              <div className="text-xs text-primary-foreground/80 leading-relaxed">
                Índice, capítulos e revisão
                <br />
                estruturados em minutos
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT: AI Interface panel */}
        <motion.div
          className="flex flex-col gap-5"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Main headline */}
          <div className="space-y-2">
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/20 border border-accent/30"
              animate={{ 
                boxShadow: [
                  "0 0 0 0 hsl(var(--accent) / 0)",
                  "0 0 0 4px hsl(var(--accent) / 0.1)",
                  "0 0 0 0 hsl(var(--accent) / 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-accent"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wide">
                I.A. Trabalhando
              </span>
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              Livro estruturado em minutos
              <br />
              com Inteligência Artificial
            </h2>
          </div>

          {/* AI Response panel */}
          <div className="bg-muted/50 border-2 border-border/50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Resposta da I.A.
              </span>
              <span className="text-xs text-muted-foreground">Índice gerado</span>
            </div>

            {/* Chapter list with typing effect */}
            <div className="space-y-3">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 group"
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={
                    typingIndex > index
                      ? { opacity: 1, x: 0, height: "auto" }
                      : { opacity: 0, x: -20, height: 0 }
                  }
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <motion.div 
                    className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={
                      typingIndex > index
                        ? { scale: 1, rotate: 0 }
                        : { scale: 0, rotate: -180 }
                    }
                    transition={{ delay: 0.1, duration: 0.3 }}
                  >
                    <span className="text-sm font-bold text-accent-foreground">{index + 1}</span>
                  </motion.div>
                  <div className="flex-1 pt-0.5 overflow-hidden">
                    <motion.p 
                      className="text-sm font-medium text-foreground leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={typingIndex > index ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {chapter}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom note with fade in */}
            {typingIndex >= chapters.length && (
              <motion.div
                className="pt-3 border-t border-border/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <p className="text-xs text-muted-foreground italic">
                  De "tenho uma ideia" para "tenho um índice estruturado" em minutos.
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
