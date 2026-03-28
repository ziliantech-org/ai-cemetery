'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { incrementGlobalVisitors } from '@/lib/firebase';

export default function GlobalCounter() {
  const t = useTranslations('site');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    incrementGlobalVisitors().then(setCount);
  }, []);

  if (count === null) return null;

  return (
    <div className="text-center text-gray-600 text-xs tracking-wider">
      {t('visitors', { count: count.toLocaleString() })}
    </div>
  );
}
