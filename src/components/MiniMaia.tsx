import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MiniMaiaProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export const MiniMaia = ({ 
  message, 
  onClose, 
  autoClose = false,
  autoCloseDelay = 5000 
}: MiniMaiaProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    }
  };

  if (autoClose) {
    setTimeout(handleClose, autoCloseDelay);
  }

  if (!isVisible) return null;

  return (
    <div className="mini-maia-container animate-fadeIn">
      <div className="mini-maia-card">
        {onClose && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        )}

        <div className="flex flex-col items-center gap-4 p-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse" />
            
            <div className="relative w-40 h-40 md:w-48 md:h-48 animate-float">
              <img
                src="/maia-avatar.png"
                alt="MAIA - Assistente IA"
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="relative bg-white rounded-2xl shadow-lg p-5 max-w-md">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-white" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <p className="text-sm font-semibold text-gray-700">
                  Olá! Eu sou a MAIA
                </p>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <Button
            onClick={handleClose}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
          >
            Entendi, vamos lá! →
          </Button>
        </div>
      </div>
    </div>
  );
};
