"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Menghindari Hydration Mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors duration-300">
      <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
        VAPT Otonom <span className="text-blue-600 dark:text-blue-500 font-semibold">- Multi Agentic AI</span>
      </h1>
      
      <div className="flex items-center space-x-4">
        {/* Container untuk Actions (Bisa ditambah tombol bahasa di sini nanti) */}
        <div className="flex items-center space-x-2 border-r border-slate-200 dark:border-slate-700 pr-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors focus:outline-none cursor-pointer"
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>

        {/* Placeholder User/Profile */}
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400 cursor-pointer transition-colors">
          OP
        </div>
      </div>
    </header>
  );
}