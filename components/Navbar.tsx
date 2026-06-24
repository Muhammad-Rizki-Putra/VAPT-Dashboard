"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { Language } from '@/lib/i18n';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const toggleLang = () => setLang(lang === 'id' ? 'en' : 'id' as Language);

  return (
    <header className="h-16 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-300">
      <h1 className="text-lg font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
        {t.appTitle}{' '}
        <span className="text-blue-600 dark:text-red-500 font-semibold">
          - {t.appSubtitle}
        </span>
      </h1>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 border-r border-slate-200 dark:border-zinc-700 pr-4">

          {/* Language toggle */}
          {mounted && (
            <button
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-md text-xs font-bold border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
            >
              {lang === 'id' ? 'ID' : 'EN'}
            </button>
          )}

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors focus:outline-none cursor-pointer"
              title={t.toggleTheme}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>

        {/* User avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-red-900/50 border border-blue-200 dark:border-red-800 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-red-400 cursor-pointer transition-colors">
          OP
        </div>
      </div>
    </header>
  );
}
