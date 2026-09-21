import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ERPKU - Mini ERP Operasional Advertising & Signage",
  description: "Sistem Manajemen Bengkel Reklame, Kalkulator RAB, dan Dokumen Otomatis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
