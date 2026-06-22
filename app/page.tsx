import Link from "next/link";
import { PlusCircle, History, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-12 transition-colors duration-300">
      
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          {/* Aksen Biru Terang (Sesuai Referensi) */}
          <div className="bg-blue-600/10 dark:bg-blue-500/10 p-4 rounded-full transition-colors duration-300">
            <ShieldCheck size={64} className="text-blue-600 dark:text-blue-500" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors duration-300">
          VAPT Otonom <span className="text-blue-600 dark:text-blue-500">Multi-Agentic AI</span>
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto transition-colors duration-300">
          Platform Vulnerability Assessment & Penetration Testing otomatis. Pilih tindakan di bawah ini untuk mengelola postur keamanan sistem Anda.
        </p>
      </div>

      {/* Action Portal (Quick Links) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        
        <Link href="/test/new" className="group">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-xl hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-blue-900/20 transition-all duration-300 h-full flex flex-col items-center text-center space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors duration-300 text-slate-600 dark:text-slate-400">
              <PlusCircle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Mulai Pengetesan Baru</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                Konfigurasi parameter dan jalankan pemindaian kerentanan pada endpoint target Anda.
              </p>
            </div>
          </div>
        </Link>

        <Link href="/test/history" className="group">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-xl hover:border-blue-600 dark:hover:border-blue-500 hover:shadow-md dark:hover:shadow-blue-900/20 transition-all duration-300 h-full flex flex-col items-center text-center space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-slate-950 transition-colors duration-300 text-slate-600 dark:text-slate-400">
              <History size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 transition-colors duration-300">Riwayat Pengetesan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300">
                Pantau status pemindaian yang sedang berjalan dan unduh laporan hasil (PDF).
              </p>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}