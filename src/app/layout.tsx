import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Desk",
  description: "Suite de operaciones bajo demanda con IA para freelancers y startups.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
