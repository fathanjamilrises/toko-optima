/**
 * BottomNav.tsx — Navigasi bawah taktil bergaya floating dock (Sub-Fase 4E/4F).
 * Memindahkan navigasi utama (Simulasi, Tantangan, Lencana) ke bagian bawah layar,
 * sehingga area atas bebas dan tidak menabrak elemen 3D atau hotspot interaktif.
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Compass, Award } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Simulasi",
      href: "/",
      icon: Coffee,
      isActive: pathname === "/",
    },
    {
      label: "Tantangan",
      href: "/tantangan",
      icon: Compass,
      isActive: pathname.startsWith("/tantangan"),
    },
    {
      label: "Lencana",
      href: "/lencana",
      icon: Award,
      isActive: pathname === "/lencana",
    },
  ];

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-1.5 rounded-full bg-[#1a1614] border border-[#3d322c] shadow-[0_12px_32px_rgba(0,0,0,0.65)]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.isActive;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
              active
                ? "bg-[#e07a5f] text-[#12100e] font-bold shadow-sm"
                : "text-[#c8b8a8] hover:text-[#f4ede2] hover:bg-[#241e1b]"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
