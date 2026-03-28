'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type { AIModel } from '@/data/models';
import LightCandle from '../Interactions/LightCandle';
import PlaceFlowers from '../Interactions/PlaceFlowers';
import WriteEulogy from '../Interactions/WriteEulogy';
import PressF from '../Interactions/PressF';
import BurnIncense from '../Interactions/BurnIncense';

interface ModelDetailProps {
  model: AIModel;
  onClose: () => void;
}

function getDaysAlive(born: string, died: string): number {
  const b = new Date(born);
  const d = new Date(died);
  return Math.floor((d.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ModelDetail({ model, onClose }: ModelDetailProps) {
  const locale = useLocale();
  const t = useTranslations('model');
  const isZh = locale === 'zh';
  const days = getDaysAlive(model.born, model.died);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Modal content */}
        <motion.div
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-cemetery-navy to-cemetery-dark border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ✕
          </button>

          {/* Header section */}
          <div className="p-6 pb-4 text-center border-b border-gray-700/30">
            <div className="text-cemetery-gold/60 text-2xl mb-2 font-serif">✦</div>
            <div className="text-gray-500 text-xs tracking-[0.3em] font-serif mb-3">
              R.I.P.
            </div>
            <h2 className="font-serif text-2xl font-bold text-gray-100 mb-1">
              {isZh ? model.nameZh : model.name}
            </h2>
            <p className="text-sm text-gray-500">{model.company}</p>
          </div>

          {/* Info section */}
          <div className="p-6 space-y-4">
            {/* Epitaph */}
            <div className="text-center italic text-cemetery-gold/80 font-serif text-sm leading-relaxed px-4">
              &ldquo;{isZh ? model.epitaphZh : model.epitaph}&rdquo;
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">{t('born')}</div>
                <div className="text-gray-300">{model.born}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">{t('died')}</div>
                <div className="text-gray-300">{model.died}</div>
              </div>
              <div className="col-span-2 bg-black/20 rounded-lg p-3">
                <div className="text-gray-500 text-xs mb-1">{t('causeOfDeath')}</div>
                <div className="text-gray-300">
                  {isZh ? model.causeOfDeathZh : model.causeOfDeath}
                </div>
              </div>
            </div>

            {/* Lifespan */}
            <div className="text-center text-xs text-gray-500">
              {t('lifespan', { days })}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed">
              {isZh ? model.descriptionZh : model.description}
            </p>

            {/* Interaction buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <LightCandle modelId={model.id} />
              <PlaceFlowers modelId={model.id} />
              <PressF modelId={model.id} />
              <BurnIncense modelId={model.id} />
            </div>

            {/* Eulogy section */}
            <WriteEulogy modelId={model.id} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
