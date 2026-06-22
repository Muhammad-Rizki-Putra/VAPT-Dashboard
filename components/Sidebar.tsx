"use client";

import Link from "next/link";
import { LayoutDashboard, PlusCircle, History, ChevronLeft, Menu } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  return (
    <aside className={`bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 flex flex-col h-screen fixed z-20 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      
      {/* Header Sidebar & Toggle Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-32 opacity-100'}`}>
          <div className="h-8 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded text-sm font-bold text-blue-600 dark:text-blue-500 whitespace-nowrap px-2 tracking-widest">
            [ LOGO ]
          </div>
        </div>
        
        {/* Tombol Toggle */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors cursor-pointer flex-shrink-0"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 p-3 space-y-2 text-sm overflow-hidden">
        <NavItem href="/" icon={<LayoutDashboard size={20} />} label="Dashboard Utama" isCollapsed={isCollapsed} />
        <NavItem href="/test/new" icon={<PlusCircle size={20} />} label="Mulai Pengetesan" isCollapsed={isCollapsed} />
        <NavItem href="/test/history" icon={<History size={20} />} label="Riwayat Pengetesan" isCollapsed={isCollapsed} />
      </nav>
    </aside>
  );
}

export function NavItem({ href, icon, label, isCollapsed }: { href: string, icon: React.ReactNode, label: string, isCollapsed: boolean }) {
  return (
    <Link 
      href={href} 
      className="flex items-center px-3 py-3 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group" 
      title={isCollapsed ? label : undefined} 
    >
      <div className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors flex-shrink-0 flex items-center justify-center">
        {icon}
      </div>
      
      <span 
        className={`overflow-hidden text-ellipsis whitespace-nowrap transition-all duration-300 font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400 ${
          isCollapsed 
            ? 'max-w-0 opacity-0 ml-0' 
            : 'max-w-[200px] opacity-100 ml-3'
        }`}
      >
        {label}
      </span>
    </Link>
  );
}