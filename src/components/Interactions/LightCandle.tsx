'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { incrementCounter, getCounter } from '@/lib/firebase';
import { useAuth } from '@/components/Auth/AuthProvider';

export default function LightCandle({ modelId }: { modelId: string }) {
  const t = useTranslations('interactions');
  const { requireAuth } = useAuth();
  const [count, setCount] = useState(0);
  const [particles, setParticles] = useState<number[]>([]);
  const [isLit, setIsLit] = useState(false);
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    getCounter(modelId, 'candles').then(setCount);
  }, [modelId]);

  const handleLight = useCallback(async () => {
    if (!requireAuth()) return;
    setIsLit(true);
    const result = await incrementCounter(modelId, 'candles');
    if (result.error) {
      if (result.limited) setLimited(true);
      return;
    }
    setCount(result.count);

    const newParticles = Array.from({ length: 6 }, () => Date.now() + Math.random());
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => !newParticles.includes(p))), 2000);
  }, [modelId, requireAuth]);

  return (
    <motion.button
      className="relative flex flex-col items-center gap-2 bg-black/20 hover:bg-black/30 border border-gray-700/50 hover:border-cemetery-flame/30 rounded-lg p-3 transition-colors group"
      whileTap={{ scale: 0.95 }}
      onClick={handleLight}
    >
      <div className="relative text-2xl">
        🕯️
        <AnimatePresence>
          {isLit && (
            <motion.div
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className="candle-flame" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="text-xs text-gray-400 group-hover:text-cemetery-flame transition-colors">
        {t('lightCandle')}
      </span>

      <span className="text-[10px] text-gray-600">
        {limited ? t('alreadyDone') : t('candleLit', { count })}
      </span>

      <AnimatePresence>
        {particles.map((id) => (
          <motion.div
            key={id}
            className="particle"
            style={{
              left: `${40 + Math.random() * 20}%`,
              bottom: '60%',
              ['--drift' as string]: `${-15 + Math.random() * 30}px`,
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0, y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
