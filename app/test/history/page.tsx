"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api, ScanListItem, formatDate } from '@/lib/api';
import { useLang } from '@/context/LanguageContext';

export default function HistoryPage() {
  const { t } = useLang();
  const [scans,   setScans]   = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const fetchScans = useCallback(async () => {
    try {
      const data = await api.listScans();
      setScans([...data.scans].reverse());
      setError('');
    } catch {
      setError(t.history.errorEngine);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 transition-colors duration-300">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t.history.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.history.subtitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setLoading(true); fetchScans(); }}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            {t.history.refresh}
          </button>
          <Link href="/test/new">
            <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer shadow-sm">
              {t.history.newTest}
            </button>
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 dark:text-slate-500 text-sm gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t.history.loading}
          </div>
        ) : scans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500 text-sm space-y-2">
            <p>{t.history.empty}</p>
            <Link href="/test/new" className="text-blue-600 dark:text-blue-400 hover:underline">
              {t.history.emptyLink}
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors duration-300">
                <tr>
                  <th className="px-5 py-4 font-medium">{t.history.colTime}</th>
                  <th className="px-5 py-4 font-medium">{t.history.colTarget}</th>
                  <th className="px-5 py-4 font-medium">{t.history.colMode}</th>
                  <th className="px-5 py-4 font-medium">{t.history.colStatus}</th>
                  <th className="px-5 py-4 font-medium">{t.history.colFindings}</th>
                  <th className="px-5 py-4 font-medium text-right">{t.history.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 transition-colors duration-300">
                {scans.map((row) => (
                  <tr key={row.scan_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200">
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(row.started_at)}</td>
                    <td className="px-5 py-4 font-mono text-xs truncate max-w-[200px]" title={row.target_url}>{row.target_url}</td>
                    <td className="px-5 py-4 text-xs">{row.testing_mode}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} progress={row.progress} labels={t.history} />
                    </td>
                    <td className="px-5 py-4">
                      {row.findings ? (
                        <div className="flex space-x-1.5 text-xs font-semibold">
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" title="Total">{row.findings.total}</span>
                          <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" title="High">{row.findings.high}</span>
                          <span className="px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400" title="Medium">{row.findings.medium}</span>
                          <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" title="Low">{row.findings.low}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 italic text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {row.status === 'completed' ? (
                        <Link href={`/test/report/${row.scan_id}`}>
                          <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm cursor-pointer transition-colors">
                            {t.history.viewReport}
                          </button>
                        </Link>
                      ) : row.status === 'running' || row.status === 'started' ? (
                        <Link href={`/test/scan/${row.scan_id}`}>
                          <button className="text-blue-600 dark:text-blue-400 font-medium hover:underline text-sm cursor-pointer transition-colors">
                            {t.history.viewProgress}
                          </button>
                        </Link>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-600 text-xs italic">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatusLabels {
  statusCompleted: string;
  statusRunning: string;
  statusStarted: string;
  statusError: string;
}

function StatusBadge({ status, progress, labels }: { status: string; progress: number; labels: StatusLabels }) {
  const map: Record<string, { style: string; label: string }> = {
    completed: { style: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50', label: labels.statusCompleted },
    running:   { style: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',   label: `${labels.statusRunning} ${progress}%` },
    started:   { style: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',   label: labels.statusStarted },
    error:     { style: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50',         label: labels.statusError },
  };
  const { style, label } = map[status] ?? {
    style: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    label: status,
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${style} flex items-center w-max space-x-1.5 transition-colors duration-300`}>
      {(status === 'running' || status === 'started') && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
      )}
      <span>{label}</span>
    </span>
  );
}
