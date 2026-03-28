'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { incrementCounter, getCounter } from '@/lib/firebase';
import { useAuth } from '@/components/Auth/AuthProvider';

function IncenseIcon() {
  // Three sticks fanning out slightly at top, converging at bottom (Chinese style)
  const rotations = [-10, 0, 10]; // degrees: left, center, right
  return (
    <div className="relative w-10 h-12 flex items-end justify-center">
      {rotations.map((rot, i) => (
        <div
          key={i}
          className="absolute bottom-0 flex flex-col items-center"
          style={{
            transform: `rotate(${rot}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Glowing tip */}
          <div className="w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_3px_1px_rgba(255,140,0,0.6)]" />
          {/* Stick */}
          <div className="w-[2px] h-7 bg-gradient-to-b from-amber-700 to-amber-900 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default function BurnIncense({ modelId }: { modelId: string }) {
  const t = useTranslations('interactions');
  const { requireAuth } = useAuth();
  const [count, setCount] = useState(0);
  const [smokeParticles, setSmokeParticles] = useState<number[]>([]);
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    getCounter(modelId, 'incense').then(setCount);
  }, [modelId]);

  const handleBurn = useCallback(async () => {
    if (!requireAuth()) return;
    const result = await incrementCounter(modelId, 'incense');
    if (result.error) {
      if (result.limited) setLimited(true);
      return;
    }
    setCount(result.count);

    const particles = Array.from({ length: 8 }, () => Date.now() + Math.random());
    setSmokeParticles((prev) => [...prev, ...particles]);
    setTimeout(() => setSmokeParticles((prev) => prev.filter((p) => !particles.includes(p))), 2500);
  }, [modelId, requireAuth]);

  return (
    <motion.button
      className="relative flex flex-col items-center gap-1 bg-black/20 hover:bg-black/30 border border-gray-700/50 hover:border-amber-500/30 rounded-lg p-3 transition-colors group overflow-hidden"
      whileTap={{ scale: 0.95 }}
      onClick={handleBurn}
    >
      <IncenseIcon />
      <span className="text-xs text-gray-400 group-hover:text-amber-400 transition-colors">
        {t('burnIncense')}
      </span>
      <span className="text-[10px] text-gray-600">
        {limited ? t('alreadyDone') : t('incenseBurned', { count })}
      </span>

      {/* Smoke particles */}
      <AnimatePresence>
        {smokeParticles.map((id) => (
          <motion.div
            key={id}
            className="absolute w-1 h-3 rounded-full bg-gray-400/30 pointer-events-none blur-[1px]"
            style={{
              left: `${35 + Math.random() * 30}%`,
              bottom: '65%',
            }}
            initial={{ opacity: 0.5, scale: 0.5 }}
            animate={{
              opacity: 0,
              y: -40 - Math.random() * 30,
              x: -8 + Math.random() * 16,
              scale: 1.5,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </motion.button>
  );
}
