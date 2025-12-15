import { motion } from "framer-motion";

interface MetricBox {
  label: string;
  value: string;
}

interface V7ActResultProps {
  emoji: string;
  title: string;
  message: string;
  metrics: MetricBox[];
}

export const V7ActResult = ({
  emoji,
  title,
  message,
  metrics
}: V7ActResultProps) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="text-center max-w-xl">
        {/* Emoji Badge */}
        <motion.div
          className="text-6xl sm:text-8xl mb-6 sm:mb-8"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
        >
          {emoji}
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-5"
          style={{
            background: "linear-gradient(90deg, #f093fb, #f5576c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {title}
        </motion.h2>

        {/* Message */}
        <motion.p
          className="text-base sm:text-xl leading-relaxed text-white/80 mb-8 sm:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          dangerouslySetInnerHTML={{ __html: message }}
        />

        {/* Metrics Grid */}
        <motion.div
          className="grid grid-cols-2 gap-4 sm:gap-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/5 p-4 sm:p-5 rounded-xl border border-white/10"
            >
              <div className="text-xs sm:text-sm text-white/50 mb-1">
                {metric.label}
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#4ecdc4]">
                {metric.value}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
