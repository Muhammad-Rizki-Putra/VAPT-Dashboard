"use client";

import Link from "next/link";
import { PlusCircle, History, ShieldCheck } from "lucide-react";
import { useLang } from "@/context/LanguageContext";

export default function Home() {
  const { t } = useLang();

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-12 transition-colors duration-300">

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600/10 dark:bg-red-500/10 p-4 rounded-full transition-colors duration-300">
            <ShieldCheck size={64} className="text-blue-600 dark:text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-zinc-100 tracking-tight transition-colors duration-300">
          {t.appTitle}{' '}
          <span className="text-blue-600 dark:text-red-500">{t.appSubtitle}</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto transition-colors duration-300">
          {t.home.heroDesc}
        </p>
      </div>

      {/* Action Portal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">

        <Link href="/test/new" className="group">
          <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 p-8 rounded-xl hover:border-blue-600 dark:hover:border-red-500 hover:shadow-md dark:hover:shadow-red-900/20 transition-all duration-300 h-full flex flex-col items-center text-center space-y-4">
            <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-red-500 group-hover:text-white dark:group-hover:text-zinc-950 transition-colors duration-300 text-slate-600 dark:text-zinc-400">
              <PlusCircle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2 transition-colors duration-300">
                {t.home.newTestTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 transition-colors duration-300">
                {t.home.newTestDesc}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/test/history" className="group">
          <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 p-8 rounded-xl hover:border-blue-600 dark:hover:border-red-500 hover:shadow-md dark:hover:shadow-red-900/20 transition-all duration-300 h-full flex flex-col items-center text-center space-y-4">
            <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-red-500 group-hover:text-white dark:group-hover:text-zinc-950 transition-colors duration-300 text-slate-600 dark:text-zinc-400">
              <History size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-2 transition-colors duration-300">
                {t.home.historyTitle}
              </h2>
              <p className="text-sm text-slate-500 dark:text-zinc-400 transition-colors duration-300">
                {t.home.historyDesc}
              </p>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
