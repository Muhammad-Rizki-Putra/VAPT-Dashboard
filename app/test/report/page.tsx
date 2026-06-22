"use client";

import React, { useRef, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

// --- DUMMY DATA ---
const reportId = "VAPT-260531-001"; 
const reportData = {
  targetUrl: "http://172.17.0.4:3000",
  scanDate: "31 May 2026 17:52",
  server: "Unknown",
  poweredBy: "Unknown",
  method: "Automated VAPT — ZAP + Nmap + SQLMap + ffuf",
  classification: "CONFIDENTIAL",
  executiveSummary: "Pengujian keamanan dilakukan terhadap http://172.17.0.4:3000 pada tanggal 31 May 2026 menggunakan sistem VAPT Otonom berbasis Multi-Agentic AI. Total ditemukan 10 kerentanan yang terdiri dari 1 High, 4 Medium, dan 5 Low. The application has multiple vulnerabilities, with the most critical being the use of dangerous JS functions and missing CSP. Addressing these will significantly enhance security.",
  vulnerabilityTotals: { total: 10, high: 1, medium: 4, low: 5 },
  findings: [
    { id: 1, name: "Content Security Policy (CSP) Header Not Set", severity: "Medium", cvss: "4.0-6.9", endpoint: "http://172.17.0.4:3000, http://1..." },
    { id: 2, name: "Storable and Cacheable Content", severity: "Low", cvss: "0.1-3.9", endpoint: "http://172.17.0.4:3000/robots.tx..." },
    { id: 3, name: "Deprecated Feature Policy Header Set", severity: "Low", cvss: "0.1-3.9", endpoint: "http://172.17.0.4:3000/chunk-7AK..." },
    { id: 4, name: "Timestamp Disclosure - Unix", severity: "Low", cvss: "0.1-3.9", endpoint: "http://172.17.0.4:3000/styles.css" },
    { id: 5, name: "Cross-Domain Misconfiguration", severity: "Medium", cvss: "4.0-6.9", endpoint: "http://172.17.0.4:3000, http://1..." },
    { id: 6, name: "Modern Web Application", severity: "Low", cvss: "0.1-3.9", endpoint: "http://172.17.0.4:3000, http://1..." },
    { id: 7, name: "Dangerous JS Functions", severity: "High", cvss: "7.0-9.9", endpoint: "http://172.17.0.4:3000/main.js" },
    { id: 8, name: "Cross-Origin-Embedder-Policy Header Missing or Invalid", severity: "Medium", cvss: "4.0-6.9", endpoint: "http://172.17.0.4:3000, http://1..." },
    { id: 9, name: "Server Information Disclosure via ETags", severity: "Low", cvss: "0.1-3.9", endpoint: "http://172.17.0.4:3000" },
    { id: 10, name: "CORS Misconfiguration (access-control-allow-origin: *)", severity: "Medium", cvss: "4.0-6.9", endpoint: "http://172.17.0.4:3000" },
  ],
  recommendations: [
    { title: "Content Security Policy (CSP) Header Not Set", text: "Tambahkan header CSP untuk membatasi sumber konten." },
    { title: "Storable and Cacheable Content", text: "Konfigurasi cache-control dengan benar untuk konten sensitif." },
    { title: "Deprecated Feature Policy Header Set", text: "Ganti Feature-Policy dengan Permissions-Policy." },
    { title: "Timestamp Disclosure - Unix", text: "Sembunyikan informasi timestamp dari response server." },
    { title: "Cross-Domain Misconfiguration", text: "Batasi CORS hanya untuk domain yang diizinkan." },
    { title: "Modern Web Application", text: "Terapkan security headers lengkap sesuai standar OWASP." },
    { title: "Dangerous JS Functions", text: "Hindari penggunaan eval() dan fungsi berbahaya lainnya." },
    { title: "Cross-Origin-Embedder-Policy Header Missing or Invalid", text: "Tambahkan header COEP dengan nilai require-corp." },
    { title: "Server Information Disclosure via ETags", text: "Lakukan review manual dan terapkan patch keamanan terbaru." },
    { title: "CORS Misconfiguration (access-control-allow-origin: *)", text: "Lakukan review manual dan terapkan patch keamanan terbaru." },
  ],
  conclusion: "Pengujian keamanan terhadap http://172.17.0.4:3000 berhasil dilakukan secara otomatis menggunakan sistem VAPT Otonom berbasis Multi-Agentic AI. Ditemukan total 10 kerentanan yang perlu segera ditindaklanjuti, terutama temuan dengan severity High. Disarankan untuk melakukan perbaikan sesuai rekomendasi dan melakukan pengujian ulang setelah perbaikan diterapkan."
};

export default function ReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isPreparing, setIsPreparing] = useState(false);

  // Fungsi Print menggunakan react-to-print
  const handlePrint = useReactToPrint({
    contentRef : reportRef,
    documentTitle: `${reportId}_Report`,
    onBeforePrint: () => {
      setIsPreparing(true);
      return Promise.resolve();
    },
    onAfterPrint: () => setIsPreparing(false),
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 15mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 transition-colors duration-300">
      
      {/* Header & Action (TIDAK MASUK KE DALAM PDF) */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Laporan Hasil Pengetesan</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pratinjau Dokumen VAPT</p>
        </div>
        
        {/* Tombol Print/Download */}
        <button 
          onClick={handlePrint}
          disabled={isPreparing}
          className="bg-blue-600 dark:bg-blue-500 text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-pointer flex items-center space-x-2 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed shadow-sm"
        >
          {isPreparing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Menyiapkan Dokumen...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Simpan PDF</span>
            </>
          )}
        </button>
      </div>

      {/* --- AREA YANG AKAN DICETAK KE PDF --- */}
      <div 
        ref={reportRef} 
        className="bg-white dark:bg-slate-900 p-10 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none transition-colors duration-300"
      >
        
        {/* Judul Dokumen Internal */}
        <div className="text-center pb-6 border-b-2 border-blue-600 dark:border-blue-500 transition-colors duration-300">
          <h1 className="text-2xl font-bold tracking-wider text-slate-900 dark:text-slate-100 uppercase">Laporan VAPT Formal</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Vulnerability Assessment & Penetration Testing</p>
          <p className="text-xs text-slate-500 dark:text-slate-500">ID: {reportId}</p>
        </div>

        {/* Tabel Metadata */}
        <div className="overflow-hidden border border-slate-300 dark:border-slate-700 rounded-sm break-inside-avoid transition-colors duration-300">
          <table className="w-full text-sm text-left">
            <tbody className="divide-y divide-slate-300 dark:divide-slate-700 transition-colors duration-300">
              <MetaRow label="Target URL" value={reportData.targetUrl} />
              <MetaRow label="Tanggal Pengujian" value={reportData.scanDate} />
              <MetaRow label="Server" value={reportData.server} />
              <MetaRow label="Powered By" value={reportData.poweredBy} />
              <MetaRow label="Metode" value={reportData.method} />
              <MetaRow label="Klasifikasi" value={reportData.classification} />
            </tbody>
          </table>
        </div>

        {/* 1. Ringkasan Eksekutif */}
        <div className="space-y-4 break-inside-avoid">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wide transition-colors duration-300">1. Ringkasan Eksekutif</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify transition-colors duration-300">
            {reportData.executiveSummary}
          </p>

          <div className="grid grid-cols-4 mt-6 border border-slate-300 dark:border-slate-700 rounded-sm overflow-hidden text-center transition-colors duration-300">
            <MetricBlock label="TOTAL" count={reportData.vulnerabilityTotals.total} bgColor="bg-blue-500" />
            <MetricBlock label="HIGH" count={reportData.vulnerabilityTotals.high} bgColor="bg-red-500" />
            <MetricBlock label="MEDIUM" count={reportData.vulnerabilityTotals.medium} bgColor="bg-orange-500" />
            <MetricBlock label="LOW" count={reportData.vulnerabilityTotals.low} bgColor="bg-green-500" />
          </div>
        </div>

        {/* 2. Temuan Kerentanan */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wide break-inside-avoid transition-colors duration-300">2. Temuan Kerentanan</h2>
          <div className="overflow-x-auto border border-slate-300 dark:border-slate-700 rounded-sm transition-colors duration-300">
            <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300">
              <thead className="bg-blue-600 dark:bg-blue-800 text-white table-header-group transition-colors duration-300">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-center border-r border-slate-300/20 w-12">No</th>
                  <th className="px-4 py-2.5 font-semibold border-r border-slate-300/20">Nama Kerentanan</th>
                  <th className="px-4 py-2.5 font-semibold text-center border-r border-slate-300/20 w-24">Severity</th>
                  <th className="px-4 py-2.5 font-semibold text-center border-r border-slate-300/20 w-24">CVSS</th>
                  <th className="px-4 py-2.5 font-semibold">Endpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-700 transition-colors duration-300">
                {reportData.findings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors break-inside-avoid">
                    <td className="px-4 py-2.5 text-center font-medium border-r border-slate-300 dark:border-slate-700">{item.id}</td>
                    <td className="px-4 py-2.5 border-r border-slate-300 dark:border-slate-700">{item.name}</td>
                    <td className="px-4 py-2.5 text-center border-r border-slate-300 dark:border-slate-700">
                      <span className={`font-semibold ${
                        item.severity === 'High' ? 'text-red-600 dark:text-red-400' :
                        item.severity === 'Medium' ? 'text-orange-500 dark:text-orange-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center border-r border-slate-300 dark:border-slate-700">{item.cvss}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{item.endpoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Rekomendasi Perbaikan */}
        <div className="space-y-4 break-inside-avoid">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wide transition-colors duration-300">3. Rekomendasi Perbaikan</h2>
          <div className="space-y-4">
            {reportData.recommendations.map((rec, idx) => (
              <div key={idx} className="text-sm break-inside-avoid">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">{idx + 1}. {rec.title}</p>
                <p className="text-slate-600 dark:text-slate-400 flex items-start transition-colors duration-300">
                  <span className="mr-2 text-slate-400 dark:text-slate-500">→</span> 
                  {rec.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Kesimpulan */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 break-inside-avoid transition-colors duration-300">
          <h2 className="text-lg font-bold text-blue-600 dark:text-blue-500 uppercase tracking-wide transition-colors duration-300">4. Kesimpulan</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify transition-colors duration-300">
            {reportData.conclusion}
          </p>
        </div>

        {/* Footer Laporan */}
        <div className="mt-12 pt-4 border-t border-slate-200 dark:border-slate-800 text-center break-inside-avoid transition-colors duration-300">
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Laporan ini dibuat otomatis oleh Sistem VAPT Otonom — Multi-Agentic AI | {reportData.scanDate.split(' ')[0]} {reportData.scanDate.split(' ')[1]} {reportData.scanDate.split(' ')[2]}
          </p>
        </div>

      </div>
    </div>
  );
}

// --- MICRO COMPONENTS UNTUK REPORT ---

function MetaRow({ label, value }: { label: string, value: string }) {
  return (
    <tr className="border-b border-slate-300 dark:border-slate-700 last:border-b-0 break-inside-avoid transition-colors duration-300">
      <td className="bg-blue-600 dark:bg-blue-800 text-white font-medium px-4 py-2.5 w-1/4 md:w-1/5 transition-colors duration-300">{label}</td>
      <td className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-slate-800 dark:text-slate-200 transition-colors duration-300">{value}</td>
    </tr>
  );
}

function MetricBlock({ label, count, bgColor }: { label: string, count: number, bgColor: string }) {
  return (
    <div className="flex flex-col border-r border-slate-300 dark:border-slate-700 last:border-r-0 break-inside-avoid transition-colors duration-300">
      <div className="bg-blue-600 dark:bg-blue-800 text-white text-xs font-bold py-2 tracking-wider transition-colors duration-300">{label}</div>
      <div className={`${bgColor} text-white text-2xl font-bold py-3 transition-colors duration-300`}>{count}</div>
    </div>
  );
}