'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { addEulogy, getEulogies, type Eulogy } from '@/lib/firebase';

export default function WriteEulogy({ modelId }: { modelId: string }) {
  const t = useTranslations('interactions');
  const [text, setText] = useState('');
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getEulogies(modelId, 10).then(setEulogies);
  }, [modelId]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    await addEulogy(modelId, text.trim());

    // Add to local list
    setEulogies((prev) => [
      { modelId, text: text.trim(), createdAt: new Date() },
      ...prev,
    ]);
    setText('');
    setSubmitting(false);
  };

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-sm text-gray-400 font-medium">{t('writeEulogy')}</h4>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('eulogyPlaceholder')}
          className="flex-1 bg-black/30 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cemetery-gold/50 transition-colors"
        />
        <motion.button
          className="px-4 py-2 bg-cemetery-gold/20 hover:bg-cemetery-gold/30 border border-cemetery-gold/30 rounded-lg text-sm text-cemetery-gold transition-colors disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
        >
          {t('submitEulogy')}
        </motion.button>
      </div>

      {/* Eulogy list */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        <AnimatePresence>
          {eulogies.map((eulogy, i) => (
            <motion.div
              key={eulogy.id || i}
              className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-400"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <p className="leading-relaxed">&ldquo;{eulogy.text}&rdquo;</p>
              {eulogy.createdAt && (
                <p className="text-[10px] text-gray-600 mt-1">
                  {new Date(eulogy.createdAt).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
