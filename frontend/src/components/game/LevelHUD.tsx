/**
 * LevelHUD.tsx — Header bar di bagian atas layar tantangan.
 * Menampilkan navigasi kembali ke peta, judul level, indikator petunjuk, dan status XP/pangkat.
 */

"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Lightbulb } from "lucide-react";
import { RankBadge } from "./RankBadge";
import type { LevelConfig } from "@/lib/game/config";

interface LevelHUDProps {
  level: LevelConfig;
  xp: number;
  hintsUsedCount: number;
  onOpenHint: () => void;
  isCompleted: boolean;
}

export function LevelHUD({
  level,
  xp,
  hintsUsedCount,
  onOpenHint,
  isCompleted,
}: LevelHUDProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[#3d322c]">
      {/* Kiri: Tombol Kembali & Info Level */}
      <div className="flex items-center gap-3">
        <Link
          href="/tantangan"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#241e1b] border border-[#3d322c] hover:border-[#e07a5f] text-xs font-mono text-[#c8b8a8] hover:text-[#f4ede2] transition-colors"
          aria-label="Kembali ke Peta Tantangan"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Peta</span>
        </Link>

        <div>
          <span className="text-[11px] font-mono text-[#e07a5f] uppercase tracking-wider block">
            {level.number <= 5 ? `Level ${level.number}` : "Level Bebas"}
          </span>
          <h1 className="text-base sm:text-lg font-serif font-bold text-[#f4ede2]">
            {level.title}
          </h1>
        </div>
      </div>

      {/* Kanan: Tombol Petunjuk & Pangkat XP */}
      <div className="flex items-center gap-3">
        {!level.isDecisionLevel && !isCompleted && (
          <button
            type="button"
            onClick={onOpenHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2e1f1a] border border-[#e07a5f]/40 text-xs font-mono text-[#f4ede2] hover:bg-[#e07a5f] transition-colors"
            aria-label="Buka petunjuk kalkulus"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#f2cc8f]" />
            <span>Petunjuk</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < hintsUsedCount ? "bg-[#e07a5f]" : "bg-[#3d322c]"
                  }`}
                />
              ))}
            </div>
          </button>
        )}

        <Link href="/lencana" title="Buka Ruang Lencana & Pencapaian" className="hover:opacity-85 transition-opacity">
          <RankBadge xp={xp} />
        </Link>
      </div>
    </header>
  );
}
