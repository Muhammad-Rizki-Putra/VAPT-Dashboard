"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react"; // Tambahkan useEffect, useState
import { useTheme } from "next-themes"; // Tambahkan ini (pastikan sudah instal 'next-themes')
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
  
  // Logika untuk mendeteksi tema dan menghindari kesalahan hidrasi
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect untuk memastikan komponen dimuat di sisi klien sebelum memeriksa tema
  useEffect(() => {
    setMounted(true);
  }, []);

  const [openGroup, setOpenGroup] = useState<string | null>('testing');

  const toggleGroup = (id: string) => {
    setOpenGroup(prev => (prev === id ? null : id));
  };

  const isActive = (href: string) => pathname === href;
  const isGroupActive = (hrefs: string[]) => hrefs.some(h => pathname.startsWith(h));

  const navItemCls = (active: boolean) =>
    `flex items-center px-3 py-2.5 rounded-md transition-colors group cursor-pointer text-sm font-medium ${
      active
        ? 'bg-red-600 dark:bg-blue-500 text-white'
        : 'text-zinc-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800/60 hover:text-zinc-900 dark:hover:text-slate-100'
    }`;

  // Tentukan gambar logo berdasarkan tema yang terdeteksi
  const currentTheme = mounted ? (resolvedTheme || theme) : 'light';
  const logoSrc = currentTheme === 'dark' ? '/ares-logo-blue_result.webp' : '/ares-logo-black_result.webp';

  return (
    <aside
      className={`bg-white dark:bg-slate-950 border-r border-zinc-200 dark:border-slate-800 flex flex-col h-screen fixed z-20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[70px]' : 'w-64'
      }`}
    >
      {/* BAGIAN ATAS: Logo Merk */}
      <div className="h-16 flex items-center justify-between border-b border-zinc-200 dark:border-slate-800">
        <div
          onClick={() => isCollapsed && setIsCollapsed(false)}
          className={`flex items-center overflow-hidden transition-all duration-300 group/logo ${
            isCollapsed ? 'cursor-pointer w-full justify-center' : 'gap-2 cursor-default'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : undefined}
        >
          <div className="relative flex items-center justify-center flex-shrink-0">
            <Image
              src="/toyota_logo.png"
              alt="Brand Logo"
              width={120}
              height={40}
              className={`object-contain transition-all duration-300 ${
                isCollapsed ? 'w-10 h-10 group-hover/logo:opacity-0' : 'w-auto px-15'
              }`}
              priority
            />
            
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isCollapsed ? 'opacity-0 group-hover/logo:opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <ChevronRight size={22} className="text-zinc-500 dark:text-slate-400 group-hover/logo:text-red-600 dark:group-hover/logo:text-blue-400" />
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(true)}
          className={`p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-slate-800 text-zinc-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-blue-500 transition-all duration-300 flex-shrink-0 ${
            isCollapsed ? 'w-0 p-0 opacity-0 overflow-hidden ml-0' : 'w-8 opacity-100 ml-1'
          }`}
          title="Collapse"
        >
          <ChevronLeft size={18} className="flex-shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
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
                  ? 'text-red-600 dark:text-blue-400 bg-red-50 dark:bg-blue-900/10'
                  : 'text-red-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-slate-400 hover:bg-zinc-100 dark:hover:bg-slate-800/60 hover:text-zinc-900 dark:hover:text-slate-100'
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

      {/* BAGIAN BAWAH: Logo .webp dan Teks disesuaikan seperti gambar referensi - Sekarang Ganti Gambar Berbeda Berdasarkan Tema */}
      <div className="border-t border-zinc-200 dark:border-slate-800 mt-auto flex justify-center">
        <div className="flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-center flex-shrink-0">
            {/* Gunakan logoSrc dinamis di sini */}
            <Image
              src={logoSrc}
              alt="ARES Logo"
              width={150}
              height={150}
              className={`object-contain transition-all duration-300 ${
                isCollapsed ? 'p-2 w-max' : 'p-4 w-max mb-3'
              }`}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}