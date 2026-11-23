/**
 * HintBox.tsx — Modal / popover petunjuk cerdas kalkulus 3 tingkat.
 * Mengungkap petunjuk satu per satu: Arah kemiringan (dP), Suhu (Hangat/Dingin), dan Rentang Puncak.
 */

"use client";

import React from "react";
import { X, Compass, Thermometer, Crosshair, ChevronRight } from "lucide-react";
import {
  evaluateSlopeHint,
  evaluateHotColdHint,
  evaluateRangeHint,
  calculateScore,
} from "@/lib/game/engine";
import type { CurvePoint, Curves } from "@/types/api";
import { formatRupiah } from "@/lib/format";
import type { LanguageMode } from "@/lib/copy";

interface HintBoxProps {
  isOpen: boolean;
  onClose: () => void;
  activePoint: CurvePoint | undefined;
  curves: Curves;
  mode: LanguageMode;
  hintsRevealed: number; // 0..3
  onRevealNextHint: () => void;
}

export function HintBox({
  isOpen,
  onClose,
  activePoint,
  curves,
  mode,
  hintsRevealed,
  onRevealNextHint,
}: HintBoxProps) {
  if (!isOpen) return null;

  const points = curves.points;
  const optX = curves.markers.optimum?.x ?? 75;
  let optIndex = 0;
  let minDiff = Infinity;
  points.forEach((p, idx) => {
    const diff = Math.abs(p.x - optX);
    if (diff < minDiff) {
      minDiff = diff;
      optIndex = idx;
    }
  });

  const range = evaluateRangeHint(optIndex, points.length);
  const minPrice = points[range.minIndex]?.price ?? 0;
  const maxPrice = points[range.maxIndex]?.price ?? 0;

  // Hitung skor sementara untuk petunjuk suhu
  const allProfits = points.map((p) => p.P);
  const minP = Math.min(...allProfits);
  const maxP = Math.max(...allProfits);
  const currentP = activePoint?.P ?? minP;
  const currentScore = calculateScore(currentP, minP, maxP);

  const slopeMessage = activePoint ? evaluateSlopeHint(activePoint.dP, mode) : "-";
  const hotCold = evaluateHotColdHint(currentScore);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Petunjuk Kalkulus"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
    >
      <div className="w-full max-w-md bg-[#241e1b] border border-[#3d322c] rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#3d322c] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2e1f1a] flex items-center justify-center text-[#e07a5f]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-[#f4ede2]">
                Petunjuk Analisis
              </h3>
              <p className="text-[11px] font-mono text-[#c8b8a8]">
                {hintsRevealed} dari 3 petunjuk terbuka (-10 XP per petunjuk)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#c8b8a8] hover:text-[#f4ede2] p-1 rounded-lg hover:bg-[#1a1614] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daftar Petunjuk */}
        <div className="flex flex-col gap-3">
          {/* Petunjuk 1: Arah Kemiringan */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#e07a5f] mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Petunjuk 1 · Arah Kemiringan</span>
            </div>
            {hintsRevealed >= 1 ? (
              <p className="text-xs text-[#f4ede2] leading-relaxed mt-1">
                {slopeMessage}
              </p>
            ) : (
              <p className="text-xs text-[#c8b8a8] italic">
                Terkunci. Buka untuk mengetahui apakah Anda harus menambah atau mengurangi cangkir.
              </p>
            )}
          </div>

          {/* Petunjuk 2: Suhu (Hangat / Dingin) */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#f2cc8f] mb-1">
              <Thermometer className="w-3.5 h-3.5" />
              <span>Petunjuk 2 · Deteksi Suhu</span>
            </div>
            {hintsRevealed >= 2 ? (
              <p className="text-xs text-[#f4ede2] leading-relaxed mt-1">
                {hotCold.message}
              </p>
            ) : (
              <p className="text-xs text-[#c8b8a8] italic">
                Terkunci. Buka untuk mengetahui seberapa dekat posisi Anda dengan titik optimum.
              </p>
            )}
          </div>

          {/* Petunjuk 3: Rentang Sasaran Puncak */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#81b29a] mb-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Petunjuk 3 · Rentang Sasaran Puncak</span>
            </div>
            {hintsRevealed >= 3 ? (
              <p className="text-xs text-[#f4ede2] leading-relaxed mt-1">
                Puncak keuntungan terbaik berada pada rentang harga antara{" "}
                <span className="font-mono text-[#f2cc8f] font-bold">
                  {formatRupiah(minPrice)}
                </span>{" "}
                sampai{" "}
                <span className="font-mono text-[#f2cc8f] font-bold">
                  {formatRupiah(maxPrice)}
                </span>.
              </p>
            ) : (
              <p className="text-xs text-[#c8b8a8] italic">
                Terkunci. Buka untuk melihat perkiraan sempit rentang harga puncak.
              </p>
            )}
          </div>
        </div>

        {/* Tombol Aksi Buka Petunjuk Berikutnya */}
        <div className="mt-5 pt-3 border-t border-[#3d322c] flex items-center justify-between">
          <span className="text-[11px] text-[#c8b8a8]">
            {hintsRevealed >= 3
              ? "Semua petunjuk sudah terbuka."
              : "Petunjuk tidak mengurangi bintang."}
          </span>
          {hintsRevealed < 3 ? (
            <button
              type="button"
              onClick={onRevealNextHint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e07a5f] hover:bg-[#f28e73] text-white text-xs font-medium transition-colors"
            >
              <span>Buka Petunjuk {hintsRevealed + 1}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#2e1f1a] text-[#f4ede2] text-xs font-medium hover:bg-[#e07a5f] transition-colors"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
