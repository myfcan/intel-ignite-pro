import { motion } from "framer-motion";

export function IaBookExperienceCard() {
  return (
    <div className="mt-6 w-full">
      <div className="text-sm text-muted-foreground mb-3">
        Exemplo visual: como a Inteligência Artificial pode estruturar um livro
        inteiro em poucos minutos.
      </div>

      <motion.div
        className="relative w-full rounded-3xl border border-border bg-card/80 p-5 shadow-xl overflow-hidden flex flex-col md:flex-row gap-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Brilho de fundo suave */}
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_hsl(var(--primary))_0,_transparent_55%),_radial-gradient(circle_at_bottom,_hsl(var(--accent))_0,_transparent_55%)]" />

        {/* Conteúdo principal */}
        <div className="relative z-10 flex flex-col md:flex-row gap-6 w-full">
          {/* Lado esquerdo: capa do livro */}
          <motion.div
            className="w-full md:w-1/3 flex items-center justify-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="w-40 h-56 rounded-2xl bg-gradient-to-b from-primary to-primary/80 shadow-2xl border border-border flex flex-col items-center justify-center px-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-primary-foreground/70 mb-2">
                Livro criado com I.A.
              </div>
              <div className="text-sm font-semibold text-primary-foreground">
                "Seu Primeiro Livro
                <br />
                com Inteligência Artificial"
              </div>
              <div className="mt-3 text-[10px] text-primary-foreground/70">
                Índice, capítulos e revisão
                <br />
                gerados em minutos.
              </div>
            </div>
          </motion.div>

          {/* Lado direito: índice/capítulos */}
          <motion.div
            className="w-full md:w-2/3 flex flex-col justify-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="text-xs font-semibold text-accent-foreground">
              Simulação de interface de I.A.
            </div>
            <div className="text-sm font-semibold text-foreground mb-1">
              Prompt:
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                "Crie o índice e a estrutura de capítulos de um livro sobre
                Inteligência Artificial para iniciantes."
              </span>
            </div>

            <div className="mt-2 bg-muted/50 border border-border rounded-2xl p-3">
              <div className="text-[11px] text-muted-foreground mb-2">
                Resposta da I.A. (resumo do índice):
              </div>

              {/* Linhas simulando capítulos */}
              <div className="space-y-2 text-xs text-foreground">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                    1
                  </span>
                  <span>Introdução: por que a Inteligência Artificial está em todo lugar.</span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                    2
                  </span>
                  <span>Tipos de Inteligência Artificial e onde eles aparecem no dia a dia.</span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                    3
                  </span>
                  <span>Como conversar com a I.A.: prompts, exemplos e boas práticas.</span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-accent text-accent-foreground text-[9px] font-bold">
                    4
                  </span>
                  <span>Aplicações práticas: trabalho, estudos, negócios e vida pessoal.</span>
                </motion.div>
              </div>

              <div className="mt-3 text-[11px] text-muted-foreground">
                *Em poucos minutos, você sai de "tenho uma ideia de livro" para
                "tenho um índice estruturado e pronto para desenvolver".*
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
