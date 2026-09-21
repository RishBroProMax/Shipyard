import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shipyard | Self-Hosted Developer Platform & PaaS Appliance",
  description:
    "Transform any fresh Linux VPS into a self-contained developer platform. Zero configuration, automatic PostgreSQL 16 & Redis 7, Caddy SSL, in-browser file studio, and real hardware telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen antialiased selection:bg-cyan-500/25 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
