// src/components/lessons/v7/V7FeedbackSystem.tsx
// Real-time visual feedback system for V7 lessons

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type FeedbackType = 'success' | 'error' | 'warning' | 'info' | 'achievement';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, null = persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

interface V7FeedbackSystemProps {
  messages: FeedbackMessage[];
  onDismiss?: (id: string) => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
}

// ============================================================================
// COMPONENT
// ============================================================================

export const V7FeedbackSystem = ({
  messages,
  onDismiss,
  position = 'top-right',
}: V7FeedbackSystemProps) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [visibleMessages, setVisibleMessages] = useState<FeedbackMessage[]>([]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setVisibleMessages(messages);

    // Auto-dismiss messages with duration
    messages.forEach((msg) => {
      if (msg.duration) {
        setTimeout(() => {
          handleDismiss(msg.id);
        }, msg.duration);
      }
    });
  }, [messages]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDismiss = (id: string) => {
    setVisibleMessages((prev) => prev.filter((msg) => msg.id !== id));
    if (onDismiss) {
      onDismiss(id);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getTypeConfig = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500/10 border-green-500/50',
          icon: <CheckCircle2 className="h-5 w-5 text-green-400" />,
          textColor: 'text-green-300',
          titleColor: 'text-green-200',
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/50',
          icon: <XCircle className="h-5 w-5 text-red-400" />,
          textColor: 'text-red-300',
          titleColor: 'text-red-200',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/50',
          icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
          textColor: 'text-yellow-300',
          titleColor: 'text-yellow-200',
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10 border-blue-500/50',
          icon: <Info className="h-5 w-5 text-blue-400" />,
          textColor: 'text-blue-300',
          titleColor: 'text-blue-200',
        };
      case 'achievement':
        return {
          bg: 'bg-purple-500/10 border-purple-500/50',
          icon: <Sparkles className="h-5 w-5 text-purple-400" />,
          textColor: 'text-purple-300',
          titleColor: 'text-purple-200',
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/50',
          icon: <Info className="h-5 w-5 text-gray-400" />,
          textColor: 'text-gray-300',
          titleColor: 'text-gray-200',
        };
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`fixed ${getPositionClasses()} z-50 space-y-2 max-w-md`}>
      <AnimatePresence>
        {visibleMessages.map((msg) => {
          const config = getTypeConfig(msg.type);

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`${config.bg} border backdrop-blur-md rounded-lg p-4 shadow-2xl`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {msg.icon || config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {msg.title && (
                    <h4 className={`font-semibold text-sm mb-1 ${config.titleColor}`}>
                      {msg.title}
                    </h4>
                  )}
                  <p className={`text-sm ${config.textColor}`}>{msg.message}</p>

                  {msg.action && (
                    <button
                      onClick={msg.action.onClick}
                      className={`mt-2 text-xs font-medium ${config.titleColor} hover:underline`}
                    >
                      {msg.action.label}
                    </button>
                  )}
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => handleDismiss(msg.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// FEEDBACK HOOK
// ============================================================================

export function useV7Feedback() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = (
    type: FeedbackType,
    message: string,
    options?: Partial<Omit<FeedbackMessage, 'id' | 'type' | 'message'>>
  ) => {
    const id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage: FeedbackMessage = {
      id,
      type,
      message,
      duration: 5000, // Default 5 seconds
      ...options,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const showSuccess = (message: string, options?: Partial<Omit<FeedbackMessage, 'id' | 'type' | 'message'>>) => {
    showFeedback('success', message, options);
  };

  const showError = (message: string, options?: Partial<Omit<FeedbackMessage, 'id' | 'type' | 'message'>>) => {
    showFeedback('error', message, options);
  };

  const showWarning = (message: string, options?: Partial<Omit<FeedbackMessage, 'id' | 'type' | 'message'>>) => {
    showFeedback('warning', message, options);
  };

  const showInfo = (message: string, options?: Partial<Omit<FeedbackMessage, 'id' | 'type' | 'message'>>) => {
    showFeedback('info', message, options);
  };

  const showAchievement = (message: string, options?: Partial<Omit<FeedbackMessage, 'id' | 'type' | 'message'>>) => {
    showFeedback('achievement', message, {
      title: '🏆 Achievement Unlocked!',
      duration: 7000,
      ...options,
    });
  };

  const dismissFeedback = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  const clearAll = () => {
    setMessages([]);
  };

  return {
    messages,
    showFeedback,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAchievement,
    dismissFeedback,
    clearAll,
  };
}

// ============================================================================
// INLINE FEEDBACK COMPONENT (for code editor)
// ============================================================================

interface InlineFeedbackProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  line?: number;
}

export const InlineFeedback = ({ message, type, line }: InlineFeedbackProps) => {
  const colors = {
    success: 'bg-green-500/20 border-green-500 text-green-300',
    error: 'bg-red-500/20 border-red-500 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500 text-blue-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${colors[type]} text-xs font-medium`}
    >
      {line && <span className="opacity-60">L{line}:</span>}
      <span>{message}</span>
    </motion.div>
  );
};

// ============================================================================
// PROGRESS FEEDBACK COMPONENT
// ============================================================================

interface ProgressFeedbackProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
}

export const ProgressFeedback = ({
  current,
  total,
  label = 'Progresso',
  showPercentage = true,
}: ProgressFeedbackProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-blue-400 font-medium">{percentage}%</span>
        )}
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{current} de {total}</span>
        <TrendingUp className="h-3 w-3" />
      </div>
    </div>
  );
};
