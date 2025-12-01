import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function IaBookExperienceCard() {
  return (
    <motion.div
      className="relative w-full rounded-3xl border-2 border-border bg-gradient-to-br from-card via-card to-card/90 p-8 shadow-2xl overflow-hidden"
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.2)_0,_transparent_50%),_radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.15)_0,_transparent_50%)]" />

      {/* Main content grid */}
      <div className="relative z-10 grid md:grid-cols-[320px_1fr] gap-10 items-center">
        
        {/* LEFT: Book cover */}
        <motion.div
          className="flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="w-56 h-80 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 shadow-2xl border-2 border-primary/20 flex flex-col items-center justify-center px-6 py-8 text-center relative overflow-hidden">
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
          </div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/20 border border-accent/30">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wide">
                I.A. Trabalhando
              </span>
            </div>
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

            {/* Chapter list */}
            <div className="space-y-3">
              <motion.div
                className="flex items-start gap-3 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-foreground">1</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Introdução: por que a Inteligência Artificial está em todo lugar
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75, duration: 0.4 }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-foreground">2</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Tipos de I.A. e onde eles aparecem no dia a dia
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.4 }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-foreground">3</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Como conversar com a I.A.: prompts e boas práticas
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3 group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.05, duration: 0.4 }}
              >
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-foreground">4</span>
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    Aplicações práticas: trabalho, estudos e negócios
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Bottom note */}
            <motion.div
              className="pt-3 border-t border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <p className="text-xs text-muted-foreground italic">
                De "tenho uma ideia" para "tenho um índice estruturado" em minutos.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
