/**
 * DecisionCard.tsx — Kartu Keputusan khusus Level 5 (DESIGN.md 7.7).
 * Menyajikan pilihan strategis bagi kondisi tidak layak produksi (NO_PRODUCTION).
 */

"use client";

import React from "react";
import { AlertTriangle, PowerOff, Store } from "lucide-react";
import type { ApiWarning } from "@/types/api";

interface DecisionCardProps {
  warnings: ApiWarning[];
  onChoose: (decision: "BUKA" | "TUTUP_SEMENTARA") => void;
  disabled?: boolean;
}

export function DecisionCard({ warnings, onChoose, disabled = false }: DecisionCardProps) {
  return (
    <div className="w-full bg-[#241e1b] border border-[#3d322c] rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#2e1f1a] flex items-center justify-center text-[#d95d39] shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[11px] font-mono text-[#d95d39] uppercase tracking-wider block font-semibold">
            Kondisi Kritis Terdeteksi
          </span>
          <h3 className="text-base font-serif font-bold text-[#f4ede2] mt-0.5">
            Biaya bahan baku melampaui kemampuan bayar pembeli di pasar
          </h3>
        </div>
      </div>

      {/* Ringkasan Peringatan Diagnostik */}
      <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c] text-xs text-[#c8b8a8]">
        {warnings.map((w) => (
          <p key={w.code} className="flex items-start gap-2">
            <span className="text-[#d95d39] font-bold">•</span>
            <span>{w.message}</span>
          </p>
        ))}
      </div>

      {/* Pilihan Keputusan Manajerial */}
      <div className="flex flex-col gap-2 pt-2">
        <span className="text-xs font-mono text-[#f4ede2] font-medium">
          Apa keputusan terbaik yang harus Anda ambil sebagai pemilik kedai?
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChoose("BUKA")}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#3d322c] bg-[#1a1614] hover:border-[#c8b8a8] text-[#c8b8a8] hover:text-[#f4ede2] text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
          >
            <Store className="w-4 h-4 text-[#c8b8a8]" />
            <span>Tetap Buka & Menjual Kopi</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChoose("TUTUP_SEMENTARA")}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[#d95d39] bg-[#2e1f1a] hover:bg-[#d95d39] text-[#f4ede2] hover:text-white text-xs font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <PowerOff className="w-4 h-4 text-[#d95d39] group-hover:text-white" />
            <span>Jeda Operasional & Evaluasi Biaya</span>
          </button>
        </div>
      </div>
    </div>
  );
}
