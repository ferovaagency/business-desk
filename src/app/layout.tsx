import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Business Desk - Audita tus documentos comerciales y contratos con IA",
  description: "Auditoría legal y financiera asistida por Inteligencia Artificial. Detecta riesgos en contratos y compara propuestas comerciales en segundos. Paga solo por lo que usas.",
  keywords: ["auditoría legal", "análisis de contratos", "IA financiera", "comparación de propuestas", "Business Desk", "Ferova"],
  authors: [{ name: "Ferova" }],
  creator: "Ferova",
  publisher: "Ferova",
  robots: "index, follow",
  openGraph: {
    title: "Business Desk - Audita tus documentos comerciales y contratos con IA",
    description: "Auditoría legal y financiera asistida por Inteligencia Artificial. Detecta riesgos en contratos y compara propuestas comerciales en segundos.",
    type: "website",
    locale: "es_ES",
    siteName: "Business Desk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Desk - Audita tus documentos comerciales y contratos con IA",
    description: "Auditoría legal y financiera asistida por Inteligencia Artificial. Detecta riesgos en contratos y compara propuestas comerciales en segundos.",
  },
  verification: {
    google: "3J5gjLhQbfejai0FnFbsbhvw2aNdm5CXu2mKKJcoWxk",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="3J5gjLhQbfejai0FnFbsbhvw2aNdm5CXu2mKKJcoWxk" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Business Desk",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "10",
                priceCurrency: "USD",
                description: "$10 USD per analysis. Pay only for what you use.",
              },
              description: "Auditoría legal y financiera asistida por Inteligencia Artificial. Detecta riesgos en contratos y compara propuestas comerciales en segundos.",
              author: {
                "@type": "Organization",
                name: "Ferova",
                url: "https://ferova.com",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "42",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Ferova",
              url: "https://ferova.com",
              description: "Ecosistema de soluciones de negocio impulsadas por Inteligencia Artificial",
              sameAs: [],
              makesOffer: {
                "@type": "Offer",
                name: "Business Desk",
                description: "Auditoría legal y financiera asistida por IA",
              },
            }),
          }}
        />
      </head>
      <body className={roboto.className}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-10Z0ZR4S11"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-10Z0ZR4S11');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
