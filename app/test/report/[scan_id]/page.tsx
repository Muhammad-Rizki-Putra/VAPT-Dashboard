"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { api, ScanResult, Vulnerability, cvssToRange } from '@/lib/api';
import { useLang } from '@/context/LanguageContext';

// ─── Grade ────────────────────────────────────────────────────────────────────

type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

const GRADE_BASE = {
  S: { color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-300 dark:border-purple-600' },
  A: { color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-300 dark:border-blue-600'   },
  B: { color: 'text-green-700 dark:text-green-300',   bg: 'bg-green-50 dark:bg-green-900/20',   border: 'border-green-300 dark:border-green-600' },
  C: { color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-300 dark:border-amber-600' },
  D: { color: 'text-red-700 dark:text-red-300',       bg: 'bg-red-50 dark:bg-red-900/20',       border: 'border-red-300 dark:border-red-600'     },
} as const;

function calcGrade(s: ScanResult['summary']): Grade {
  if (s.total    === 0)                                    return 'S';
  if (s.critical === 0 && s.high === 0 && s.medium === 0) return 'A';
  if (s.critical === 0 && s.high === 0)                   return 'B';
  if (s.critical === 0)                                   return 'C';
  return 'D';
}

// ─── Radar ────────────────────────────────────────────────────────────────────

function vulnCategory(v: Vulnerability): string {
  const n = v.name.toLowerCase();
  if (/jwt|auth|login|session|token|credential|password/.test(n)) return 'auth';
  if (/csp|cors|coep|coop|header|policy/.test(n))                  return 'headers';
  if (/sql|injection|xss|eval|dangerous js|script/.test(n))        return 'injection';
  if (/disclosure|etag|timestamp|information|expose|robots/.test(n)) return 'exposure';
  if (/weak|hs256|cipher|tls|ssl|brute/.test(n) || v.source === 'JWT Analysis') return 'crypto';
  return 'config';
}

const SEV_WEIGHT: Record<string, number> = { Critical: 40, High: 30, Medium: 20, Low: 10 };

function calcRadarScores(vulns: Vulnerability[]): Record<string, number> {
  const raw: Record<string, number> = { headers: 0, auth: 0, injection: 0, crypto: 0, exposure: 0, config: 0 };
  for (const v of vulns) {
    const cat = vulnCategory(v);
    raw[cat] = Math.min(100, raw[cat] + (SEV_WEIGHT[v.severity] ?? 10));
  }
  return Object.fromEntries(Object.entries(raw).map(([k, val]) => [k, Math.max(0, 100 - val)]));
}

function RadarChart({ scores, cats }: { scores: Record<string, number>; cats: { key: string; label: string }[] }) {
  const N  = cats.length;
  const cx = 160, cy = 158, r = 100;
  const angles = cats.map((_, i) => (2 * Math.PI * i / N) - Math.PI / 2);

  const pt = (angle: number, t: number) => ({
    x: +(cx + r * t * Math.cos(angle)).toFixed(2),
    y: +(cy + r * t * Math.sin(angle)).toFixed(2),
  });

  const poly = (t: number) =>
    angles.map(a => { const p = pt(a, t); return `${p.x},${p.y}`; }).join(' ');

  const dataPoly = cats.map((cat, i) => {
    const p = pt(angles[i], (scores[cat.key] ?? 100) / 100);
    return `${p.x},${p.y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 320 316" className="w-full max-w-xs mx-auto">
      <polygon points={poly(1)} fill="#fafafa" className="dark:fill-slate-800/40" />
      {[0.25, 0.5, 0.75, 1].map(t => (
        <polygon key={t} points={poly(t)} fill="none"
          stroke="#e4e4e7" strokeWidth={t === 1 ? 1.5 : 0.8}
          className="dark:stroke-slate-600" />
      ))}
      {[25, 50, 75].map(pct => {
        const p = pt(-Math.PI / 2, pct / 100);
        return <text key={pct} x={p.x + 3} y={p.y} fontSize="8" fill="#a1a1aa" className="select-none">{pct}%</text>;
      })}
      {angles.map((a, i) => {
        const e = pt(a, 1);
        return <line key={i} x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="#d4d4d8" strokeWidth="1" className="dark:stroke-slate-600" />;
      })}
      <polygon points={dataPoly} fill="rgba(59,130,246,0.18)" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      {cats.map((cat, i) => {
        const score = scores[cat.key] ?? 100;
        const p     = pt(angles[i], score / 100);
        return (
          <circle key={i} cx={p.x} cy={p.y} r="4.5"
            fill={score < 60 ? '#ef4444' : '#3b82f6'}
            stroke="white" strokeWidth="1.5" />
        );
      })}
      {cats.map((cat, i) => {
        const p     = pt(angles[i], 1.35);
        const lines = cat.label.split('\n');
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fontSize="9.5" fill="#52525b" className="dark:fill-slate-400 select-none">
            {lines.map((line, j) => (
              <tspan key={j} x={p.x} dy={j === 0 ? (lines.length > 1 ? -6 : 0) : 13}>{line}</tspan>
            ))}
          </text>
        );
      })}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const params = useParams();
  const scanId = params.scan_id as string;
  const { t }  = useLang();
  const tr     = t.report;

  const [result,      setResult]      = useState<ScanResult | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [isPreparing, setIsPreparing] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scanId) return;
    api.getResult(scanId)
      .then(setResult)
      .catch(() => setError(tr.errLoad))
      .finally(() => setLoading(false));
  }, [scanId, tr]);

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `ARES_Report_${scanId}`,
    onBeforePrint: () => { setIsPreparing(true); return Promise.resolve(); },
    onAfterPrint:  () => setIsPreparing(false),
    pageStyle: `
      @page { size: A4 portrait; margin: 15mm; }
      @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    `,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-400 dark:text-slate-500 gap-2 text-sm">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        {tr.loading}
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto mt-20 space-y-4 text-center">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
          <p className="text-red-600 dark:text-red-400 font-semibold">{error || tr.errNotFound}</p>
        </div>
        <Link href="/test/history" className="text-sm text-red-600 dark:text-blue-400 hover:underline">
          {tr.backHistory}
        </Link>
      </div>
    );
  }

  const grade       = calcGrade(result.summary);
  const gradeBase   = GRADE_BASE[grade];
  const gradeConfMap: Record<Grade, { label: string; desc: string }> = {
    S: tr.gradeS,
    A: tr.gradeA,
    B: tr.gradeB,
    C: tr.gradeC,
    D: tr.gradeD,
  };
  const gradeConf   = gradeConfMap[grade];
  const radarScores = calcRadarScores(result.vulnerabilities);
  const radarCats   = tr.radarCats;

  const conclusion = tr.conclusionTemplate(
    result.target_url,
    result.testing_mode,
    result.summary.total,
    result.summary.high,
    result.summary.medium,
    result.summary.low,
    grade,
    gradeConf.label,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 transition-colors duration-300">

      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-slate-100 tracking-tight">{tr.title}</h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400 mt-0.5">
            <Link href="/test/history" className="hover:text-red-600 dark:hover:text-blue-400 transition-colors">{tr.backHistory}</Link>
            <span className="mx-2 text-zinc-300 dark:text-slate-700">/</span>
            <span className="font-mono text-xs">{scanId}</span>
          </p>
        </div>
        <button
          onClick={handlePrint}
          disabled={isPreparing}
          className="bg-red-600 dark:bg-blue-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-red-700 dark:hover:bg-blue-600 transition-colors cursor-pointer flex items-center space-x-2 disabled:bg-zinc-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-sm"
        >
          {isPreparing
            ? <><Loader2 size={16} className="animate-spin" /><span>{tr.preparing}</span></>
            : <><Download size={16} /><span>{tr.savePdf}</span></>
          }
        </button>
      </div>

      {/* Printable Area */}
      <div
        ref={reportRef}
        className="bg-white dark:bg-slate-900 p-10 border border-zinc-200 dark:border-slate-800 rounded-lg shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none transition-colors duration-300"
      >

        {/* Title */}
        <div className="text-center pb-6 border-b-2 border-red-600 dark:border-blue-500">
          <h1 className="text-2xl font-bold tracking-wider text-zinc-900 dark:text-slate-100 uppercase">{tr.formalTitle}</h1>
          <p className="text-sm text-zinc-600 dark:text-slate-400 mt-1">{tr.formalSubtitle}</p>
          <p className="text-xs text-zinc-500 dark:text-slate-500 mt-0.5">{tr.mode}: {result.testing_mode}</p>
        </div>

        {/* Metadata */}
        <div className="overflow-hidden border border-zinc-300 dark:border-slate-700 rounded-sm break-inside-avoid">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-zinc-300 dark:divide-slate-700">
              <MetaRow label={tr.metaTarget}         value={result.target_url} />
              <MetaRow label={tr.metaDate}           value={result.scan_date} />
              <MetaRow label={tr.metaServer}         value={result.tech_stack.server} />
              <MetaRow label={tr.metaPoweredBy}      value={result.tech_stack.powered_by} />
              <MetaRow label={tr.metaMethod}         value={tr.methodTemplate(result.tools_used.join(' + '))} />
              <MetaRow label={tr.metaClassification} value={tr.metaClassificationValue} />
            </tbody>
          </table>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-4 break-inside-avoid">
          <h2 className="text-lg font-bold text-red-600 dark:text-blue-500 uppercase tracking-wide">{tr.s1Title}</h2>
          <p className="text-sm text-zinc-700 dark:text-slate-300 leading-relaxed text-justify">{result.exploit_summary}</p>
          <div className="grid grid-cols-4 border border-zinc-300 dark:border-slate-700 rounded-sm overflow-hidden text-center">
            <MetricBlock label="TOTAL"  count={result.summary.total}  bgColor="bg-blue-500" />
            <MetricBlock label="HIGH"   count={result.summary.high}   bgColor="bg-red-500" />
            <MetricBlock label="MEDIUM" count={result.summary.medium} bgColor="bg-orange-500" />
            <MetricBlock label="LOW"    count={result.summary.low}    bgColor="bg-green-500" />
          </div>
        </div>

        {/* 2. Security Assessment */}
        <div className="space-y-5 break-inside-avoid">
          <h2 className="text-lg font-bold text-red-600 dark:text-blue-500 uppercase tracking-wide">{tr.s2Title}</h2>

          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Grade Badge */}
            <div className={`flex flex-col items-center p-6 border-2 rounded-xl ${gradeBase.bg} ${gradeBase.border} space-y-3`}>
              <p className="text-[10px] font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-widest">{tr.securityGrade}</p>
              <div className={`text-[88px] font-black leading-none ${gradeBase.color} drop-shadow-sm`}>{grade}</div>
              <p className={`text-sm font-bold tracking-widest ${gradeBase.color}`}>{gradeConf.label}</p>
              <p className="text-xs text-zinc-600 dark:text-slate-400 text-center leading-relaxed">{gradeConf.desc}</p>

              <div className="w-full pt-3 border-t border-zinc-200 dark:border-slate-700 space-y-1.5">
                {radarCats.map(cat => {
                  const score  = radarScores[cat.key] ?? 100;
                  const isWeak = score < 60;
                  return (
                    <div key={cat.key}>
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[10px] text-zinc-500 dark:text-slate-400">{cat.label.replace('\n', ' ')}</span>
                        <span className={`text-[10px] font-bold ${isWeak ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{score}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-slate-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${isWeak ? 'bg-red-400' : 'bg-green-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="flex flex-col items-center space-y-3">
              <p className="text-xs text-zinc-500 dark:text-slate-400 text-center leading-relaxed">
                {tr.radarHint}<br />
                <span className="text-red-500 font-medium">●</span> {tr.radarWeak}
              </p>
              <RadarChart scores={radarScores} cats={radarCats} />
              <div className="flex gap-5 text-[10px] text-zinc-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />{tr.radarSafe}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />{tr.radarVulnerable}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Vulnerability Findings */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-red-600 dark:text-blue-500 uppercase tracking-wide break-inside-avoid">{tr.s3Title}</h2>
          <div className="overflow-x-auto border border-zinc-300 dark:border-slate-700 rounded-sm">
            <table className="w-full text-sm text-left text-zinc-700 dark:text-slate-300">
              <thead className="bg-red-600 dark:bg-blue-800 text-white table-header-group">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-center border-r border-zinc-300/20 w-12">{tr.colNo}</th>
                  <th className="px-4 py-2.5 font-semibold border-r border-zinc-300/20">{tr.colName}</th>
                  <th className="px-4 py-2.5 font-semibold text-center border-r border-zinc-300/20 w-24">{tr.colSeverity}</th>
                  <th className="px-4 py-2.5 font-semibold text-center border-r border-zinc-300/20 w-20">{tr.colCvss}</th>
                  <th className="px-4 py-2.5 font-semibold border-r border-zinc-300/20 w-20">{tr.colSource}</th>
                  <th className="px-4 py-2.5 font-semibold">{tr.colEndpoint}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-300 dark:divide-slate-700">
                {result.vulnerabilities.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-50 dark:hover:bg-slate-800/50 transition-colors break-inside-avoid">
                    <td className="px-4 py-2.5 text-center font-medium border-r border-zinc-300 dark:border-slate-700">{v.id}</td>
                    <td className="px-4 py-2.5 border-r border-zinc-300 dark:border-slate-700">{v.name}</td>
                    <td className="px-4 py-2.5 text-center border-r border-zinc-300 dark:border-slate-700">
                      <span className={`font-semibold ${
                        v.severity === 'Critical' ? 'text-purple-600 dark:text-purple-400' :
                        v.severity === 'High'     ? 'text-red-600 dark:text-red-400'       :
                        v.severity === 'Medium'   ? 'text-orange-500 dark:text-orange-400' :
                                                    'text-green-600 dark:text-green-400'
                      }`}>{v.severity}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs border-r border-zinc-300 dark:border-slate-700">{cvssToRange(v.cvss_score)}</td>
                    <td className="px-4 py-2.5 text-xs border-r border-zinc-300 dark:border-slate-700">{v.source}</td>
                    <td className="px-4 py-2.5 font-mono text-xs truncate max-w-[180px]" title={v.endpoint}>{v.endpoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Recommendations */}
        <div className="space-y-4 break-inside-avoid">
          <h2 className="text-lg font-bold text-red-600 dark:text-blue-500 uppercase tracking-wide">{tr.s4Title}</h2>
          <div className="space-y-4">
            {result.vulnerabilities.map((v, idx) => (
              <div key={v.id} className="text-sm break-inside-avoid">
                <p className="font-bold text-zinc-800 dark:text-slate-200 mb-1">{idx + 1}. {v.name}</p>
                <p className="text-zinc-600 dark:text-slate-400 flex items-start">
                  <span className="mr-2 text-zinc-400 dark:text-slate-500 flex-shrink-0">→</span>
                  {v.recommendation || tr.defaultRec}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Conclusion */}
        <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-slate-800 break-inside-avoid">
          <h2 className="text-lg font-bold text-red-600 dark:text-blue-500 uppercase tracking-wide">{tr.s5Title}</h2>
          <p className="text-sm text-zinc-700 dark:text-slate-300 leading-relaxed text-justify">{conclusion}</p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-zinc-200 dark:border-slate-800 text-center break-inside-avoid">
          <p className="text-xs text-zinc-400 dark:text-slate-500 italic">
            {tr.footer} | {result.scan_date}
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-zinc-300 dark:border-slate-700 last:border-b-0 break-inside-avoid">
      <td className="bg-red-600 dark:bg-blue-800 text-white font-medium px-4 py-2.5 w-1/4">{label}</td>
      <td className="bg-zinc-50 dark:bg-slate-800/50 px-4 py-2.5 text-zinc-800 dark:text-slate-200">{value}</td>
    </tr>
  );
}

function MetricBlock({ label, count, bgColor }: { label: string; count: number; bgColor: string }) {
  return (
    <div className="flex flex-col border-r border-zinc-300 dark:border-slate-700 last:border-r-0 break-inside-avoid">
      <div className="bg-red-600 dark:bg-blue-800 text-white text-xs font-bold py-2 tracking-wider">{label}</div>
      <div className={`${bgColor} text-white text-2xl font-bold py-3`}>{count}</div>
    </div>
  );
}