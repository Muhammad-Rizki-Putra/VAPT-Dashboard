"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useLang } from '@/context/LanguageContext';

export default function NewScanPage() {
  const router = useRouter();
  const { t } = useLang();

  const PLATFORM_CATEGORIES = [
    {
      title: t.platforms.cat1,
      items: [
        { id: "system-os", name: t.platforms['system-os'], desc: t.platforms['system-os-desc'], isAvailable: false },
        { id: "ad-identity", name: t.platforms['ad-identity'], desc: t.platforms['ad-identity-desc'], isAvailable: false },
      ],
    },
    {
      title: t.platforms.cat2,
      items: [
        { id: "web",    name: t.platforms.web,       desc: t.platforms['web-desc'],    isAvailable: true },
        { id: "web-va", name: t.platforms['web-va'], desc: t.platforms['web-va-desc'], isAvailable: true },
        { id: "api",    name: t.platforms.api,       desc: t.platforms['api-desc'],    isAvailable: true },
        { id: "api-va", name: t.platforms['api-va'], desc: t.platforms['api-va-desc'], isAvailable: true },
        { id: "mobile", name: t.platforms.mobile,    desc: t.platforms['mobile-desc'], isAvailable: false },
      ],
    },
    {
      title: t.platforms.cat3,
      items: [
        { id: "cloud", name: t.platforms.cloud, desc: t.platforms['cloud-desc'], isAvailable: false },
      ],
    },
  ];

  const TESTING_MODES = [
    { value: 'Black Box', label: 'Black Box', desc: t.newScan.modeBlackBoxDesc },
    { value: 'Grey Box',  label: 'Grey Box',  desc: t.newScan.modeGreyBoxDesc },
    { value: 'White Box', label: 'White Box', desc: t.newScan.modeWhiteBoxDesc },
  ];

  const [openCategory,     setOpenCategory]     = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [targetUrl,        setTargetUrl]        = useState('');
  const [testingMode,      setTestingMode]      = useState('Black Box');
  const [username,         setUsername]         = useState('');
  const [password,         setPassword]         = useState('');
  const [swaggerUrl,       setSwaggerUrl]       = useState('');
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [error,            setError]            = useState('');

  const selectedItem = PLATFORM_CATEGORIES
    .flatMap(c => c.items)
    .find(i => i.id === selectedPlatform);

  const isAvailable  = selectedItem?.isAvailable ?? false;
  const needsCreds   = testingMode === 'Grey Box' || testingMode === 'White Box';
  const needsSwagger = testingMode === 'White Box';

  const canSubmit =
    isAvailable &&
    !!targetUrl &&
    (!needsCreds  || (!!username && !!password)) &&
    (!needsSwagger || !!swaggerUrl) &&
    !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError('');
    try {
      const result = await api.startScan({
        target_url:  targetUrl,
        mode:        testingMode,
        language:    'id',
        username:    needsCreds   ? username   : undefined,
        password:    needsCreds   ? password   : undefined,
        swagger_url: needsSwagger ? swaggerUrl : undefined,
      });
      router.push(`/test/scan/${result.scan_id}`);
    } catch {
      setError(t.newScan.errorEngine);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-slate-800 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-slate-100">{t.newScan.title}</h1>
        <p className="text-sm text-zinc-500 dark:text-slate-400">{t.newScan.subtitle}</p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>

        {/* 1. Platform selection */}
        <div className="bg-white dark:bg-slate-900 p-6 border border-zinc-200 dark:border-slate-800 rounded-lg shadow-sm space-y-6 transition-colors duration-300">
          <h3 className="text-base font-semibold text-zinc-800 dark:text-slate-100 border-b border-zinc-200 dark:border-slate-800 pb-3 transition-colors duration-300">
            {t.newScan.selectCategory}
          </h3>

          <div className="space-y-2">
            {PLATFORM_CATEGORIES.map((category) => {
              const isOpen = openCategory === category.title;
              const hasSelection = category.items.some(i => i.id === selectedPlatform);
              return (
                <div key={category.title} className="border border-zinc-200 dark:border-slate-700 rounded-lg overflow-hidden transition-colors duration-300">
                  {/* Category header — clickable accordion trigger */}
                  <button
                    type="button"
                    onClick={() => setOpenCategory(isOpen ? null : category.title)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-200 ${
                      isOpen
                        ? 'bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/30'
                        : 'bg-zinc-50 dark:bg-slate-800/50 hover:bg-zinc-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`text-sm font-bold border-l-4 pl-3 transition-colors duration-200 ${
                      isOpen
                        ? 'text-blue-800 dark:text-blue-400 border-blue-800 dark:border-blue-500'
                        : 'text-zinc-700 dark:text-slate-200 border-zinc-300 dark:border-slate-600'
                    }`}>
                      {category.title}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasSelection && (
                        <span className="text-[10px] font-semibold text-blue-800 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                          ✓ selected
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-zinc-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Category items — animated accordion body */}
                  <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="flex flex-col space-y-3 p-4">
                        {category.items.map((item) => {
                          const isSelected = selectedPlatform === item.id;
                          return (
                            <label
                              key={item.id}
                              className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                                isSelected
                                  ? 'border-blue-800 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-md'
                                  : 'border-zinc-200 dark:border-slate-800 hover:border-blue-800/40 dark:hover:border-blue-500/40 hover:bg-zinc-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="platform"
                                className="mt-1 text-blue-800 dark:text-blue-500 focus:ring-blue-800 dark:focus:ring-blue-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => setSelectedPlatform(item.id)}
                              />
                              <div className="flex flex-col w-full">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-zinc-800 dark:text-slate-200 transition-colors duration-300">{item.name}</span>
                                  {!item.isAvailable && (
                                    <span className="text-[10px] font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 px-2 py-0.5 rounded-full whitespace-nowrap transition-colors duration-300">
                                      {t.newScan.comingSoon}
                                    </span>
                                  )}
                                </div>
                                <div className={`grid transition-all duration-300 ease-in-out ${isSelected ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                                  <div className="overflow-hidden">
                                    <p className="text-xs text-zinc-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">{item.desc}</p>
                                  </div>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Scan config (shown after platform selected) */}
        <div className={`grid transition-all duration-500 ease-in-out ${selectedPlatform ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden p-1 -m-1">
            <div className="bg-zinc-50 dark:bg-slate-900/50 p-6 border border-zinc-200 dark:border-slate-800 rounded-lg shadow-sm mt-1 space-y-5 transition-colors duration-300">

              <AnimatedWrapper show={isAvailable}>
                {/* Target URL */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-zinc-800 dark:text-slate-200 transition-colors duration-300">
                    {t.newScan.targetUrl} <span className="text-blue-800">{t.newScan.required}</span>
                  </label>
                  <input
                    type="url"
                    className="w-full p-2.5 border border-zinc-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-zinc-800 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-500 focus:border-blue-800 dark:focus:border-blue-500 outline-none text-sm transition-all duration-300 placeholder-zinc-400 dark:placeholder-slate-600"
                    placeholder="http://localhost:3002"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    required={isAvailable}
                  />
                </div>

                {/* Testing Mode */}
                <div className="space-y-2 pt-1">
                  <label className="block text-sm font-semibold text-zinc-800 dark:text-slate-200 transition-colors duration-300">
                    {t.newScan.testingMode} <span className="text-blue-800">{t.newScan.required}</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {TESTING_MODES.map((m) => (
                      <label
                        key={m.value}
                        className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                          testingMode === m.value
                            ? 'border-blue-800 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                            : 'border-zinc-200 dark:border-slate-700 hover:border-blue-700/60 dark:hover:border-blue-600/40 hover:bg-white dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="testingMode"
                          className="sr-only"
                          value={m.value}
                          checked={testingMode === m.value}
                          onChange={() => { setTestingMode(m.value); setUsername(''); setPassword(''); setSwaggerUrl(''); }}
                        />
                        <span className={`text-xs font-bold mb-0.5 ${testingMode === m.value ? 'text-blue-800 dark:text-blue-400' : 'text-zinc-700 dark:text-slate-300'}`}>
                          {m.label}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-slate-400 leading-relaxed">{m.desc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Credentials */}
                <AnimatedWrapper show={needsCreds}>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300">
                        {t.newScan.username} <span className="text-blue-800">{t.newScan.required}</span>
                      </label>
                      <input
                        type="text"
                        className="w-full p-2.5 border border-zinc-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-zinc-800 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-500 outline-none text-sm transition-all duration-300 placeholder-zinc-400 dark:placeholder-slate-600"
                        placeholder="admin@example.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300">
                        {t.newScan.password} <span className="text-blue-800">{t.newScan.required}</span>
                      </label>
                      <input
                        type="password"
                        className="w-full p-2.5 border border-zinc-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-zinc-800 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-500 outline-none text-sm transition-all duration-300 placeholder-zinc-400 dark:placeholder-slate-600"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </AnimatedWrapper>

                {/* Swagger URL */}
                <AnimatedWrapper show={needsSwagger}>
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-slate-300">
                      {t.newScan.swaggerUrl} <span className="text-blue-800">{t.newScan.required}</span>
                    </label>
                    <input
                      type="url"
                      className="w-full p-2.5 border border-zinc-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-zinc-800 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-800 dark:focus:ring-blue-500 outline-none text-sm transition-all duration-300 placeholder-zinc-400 dark:placeholder-slate-600"
                      placeholder="http://localhost:3002/api-docs"
                      value={swaggerUrl}
                      onChange={(e) => setSwaggerUrl(e.target.value)}
                    />
                  </div>
                </AnimatedWrapper>
              </AnimatedWrapper>

              {/* Platform not yet available */}
              <AnimatedWrapper show={selectedPlatform !== '' && !isAvailable}>
                <div className="py-4 text-center">
                  <div className="inline-block p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-full mb-3 transition-colors duration-300">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-slate-200 transition-colors duration-300">{t.newScan.moduleInDev}</h4>
                  <p className="text-xs text-zinc-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed transition-colors duration-300">
                    {t.newScan.moduleInDevDesc.replace('{name}', selectedItem?.name ?? '')}
                  </p>
                </div>
              </AnimatedWrapper>

            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg text-sm text-blue-600 dark:text-blue-400">
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!canSubmit}
            className="bg-blue-800 dark:bg-blue-500 text-white px-6 py-2.5 rounded-md font-semibold hover:bg-blue-900 dark:hover:bg-blue-600 transition-colors shadow-sm disabled:bg-zinc-300 dark:disabled:bg-slate-800 disabled:text-zinc-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{t.newScan.submitting}</span>
              </>
            ) : (
              <span>{t.newScan.submit}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function AnimatedWrapper({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <div className={`grid transition-all duration-300 ease-in-out ${show ? 'grid-rows-[1fr] opacity-100 mb-2' : 'grid-rows-[0fr] opacity-0 mb-0'}`}>
      <div className="overflow-hidden p-1 -m-1">
        {children}
      </div>
    </div>
  );
}
