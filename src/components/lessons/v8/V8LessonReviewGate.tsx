import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ALL_REVIEWS = [
  { name: 'Maria S.', stars: 5, text: 'Essa aula foi um divisor de águas pra mim. Nunca imaginei que IA fosse tão acessível!', time: 'há 2 dias' },
  { name: 'Carlos R.', stars: 5, text: 'Conteúdo claro e direto, sem enrolação. Apliquei no mesmo dia e já vi resultado.', time: 'há 5 dias' },
  { name: 'Ana P.', stars: 4, text: 'Melhor investimento de tempo que fiz. O conteúdo é prático e vai direto ao ponto.', time: 'há 1 semana' },
  { name: 'Pedro M.', stars: 5, text: 'Não sabia que IA podia ser tão simples. Essa aula mudou minha forma de trabalhar.', time: 'há 3 dias' },
  { name: 'Julia F.', stars: 5, text: 'Depois dessa aula, comecei a gerar renda extra com IA. Recomendo demais!', time: 'há 4 dias' },
];

function getReviewsForLesson(lessonId: string) {
  let hash = 0;
  for (let i = 0; i < lessonId.length; i++) {
    hash = ((hash << 5) - hash) + lessonId.charCodeAt(i);
    hash |= 0;
  }
  const start = Math.abs(hash) % ALL_REVIEWS.length;
  const reviews: typeof ALL_REVIEWS = [];
  for (let i = 0; i < 4; i++) {
    reviews.push(ALL_REVIEWS[(start + i) % ALL_REVIEWS.length]);
  }
  return reviews;
}

interface V8LessonReviewGateProps {
  lessonId: string;
  lessonTitle: string;
  onClose: () => void;
}

export const V8LessonReviewGate = ({ lessonId, lessonTitle, onClose }: V8LessonReviewGateProps) => {
  const navigate = useNavigate();
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const reviews = getReviewsForLesson(lessonId);

  useEffect(() => {
    const timer = setTimeout(() => setButtonEnabled(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const renderStars = (count: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('');

  const COLORS = ['bg-violet-500', 'bg-pink-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'];

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-none bg-transparent"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <motion.div
          className="bg-white rounded-3xl overflow-hidden shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-center">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">O que dizem sobre</p>
            <h3 className="text-white text-lg font-bold leading-tight truncate">{lessonTitle}</h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              {renderStars(5)}
              <span className="text-white/80 text-xs ml-1.5">4.9 de 5</span>
            </div>
          </div>

          {/* Reviews */}
          <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-y-auto">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
              >
                <div className={`w-9 h-9 rounded-full ${COLORS[i % COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {initials(review.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                    <span className="text-[10px] text-gray-400">{review.time}</span>
                  </div>
                  <div className="flex gap-0.5 mb-1">{renderStars(review.stars)}</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{review.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 space-y-2.5">
            <Button
              onClick={onClose}
              disabled={!buttonEnabled}
              className="w-full py-5 text-base font-semibold rounded-2xl transition-all disabled:opacity-40"
              style={{
                background: buttonEnabled
                  ? 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)'
                  : '#D1D5DB',
              }}
            >
              {buttonEnabled ? 'Continuar' : 'Leia os depoimentos...'}
            </Button>

            <button
              onClick={() => navigate('/pricing')}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-xl transition-colors"
            >
              <Crown className="w-4 h-4" />
              Quero desbloquear tudo
            </button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
