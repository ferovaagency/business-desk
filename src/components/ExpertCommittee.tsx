"use client";

import { useLanguage } from './LanguageContext';
import { translations } from '@/lib/translations';
import { Scale, DollarSign, Globe } from 'lucide-react';

export function ExpertCommittee() {
  const { language } = useLanguage();
  const t = translations[language];

  const experts = [
    {
      icon: <Scale className="w-8 h-8" />,
      title: t.expert1Title,
      subtitle: t.expert1Sub,
      description: t.expert1Desc,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: t.expert2Title,
      subtitle: t.expert2Sub,
      description: t.expert2Desc,
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t.expert3Title,
      subtitle: t.expert3Sub,
      description: t.expert3Desc,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20"
    }
  ];

  return (
    <section className="py-24 px-6 bg-slate-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t.expertH2}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experts.map((expert, index) => (
            <div
              key={index}
              className="group relative bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900/60 hover:border-primary/30 transition-all duration-300 hover-float"
            >
              <div className={`w-16 h-16 rounded-2xl ${expert.color} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {expert.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {expert.title}
                </h3>
                <p className="text-sm font-medium text-primary">
                  {expert.subtitle}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {expert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
