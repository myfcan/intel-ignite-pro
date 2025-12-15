import { motion } from "framer-motion";

interface V7ActDramaticProps {
  mainValue: string;
  subtitle: string;
  highlightWord?: string;
}

export const V7ActDramatic = ({
  mainValue,
  subtitle,
  highlightWord
}: V7ActDramaticProps) => {
  // Parse subtitle to highlight word
  const renderSubtitle = () => {
    if (!highlightWord) return subtitle;
    
    const parts = subtitle.split(highlightWord);
    if (parts.length === 1) return subtitle;
    
    return (
      <>
        {parts[0]}
        <strong className="text-white">{highlightWord}</strong>
        {parts[1]}
      </>
    );
  };

  return (
    <div 
      className="w-full h-screen flex items-center justify-center relative"
      style={{
        background: "radial-gradient(circle at center, rgba(255,0,0,0.1) 0%, transparent 70%)"
      }}
    >
      <div className="relative text-center">
        {/* Main Number */}
        <motion.div
          className="text-[20vw] font-black leading-none"
          style={{
            background: "linear-gradient(45deg, #ff0000, #ff6b6b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {mainValue}
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="absolute top-[60%] left-1/2 -translate-x-1/2 text-center 
                     text-xl sm:text-2xl md:text-3xl text-white/80 whitespace-nowrap"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -20 }}
          transition={{ duration: 1, delay: 1 }}
        >
          {renderSubtitle()}
        </motion.div>
      </div>
    </div>
  );
};
