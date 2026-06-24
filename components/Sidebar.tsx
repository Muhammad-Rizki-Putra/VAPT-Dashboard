"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutDashboard,
  Menu,
  PlusCircle,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useLang();
  const pathname = usePathname();

  const [openGroup, setOpenGroup] = useState<string | null>('testing');

  const toggleGroup = (id: string) => {
    setOpenGroup(prev => (prev === id ? null : id));
  };

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (hrefs: string[]) => hrefs.some(h => pathname.startsWith(h));

  const navItemCls = (active: boolean) =>
    `flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer text-sm font-medium ${
      active
        ? 'bg-blue-600 dark:bg-red-500 text-white'
        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100'
    }`;

  return (
    <aside
      className={`bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 flex flex-col h-screen fixed z-20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[70px]' : 'w-64'
      }`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200 dark:border-zinc-800">
        <div
          onClick={() => isCollapsed && setIsCollapsed(false)}
          className={`flex items-center overflow-hidden transition-all duration-300 group/logo ${
            isCollapsed ? 'cursor-pointer w-full justify-center' : 'gap-2 cursor-default'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : undefined}
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            <Image
              src="/ares-logo-01_result.webp"
              alt="Logo"
              width={80}
              height={32}
              className={`object-contain transition-all duration-300 ${
                isCollapsed ? 'w-12 group-hover/logo:opacity-0' : 'w-12'
              }`}
              priority
            />
            
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCollapsed ? 'opacity-0 group-hover/logo:opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <ChevronRight size={22} className="text-slate-500 dark:text-zinc-400 group-hover/logo:text-blue-600 dark:group-hover/logo:text-red-400" />
            </div>
          </div>
          
          {/* PERBAIKAN 1: Hapus class 'hidden'. Gunakan max-w dan min-w untuk mencegah reflow 4 baris */}
          <div
            className={`flex flex-col leading-tight overflow-hidden transition-all duration-300 ${
              isCollapsed ? 'max-w-0 opacity-0' : 'max-w-[120px] opacity-100'
            }`}
          >
            <span className="text-[11px] font-bold text-blue-600 dark:text-red-400 whitespace-nowrap tracking-wide uppercase">
              ARES
            </span>
            <span className="text-[9px] text-slate-400 dark:text-zinc-500 min-w-[110px]">
              Autonomous Red-team Evaluation System
            </span>
          </div>
        </div>

        {/* Tombol Collapse diubah ke opacity dan width animation untuk mencegah lompatan */}
        <button
          onClick={() => setIsCollapsed(true)}
          className={`p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-red-500 transition-all duration-300 flex-shrink-0 ${
            isCollapsed ? 'w-0 p-0 opacity-0 overflow-hidden ml-0' : 'w-8 opacity-100 ml-1'
          }`}
          title="Collapse"
        >
          <ChevronLeft size={18} className="flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-hidden">
        {/* Dashboard */}
        <Link href="/" title={isCollapsed ? t.nav.dashboard : undefined}>
          <div className={navItemCls(isActive('/'))}>
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              <LayoutDashboard size={18} />
            </div>
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[160px] opacity-100'
              }`}
            >
              {t.nav.dashboard}
            </span>
          </div>
        </Link>

        {/* Testing */}
        <div>
          <button
            onClick={() => {
              if (isCollapsed) {
                setIsCollapsed(false);
                setOpenGroup('testing');
              } else {
                toggleGroup('testing');
              }
            }}
            title={isCollapsed ? t.nav.testingGroup : undefined}
            className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium overflow-hidden ${
              isGroupActive(['/test'])
                ? openGroup === 'testing'
                  ? 'text-blue-600 dark:text-red-400 bg-blue-50 dark:bg-red-900/10'
                  : 'text-blue-600 dark:text-red-400'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100'
            }`}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              <Menu size={18} />
            </div>

            <span
              className={`whitespace-nowrap overflow-hidden flex-1 text-left transition-all duration-300 ${
                isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100 ml-3'
              }`}
            >
              {t.nav.testingGroup}
            </span>

            {/* PERBAIKAN 2: Hilangkan render kondisional (&&). Gunakan transisi w-0 dan opacity-0 */}
            <ChevronDown
              size={14}
              className={`flex-shrink-0 transition-all duration-300 ${
                openGroup === 'testing' ? 'rotate-180' : ''
              } ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-4 opacity-100 ml-1'}`}
            />
          </button>

          {/* Sub-items (accordion body) */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              !isCollapsed && openGroup === 'testing'
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-1 pl-4 space-y-1">
                <Link href="/test/new">
                  <div className={navItemCls(isActive('/test/new'))}>
                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      <PlusCircle size={16} />
                    </div>
                    <span className="ml-3 whitespace-nowrap overflow-hidden">{t.nav.newScan}</span>
                  </div>
                </Link>
                <Link href="/test/history">
                  <div className={navItemCls(isActive('/test/history'))}>
                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      <History size={16} />
                    </div>
                    <span className="ml-3 whitespace-nowrap overflow-hidden">{t.nav.history}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* PERBAIKAN 3: Ganti render kondisional ke CSS max-height dan opacity */}
          <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1 pt-1">
              <Link href="/test/new" title={t.nav.newScan}>
                <div className={navItemCls(isActive('/test/new'))}>
                  <div className="flex items-center justify-center w-5 h-5 mx-auto flex-shrink-0">
                    <PlusCircle size={16} />
                  </div>
                </div>
              </Link>
              <Link href="/test/history" title={t.nav.history}>
                <div className={navItemCls(isActive('/test/history'))}>
                  <div className="flex items-center justify-center w-5 h-5 mx-auto flex-shrink-0">
                    <History size={16} />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}