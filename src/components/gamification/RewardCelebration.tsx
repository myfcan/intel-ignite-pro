import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface RewardCelebrationProps {
  type: 'lesson' | 'patent' | 'points';
  trigger: boolean;
}

export function RewardCelebration({ type, trigger }: RewardCelebrationProps) {
  useEffect(() => {
    if (!trigger) return;

    if (type === 'patent') {
      // Confetti mais intenso para subida de patente
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    } else if (type === 'lesson') {
      // Confetti rápido para conclusão de aula
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
        colors: ['#6CB1FF', '#EC4899', '#F59E0B']
      });
    } else if (type === 'points') {
      // Mini confetti para ganho de pontos
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.4 },
        zIndex: 9999,
        colors: ['#6CB1FF', '#EC4899']
      });
    }
  }, [trigger, type]);

  return null;
}
