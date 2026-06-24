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
  ShieldCheck,
} from "lucide-react";
import { useLang } from "@/context/LanguageContext";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const { t } = useLang();
  const pathname = usePathname();

  // Accordion: only one group open at a time
  const [openGroup, setOpenGroup] = useState<string | null>('testing');

  const toggleGroup = (id: string) => {
    setOpenGroup(prev => (prev === id ? null : id));
  };

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (hrefs: string[]) => hrefs.some(h => pathname.startsWith(h));

  const navItemCls = (active: boolean) =>
    `flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer text-sm font-medium ${
      active
        ? 'bg-blue-600 dark:bg-blue-500 text-white'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  return (
    <aside
      className={`bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed z-20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[70px]' : 'w-64'
      }`}
    >
      {/* Logo + Toggle */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-800">
        <div
          className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'w-0 opacity-0' : 'w-44 opacity-100'
          }`}
        >
          <Image
            src="/toyota_logo.png"
            alt="Toyota Logo"
            width={80}
            height={32}
            className="object-contain flex-shrink-0"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap tracking-wide uppercase">
              ARES
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Autonomous Red-team Evaluation System
            </span>
          </div>
        </div>

        {/* Collapsed: show shield icon as logo placeholder */}
        {isCollapsed && (
          <div className="flex items-center justify-center w-8 h-8 mx-auto">
            <ShieldCheck size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-hidden">

        {/* Dashboard — single direct link */}
        <Link href="/" title={isCollapsed ? t.nav.dashboard : undefined}>
          <div className={navItemCls(isActive('/'))}>
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              <LayoutDashboard size={18} />
            </div>
            <span
              className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-200 ${
                isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[160px] opacity-100'
              }`}
            >
              {t.nav.dashboard}
            </span>
          </div>
        </Link>

        {/* Testing — accordion group */}
        <div>
          {/* Group header */}
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
            className={`w-full flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
              isGroupActive(['/test'])
                ? openGroup === 'testing'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10'
                  : 'text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
              <Menu size={18} />
            </div>

            <span
              className={`ml-3 whitespace-nowrap overflow-hidden flex-1 text-left transition-all duration-200 ${
                isCollapsed ? 'max-w-0 opacity-0 ml-0' : 'max-w-[120px] opacity-100'
              }`}
            >
              {t.nav.testingGroup}
            </span>

            {!isCollapsed && (
              <ChevronDown
                size={14}
                className={`flex-shrink-0 transition-transform duration-200 ${
                  openGroup === 'testing' ? 'rotate-180' : ''
                }`}
              />
            )}
          </button>

          {/* Sub-items (accordion body) */}
          <div
            className={`grid transition-all duration-200 ease-in-out ${
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
                    <span className="ml-3 whitespace-nowrap">{t.nav.newScan}</span>
                  </div>
                </Link>
                <Link href="/test/history">
                  <div className={navItemCls(isActive('/test/history'))}>
                    <div className="flex-shrink-0 flex items-center justify-center w-5 h-5">
                      <History size={16} />
                    </div>
                    <span className="ml-3 whitespace-nowrap">{t.nav.history}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Collapsed mode: show individual icons for quick access */}
          {isCollapsed && (
            <div className="space-y-1 pt-1">
              <Link href="/test/new" title={t.nav.newScan}>
                <div className={navItemCls(isActive('/test/new'))}>
                  <div className="flex items-center justify-center w-5 h-5 mx-auto">
                    <PlusCircle size={16} />
                  </div>
                </div>
              </Link>
              <Link href="/test/history" title={t.nav.history}>
                <div className={navItemCls(isActive('/test/history'))}>
                  <div className="flex items-center justify-center w-5 h-5 mx-auto">
                    <History size={16} />
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
