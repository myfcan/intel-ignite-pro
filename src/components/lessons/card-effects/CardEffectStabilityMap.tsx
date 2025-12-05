import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, TrendingUp, Heart, Brain, Zap, CheckCircle } from 'lucide-react';

interface CardEffectStabilityMapProps {
  isActive?: boolean;
}

export const CardEffectStabilityMap: React.FC<CardEffectStabilityMapProps> = ({ isActive = false }) => {
  const [scene, setScene] = useState(0);
  const [activeElement, setActiveElement] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const loopCountRef = useRef(0);

  const stabilityPillars = [
    { icon: Shield, label: 'Segurança', description: 'Base sólida primeiro', color: 'text-blue-400' },
    { icon: TrendingUp, label: 'Crescimento', description: 'Evolução gradual', color: 'text-green-400' },
    { icon: Heart, label: 'Propósito', description: 'Conexão com valores', color: 'text-pink-400' },
    { icon: Brain, label: 'Aprendizado', description: 'Melhoria contínua', color: 'text-purple-400' },
  ];

  const clearTimers = () => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
  };

  const startAnimation = () => {
    clearTimers();
    setScene(0);
    setActiveElement(0);

    // Cena 1: Título (0-3s)
    timersRef.current.push(setTimeout(() => setScene(1), 400));

    // Cena 2: Pilares aparecem (3-9s)
    timersRef.current.push(setTimeout(() => setScene(2), 3000));

    // Animar cada pilar
    timersRef.current.push(setTimeout(() => setActiveElement(1), 4000));
    timersRef.current.push(setTimeout(() => setActiveElement(2), 5500));
    timersRef.current.push(setTimeout(() => setActiveElement(3), 7000));
    timersRef.current.push(setTimeout(() => setActiveElement(4), 8500));

    // Cena 3: Mapa completo (9-12s)
    timersRef.current.push(setTimeout(() => setScene(3), 10000));

    // Cena 4: Mensagem final (12-15s)
    timersRef.current.push(setTimeout(() => setScene(4), 12000));

    // Loop (max 2x)
    timersRef.current.push(setTimeout(() => {
      loopCountRef.current += 1;
      if (loopCountRef.current < 2) {
        startAnimation();
      }
    }, 15000));
  };

  useEffect(() => {
    if (isActive) {
      loopCountRef.current = 0;
      startAnimation();
    } else {
      clearTimers();
      setScene(0);
      setActiveElement(0);
    }
    return () => clearTimers();
  }, [isActive]);

  return (
    <div className="relative w-full min-h-[480px] h-[60vh] max-h-[600px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
      {/* Background com grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Glow central */}
      <motion.div 
        className="absolute inset-0"
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.25) 0%, transparent 60%)',
            'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {/* Cena 1: Título */}
          {scene === 1 && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Mapa da Estabilidade
              </h2>
              <p className="text-indigo-200 text-lg">
                Construa sua jornada com bases sólidas
              </p>
            </motion.div>
          )}

          {/* Cena 2: Pilares */}
          {scene === 2 && (
            <motion.div
              key="pillars"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              <h3 className="text-xl font-semibold text-white text-center mb-8">
                Os 4 Pilares da Estabilidade
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stabilityPillars.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  const isActiveItem = activeElement > idx;
                  return (
                    <motion.div
                      key={pillar.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: 1, 
                        scale: isActiveItem ? 1.05 : 1,
                        boxShadow: isActiveItem ? '0 0 30px rgba(99, 102, 241, 0.4)' : 'none'
                      }}
                      transition={{ delay: idx * 0.2, duration: 0.4 }}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        isActiveItem 
                          ? 'bg-indigo-900/50 border-indigo-400' 
                          : 'bg-slate-800/50 border-slate-700'
                      }`}
                    >
                      <Icon className={`w-8 h-8 mb-2 ${isActiveItem ? pillar.color : 'text-slate-500'}`} />
                      <p className={`font-semibold ${isActiveItem ? 'text-white' : 'text-slate-400'}`}>
                        {pillar.label}
                      </p>
                      <p className={`text-xs mt-1 ${isActiveItem ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {pillar.description}
                      </p>
                      {isActiveItem && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Cena 3: Mapa conectado */}
          {scene === 3 && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <motion.div 
                className="relative w-48 h-48 mx-auto mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                {/* Círculo central */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                  >
                    <Zap className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                {/* Pilares orbitando */}
                {stabilityPillars.map((pillar, idx) => {
                  const Icon = pillar.icon;
                  const angle = (idx * 90) * (Math.PI / 180);
                  const x = Math.cos(angle) * 70;
                  const y = Math.sin(angle) * 70;
                  return (
                    <motion.div
                      key={pillar.label}
                      className="absolute w-10 h-10 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center"
                      style={{
                        left: `calc(50% + ${x}px - 20px)`,
                        top: `calc(50% + ${y}px - 20px)`,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Icon className={`w-5 h-5 ${pillar.color}`} />
                    </motion.div>
                  );
                })}
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">
                Tudo Conectado
              </h3>
              <p className="text-indigo-200">
                Cada pilar fortalece o outro
              </p>
            </motion.div>
          )}

          {/* Cena 4: Mensagem final */}
          {scene === 4 && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-6"
              >
                🏆
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Estabilidade é Estratégia
              </h3>
              <p className="text-indigo-200">
                Não é sobre correr, é sobre construir algo que dura
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-500/30"
      >
        <span className="text-xs font-medium text-indigo-200">Estabilidade</span>
      </motion.div>

      {/* Progress indicator */}
      <div className="mt-4 flex justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <motion.div
            key={s}
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              scene >= s ? 'bg-indigo-400' : 'bg-slate-600'
            }`}
            animate={scene === s ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </div>
  );
};

export default CardEffectStabilityMap;
