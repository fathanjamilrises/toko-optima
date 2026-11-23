/**
 * ResultPanel.tsx — Panel hasil penilaian level setelah jawaban dikunci.
 * Menampilkan bintang, stempel stiker miring, perbandingan hasil, pelajaran bisnis,
 * serta tombol navigasi level berikutnya dan tombol lihat hitungan lengkap di /.
 */

"use client";

import React from "react";
import Link from "next/link";
import { Star, RotateCcw, ArrowRight, FileText } from "lucide-react";
import type { ScoreResult } from "@/lib/game/engine";
import { formatRupiah } from "@/lib/format";
import { CoffeeBeansBurst } from "./CoffeeBeansBurst";

interface ResultPanelProps {
  result: ScoreResult;
  chosenProfit: number;
  maxProfit: number;
  lesson: string;
  nextLevelId: string | null;
  presetId: string | null;
  onRetry: () => void;
  earnedXp: number;
  rewardDetails: string[];
}

export function ResultPanel({
  result,
  chosenProfit,
  maxProfit,
  lesson,
  nextLevelId,
  presetId,
  onRetry,
  earnedXp,
  rewardDetails,
}: ResultPanelProps) {
  const isLossCase = maxProfit < 0;

  return (
    <div
      role="region"
      aria-label="Hasil Tantangan"
      className="w-full bg-[#241e1b] border border-[#3d322c] rounded-2xl p-6 flex flex-col gap-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Efek Ledakan Biji Kopi Saat 3 Bintang (DESIGN.md 6.5) */}
      {result.stars === 3 && <CoffeeBeansBurst />}

      {/* Baris Atas: Bintang & Stempel Miring */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Bintang */}
        <div className="flex items-center gap-1.5" aria-label={`${result.stars} dari 3 bintang`}>
          {[1, 2, 3].map((starNum) => {
            const isFilled = starNum <= result.stars;
            return (
              <Star
                key={starNum}
                className={`w-7 h-7 ${
                  isFilled
                    ? "text-[#f2cc8f] fill-[#f2cc8f] drop-shadow-sm scale-105"
                    : "text-[#3d322c]"
                } transition-all`}
              />
            );
          })}
        </div>

        {/* Stempel Stiker Miring Taktil (#3) */}
        <div
          className={`px-4 py-1.5 rounded-lg border-2 font-mono text-xs font-black tracking-wider uppercase rotate-[-3deg] shadow-md select-none ${
            result.stars === 3
              ? "border-[#81b29a] text-[#81b29a] bg-[#81b29a]/10"
              : result.stars >= 1
                ? "border-[#f2cc8f] text-[#f2cc8f] bg-[#f2cc8f]/10"
                : "border-[#d95d39] text-[#d95d39] bg-[#d95d39]/10"
          }`}
        >
          {result.stampText}
        </div>
      </div>

      {/* Ringkasan Skor & Angka */}
      <div className="p-4 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#c8b8a8]">Akurasi Keuntungan:</span>
          <span className="text-lg font-mono font-bold text-[#f4ede2]">
            {result.score}%
          </span>
        </div>

        <p className="text-sm font-serif text-[#f4ede2]">
          {isLossCase ? (
            <>
              Kerugian Anda adalah{" "}
              <strong className="text-[#e07a5f] font-mono font-bold">
                {formatRupiah(chosenProfit)}
              </strong>{" "}
              (kerugian terminim: {formatRupiah(maxProfit)}).
            </>
          ) : (
            <>
              Untung harian Anda sebesar{" "}
              <strong className="text-[#81b29a] font-mono font-bold">
                {formatRupiah(chosenProfit)}
              </strong>{" "}
              dari potensi maksimal {formatRupiah(maxProfit)}.
            </>
          )}
        </p>

        {/* Rincian Perolehan XP */}
        {earnedXp > 0 && (
          <div className="mt-2 pt-2 border-t border-[#3d322c] flex flex-col gap-1 text-[11px] font-mono text-[#f2cc8f]">
            <div className="font-bold">+ {earnedXp} XP Diperoleh:</div>
            {rewardDetails.map((det, idx) => (
              <span key={idx} className="text-[#c8b8a8]">
                • {det}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Satu Kalimat Pelajaran Bisnis */}
      <div className="p-3.5 rounded-xl bg-[#2e1f1a] border border-[#e07a5f]/40">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#e07a5f] block font-bold mb-1">
          Pelajaran Kunci
        </span>
        <p className="text-xs text-[#f4ede2] leading-relaxed font-sans">
          {lesson}
        </p>
      </div>

      {/* Tombol Navigasi Tindakan */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#3d322c] bg-[#1a1614] hover:border-[#c8b8a8] text-xs font-medium text-[#c8b8a8] hover:text-[#f4ede2] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>

          {presetId && (
            <Link
              href={`/?preset=${presetId}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#3d322c] bg-[#1a1614] hover:border-[#e07a5f] text-xs font-medium text-[#c8b8a8] hover:text-[#f4ede2] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-[#e07a5f]" />
              <span>Hitungan Lengkap</span>
            </Link>
          )}
        </div>

        {nextLevelId ? (
          <Link
            href={`/tantangan/${nextLevelId}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e07a5f] hover:bg-[#f28e73] text-white text-xs font-medium shadow-md transition-colors"
          >
            <span>Level Berikutnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <Link
            href="/tantangan"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#81b29a] hover:bg-[#81b29a]/90 text-white text-xs font-medium shadow-md transition-colors"
          >
            <span>Kembali ke Peta</span>
          </Link>
        )}
      </div>
    </div>
  );
}
