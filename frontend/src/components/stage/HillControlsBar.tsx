/**
 * HillControlsBar.tsx — Bilah kontrol interaktif untuk adegan Bukit Untung (DESIGN.md 6.4).
 * Berisi tombol ganti sudut pandang kamera (Tampak Miring | Tampak Depan 2D | Reset),
 * dan slider penelusuran kurva x untuk menggerakkan cangkir penanda.
 */

"use client";

import React from "react";
import { Eye, RotateCcw, Compass } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { CurvePoint } from "@/types/api";
import type { LanguageMode } from "@/lib/copy";

export type CameraViewMode = "miring" | "depan";

interface HillControlsBarProps {
  viewMode: CameraViewMode;
  onViewModeChange: (mode: CameraViewMode) => void;
  onResetCamera: () => void;
  points: CurvePoint[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  mode: LanguageMode;
}

export function HillControlsBar({
  viewMode,
  onViewModeChange,
  onResetCamera,
  points,
  currentIndex,
  onIndexChange,
  mode,
}: HillControlsBarProps) {
  const maxIdx = Math.max(0, points.length - 1);
  const activePt = points[currentIndex] || points[0];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onIndexChange(val);
    if (typeof window !== "undefined" && navigator.vibrate) {
      navigator.vibrate(8);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#241e1b] border border-[#3d322c] rounded-2xl">
      {/* Baris Kontrol Sudut Kamera */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#c8b8a8]">Sudut Pandang:</span>
          <div className="flex items-center p-1 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <button
              type="button"
              onClick={() => onViewModeChange("miring")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === "miring"
                  ? "bg-[#e07a5f] text-[#12100e] font-bold shadow-sm"
                  : "text-[#c8b8a8] hover:text-[#f4ede2]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tampak Miring</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("depan")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                viewMode === "depan"
                  ? "bg-[#e07a5f] text-[#12100e] font-bold shadow-sm"
                  : "text-[#c8b8a8] hover:text-[#f4ede2]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Tampak Depan (2D)</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onResetCamera}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#c8b8a8] text-xs font-mono text-[#c8b8a8] hover:text-[#f4ede2] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Kamera</span>
        </button>
      </div>

      {/* Slider Penelusuran Cangkir */}
      {points.length > 0 && activePt && (
        <div className="flex flex-col gap-2 pt-2 border-t border-[#3d322c]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-mono text-[#c8b8a8]">
              Geser cangkir untuk menjelajah bukit:
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className="font-bold text-[#f4ede2]">
                {formatNumber(Math.round(activePt.x))} cangkir
              </span>
              <span className="text-[#3d322c]">·</span>
              <span className="text-[#f2cc8f]">{formatRupiah(activePt.price)}</span>
              <span className="text-[#3d322c]">·</span>
              <span
                className={`font-bold ${
                  activePt.P >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"
                }`}
              >
                {formatRupiah(activePt.P)}
              </span>
              {mode === "akademik" && (
                <>
                  <span className="text-[#3d322c]">·</span>
                  <span className="text-[#e07a5f]">
                    P&apos;(x)={Math.round(activePt.dP)}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#a89888]">
              {Math.round(points[0].x)}
            </span>
            <input
              type="range"
              min={0}
              max={maxIdx}
              value={currentIndex}
              onChange={handleSliderChange}
              aria-label="Posisi cangkir di Bukit Untung"
              aria-valuetext={`${Math.round(activePt.x)} cangkir, untung ${formatRupiah(activePt.P)}`}
              className="flex-1 h-2 bg-[#1a1614] rounded-lg appearance-none cursor-pointer accent-[#e07a5f]"
            />
            <span className="text-[11px] font-mono text-[#a89888]">
              {Math.round(points[maxIdx].x)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
