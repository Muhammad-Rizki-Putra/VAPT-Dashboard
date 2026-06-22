import Link from 'next/link';
import React from 'react';

// --- DUMMY DATA ---
const historyData = [
  {
    id: "VAPT-260531-001",
    date: "31 May 2026, 17:52",
    target: "http://172.17.0.4:3000",
    status: "Completed",
    findings: { total: 10, high: 1, medium: 4, low: 5 },
  },
  {
    id: "VAPT-260528-005",
    date: "28 May 2026, 14:15",
    target: "https://hr-portal.internal/login.php",
    status: "Completed",
    findings: { total: 17, high: 3, medium: 4, low: 10 },
  },
  {
    id: "VAPT-260613-008",
    date: "13 Jun 2026, 16:45",
    target: "https://staging-inventory.local/api",
    status: "Running",
    findings: { total: 0, high: 0, medium: 0, low: 0 },
  },
  {
    id: "VAPT-260612-002",
    date: "12 Jun 2026, 09:00",
    target: "https://legacy-billing.internal/",
    status: "Failed",
    findings: { total: 0, high: 0, medium: 0, low: 0 },
  }
];

export default function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Riwayat Pengetesan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Daftar eksekusi VAPT Otonom sebelumnya</p>
        </div>
        <Link href="/test/new">
          <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer shadow-sm">
            + Pengetesan Baru
          </button>
        </Link>
      </div>

      {/* Tabel Riwayat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors duration-300">
              <tr>
                <th className="px-5 py-4 font-medium">ID Laporan</th>
                <th className="px-5 py-4 font-medium">Waktu Mulai</th>
                <th className="px-5 py-4 font-medium">Target URL</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Rekap Temuan (T/H/M/L)</th>
                <th className="px-5 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 transition-colors duration-300">
              {historyData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                  <td className="px-5 py-4 font-medium text-slate-800 dark:text-slate-200">{row.id}</td>
                  <td className="px-5 py-4">{row.date}</td>
                  <td className="px-5 py-4 font-mono text-xs truncate max-w-xs" title={row.target}>
                    {row.target}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-4">
                    {row.status === "Completed" ? (
                      <div className="flex space-x-2 text-xs font-semibold">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" title="Total">{row.findings.total}</span>
                        <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" title="High">{row.findings.high}</span>
                        <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" title="Medium">{row.findings.medium}</span>
                        <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" title="Low">{row.findings.low}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-600 italic">-</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {row.status === "Completed" ? (
                      <Link href="/test/report">
                        <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm cursor-pointer transition-colors">
                          Lihat Laporan
                        </button>
                      </Link>
                    ) : (
                      <button className="text-slate-400 dark:text-slate-600 cursor-not-allowed text-sm" disabled>
                        Menunggu...
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- MICRO COMPONENT ---
function StatusBadge({ status }: { status: string }) {
  let badgeStyle = "";
  let label = "";

  switch (status) {
    case "Completed":
      badgeStyle = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50";
      label = "Selesai";
      break;
    case "Running":
      badgeStyle = "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50";
      label = "Berjalan";
      break;
    case "Failed":
      badgeStyle = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50";
      label = "Gagal";
      break;
    default:
      badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      label = status;
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeStyle} flex items-center w-max space-x-1.5 transition-colors duration-300`}>
      {status === "Running" && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
      )}
      <span>{label}</span>
    </span>
  );
}