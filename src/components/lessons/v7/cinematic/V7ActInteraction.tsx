import { useState } from "react";
import { motion } from "framer-motion";

interface InteractionOption {
  id: string;
  text: string;
  isDefault?: boolean;
}

interface V7ActInteractionProps {
  title: string;
  subtitle?: string;
  options: InteractionOption[];
  buttonText: string;
  onReveal: (selectedIds: string[]) => void;
  allowMultiple?: boolean;
}

export const V7ActInteraction = ({
  title,
  subtitle,
  options,
  buttonText,
  onReveal,
  allowMultiple = false
}: V7ActInteractionProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    options.filter(o => o.isDefault).map(o => o.id)
  );

  const toggleOption = (id: string) => {
    if (allowMultiple) {
      setSelectedIds(prev => 
        prev.includes(id) 
          ? prev.filter(i => i !== id)
          : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-3xl">
        {/* Question Box */}
        <motion.div
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 sm:p-10 mb-6 sm:mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 sm:mb-6">
            {title}
          </h2>
          
          {subtitle && (
            <p className="text-center text-white/70 mb-6 sm:mb-8">
              {subtitle}
            </p>
          )}

          {/* Options */}
          <div className="space-y-3 sm:space-y-4">
            {options.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              
              return (
                <motion.div
                  key={option.id}
                  className={`
                    bg-white/[0.03] border-2 rounded-xl p-4 sm:p-5 cursor-pointer
                    flex items-center gap-4 transition-all duration-300
                    ${isSelected 
                      ? "bg-[rgba(78,205,196,0.1)] border-[#4ecdc4]" 
                      : "border-white/10 hover:bg-white/[0.08] hover:translate-x-1"
                    }
                  `}
                  onClick={() => toggleOption(option.id)}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Checkbox */}
                  <div 
                    className={`
                      w-6 h-6 border-2 rounded-md flex items-center justify-center
                      transition-all duration-300
                      ${isSelected 
                        ? "bg-[#4ecdc4] border-[#4ecdc4]" 
                        : "border-white/30"
                      }
                    `}
                  >
                    {isSelected && (
                      <span className="text-black font-bold text-sm">✓</span>
                    )}
                  </div>
                  
                  <span className="text-white/90 text-sm sm:text-base">
                    {option.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Reveal Button */}
        <motion.button
          className="w-full sm:w-auto mx-auto block px-12 sm:px-16 py-4 sm:py-5 
                     text-lg sm:text-xl text-white rounded-full cursor-pointer
                     transition-all duration-300 hover:-translate-y-1"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
          }}
          onClick={() => onReveal(selectedIds)}
          whileHover={{ 
            boxShadow: "0 15px 40px rgba(102, 126, 234, 0.4)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          {buttonText}
        </motion.button>
      </div>
    </div>
  );
};
