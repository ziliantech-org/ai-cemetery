'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { sendCode, verifyCode } from '@/lib/firebase';
import type { AuthUser } from '@/lib/firebase';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const t = useTranslations('auth');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!email.trim() || loading) return;
    setError('');
    setLoading(true);

    const result = await sendCode(email.trim());
    setLoading(false);

    if (!result.ok) {
      setError(result.error || t('sendFailed'));
      return;
    }

    setStep('code');
    startCountdown();

    // Dev mode: auto-fill the code
    if (result.devCode) {
      setCode(result.devCode);
    }
  };

  const handleVerify = async () => {
    if (!code.trim() || loading) return;
    setError('');
    setLoading(true);

    const result = await verifyCode(email.trim(), code.trim());
    setLoading(false);

    if (!result.ok) {
      setError(result.error || t('invalidCode'));
      return;
    }

    if (result.user) {
      onSuccess(result.user);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    await sendCode(email.trim());
    setLoading(false);
    startCountdown();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="relative w-full max-w-sm bg-gradient-to-b from-cemetery-navy to-cemetery-dark border border-gray-700/50 rounded-xl shadow-2xl shadow-black/50 p-6"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
          >
            ✕
          </button>

          <div className="text-center mb-6">
            <div className="text-2xl mb-2">🪦</div>
            <h3 className="font-serif text-lg text-cemetery-gold">{t('title')}</h3>
            <p className="text-xs text-gray-500 mt-1">{t('subtitle')}</p>
          </div>

          {step === 'email' ? (
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                placeholder={t('emailPlaceholder')}
                className="w-full bg-black/30 border border-gray-700/50 rounded-lg px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cemetery-gold/50 transition-colors"
                autoFocus
              />
              <motion.button
                className="w-full py-3 bg-cemetery-gold/20 hover:bg-cemetery-gold/30 border border-cemetery-gold/30 rounded-lg text-sm text-cemetery-gold transition-colors disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
                onClick={handleSendCode}
                disabled={!email.trim() || loading}
              >
                {loading ? t('sending') : t('sendCode')}
              </motion.button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-gray-400 text-center">
                {t('codeSentTo', { email: email })}
              </p>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder={t('codePlaceholder')}
                className="w-full bg-black/30 border border-gray-700/50 rounded-lg px-4 py-3 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-cemetery-gold/50 transition-colors text-center tracking-[0.5em] text-lg"
                maxLength={6}
                autoFocus
              />
              <motion.button
                className="w-full py-3 bg-cemetery-gold/20 hover:bg-cemetery-gold/30 border border-cemetery-gold/30 rounded-lg text-sm text-cemetery-gold transition-colors disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
                onClick={handleVerify}
                disabled={code.length < 6 || loading}
              >
                {loading ? t('verifying') : t('verify')}
              </motion.button>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || loading}
                className="w-full text-xs text-gray-500 hover:text-gray-400 disabled:text-gray-700 transition-colors"
              >
                {countdown > 0
                  ? t('resendIn', { seconds: countdown })
                  : t('resendCode')}
              </button>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 text-center mt-3">{error}</p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
