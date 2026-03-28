'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export default function ShareButton({ modelName }: { modelName: string }) {
  const t = useTranslations('interactions');
  const [copied, setCopied] = useState(false);

  const shareText = t('shareText', { name: modelName });

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const fullText = `${shareText}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'AI Cemetery', text: shareText, url });
        return;
      } catch {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard failed
    }
  };

  return (
    <motion.button
      className="relative flex flex-col items-center gap-2 bg-black/20 hover:bg-black/30 border border-gray-700/50 hover:border-blue-500/30 rounded-lg p-3 transition-colors group"
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
    >
      <span className="text-2xl">🔗</span>
      <span className="text-xs text-gray-400 group-hover:text-blue-400 transition-colors">
        {copied ? '✓ Copied!' : t('share')}
      </span>
    </motion.button>
  );
}
