'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { incrementCounter, getCounter } from '@/lib/firebase';
import { useAuth } from '@/components/Auth/AuthProvider';

const flowerEmojis = ['🌹', '🌺', '🌸', '💐', '🌻', '🌷'];

export default function PlaceFlowers({ modelId }: { modelId: string }) {
  const t = useTranslations('interactions');
  const { requireAuth } = useAuth();
  const [count, setCount] = useState(0);
  const [floatingFlowers, setFloatingFlowers] = useState<{ id: number; emoji: string }[]>([]);
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    getCounter(modelId, 'flowers').then(setCount);
  }, [modelId]);

  const handlePlace = useCallback(async () => {
    if (!requireAuth()) return;
    const result = await incrementCounter(modelId, 'flowers');
    if (result.error) {
      if (result.limited) setLimited(true);
      return;
    }
    setCount(result.count);

    const flower = {
      id: Date.now(),
      emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
    };
    setFloatingFlowers((prev) => [...prev, flower]);
    setTimeout(() => {
      setFloatingFlowers((prev) => prev.filter((f) => f.id !== flower.id));
    }, 2000);
  }, [modelId, requireAuth]);

  return (
    <motion.button
      className="relative flex flex-col items-center gap-2 bg-black/20 hover:bg-black/30 border border-gray-700/50 hover:border-pink-500/30 rounded-lg p-3 transition-colors group overflow-hidden"
      whileTap={{ scale: 0.95 }}
      onClick={handlePlace}
    >
      <span className="text-2xl">💐</span>
      <span className="text-xs text-gray-400 group-hover:text-pink-400 transition-colors">
        {t('placeFlowers')}
      </span>
      <span className="text-[10px] text-gray-600">
        {limited ? t('alreadyDone') : t('flowersPlaced', { count })}
      </span>

      <AnimatePresence>
        {floatingFlowers.map((flower) => (
          <motion.div
            key={flower.id}
            className="absolute text-lg pointer-events-none"
            style={{ left: `${20 + Math.random() * 60}%` }}
            initial={{ y: 0, opacity: 1, bottom: '50%' }}
            animate={{
              y: -80,
              opacity: 0,
              rotate: 15 - Math.random() * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
          >
            {flower.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
