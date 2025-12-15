import { motion } from "framer-motion";

interface ComparisonCard {
  label: string;
  value: string;
  isPositive: boolean;
  details: string[];
}

interface V7ActComparisonProps {
  title: string;
  leftCard: ComparisonCard;
  rightCard: ComparisonCard;
}

export const V7ActComparison = ({
  title,
  leftCard,
  rightCard
}: V7ActComparisonProps) => {
  const renderCard = (card: ComparisonCard, isPro: boolean, delay: number) => (
    <motion.div
      className={`
        bg-white/5 backdrop-blur-md border rounded-2xl p-6 sm:p-8
        ${isPro 
          ? "border-[rgba(78,205,196,0.5)] shadow-[0_0_30px_rgba(78,205,196,0.2)]" 
          : "border-white/10"
        }
      `}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
    >
      <div className="text-sm text-white/50 mb-2">{card.label}</div>
      <div 
        className={`text-4xl sm:text-5xl font-bold mb-5 ${
          card.isPositive ? "text-[#4ecdc4]" : "text-[#ff6b6b]"
        }`}
      >
        {card.value}
      </div>
      <div className="text-base sm:text-lg leading-relaxed text-white/70 space-y-1">
        {card.details.map((detail, index) => (
          <div key={index}>{detail}</div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-6 sm:p-10">
      {/* Title */}
      <motion.h2
        className="text-3xl sm:text-4xl mb-8 sm:mb-10 text-center font-semibold"
        style={{
          background: "linear-gradient(90deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full max-w-5xl">
        {renderCard(leftCard, false, 0)}
        {renderCard(rightCard, true, 0.3)}
      </div>
    </div>
  );
};
