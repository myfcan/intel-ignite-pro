import { useNavigate } from 'react-router-dom';
import { BookOpen, Bot, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const shortcuts = [
  {
    label: 'Guia de bolso',
    icon: BookOpen,
    route: '/guides',
    iconBg: 'bg-accent shadow-[0_4px_12px_hsl(var(--accent)/0.3)]',
  },
  {
    label: 'Diretório de IA',
    icon: Bot,
    route: '/ai-directory',
    iconBg: 'bg-primary shadow-[0_4px_12px_hsl(var(--primary)/0.3)]',
  },
  {
    label: 'Super Prompts',
    icon: MessageCircle,
    route: '/prompt-library',
    iconBg: 'bg-secondary shadow-[0_4px_12px_hsl(var(--secondary)/0.3)]',
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
                       bg-card/85 backdrop-blur-xl border border-border/80
                       shadow-sm hover:shadow-md
                       active:scale-[0.96] transition-all duration-150"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}
            >
              <item.icon className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold leading-tight text-center text-foreground/75">
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
