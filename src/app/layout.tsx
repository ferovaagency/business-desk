import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "Business Desk",
  description: "Suite de operaciones bajo demanda con IA para freelancers y startups.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
