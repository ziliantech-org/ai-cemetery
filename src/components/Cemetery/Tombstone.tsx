'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { AIModel } from '@/data/models';

interface TombstoneProps {
  model: AIModel;
  onClick: () => void;
}

function getDaysAlive(born: string, died: string): number {
  const b = new Date(born);
  const d = new Date(died);
  return Math.floor((d.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function Tombstone({ model, onClick }: TombstoneProps) {
  const locale = useLocale();
  const t = useTranslations('model');
  const days = getDaysAlive(model.born, model.died);
  const isZh = locale === 'zh';

  return (
    <motion.div
      className="tombstone-glow cursor-pointer group relative"
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {/* Tombstone shape */}
      <div className="relative w-36 md:w-44">
        {/* Stone body */}
        <div className="bg-gradient-to-b from-[#4a4a5a] via-[#3a3a4a] to-[#2a2a3a] rounded-t-[50%] rounded-b-none p-4 pt-8 pb-6 border border-gray-700/50 shadow-lg shadow-black/50">
          {/* Cross or symbol */}
          <div className="text-center text-cemetery-gold/60 text-lg mb-2 font-serif">
            ✦
          </div>

          {/* R.I.P. */}
          <div className="text-center text-gray-400/80 text-[10px] tracking-[0.3em] font-serif mb-2">
            R.I.P.
          </div>

          {/* Model name */}
          <div className="text-center font-serif text-sm font-bold text-gray-200 leading-tight mb-2">
            {isZh ? model.nameZh : model.name}
          </div>

          {/* Dates */}
          <div className="text-center text-[10px] text-gray-500 mb-1">
            {model.born.slice(0, 4)} — {model.died.slice(0, 4)}
          </div>

          {/* Days alive */}
          <div className="text-center text-[9px] text-cemetery-gold/50">
            {t('lifespan', { days })}
          </div>
        </div>

        {/* Base */}
        <div className="bg-gradient-to-b from-[#2a2a3a] to-[#1a1a2a] h-3 rounded-b-sm border-t border-gray-600/30" />

        {/* Ground shadow */}
        <div className="h-2 bg-gradient-to-t from-transparent to-black/20 rounded-full mx-2 -mt-1" />

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-t-[50%] bg-cemetery-gold/0 group-hover:bg-cemetery-gold/5 transition-colors duration-500" />
      </div>

      {/* Company label */}
      <div className="text-center mt-2 text-[10px] text-gray-600 group-hover:text-gray-400 transition-colors">
        {model.company}
      </div>
    </motion.div>
  );
}
