"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { api, ScanListItem, formatDate } from '@/lib/api';
import { useLang } from '@/context/LanguageContext';
import { MOCK_SCANS } from '@/lib/dummyData';

export default function HistoryPage() {
  const { t } = useLang();
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const fetchScans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.listScans();
      setScans([...data.scans].reverse());
      setError('');
    } catch {
      // FALLBACK TRIGGER: Saat backend mati, gunakan data dummy
      console.warn("Backend tidak merespon. Menggunakan data dummy sebagai fallback.");
      setScans([...MOCK_SCANS]);
      // Opsional: Tampilkan pesan peringatan agar user tahu ini data dummy
      setError(t.history.errorEngine + " (Menampilkan Data Dummy untuk UI Development)");
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const groupedScans = useMemo(() => {
    const map = new Map<string, {
      id: string;
      target_url: string;
      testing_mode: string;
      latest: ScanListItem;
      history: ScanListItem[];
    }>();

    scans.forEach(scan => {
      const key = `${scan.target_url}___${scan.testing_mode}`;
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          target_url: scan.target_url,
          testing_mode: scan.testing_mode,
          latest: scan, // Asumsi array awal sudah diurutkan dari yang terbaru
          history: []
        });
      }
      map.get(key)!.history.push(scan);
    });

    return Array.from(map.values());
  }, [scans]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-slate-800 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-slate-100">{t.history.title}</h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400">{t.history.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { fetchScans(); }}
            className="text-sm text-zinc-500 dark:text-slate-400 hover:text-blue-800 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {t.history.refresh}
          </button>
          <Link href="/test/new">
            <button className="bg-blue-800 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-900 dark:hover:bg-blue-600 transition-colors cursor-pointer shadow-sm">
              {t.history.newTest}
            </button>
          </Link>
        </div>
      </div>

      {/* Error / Warning (Menampilkan status Dummy) */}
      {error && (
        <div className="p-3.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/50 rounded-lg text-sm text-orange-600 dark:text-orange-400 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-400 dark:text-slate-500 text-sm gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t.history.loading}
          </div>
        ) : groupedScans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 dark:text-slate-500 text-sm space-y-2">
            <p>{t.history.empty}</p>
            <Link href="/test/new" className="text-blue-800 dark:text-blue-400 hover:underline">
              {t.history.emptyLink}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-zinc-600 dark:text-slate-300">
              <thead className="bg-zinc-50 dark:bg-slate-800/50 text-zinc-700 dark:text-slate-200 transition-colors duration-300">
                <tr>
                  {/* Kolom untuk Expand Arrow */}
                  <th className="px-5 py-4 font-medium w-10"></th>
                  <th className="px-5 py-4 font-medium">{t.history.colTarget}</th>
                  <th className="px-5 py-4 font-medium">{t.history.colMode}</th>
                  <th className="px-5 py-4 font-medium">Status Terbaru</th>
                  <th className="px-5 py-4 font-medium">Temuan Terakhir</th>
                  <th className="px-5 py-4 font-medium text-right">{t.history.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-slate-800 transition-colors duration-300">
                {groupedScans.map((group) => {
                  const isExpanded = expandedGroups[group.id];

                  return (
                    <React.Fragment key={group.id}>
                      {/* Baris Utama (Group Header) */}
                      <tr
                        className={`hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-colors duration-200 cursor-pointer ${isExpanded ? 'bg-zinc-50 dark:bg-slate-800/20' : ''}`}
                        onClick={() => toggleGroup(group.id)}
                      >
                        <td className="px-5 py-4 text-zinc-400">
                          {group.history.length > 1 ? (
                            <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          ) : (
                            <span className="w-4 h-4 inline-block"></span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs font-bold truncate max-w-[200px]" title={group.target_url}>
                          {group.target_url}
                          {group.history.length > 1 && (
                            <span className="ml-2 text-[10px] bg-zinc-200 dark:bg-slate-700 text-zinc-600 dark:text-slate-300 px-1.5 py-0.5 rounded-full">
                              {group.history.length} scans
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs font-medium">{group.testing_mode}</td>
                        <td className="px-5 py-4">
                          <StatusBadge status={group.latest.status} progress={group.latest.progress} labels={t.history} />
                        </td>
                        <td className="px-5 py-4">
                          <FindingsDisplay findings={group.latest.findings} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-3 items-center">
                            {/* Tombol Scan Again - Mengarahkan ke form new dengan parameter */}
                            <Link href={`/test/new?url=${encodeURIComponent(group.target_url)}&mode=${encodeURIComponent(group.testing_mode)}`} onClick={(e) => e.stopPropagation()}>
                              <button className="text-zinc-500 dark:text-slate-400 hover:text-blue-800 dark:hover:text-blue-400 font-medium text-xs border border-zinc-300 dark:border-slate-700 px-2 py-1 rounded transition-colors">
                                Scan Ulang
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>

                      {/* Baris History Detail (Di-expand) */}
                      {isExpanded && group.history.length > 1 && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b-0">
                            <div className="bg-zinc-50/50 dark:bg-slate-800/30 px-10 py-3 border-l-4 border-blue-800 dark:border-blue-500">
                              <table className="w-full text-xs text-left text-zinc-500 dark:text-slate-400">
                                <thead>
                                  <tr>
                                    <th className="pb-2 font-medium w-48">{t.history.colTime}</th>
                                    <th className="pb-2 font-medium w-32">{t.history.colStatus}</th>
                                    <th className="pb-2 font-medium">{t.history.colFindings}</th>
                                    <th className="pb-2 font-medium text-right">{t.history.colAction}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200/50 dark:divide-slate-700/50">
                                  {group.history.map((row) => (
                                    <tr key={row.scan_id}>
                                      <td className="py-2 whitespace-nowrap">{formatDate(row.started_at)}</td>
                                      <td className="py-2">
                                        <StatusBadge status={row.status} progress={row.progress} labels={t.history} />
                                      </td>
                                      <td className="py-2">
                                        <FindingsDisplay findings={row.findings} />
                                      </td>
                                      <td className="py-2 text-right">
                                        {row.status === 'completed' ? (
                                          <Link href={`/test/report/${row.scan_id}`}>
                                            <button className="text-blue-800 dark:text-blue-400 font-medium hover:underline cursor-pointer transition-colors">
                                              {t.history.viewReport}
                                            </button>
                                          </Link>
                                        ) : row.status === 'running' || row.status === 'started' ? (
                                          <Link href={`/test/scan/${row.scan_id}`}>
                                            <button className="text-blue-800 dark:text-blue-400 font-medium hover:underline cursor-pointer transition-colors">
                                              {t.history.viewProgress}
                                            </button>
                                          </Link>
                                        ) : (
                                          <span className="text-zinc-400 dark:text-slate-600 italic">—</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// === KOMPONEN BANTUAN ===

interface StatusLabels {
  statusCompleted: string;
  statusRunning: string;
  statusStarted: string;
  statusError: string;
}

function StatusBadge({ status, progress, labels }: { status: string; progress: number; labels: StatusLabels }) {
  const map: Record<string, { style: string; label: string }> = {
    completed: { style: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50', label: labels.statusCompleted },
    running: { style: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', label: `${labels.statusRunning} ${progress}%` },
    started: { style: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', label: labels.statusStarted },
    error: { style: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50', label: labels.statusError },
  };
  const { style, label } = map[status] ?? {
    style: 'bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-slate-300 border-zinc-200 dark:border-slate-700',
    label: status,
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold border ${style} flex items-center w-max space-x-1.5 transition-colors duration-300`}>
      {(status === 'running' || status === 'started') && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-800 dark:bg-blue-500 animate-pulse" />
      )}
      <span>{label}</span>
    </span>
  );
}

function FindingsDisplay({ findings }: { findings: any }) {
  if (!findings) return <span className="text-zinc-400 dark:text-slate-600 italic text-xs">—</span>;

  return (
    <div className="flex space-x-1.5 text-[10px] font-semibold">
      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-slate-800 text-zinc-700 dark:text-slate-300" title="Total">{findings.total}</span>
      <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" title="High">{findings.high}</span>
      <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" title="Medium">{findings.medium}</span>
      <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" title="Low">{findings.low}</span>
    </div>
  );
}