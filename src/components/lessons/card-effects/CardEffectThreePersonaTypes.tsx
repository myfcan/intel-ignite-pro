import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Clock, Zap, User, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CardEffectThreePersonaTypesProps {
  isActive?: boolean;
}

export const CardEffectThreePersonaTypes = ({ isActive = false }: CardEffectThreePersonaTypesProps) => {
  const [scene, setScene] = useState(0);
  const [activePersona, setActivePersona] = useState<number | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const personas = [
    { 
      icon: ShieldAlert, 
      label: "O Medroso", 
      color: "red",
      quote: "Isso é complicado demais...",
      behavior: "Nunca abre uma ferramenta"
    },
    { 
      icon: Clock, 
      label: "O Planejador Eterno", 
      color: "yellow",
      quote: "Vou estudar tudo primeiro...",
      behavior: "Nada sai do papel"
    },
    { 
      icon: Zap, 
      label: "O Fazedor Silencioso", 
      color: "green",
      quote: "Deixa eu testar isso hoje.",
      behavior: "Já está sendo pago"
    }
  ];

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    loopCountRef.current++;
    setScene(0);
    setActivePersona(null);

    timersRef.current.push(setTimeout(() => setScene(1), 500));
    timersRef.current.push(setTimeout(() => { setScene(2); setActivePersona(0); }, 2000));
    timersRef.current.push(setTimeout(() => setActivePersona(1), 4500));
    timersRef.current.push(setTimeout(() => setActivePersona(2), 7000));
    timersRef.current.push(setTimeout(() => setScene(3), 10000));
    timersRef.current.push(setTimeout(() => setScene(4), 12500));

    if (loopCountRef.current < 2) {
      timersRef.current.push(setTimeout(() => startAnimation(), 15000));
    }
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActivePersona(null);
    }
    return () => clearTimers();
  }, [isActive]);

  const getColorClasses = (color: string, isActive: boolean) => {
    if (!isActive) return 'bg-gray-800 border-gray-700 text-gray-500';
    const colors: Record<string, string> = {
      red: 'bg-red-900/50 border-red-500/50 text-red-300',
      yellow: 'bg-yellow-900/50 border-yellow-500/50 text-yellow-300',
      green: 'bg-emerald-900/50 border-emerald-500/50 text-emerald-300'
    };
    return colors[color];
  };

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      red: 'text-red-400',
      yellow: 'text-yellow-400',
      green: 'text-emerald-400'
    };
    return colors[color];
  };

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-gray-950 to-zinc-950">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Scene 1: Title */}
          {scene >= 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-12 text-center"
            >
              <h3 className="text-white text-xl font-bold">
                3 Tipos de Pessoa
              </h3>
              <p className="text-gray-400 text-sm mt-1">Diante da Inteligência Artificial</p>
            </motion.div>
          )}

          {/* Scene 2: Three personas */}
          {scene >= 2 && (
            <motion.div
              key="personas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 flex-wrap justify-center max-w-lg"
            >
              {personas.map((persona, index) => {
                const Icon = persona.icon;
                const isCurrentActive = activePersona === index;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      scale: isCurrentActive ? 1.05 : 1
                    }}
                    transition={{ delay: index * 0.2 }}
                    className={`w-36 p-4 rounded-xl border-2 transition-all duration-300 ${getColorClasses(persona.color, isCurrentActive)}`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isCurrentActive ? 'bg-white/10' : 'bg-gray-800'}`}>
                        <Icon className={`w-6 h-6 ${isCurrentActive ? getIconColor(persona.color) : 'text-gray-600'}`} />
                      </div>
                      <p className="font-semibold text-sm mb-1">{persona.label}</p>
                      {isCurrentActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-2"
                        >
                          <p className="text-xs italic mb-2">"{persona.quote}"</p>
                          <p className="text-xs opacity-70">{persona.behavior}</p>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Scene 3: Comparison result */}
          {scene >= 3 && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-28 flex gap-6"
            >
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="text-sm">Parado</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">Planejando</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Lucrando</span>
              </div>
            </motion.div>
          )}

          {/* Scene 4: Question */}
          {scene >= 4 && (
            <motion.div
              key="question"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute bottom-8"
            >
              <p className="text-white font-semibold text-center">
                Em qual você se reconhece hoje?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex gap-2 mt-4 absolute bottom-5">
          {[1, 2, 3, 4].map((s) => (
            <motion.div
              key={s}
              className={`w-2.5 h-2.5 rounded-full ${scene >= s ? 'bg-white' : 'bg-gray-700'}`}
              animate={{ scale: scene === s ? 1.3 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20"
      >
        <span className="text-gray-300 text-xs font-medium">Perfis</span>
      </motion.div>
    </div>
  );
};
