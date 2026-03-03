import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Navigation } from "@/components/Navigation";
import { ScanlineBackground } from "@/components/ScanlineBackground";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SEQI.MUSEUM",
  description: "个人博物馆 — 技术、阅读、成就的数字展厅",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
      <body
        style={{ background: "#080b0f", color: "#e2e8f0" }}
        className="antialiased"
      >
        <ScanlineBackground />
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
