"use client";

import React, { useState } from 'react';
import { Hero } from '@/components/Hero';
import { ExpertCommittee } from '@/components/ExpertCommittee';
import { TaskCatalog } from '@/components/TaskCatalog';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ConversionModal } from '@/components/ConversionModal';
import { LanguageProvider } from '@/components/LanguageContext';
import { AuthProvider, useAuth } from '@/components/auth-provider';
import { translations } from '@/lib/translations';

function LandingPage() {
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const t = translations['es'];

  // Redirigir a /dashboard si ya está autenticado
  if (!loading && user) {
    window.location.href = "/dashboard";
    return null;
  }

  const handleTriggerTask = (taskId?: string) => {
    if (taskId) setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary">
      {/* Navigation & Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center border-b border-white/5">
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-primary rounded-full inline-block"></span>
          {t.navTitle} <span className="text-xs text-slate-500 font-normal">{t.byFerova}</span>
        </div>
        
        <LanguageSwitcher />
      </header>

      {/* Hero Section */}
      <Hero onTriggerModal={() => handleTriggerTask()} />

      {/* Interactive Catalog Section */}
      <TaskCatalog onSelectTask={handleTriggerTask} />
      
      {/* Expert Committee Section */}
      <ExpertCommittee />

      {/* Conversion Modal */}
      <ConversionModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTaskId(null);
        }} 
      />

      {/* Footer */}
      <footer className="py-16 text-center">
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed px-6">
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <LandingPage />
      </LanguageProvider>
    </AuthProvider>
  );
}
