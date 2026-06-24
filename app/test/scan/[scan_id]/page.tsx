"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ScanStatus, LogEntry } from '@/lib/api';
import { useLang } from '@/context/LanguageContext';

const STEP_THRESHOLDS = [5, 15, 30, 55, 80, 95, 100];

const LOG_STYLE: Record<LogEntry['level'], string> = {
  agent:   'text-cyan-400 font-semibold',
  llm:     'text-violet-400 italic',
  tool:    'text-amber-300',
  success: 'text-green-400',
  warning: 'text-orange-400',
  info:    'text-slate-400',
};

export default function ScanProgressPage() {
  const router = useRouter();
  const params = useParams();
  const scanId = params.scan_id as string;
  const { t } = useLang();

  const [status,    setStatus]    = useState<ScanStatus | null>(null);
  const [logs,      setLogs]      = useState<LogEntry[]>([]);
  const [error,     setError]     = useState('');

  const logsEndRef   = useRef<HTMLDivElement>(null);
  const logOffsetRef = useRef(0);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    if (!scanId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const [s, logData] = await Promise.all([
          api.getStatus(scanId),
          api.getLogs(scanId, logOffsetRef.current),
        ]);

        if (cancelled) return;

        setStatus(s);

        if (logData.logs.length > 0) {
          setLogs(prev => [...prev, ...logData.logs]);
          logOffsetRef.current += logData.logs.length;
        }

        if (s.status === 'completed') {
          setTimeout(() => {
            if (!cancelled) router.push(`/test/report/${scanId}`);
          }, 2000);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : '';
          setError(msg === 'SCAN_NOT_FOUND' ? t.scan.errNotFound : t.scan.errConnection);
        }
      }
    };

    poll();
    const interval = setInterval(poll, 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [scanId, router, t]);

  const steps = STEP_THRESHOLDS.map((threshold, i) => ({
    threshold,
    label: t.scan.steps[i] ?? '',
  }));

  if (error) {
    const isNotFound = error === t.scan.errNotFound;
    return (
      <div className="max-w-2xl mx-auto mt-20 space-y-4">
        <div className={`p-6 border rounded-lg text-center space-y-2 ${
          isNotFound
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
        }`}>
          <p className={`font-semibold ${isNotFound ? 'text-amber-700 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
            {isNotFound ? t.scan.errNotFoundTitle : t.scan.errConnectionTitle}
          </p>
          <p className={`text-sm ${isNotFound ? 'text-amber-600 dark:text-amber-400' : 'text-red-500 dark:text-red-400'}`}>
            {error}
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/test/new">
            <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              {t.scan.newScan}
            </button>
          </Link>
          <Link href="/test/history" className="flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {t.scan.backHistory}
          </Link>
        </div>
      </div>
    );
  }

  const progress    = status?.progress     ?? 0;
  const currentStep = status?.current_step ?? t.scan.connecting;
  const isCompleted = status?.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.scan.title}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-500 font-mono mt-0.5">{scanId}</p>
        </div>
        {isCompleted && (
          <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 px-3 py-1 rounded-full">
            {t.scan.completed}
          </span>
        )}
      </div>

      {/* Progress Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm space-y-4 transition-colors duration-300">

        <div className="flex items-center gap-4">
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 w-12 text-right tabular-nums">
            {progress}%
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          {!isCompleted && (
            <svg className="animate-spin h-3.5 w-3.5 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          <span>{currentStep}</span>
        </div>

        {/* Steps timeline */}
        <div className="flex items-center gap-1 pt-1">
          {steps.map(({ threshold, label }, i) => {
            const done   = progress >= threshold;
            const active = progress >= (steps[i - 1]?.threshold ?? 0) && !done;
            return (
              <React.Fragment key={threshold}>
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                    done ? 'bg-blue-500' : active ? 'bg-blue-300 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                  <span className={`text-[9px] text-center leading-tight transition-colors duration-300 truncate w-full text-center ${
                    done ? 'text-slate-600 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600'
                  }`}>{label.split(' — ')[0]}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px flex-1 transition-colors duration-300 mb-3 ${done ? 'bg-blue-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Terminal */}
      <div className="rounded-lg overflow-hidden border border-slate-700 shadow-lg">
        <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-slate-400 font-mono ml-2">{t.scan.consoleTitle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {!isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
            <span className="text-xs text-slate-500 font-mono">{logs.length} {t.scan.lines}</span>
          </div>
        </div>

        <div className="bg-slate-950 p-4 h-96 overflow-y-auto font-mono text-xs leading-relaxed">
          {logs.length === 0 ? (
            <div className="flex items-center gap-2 text-slate-600">
              <span className="animate-pulse">▋</span>
              <span>{t.scan.waitingOutput}</span>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.index} className="flex gap-3 mb-1">
                <span className="text-slate-600 flex-shrink-0 select-none">{log.time}</span>
                <span className={`whitespace-pre-wrap break-all ${LOG_STYLE[log.level]}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}

          {!isCompleted && (
            <div className="flex items-center gap-2 text-slate-600 mt-1">
              <span className="text-slate-700 select-none">{new Date().toLocaleTimeString('id-ID', { hour12: false })}</span>
              <span className="animate-pulse text-green-500">▋</span>
            </div>
          )}

          <div ref={logsEndRef} />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span><span className="text-cyan-500 font-semibold">■</span> {t.scan.legendAgent}</span>
        <span><span className="text-violet-400">■</span> {t.scan.legendLlm}</span>
        <span><span className="text-amber-400">■</span> {t.scan.legendTool}</span>
        <span><span className="text-green-400">■</span> {t.scan.legendSuccess}</span>
        <span><span className="text-orange-400">■</span> {t.scan.legendWarning}</span>
      </div>

      <div className="text-center pb-4">
        <Link
          href="/test/history"
          className="text-sm text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {t.scan.backToHistory}
        </Link>
      </div>
    </div>
  );
}
