import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useState, useEffect } from "react";

interface IaDigitalEmployeeCardProps {
  onComplete?: () => void;
}

export const IaDigitalEmployeeCard = ({ onComplete }: IaDigitalEmployeeCardProps) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    "Você define regras, limites e tom de voz do agente.",
    "Ele responde clientes, preenche planilhas e registra tudo automaticamente.",
    "Você acompanha métricas e ajusta o comportamento com novos prompts."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => {
        if (prev < pages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onComplete) {
            setTimeout(onComplete, 2000);
          }
          return prev;
        }
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [onComplete, pages.length]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-background via-background to-primary/5 border border-border shadow-2xl"
    >
      {/* Badge 24/7 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold"
      >
        24/7
      </motion.div>

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-2">
          I.A. como funcionário digital
        </h2>
        <p className="text-sm text-muted-foreground">
          Agentes que atendem, registram e organizam sem parar.
        </p>
      </motion.div>

      {/* Ícone central com pulso */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-12 h-12 text-primary-foreground" />
          </div>
        </motion.div>
      </div>

      {/* Páginas/Capítulos com transição */}
      <div className="relative min-h-[120px] flex items-center justify-center">
        {pages.map((text, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{
              opacity: currentPage === index ? 1 : 0,
              x: currentPage === index ? 0 : currentPage > index ? -50 : 50,
              display: currentPage === index ? "block" : "none"
            }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center px-8"
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <p className="text-center text-foreground leading-relaxed">
                {text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Indicador de páginas */}
      <div className="flex justify-center gap-2 mt-8">
        {pages.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              scale: currentPage === index ? 1.2 : 1,
              opacity: currentPage === index ? 1 : 0.4
            }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>
    </motion.div>
  );
};
