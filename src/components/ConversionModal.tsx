"use client";

import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { translations } from '@/lib/translations';
import { useAuth } from './auth-provider';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ConversionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ConversionModal({ isOpen, onClose }: ConversionModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const { login } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleLogin = async () => {
    if (termsAccepted && privacyAccepted) {
      await login();
      window.location.href = "/dashboard";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] max-w-lg p-8">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {t.modalTitle}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm pt-2">
                $10 USD por ejecución profesional
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm text-white">{t.chkTerms}</span>
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="ml-2 text-xs text-primary underline"
              >
                {showTerms ? t.details : t.modalTitle}
              </button>
              {showTerms && (
                <div className="mt-3 rounded-2xl bg-slate-800 p-4 text-xs leading-5 text-slate-400">
                  <strong className="text-white">{t.modalTitle}</strong>
                  <p className="mt-2">{t.modalTerms}</p>
                </div>
              )}
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary"
            />
            <div className="flex-1">
              <span className="text-sm text-white">{t.chkPrivacy}</span>
            </div>
          </label>
        </div>

        <Button
          onClick={handleLogin}
          disabled={!termsAccepted || !privacyAccepted}
          className="mt-6 w-full h-14 rounded-full bg-primary text-background font-bold text-lg hover:bg-primary/90 transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          {t.googleBtn}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
