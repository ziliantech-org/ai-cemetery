'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { getModelsByYear, type AIModel } from '@/data/models';

interface TimelineViewProps {
  onSelectModel: (model: AIModel) => void;
}

export default function TimelineView({ onSelectModel }: TimelineViewProps) {
  const t = useTranslations('timeline');
  const locale = useLocale();
  const isZh = locale === 'zh';
  const modelsByYear = getModelsByYear();
  const years = Object.keys(modelsByYear).sort().reverse();

  return (
    <div className="max-w-3xl mx-auto px-4 pt-28 pb-20">
      {/* Title */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-100 mb-3">
          {t('title')}
        </h1>
        <p className="text-gray-500 text-sm">{t('subtitle')}</p>
      </motion.div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-cemetery-gold/30 via-gray-700 to-transparent" />

        {years.map((year, yearIndex) => (
          <div key={year} className="mb-12">
            {/* Year marker */}
            <motion.div
              className="relative flex items-center mb-6"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: yearIndex * 0.1 }}
            >
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cemetery-gold border-2 border-cemetery-bg z-10" />
              <div className="ml-16 md:ml-0 md:absolute md:left-1/2 md:translate-x-6">
                <span className="font-serif text-xl font-bold text-cemetery-gold">
                  {year}
                </span>
              </div>
            </motion.div>

            {/* Models in this year */}
            {modelsByYear[year].map((model, modelIndex) => (
              <motion.div
                key={model.id}
                className="relative pl-16 md:pl-0 mb-4 cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: yearIndex * 0.05 + modelIndex * 0.08,
                }}
                onClick={() => onSelectModel(model)}
              >
                {/* Dot on timeline */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-3 w-2.5 h-2.5 rounded-full bg-gray-600 group-hover:bg-cemetery-gold transition-colors z-10" />

                {/* Card — alternate left/right on desktop */}
                <div
                  className={`md:w-[calc(50%-2rem)] ${
                    modelIndex % 2 === 0
                      ? 'md:ml-[calc(50%+2rem)]'
                      : 'md:mr-[calc(50%+2rem)]'
                  }`}
                >
                  <div className="bg-cemetery-navy/50 border border-gray-700/30 rounded-lg p-4 hover:border-cemetery-gold/30 hover:bg-cemetery-navy/80 transition-all group-hover:shadow-lg group-hover:shadow-cemetery-gold/5">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-serif font-bold text-gray-200 group-hover:text-cemetery-gold transition-colors">
                        {isZh ? model.nameZh : model.name}
                      </h3>
                      <span className="text-xs text-gray-600 ml-2 flex-shrink-0">
                        {model.company}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      {model.born} → {model.died}
                    </p>
                    <p className="text-sm text-gray-400 italic font-serif">
                      &ldquo;{isZh ? model.epitaphZh : model.epitaph}&rdquo;
                    </p>
                    <p className="text-xs text-cemetery-flame/60 mt-2">
                      {isZh ? model.causeOfDeathZh : model.causeOfDeath}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
