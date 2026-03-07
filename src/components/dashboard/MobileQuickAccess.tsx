import { useNavigate } from 'react-router-dom';
import { BookOpen, Bot, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const shortcuts = [
  {
    label: 'Guia de bolso',
    icon: BookOpen,
    route: '/guides',
    gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)',
    shadow: 'rgba(6, 182, 212, 0.25)',
  },
  {
    label: 'Diretório de IA',
    icon: Bot,
    route: '/ai-directory',
    gradient: 'linear-gradient(135deg, #6366F1, #818CF8)',
    shadow: 'rgba(99, 102, 241, 0.25)',
  },
  {
    label: 'Super Prompts',
    icon: MessageCircle,
    route: '/prompt-library',
    gradient: 'linear-gradient(135deg, #A855F7, #C084FC)',
    shadow: 'rgba(168, 85, 247, 0.25)',
  },
] as const;

export function MobileQuickAccess() {
  const navigate = useNavigate();

  return (
    <div className="lg:hidden mb-4">
      <div className="grid grid-cols-3 gap-2.5">
        {shortcuts.map((item, i) => (
          <motion.button
            key={item.route}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            onClick={() => navigate(item.route)}
            className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl
                       active:scale-[0.96] transition-transform duration-150"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(16px)',
              border: '1px solid hsl(220 13% 91% / 0.8)',
              boxShadow: '0 2px 12px -4px rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: item.gradient,
                boxShadow: `0 4px 12px ${item.shadow}`,
              }}
            >
              <item.icon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span
              className="text-[11px] font-semibold leading-tight text-center"
              style={{ color: 'hsl(215 25% 27%)' }}
            >
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
