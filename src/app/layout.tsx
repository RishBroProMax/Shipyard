import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shipyard | Zero-Config Self-Hosted Developer Platform & PaaS",
  description: "Transform any fresh Linux VPS into a self-contained developer platform. PostgreSQL 16, Redis, Caddy SSL, Git webhooks, in-browser file editor, and real hardware telemetry with 0 mock data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[#050608] text-zinc-100 min-h-screen antialiased selection:bg-cyan-500/20 selection:text-cyan-300`}
      >
        {children}
      </body>
    </html>
  );
}
