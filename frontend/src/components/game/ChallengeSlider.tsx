/**
 * ChallengeSlider.tsx — Slider tantangan yang menempel tepat ke indeks array curves.points.
 * Menampilkan kuantitas cangkir, harga jual, dan estimasi keuntungan titik terpilih.
 * Mendukung navigasi keyboard: ← → (±1), Shift+← → (±10), Home/End.
 */

"use client";

import React, { useRef } from "react";
import type { CurvePoint } from "@/types/api";
import { formatNumber, formatRupiah } from "@/lib/format";
import { Check } from "lucide-react";

interface ChallengeSliderProps {
  points: CurvePoint[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onLockAnswer: () => void;
  isLocked: boolean;
  highlightRange?: { minIndex: number; maxIndex: number } | null;
}

export function ChallengeSlider({
  points,
  currentIndex,
  onIndexChange,
  onLockAnswer,
  isLocked,
  highlightRange,
}: ChallengeSliderProps) {
  const sliderRef = useRef<HTMLInputElement | null>(null);

  const maxIndex = Math.max(0, points.length - 1);
  const activePt = points[currentIndex] || points[0];

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  // Penanganan tombol keyboard panah
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLocked) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      triggerHaptic();
      onIndexChange(Math.max(0, currentIndex - step));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      triggerHaptic();
      onIndexChange(Math.min(maxIndex, currentIndex + step));
    } else if (e.key === "Home") {
      e.preventDefault();
      triggerHaptic();
      onIndexChange(0);
    } else if (e.key === "End") {
      e.preventDefault();
      triggerHaptic();
      onIndexChange(maxIndex);
    }
  };

  if (!points || points.length === 0) return null;

  return (
    <div className="w-full bg-[#241e1b] border border-[#3d322c] rounded-2xl p-5 flex flex-col gap-4">
      {/* Baris Status Nilai Terpilih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8b8a8] block">
            Target Jual
          </span>
          <span className="text-base font-serif font-bold text-[#f4ede2]">
            {formatNumber(Math.round(activePt.x))} cangkir
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8b8a8] block">
            Harga Seduh
          </span>
          <span className="text-base font-serif font-bold text-[#e07a5f]">
            {formatRupiah(activePt.price)}
          </span>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#c8b8a8] block">
            Laba Bersih Harian
          </span>
          <span
            className={`text-base font-serif font-bold ${
              activePt.P >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"
            }`}
          >
            {formatRupiah(activePt.P)}
          </span>
        </div>
      </div>

      {/* Kontrol Input Range Slider */}
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center h-11">
          <input
            ref={sliderRef}
            type="range"
            min={0}
            max={maxIndex}
            step={1}
            value={currentIndex}
            disabled={isLocked}
            onChange={(e) => {
              triggerHaptic();
              onIndexChange(Number(e.target.value));
            }}
            onKeyDown={handleKeyDown}
            aria-label="Slider penyesuaian target penjualan kopi"
            aria-valuetext={`${Math.round(activePt.x)} cangkir dengan harga ${formatRupiah(
              activePt.price
            )}, perkiraan laba ${formatRupiah(activePt.P)}`}
            className="w-full h-3 bg-[#1a1614] rounded-lg cursor-pointer accent-[#e07a5f] disabled:opacity-50"
          />

          {/* Indikator visual sorotan rentang petunjuk 3 (jika terbuka) */}
          {highlightRange && (
            <div
              className="absolute h-3 bg-[#81b29a]/30 pointer-events-none rounded-lg border-x-2 border-[#81b29a]"
              style={{
                left: `${(highlightRange.minIndex / maxIndex) * 100}%`,
                width: `${
                  ((highlightRange.maxIndex - highlightRange.minIndex) / maxIndex) * 100
                }%`,
              }}
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-[#c8b8a8]">
          <span>
            {formatNumber(Math.round(points[0].x))} cangkir ({formatRupiah(points[0].price)})
          </span>
          <span className="text-[#e07a5f]">
            Titik {currentIndex + 1} / {points.length}
          </span>
          <span>
            {formatNumber(Math.round(points[maxIndex].x))} cangkir ({formatRupiah(points[maxIndex].price)})
          </span>
        </div>
      </div>

      {/* Tombol Kunci Jawaban */}
      {!isLocked ? (
        <button
          type="button"
          onClick={onLockAnswer}
          className="w-full py-3 rounded-xl bg-[#e07a5f] hover:bg-[#f28e73] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Kunci Jawaban & Nilai Hasil</span>
        </button>
      ) : (
        <div className="py-2.5 text-center text-xs font-mono text-[#81b29a] bg-[#81b29a]/10 rounded-xl border border-[#81b29a]/30">
          ✓ Jawaban telah dikunci
        </div>
      )}
    </div>
  );
}
