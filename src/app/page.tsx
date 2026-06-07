"use client";

import { ArrowRight, Languages, Scale, BriefcaseBusiness, ShieldCheck, Sparkles, X, User, DollarSign, Globe, Check } from "lucide-react";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/components/auth-provider";

type Locale = "es" | "en";
type AnalysisType = "contract" | "proposals";

const copy = {
  es: {
    badge: "MATERIAL AI WORKSPACE",
    heroTitle: "Audita tus documentos comerciales y contratos con Inteligencia Artificial",
    heroSubtitle: "Descubre riesgos legales y financieros ocultos por solo $10 USD por documento. Sin suscripciones, paga solo por lo que usas.",
    auditContract: "Auditar Contrato ($10 USD)",
    compareProposals: "Comparar Propuestas ($10 USD)",
    servicesTitle: "Servicios",
    contractReview: "Revisión de Contratos",
    contractReviewDesc: "Detecta cláusulas abusivas, riesgos ocultos y obligaciones críticas.",
    proposalComparison: "Comparador de Propuestas",
    proposalComparisonDesc: "Elige la cotización más rentable con análisis comparativo detallado.",
    howItWorksTitle: "Cómo Funciona",
    howItWorksStep1: "Sube tu documento",
    howItWorksStep1Desc: "Arrastra tu contrato o propuestas en PDF",
    howItWorksStep2: "Analiza con IA",
    howItWorksStep2Desc: "Gemini procesa el contenido en segundos",
    howItWorksStep3: "Recibe resultados",
    howItWorksStep3Desc: "Obtén un informe detallado y accionable",
    expertsTitle: "Comité de Expertos",
    expertsSubtitle: "Nuestra IA está entrenada por profesionales de primer nivel",
    legalAgent: "Agente Legal",
    legalAgentSubtitle: "Entrenado por Abogado Corporativo Senior",
    legalAgentDesc: "Especializado en blindaje de contratos, detección de penalizaciones ocultas y cláusulas abusivas.",
    financialAgent: "Agente Financiero",
    financialAgentSubtitle: "Entrenado por Contadora Pública y Auditora",
    financialAgentDesc: "Optimizado para analizar costos ocultos, viabilidad de presupuestos y márgenes de ganancia en propuestas.",
    strategyAgent: "Agente de Estrategia Global",
    strategyAgentSubtitle: "Entrenado por Profesional en Negocios y Gerencia Internacional",
    strategyAgentDesc: "Diseñado para auditar el cumplimiento normativo internacional, escalabilidad comercial y términos de comercio global.",
    pricingTitle: "Precio Transparente",
    pricingSubtitle: "$10 USD por análisis único. Paga solo por lo que usas.",
    pricingNote: "Sin suscripciones ocultas. Sin cargos mensuales.",
    modalTitle: "Iniciar Sesión",
    modalSubtitle: "Completa el proceso para comenzar tu análisis",
    termsCheckbox: "Acepto los Términos y Condiciones",
    privacyCheckbox: "Autorizo el Tratamiento de Datos Personales de acuerdo con la Política de Privacidad",
    termsTitle: "Términos y Condiciones",
    termsContent: "Business Desk es un prototipo de auditoría asistida por Inteligencia Artificial. Al utilizar este servicio, usted acepta que los documentos proporcionados serán procesados de forma confidencial y segura. Los resultados generados por la IA son de carácter informativo y no constituyen asesoramiento legal o financiero profesional. Ferova no se hace responsable de decisiones tomadas basadas en estos análisis. El servicio se proporciona bajo el modelo de pago por uso, con un costo de $10 USD por análisis.",
    privacyTitle: "Política de Privacidad",
    privacyContent: "En Business Desk, protegemos su privacidad. Sus documentos se procesan de forma segura y no se comparten con terceros. Los datos personales se utilizan exclusivamente para la autenticación y prestación del servicio. Implementamos medidas de seguridad estándar de la industria para proteger su información. Puede solicitar la eliminación de sus datos en cualquier momento contactando a nuestro equipo de soporte.",
    loginButton: "Iniciar sesión con Google",
    close: "Cerrar",
  },
  en: {
    badge: "MATERIAL AI WORKSPACE",
    heroTitle: "Audit your business documents and contracts with AI",
    heroSubtitle: "Discover hidden legal and financial risks for just $10 USD per document. No subscriptions, pay only for what you use.",
    auditContract: "Audit Contract ($10 USD)",
    compareProposals: "Compare Proposals ($10 USD)",
    servicesTitle: "Services",
    contractReview: "Contract Review",
    contractReviewDesc: "Detect abusive clauses, hidden risks, and critical obligations.",
    proposalComparison: "Proposal Comparison",
    proposalComparisonDesc: "Choose the most profitable quote with detailed comparative analysis.",
    howItWorksTitle: "How It Works",
    howItWorksStep1: "Upload your document",
    howItWorksStep1Desc: "Drag your contract or proposals in PDF format",
    howItWorksStep2: "Analyze with AI",
    howItWorksStep2Desc: "Gemini processes the content in seconds",
    howItWorksStep3: "Receive results",
    howItWorksStep3Desc: "Get a detailed and actionable report",
    expertsTitle: "Expert Committee",
    expertsSubtitle: "Our AI is trained by top-tier professionals",
    legalAgent: "Legal AI Agent",
    legalAgentSubtitle: "Trained by Senior Corporate Lawyer",
    legalAgentDesc: "Specialized in contract shielding, detection of hidden penalties, and abusive clauses.",
    financialAgent: "Financial AI Agent",
    financialAgentSubtitle: "Trained by CPA and Auditor",
    financialAgentDesc: "Optimized to analyze hidden costs, budget feasibility, and profit margins in proposals.",
    strategyAgent: "Global Strategy Agent",
    strategyAgentSubtitle: "Trained by Business Professional and International Manager",
    strategyAgentDesc: "Designed to audit international regulatory compliance, commercial scalability, and global trade terms.",
    pricingTitle: "Transparent Pricing",
    pricingSubtitle: "$10 USD per single analysis. Pay only for what you use.",
    pricingNote: "No hidden subscriptions. No monthly charges.",
    modalTitle: "Sign In",
    modalSubtitle: "Complete the process to start your analysis",
    termsCheckbox: "I accept the Terms and Conditions",
    privacyCheckbox: "I authorize the processing of personal data according to the Privacy Policy",
    termsTitle: "Terms and Conditions",
    termsContent: "Business Desk is an AI-assisted audit prototype. By using this service, you agree that the documents provided will be processed confidentially and securely. The results generated by the AI are for informational purposes only and do not constitute professional legal or financial advice. Ferova is not responsible for decisions made based on these analyses. The service is provided under a pay-per-use model, with a cost of $10 USD per analysis.",
    privacyTitle: "Privacy Policy",
    privacyContent: "At Business Desk, we protect your privacy. Your documents are processed securely and are not shared with third parties. Personal data is used exclusively for authentication and service provision. We implement industry-standard security measures to protect your information. You may request the deletion of your data at any time by contacting our support team.",
    loginButton: "Sign in with Google",
    close: "Close",
  },
} satisfies Record<Locale, Record<string, string>>;

function LandingPage() {
  const { user, loading, login } = useAuth();
  const [locale, setLocale] = useState<Locale>("es");
  const [showModal, setShowModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AnalysisType | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const t = copy[locale];

  // Redirigir a /dashboard si ya está autenticado
  if (!loading && user) {
    window.location.href = "/dashboard";
    return null;
  }

  const handleToolClick = (tool: AnalysisType) => {
    setSelectedTool(tool);
    setShowModal(true);
  };

  const handleLogin = async () => {
    if (termsAccepted && privacyAccepted) {
      await login();
      // Redirigir a /dashboard con la herramienta seleccionada
      window.location.href = `/dashboard?tool=${selectedTool}`;
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-[#e6e1e5]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#cac4d0]/10 bg-[#121212]/78 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#a8c7fa] text-[#062e6f]"><Sparkles className="h-5 w-5" /></div>
            <div>
              <p className="text-lg font-medium tracking-[-0.02em]">Business Desk</p>
              <p className="text-xs text-[#cac4d0]">Material AI Workspace</p>
            </div>
          </div>
          <LanguageSwitch locale={locale} onChange={setLocale} />
        </div>
      </header>

      {/* Hero Section */}
      <section className="grid min-h-screen place-items-center px-6 pt-20">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#a8c7fa]/12 px-4 py-2 text-xs font-medium tracking-[0.12em] text-[#d7e3f8]">
            <Sparkles className="h-4 w-4" /> {t.badge}
          </div>
          <h1 className="max-w-4xl mx-auto text-5xl font-medium tracking-[-0.04em] text-[#e6e1e5] md:text-7xl lg:text-8xl">
            {t.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-[#cac4d0] md:text-xl">
            {t.heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button onClick={() => handleToolClick("contract")} className="group inline-flex h-16 items-center gap-3 rounded-full bg-[#a8c7fa] px-8 text-base font-bold text-[#062e6f] shadow-[0_4px_16px_rgba(168,199,250,0.32)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20">
              <Scale className="h-5 w-5" /> {t.auditContract} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => handleToolClick("proposals")} className="group inline-flex h-16 items-center gap-3 rounded-full border-2 border-[#a8c7fa] px-8 text-base font-bold text-[#a8c7fa] shadow-[0_4px_16px_rgba(168,199,250,0.16)] transition hover:bg-[#a8c7fa]/10 focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20">
              <BriefcaseBusiness className="h-5 w-5" /> {t.compareProposals} <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5] md:text-4xl">{t.servicesTitle}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <FeatureCard
              icon={Scale}
              title={t.contractReview}
              description={t.contractReviewDesc}
            />
            <FeatureCard
              icon={BriefcaseBusiness}
              title={t.proposalComparison}
              description={t.proposalComparisonDesc}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-24 bg-[#1c1b1f]/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5] md:text-4xl">{t.howItWorksTitle}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              step="1"
              title={t.howItWorksStep1}
              description={t.howItWorksStep1Desc}
            />
            <StepCard
              step="2"
              title={t.howItWorksStep2}
              description={t.howItWorksStep2Desc}
            />
            <StepCard
              step="3"
              title={t.howItWorksStep3}
              description={t.howItWorksStep3Desc}
            />
          </div>
        </div>
      </section>

      {/* Expert Committee Section */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5] md:text-4xl">{t.expertsTitle}</h2>
            <p className="mt-4 text-lg text-[#cac4d0]">{t.expertsSubtitle}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <ExpertCard
              icon={Scale}
              title={t.legalAgent}
              subtitle={t.legalAgentSubtitle}
              description={t.legalAgentDesc}
            />
            <ExpertCard
              icon={DollarSign}
              title={t.financialAgent}
              subtitle={t.financialAgentSubtitle}
              description={t.financialAgentDesc}
            />
            <ExpertCard
              icon={Globe}
              title={t.strategyAgent}
              subtitle={t.strategyAgentSubtitle}
              description={t.strategyAgentDesc}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-24 bg-[#1c1b1f]/50">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-[2rem] bg-[#1c1b1f] shadow-[0_8px_32px_rgba(0,0,0,0.48)] ring-1 ring-[#cac4d0]/10">
            <div className="p-8 md:p-12 lg:p-16">
              <h2 className="mb-4 text-center text-3xl font-medium tracking-[-0.03em] text-[#e6e1e5] md:text-4xl">{t.pricingTitle}</h2>
              <p className="mb-8 text-center text-lg text-[#cac4d0]">{t.pricingSubtitle}</p>
              <div className="mb-8 rounded-3xl bg-[#2b2930] p-6 text-center">
                <p className="text-5xl font-medium text-[#e6e1e5]">$10 USD</p>
                <p className="mt-2 text-sm text-[#cac4d0]">{t.pricingNote}</p>
              </div>
              <div className="text-center">
                <button onClick={() => handleToolClick("contract")} className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20">
                  {t.auditContract} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#cac4d0]/10 px-6 py-12">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm text-[#cac4d0]">© 2026 Business Desk by Ferova. All rights reserved.</p>
        </div>
      </footer>

      {/* Login Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212]/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#1c1b1f] shadow-[0_8px_32px_rgba(0,0,0,0.48)] ring-1 ring-[#cac4d0]/10">
            <div className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-medium text-[#e6e1e5]">{t.modalTitle}</h3>
                  <p className="mt-1 text-sm text-[#cac4d0]">{t.modalSubtitle}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-[#cac4d0] transition hover:bg-[#2b2930] hover:text-[#e6e1e5]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#938f99]/25 bg-[#2b2930] text-[#a8c7fa] focus:ring-[#a8c7fa]/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-[#e6e1e5]">{t.termsCheckbox}</span>
                    <button onClick={() => setShowTerms(!showTerms)} className="ml-2 text-xs text-[#a8c7fa] underline">
                      {showTerms ? t.close : t.termsTitle}
                    </button>
                    {showTerms && (
                      <div className="mt-3 rounded-2xl bg-[#2b2930] p-4 text-xs leading-5 text-[#cac4d0]">
                        <strong className="text-[#e6e1e5]">{t.termsTitle}</strong>
                        <p className="mt-2">{t.termsContent}</p>
                      </div>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-[#938f99]/25 bg-[#2b2930] text-[#a8c7fa] focus:ring-[#a8c7fa]/20"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-[#e6e1e5]">{t.privacyCheckbox}</span>
                    <button onClick={() => setShowPrivacy(!showPrivacy)} className="ml-2 text-xs text-[#a8c7fa] underline">
                      {showPrivacy ? t.close : t.privacyTitle}
                    </button>
                    {showPrivacy && (
                      <div className="mt-3 rounded-2xl bg-[#2b2930] p-4 text-xs leading-5 text-[#cac4d0]">
                        <strong className="text-[#e6e1e5]">{t.privacyTitle}</strong>
                        <p className="mt-2">{t.privacyContent}</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <button
                onClick={handleLogin}
                disabled={!termsAccepted || !privacyAccepted}
                className="mt-6 inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#a8c7fa] px-7 text-sm font-bold text-[#062e6f] shadow-[0_2px_8px_rgba(168,199,250,0.22)] transition hover:bg-[#d7e3f8] focus:outline-none focus:ring-4 focus:ring-[#a8c7fa]/20 disabled:cursor-not-allowed disabled:bg-[#938f99]/35 disabled:text-[#cac4d0]/60"
              >
                <Sparkles className="h-5 w-5" /> {t.loginButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="rounded-3xl bg-[#1c1b1f] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.32)] ring-1 ring-[#cac4d0]/10 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.48)]">
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-[#a8c7fa]/12 text-[#a8c7fa]">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mb-3 text-xl font-medium text-[#e6e1e5]">{title}</h3>
      <p className="text-sm leading-6 text-[#cac4d0]">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="rounded-3xl bg-[#1c1b1f] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.32)] ring-1 ring-[#cac4d0]/10">
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-[#a8c7fa] text-[#062e6f] text-xl font-bold">
        {step}
      </div>
      <h3 className="mb-3 text-lg font-medium text-[#e6e1e5]">{title}</h3>
      <p className="text-sm leading-6 text-[#cac4d0]">{description}</p>
    </div>
  );
}

function ExpertCard({ icon: Icon, title, subtitle, description }: { icon: any; title: string; subtitle: string; description: string }) {
  return (
    <div className="rounded-3xl bg-[#1c1b1f] p-8 shadow-[0_4px_16px_rgba(0,0,0,0.32)] ring-1 ring-[#cac4d0]/10 transition hover:shadow-[0_6px_24px_rgba(0,0,0,0.48)]">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-[#a8c7fa]/12 text-[#a8c7fa]">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-[#e6e1e5]">{title}</h3>
      <p className="mb-4 text-xs font-medium text-[#a8c7fa]">{subtitle}</p>
      <p className="text-sm leading-6 text-[#cac4d0]">{description}</p>
    </div>
  );
}

function LanguageSwitch({ locale, onChange }: { locale: Locale; onChange: (locale: Locale) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[#2b2930] p-1 text-sm font-medium text-[#cac4d0]">
      <Languages className="ml-3 h-4 w-4 text-[#a8c7fa]" />
      {(["es", "en"] as const).map((item) => (
        <button key={item} onClick={() => onChange(item)} className="rounded-full px-3 py-1.5 transition hover:bg-[#36343b] hover:text-[#e6e1e5]" type="button">
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LandingPage />
    </AuthProvider>
  );
}
