import type { Metadata } from "next";
import { Caveat, Figtree, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["opsz", "SOFT", "WONK"], display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"], display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "KopiOptima — Simulator untung kedai kopi",
  description: "Simulator untung terbesar untuk kedai kopi berbasis kalkulus dasar.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-type="software" lang="id">
      <body className={`${fraunces.variable} ${figtree.variable} ${mono.variable} ${caveat.variable}`}>
        <Header />
        <main id="top">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
