/**
 * LevelMap.tsx — Peta Jalur Karier Barista & Tantangan Kedai Kopi.
 * Mengimplementasikan roadmap vertikal interaktif yang kaya visual (DESIGN.md 3.3).
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, Play, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";
import { LEVELS } from "@/lib/game/config";
import { getProgress, resetProgress, type GameProgress } from "@/lib/game/progress";
import { RankBadge } from "./RankBadge";

export function LevelMap() {
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const handleReset = () => {
    if (confirm("Reset seluruh progres permainan dan perolehan XP?")) {
      setProgress(resetProgress());
    }
  };

  if (!progress) return null;

  const totalStars = Object.values(progress.levels).reduce(
    (acc, lvl) => acc + (lvl.bestStars || 0),
    0
  );
  const completedLevels = Object.values(progress.levels).filter((l) => l.completed).length;

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 py-4">
      {/* Header Dashboard Karier Barista */}
      <div className="bento p-6 flex flex-col gap-5 border border-[#3d322c]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#e07a5f] font-semibold">
                Jalur Karier Barista
              </span>
              <span className="text-[#3d322c]">·</span>
              <span className="text-[10px] font-mono text-[#c8b8a8]">
                {completedLevels} / 5 Level Selesai
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f4ede2] m-0">
              Tantangan Kedai Kopi
            </h1>
            <p className="text-xs sm:text-sm text-[#c8b8a8] mt-1.5 max-w-xl leading-relaxed">
              Pecahkan 5 krisis bisnis nyata kedai kopi menggunakan intuisi kalkulus diferensial: dari menetapkan harga perdana, lembur barista, hingga batas kapasitas mesin.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#d95d39] text-xs font-mono text-[#c8b8a8] hover:text-[#d95d39] transition-colors"
              title="Reset seluruh perolehan bintang dan XP"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progres</span>
            </button>
          </div>
        </div>

        {/* Ringkasan Skor & Statistik Taktil */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#3d322c]">
          <div className="p-3 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a89888]">
              Pangkat Barista
            </span>
            <div className="mt-1">
              <RankBadge xp={progress.totalXp} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a89888]">
              Bintang Terkumpul
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-mono font-bold text-[#f2cc8f]">
                {totalStars}
              </span>
              <span className="text-xs font-mono text-[#a89888]">/ 15 ★</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a89888]">
              Total Pengalaman
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-mono font-bold text-[#e07a5f]">
                {progress.totalXp}
              </span>
              <span className="text-xs font-mono text-[#a89888]">XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jalur Vertikal Stasiun Level */}
      <div className="relative flex flex-col gap-4 pl-7 sm:pl-12 my-2">
        {/* Garis Vertikal Jalur */}
        <div className="absolute left-[27px] sm:left-[47px] top-6 bottom-6 w-0.5 bg-[#3d322c]" />

        {LEVELS.map((level) => {
          const lvlProgress = progress.levels[level.id] || {
            completed: false,
            bestScore: 0,
            bestStars: 0,
            attempts: 0,
          };

          const isCompleted = lvlProgress.completed;

          return (
            <div key={level.id} className="relative flex items-start gap-4 sm:gap-6 group">
              {/* Node Stasiun Lingkaran */}
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 z-10 transition-transform group-hover:scale-105 shadow-md ${
                  isCompleted
                    ? "bg-[#e07a5f] text-[#12100e] ring-4 ring-[#2e1f1a]"
                    : "bg-[#241e1b] text-[#c8b8a8] border-2 border-[#3d322c] group-hover:border-[#e07a5f]"
                }`}
              >
                {level.number <= 5 ? level.number : "∞"}
              </div>

              {/* Kartu Stasiun Tantangan */}
              <Link
                href={`/tantangan/${level.id}`}
                className={`flex-1 rounded-2xl p-4 sm:p-5 border transition-all flex flex-col gap-3 group-hover:border-[#e07a5f] ${
                  isCompleted
                    ? "bg-[#241e1b] border-[#3d322c]"
                    : "bg-[#1a1614] border-[#3d322c]"
                }`}
              >
                {/* Baris Atas: Label Level + Subtitle + Bintang */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#e07a5f]/15 border border-[#e07a5f]/30 text-[#e07a5f]">
                      {level.number <= 5 ? `Level ${level.number}` : "Sandbox"}
                    </span>
                    <span className="text-xs text-[#a89888] font-mono">
                      {level.subtitle}
                    </span>
                  </div>

                  {/* Bintang Perolehan */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= lvlProgress.bestStars
                            ? "text-[#f2cc8f] fill-[#f2cc8f]"
                            : "text-[#3d322c]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Judul & Deskripsi Misi */}
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#f4ede2] group-hover:text-[#e07a5f] transition-colors m-0">
                    {level.title}
                  </h3>
                  <p className="text-xs text-[#c8b8a8] mt-1 line-clamp-2 leading-relaxed">
                    {level.mission}
                  </p>
                </div>

                {/* Baris Bawah: Status & Tombol Aksi */}
                <div className="flex items-center justify-between pt-3 border-t border-[#3d322c]/60 text-xs">
                  {isCompleted ? (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#81b29a] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai ({lvlProgress.bestScore}/100)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-mono text-[11px] text-[#a89888]">
                      <Sparkles className="w-3 h-3 text-[#f2cc8f]" />
                      <span>Siap Dijalankan</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#e07a5f] group-hover:translate-x-0.5 transition-transform">
                    <span>{isCompleted ? "Main Ulang" : "Mulai Misi"}</span>
                    {isCompleted ? (
                      <ArrowRight className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
