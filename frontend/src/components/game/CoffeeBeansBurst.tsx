/**
 * CoffeeBeansBurst.tsx — Efek perayaan 3 bintang (DESIGN.md 6.5).
 * Meledakkan ±60 butir "biji kopi" kecil secara prosedural,
 * berhamburan selama 1,2 detik lalu otomatis dibersihkan dari memori.
 * Menghormati prefers-reduced-motion (dinonaktifkan jika reduced-motion aktif).
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";

interface BeanParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  dx: number;
  dy: number;
  dRot: number;
}

export function CoffeeBeansBurst() {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Periksa preferensi gerak pengguna
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Inisialisasi 60 butir biji kopi dengan lintasan menyebar
  const particles: BeanParticle[] = useMemo(() => {
    if (prefersReducedMotion) return [];

    const list: BeanParticle[] = [];
    const count = 60;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 120 + Math.random() * 260; // pixel distance
      list.push({
        id: i,
        x: 0,
        y: 0,
        rotation: Math.random() * 360,
        scale: 0.7 + Math.random() * 0.6,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed - 60, // bias ke atas
        dRot: (Math.random() - 0.5) * 720,
      });
    }

    return list;
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsVisible(false);
      return;
    }

    // Buang komponen dari memori tepat setelah 1,2 detik (DESIGN.md 6.5)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  if (!isVisible || prefersReducedMotion || particles.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-0 h-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute -top-3 -left-2 w-4 h-5 rounded-[50%] bg-[#4a2e18] border border-[#2e1c0e] shadow-md transition-all duration-1000 ease-out"
            style={{
              transform: `translate(${p.dx}px, ${p.dy}px) rotate(${p.rotation + p.dRot}deg) scale(${p.scale})`,
              opacity: 0,
            }}
          >
            {/* Guratan Garis Tengah Biji Kopi */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-3.5 bg-[#241408] rounded-full rotate-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
