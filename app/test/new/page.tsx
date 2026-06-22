"use client";

import React, { useState } from 'react';

const PLATFORM_CATEGORIES = [
  {
    title: "1. Network & Infrastructure VAPT",
    items: [
      { id: "system-os", name: "System / OS VAPT", desc: "Windows, Linux, macOS. Miskonfigurasi, patch, kerentanan kernel.", isAvailable: false },
      { id: "ad-identity", name: "Active Directory (AD)", desc: "Domain Controller, Kerberoasting, LDAP, Privilege Escalation.", isAvailable: false }
    ]
  },
  {
    title: "2. Application Level VAPT",
    items: [
      { id: "web", name: "Web Application VAPT", desc: "Frontend/Backend, SQL Injection, XSS, Broken Access Control.", isAvailable: true },
      { id: "api", name: "API VAPT", desc: "REST, SOAP, GraphQL, endpoint auth & rate limiting.", isAvailable: true },
      { id: "mobile", name: "Mobile VAPT", desc: "Android (APK) & iOS (IPA). Analisis statis & dinamis.", isAvailable: false }
    ]
  },
  {
    title: "3. Cloud & Modern Workspace VAPT",
    items: [
      { id: "cloud", name: "Cloud Infrastructure", desc: "Miskonfigurasi AWS, Azure, GCP, kebijakan IAM & S3 bucket.", isAvailable: false }
    ]
  }
];

export default function NewScanPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [targetUrl, setTargetUrl] = useState('');

  const selectedItem = PLATFORM_CATEGORIES
    .flatMap(c => c.items)
    .find(i => i.id === selectedPlatform);
    
  const isAvailable = selectedItem?.isAvailable ?? false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mulai Pengetesan Baru</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Konfigurasi parameter VAPT Otonom - Multi Agentic AI</p>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        
        {/* 1. Pilihan Platform */}
        <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm space-y-6 transition-colors duration-300">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-3 transition-colors duration-300">Pilih Kategori & Platform Target</h3>
          
          <div className="space-y-6">
            {PLATFORM_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-3">
                {/* Partisi Title */}
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded border-l-4 border-blue-600 dark:border-blue-500 transition-colors duration-300">
                  {category.title}
                </h4>
                
                {/* Opsi List Vertikal */}
                <div className="flex flex-col space-y-3">
                  {category.items.map((item) => {
                    const isSelected = selectedPlatform === item.id;
                    return (
                      <label 
                        key={item.id} 
                        className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                          isSelected 
                            ? 'border-blue-600 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-md' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-blue-600/40 dark:hover:border-blue-500/40 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="platform"
                          className="mt-1 text-blue-600 dark:text-blue-500 focus:ring-blue-600 dark:focus:ring-blue-500 cursor-pointer"
                          checked={isSelected}
                          onChange={() => setSelectedPlatform(item.id)}
                        />
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors duration-300">{item.name}</span>
                            
                            {/* Badge Segera Hadir */}
                            {!item.isAvailable && (
                              <span className="text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors duration-300">
                                Segera Hadir
                              </span>
                            )}
                          </div>
                          
                          {/* Wrapper Transisi untuk Deskripsi */}
                          <div className={`grid transition-all duration-300 ease-in-out ${
                            isSelected 
                              ? 'grid-rows-[1fr] opacity-100 mt-1.5' 
                              : 'grid-rows-[0fr] opacity-0 mt-0'
                          }`}>
                            <div className="overflow-hidden">
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Input Dinamis & Informasi Status */}
        <div className={`grid transition-all duration-500 ease-in-out ${selectedPlatform ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden p-1 -m-1">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm mt-1 transition-colors duration-300">
              
              {/* Jika platform siap digunakan (Web / API) */}
              <AnimatedWrapper show={isAvailable}>
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 transition-colors duration-300">
                  Target URL / Endpoint Utama <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input 
                  type="url" 
                  className="w-full p-2.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500 focus:border-blue-600 dark:focus:border-blue-500 outline-none text-sm transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="https://..."
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  required={isAvailable}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors duration-300">Masukkan endpoint utama yang akan dianalisis secara menyeluruh.</p>
              </AnimatedWrapper>

              {/* Jika platform dalam tahap pengembangan */}
              <AnimatedWrapper show={selectedPlatform !== '' && !isAvailable}>
                <div className="py-4 text-center">
                  <div className="inline-block p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-full mb-3 transition-colors duration-300">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors duration-300">Modul dalam Tahap Pengembangan</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed transition-colors duration-300">
                    Agen AI Otonom untuk pengujian <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedItem?.name}</span> saat ini masih dalam fase riset dan penyempurnaan (R&D). Fitur ini akan segera diaktifkan pada rilis pembaruan berikutnya.
                  </p>
                </div>
              </AnimatedWrapper>

            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer"
            disabled={!selectedPlatform || !isAvailable || (isAvailable && !targetUrl)}
          >
            Mulai Pengetesan
          </button>
        </div>
      </form>
    </div>
  );
}

// --- HELPER COMPONENT ---
function AnimatedWrapper({ show, children }: { show: boolean, children: React.ReactNode }) {
  return (
    <div className={`grid transition-all duration-300 ease-in-out ${show ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
      <div className="overflow-hidden p-1 -m-1">
        {children}
      </div>
    </div>
  );
}