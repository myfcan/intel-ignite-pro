import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface Badge {
  icone: string;
  nome: string;
  descricao: string;
  data?: string;
  desbloqueado: boolean;
}

interface BadgeDisplayProps {
  badge: Badge;
  onClick?: () => void;
}

export function BadgeDisplay({ badge, onClick }: BadgeDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card
        className={`p-6 flex flex-col items-center cursor-pointer transition-all ${
          badge.desbloqueado
            ? "bg-gradient-primary text-white shadow-cyan-glow"
            : "bg-muted opacity-50"
        }`}
        onClick={onClick}
      >
        <span className="text-5xl mb-3">{badge.icone}</span>
        <h3 className="font-bold text-sm text-center mb-1">{badge.nome}</h3>
        <p className="text-xs text-center opacity-80 mb-2">{badge.descricao}</p>
        {badge.data && (
          <span className="text-xs opacity-70">
            {new Date(badge.data).toLocaleDateString('pt-BR')}
          </span>
        )}
      </Card>
    </motion.div>
  );
}
