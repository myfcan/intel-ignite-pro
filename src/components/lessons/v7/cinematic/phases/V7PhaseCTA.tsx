// V7PhaseCTA - Call to Action final phase
import { motion } from 'framer-motion';
import { useState } from 'react';

interface V7PhaseCTAProps {
  title: string;
  subtitle: string;
  options: {
    label: string;
    emoji: string;
    variant: 'negative' | 'positive';
    onClick?: () => void;
  }[];
  duration: number;
  onChoice: (choice: 'negative' | 'positive') => void;
}

export default function V7PhaseCTA({
  title,
  subtitle,
  options,
  duration,
  onChoice
}: V7PhaseCTAProps) {
  const [selected, setSelected] = useState<'negative' | 'positive' | null>(null);

  const handleSelect = (variant: 'negative' | 'positive') => {
    setSelected(variant);
    setTimeout(() => onChoice(variant), 500);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <h2 className="text-2xl sm:text-3xl text-muted-foreground">
            {title}
          </h2>
          <p className="text-4xl sm:text-5xl font-bold text-foreground">
            {subtitle}
          </p>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          {options.map((option, index) => (
            <motion.button
              key={option.variant}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                scale: selected === option.variant ? 1.1 : (selected ? 0.9 : 1)
              }}
              transition={{ delay: 0.8 + index * 0.2, duration: 0.6 }}
              onClick={() => handleSelect(option.variant)}
              disabled={selected !== null}
              className={`
                relative px-8 py-6 rounded-2xl text-xl font-bold
                transition-all duration-300 overflow-hidden
                ${option.variant === 'negative' 
                  ? 'bg-muted/20 text-muted-foreground hover:bg-muted/30 border border-muted/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }
                ${selected && selected !== option.variant ? 'opacity-30' : ''}
                disabled:cursor-not-allowed
              `}
            >
              {/* Glow effect for positive option */}
              {option.variant === 'positive' && (
                <motion.div
                  className="absolute inset-0 bg-primary/30 rounded-2xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(var(--primary), 0.3)',
                      '0 0 40px rgba(var(--primary), 0.5)',
                      '0 0 20px rgba(var(--primary), 0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <span className="relative z-10 flex items-center gap-3">
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Countdown hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="text-muted-foreground text-sm"
        >
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            A escolha é sua. E é agora.
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
