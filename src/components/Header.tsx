'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/components/Auth/AuthProvider';

export default function Header() {
  const t = useTranslations('site');
  const tTimeline = useTranslations('timeline');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === 'en' ? 'zh' : 'en';
  const isTimeline = pathname === '/timeline';
  const { user, loading, login, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-cemetery-bg via-cemetery-bg/95 to-transparent">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl">🪦</span>
          <div>
            <h1 className="font-serif text-xl font-bold text-cemetery-gold group-hover:text-white transition-colors">
              {t('title')}
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">{t('subtitle')}</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {isTimeline ? (
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-cemetery-gold transition-colors"
            >
              {tTimeline('viewCemetery')}
            </Link>
          ) : (
            <Link
              href="/timeline"
              className="text-sm text-gray-400 hover:text-cemetery-gold transition-colors"
            >
              {tTimeline('viewTimeline')}
            </Link>
          )}

          <Link
            href={pathname}
            locale={otherLocale}
            className="px-3 py-1.5 text-sm border border-gray-700 rounded-md text-gray-400 hover:text-cemetery-gold hover:border-cemetery-gold transition-colors"
          >
            {t('language')}
          </Link>

          {!loading && (
            user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-cemetery-gold transition-colors"
                >
                  {user.email}
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-cemetery-bg border border-gray-700 rounded-md shadow-lg min-w-[120px] py-1 z-50">
                    <button
                      onClick={() => { logout(); setShowMenu(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-cemetery-gold hover:bg-white/5 transition-colors"
                    >
                      {tAuth('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                className="px-3 py-1.5 text-sm border border-cemetery-gold/30 rounded-md text-cemetery-gold/70 hover:text-cemetery-gold hover:border-cemetery-gold transition-colors"
              >
                {tAuth('loginPrompt')}
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
