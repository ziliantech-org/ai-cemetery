'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { models, type AIModel } from '@/data/models';
import Tombstone from './Tombstone';
import FogEffect from './FogEffect';
import MoonLight from './MoonLight';

interface CemeterySceneProps {
  onSelectModel: (model: AIModel) => void;
}

export default function CemeteryScene({ onSelectModel }: CemeterySceneProps) {
  const t = useTranslations('cemetery');
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // For mobile: vertical scroll. For desktop: horizontal scroll via wheel.
  useEffect(() => {
    if (isMobile) return;
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="relative min-h-screen pt-24 pb-16" ref={containerRef}>
        {/* Background layers */}
        <div className="fixed inset-0 bg-gradient-to-b from-cemetery-bg via-cemetery-navy to-cemetery-dark z-0" />
        <MoonLight />
        <FogEffect />

        {/* Ground gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0d1a0d] via-[#0d150d] to-transparent z-[1]" />

        {/* Tombstones vertical grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4 px-4 mt-8">
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Tombstone model={model} onClick={() => onSelectModel(model)} />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: horizontal scrolling cemetery
  return (
    <div className="relative h-screen overflow-hidden" ref={containerRef}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d1a] via-cemetery-navy to-cemetery-dark z-0" />
      <MoonLight />
      <FogEffect />

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-[#0d1a0d] via-[#111a11] to-transparent z-[1]" />

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden z-10 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        <div
          className="h-full flex items-end pb-[15%] px-16 gap-12"
          style={{ width: `${Math.max(100, models.length * 14)}vw` }}
        >
          {/* Entry text */}
          <motion.div
            className="flex-shrink-0 flex flex-col items-center justify-center h-full ml-[20vw] mr-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <p className="text-gray-500 text-sm tracking-widest animate-pulse">
              {t('enterPrompt')}
            </p>
          </motion.div>

          {/* Tombstones */}
          {models.map((model, index) => (
            <motion.div
              key={model.id}
              className="flex-shrink-0"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.8 + index * 0.12,
                ease: 'easeOut',
              }}
            >
              <Tombstone model={model} onClick={() => onSelectModel(model)} />
            </motion.div>
          ))}

          {/* End spacer */}
          <div className="flex-shrink-0 w-[20vw]" />
        </div>
      </div>

      {/* Scroll hint overlay */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <motion.span
            animate={{ x: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ←
          </motion.span>
          <span>{t('enterPrompt')}</span>
          <motion.span
            animate={{ x: [5, -5, 5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            →
          </motion.span>
        </div>
      </motion.div>
    </div>
  );
}
