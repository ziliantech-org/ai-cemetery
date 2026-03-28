'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { incrementCounter, getCounter } from '@/lib/firebase';
import { useAuth } from '@/components/Auth/AuthProvider';

export default function PressF({ modelId }: { modelId: string }) {
  const t = useTranslations('interactions');
  const { user, requireAuth } = useAuth();
  const [count, setCount] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [showF, setShowF] = useState(false);
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    getCounter(modelId, 'respects').then(setCount);
  }, [modelId]);

  const handlePressF = useCallback(async () => {
    if (!requireAuth()) return;
    setShowFlash(true);
    setShowF(true);
    const result = await incrementCounter(modelId, 'respects');
    if (result.error) {
      if (result.limited) setLimited(true);
    } else {
      setCount(result.count);
    }

    setTimeout(() => setShowFlash(false), 600);
    setTimeout(() => setShowF(false), 1500);
  }, [modelId, requireAuth]);

  // Listen for 'F' key press (only if logged in)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (!user) return;
        handlePressF();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [user, handlePressF]);

  return (
    <motion.button
      className="relative flex flex-col items-center gap-2 bg-black/20 hover:bg-black/30 border border-gray-700/50 hover:border-cemetery-gold/30 rounded-lg p-3 transition-colors group"
      whileTap={{ scale: 0.95 }}
      onClick={handlePressF}
    >
      <span className="text-2xl">🙇</span>
      <span className="text-xs text-gray-400 group-hover:text-cemetery-gold transition-colors">
        {t('pressF')}
      </span>
      <span className="text-[10px] text-gray-600">
        {limited ? t('alreadyDone') : t('respectsPaid', { count })}
      </span>

      <AnimatePresence>
        {showF && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-4xl font-bold text-cemetery-gold/60">F</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="fixed inset-0 bg-white pointer-events-none z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}
