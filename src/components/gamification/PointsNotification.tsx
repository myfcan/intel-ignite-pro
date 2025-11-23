import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, TrendingUp } from 'lucide-react';

interface PointsNotificationProps {
  points: number;
  reason: string;
  show: boolean;
  onHide: () => void;
}

export function PointsNotification({ points, reason, show, onHide }: PointsNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.5 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="fixed top-20 right-4 z-[100] pointer-events-none"
        >
          <div className="bg-gradient-to-r from-pink-400 via-rose-300 to-pink-400 text-pink-900 px-6 py-4 rounded-2xl shadow-2xl border-2 border-pink-500/50">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Coins className="w-8 h-8 animate-bounce" />
                <TrendingUp className="w-4 h-4 absolute -top-1 -right-1 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">+{points} pts</div>
                <div className="text-sm font-medium opacity-90">{reason}</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
