'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { addEulogy, getEulogies, type Eulogy } from '@/lib/firebase';
import { useAuth } from '@/components/Auth/AuthProvider';

export default function WriteEulogy({ modelId }: { modelId: string }) {
  const t = useTranslations('interactions');
  const { user, requireAuth } = useAuth();
  const [text, setText] = useState('');
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);

  useEffect(() => {
    getEulogies(modelId, 50).then(setEulogies);
  }, [modelId]);

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    if (!requireAuth()) return;
    setSubmitting(true);

    const result = await addEulogy(modelId, text.trim(), replyTo ?? undefined);
    if (result.ok && result.eulogy) {
      setEulogies((prev) => [result.eulogy!, ...prev]);
    }

    setText('');
    setReplyTo(null);
    setSubmitting(false);
  };

  // Build 2-level structure: top-level + all descendants flat under root
  const eulogyMap = new Map<number, Eulogy>();
  for (const e of eulogies) {
    if (e.id != null) eulogyMap.set(e.id, e);
  }

  function findRoot(id: number): number | null {
    const e = eulogyMap.get(id);
    if (!e) return null;
    if (!e.parentId) return e.id!;
    return findRoot(e.parentId);
  }

  const topLevel: Eulogy[] = [];
  const repliesByRoot = new Map<number, Eulogy[]>();
  for (const e of [...eulogies].reverse()) {
    if (!e.parentId) {
      topLevel.push(e);
    } else {
      const rootId = findRoot(e.parentId);
      if (rootId != null) {
        const list = repliesByRoot.get(rootId) || [];
        list.push(e);
        repliesByRoot.set(rootId, list);
      }
    }
  }
  topLevel.reverse();

  const replyTarget = replyTo ? eulogyMap.get(replyTo) : null;

  return (
    <div className="space-y-3 pt-2">
      <h4 className="text-sm text-gray-400 font-medium">{t('writeEulogy')}</h4>

      {/* Reply indicator */}
      {replyTarget && (
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-black/20 rounded-lg px-3 py-1.5">
          <span>{t('replyingTo', { text: replyTarget.text.slice(0, 30) + (replyTarget.text.length > 30 ? '...' : '') })}</span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-gray-600 hover:text-gray-400 ml-auto"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 280))}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={replyTo ? t('replyPlaceholder') : t('eulogyPlaceholder')}
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

      {/* Eulogy list — 2 levels: top-level + flat replies */}
      <div className="space-y-2 max-h-60 overflow-y-auto">
        <AnimatePresence>
          {topLevel.map((eulogy, i) => {
            const replies = repliesByRoot.get(eulogy.id!) || [];
            return (
              <motion.div
                key={eulogy.id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {/* Top-level eulogy */}
                <div className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-400">
                  {eulogy.userEmail && (
                    <p className="text-[10px] text-cemetery-gold/60 mb-1">{eulogy.userEmail}</p>
                  )}
                  <p className="leading-relaxed">&ldquo;{eulogy.text}&rdquo;</p>
                  <div className="flex items-center justify-between mt-1">
                    {eulogy.createdAt && (
                      <p className="text-[10px] text-gray-600">
                        {new Date(eulogy.createdAt).toLocaleDateString()}
                      </p>
                    )}
                    {user && (
                      <button
                        onClick={() => setReplyTo(eulogy.id!)}
                        className="text-[10px] text-gray-600 hover:text-cemetery-gold transition-colors"
                      >
                        {t('reply')}
                      </button>
                    )}
                  </div>
                </div>
                {/* Flat replies */}
                {replies.map((reply, j) => {
                  const parentEulogy = reply.parentId ? eulogyMap.get(reply.parentId) : null;
                  return (
                    <div key={reply.id || j} className="ml-4 mt-1">
                      <div className="bg-black/20 rounded-lg px-3 py-2 text-sm text-gray-400">
                        <div className="flex items-center gap-1 flex-wrap text-[10px]">
                          {reply.userEmail && (
                            <span className="text-cemetery-gold/60">{reply.userEmail}</span>
                          )}
                          {parentEulogy?.userEmail && (
                            <>
                              <span className="text-gray-600">{t('reply')}</span>
                              <span className="text-cemetery-gold/40">{parentEulogy.userEmail}</span>
                            </>
                          )}
                        </div>
                        <p className="leading-relaxed mt-1">&ldquo;{reply.text}&rdquo;</p>
                        <div className="flex items-center justify-between mt-1">
                          {reply.createdAt && (
                            <p className="text-[10px] text-gray-600">
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </p>
                          )}
                          {user && (
                            <button
                              onClick={() => setReplyTo(reply.id!)}
                              className="text-[10px] text-gray-600 hover:text-cemetery-gold transition-colors"
                            >
                              {t('reply')}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
