"use client";

import { useLanguage } from './LanguageContext';
import { translations } from '@/lib/translations';
import type { Language } from '@/lib/translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium hover:bg-slate-700/50 hover:text-white transition-all"
    >
      {t.langSwitch}
    </button>
  );
}
