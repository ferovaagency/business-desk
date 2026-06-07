"use client";

import { useLanguage } from './LanguageContext';
import { translations } from '@/lib/translations';
import { ArrowRight } from 'lucide-react';

type HeroProps = {
  onTriggerModal: () => void;
};

export function Hero({ onTriggerModal }: HeroProps) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <section className="hero-gradient min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-tight">
            {t.heroH1}
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <button
            onClick={onTriggerModal}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-background font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/25"
          >
            {t.cta1}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-8 py-4 rounded-full border border-white/10 text-white font-medium hover:bg-white/5 transition-all">
            {t.cta2}
          </button>
        </div>
      </div>
    </section>
  );
}
