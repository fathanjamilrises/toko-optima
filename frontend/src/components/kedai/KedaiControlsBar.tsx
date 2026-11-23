/**
 * KedaiControlsBar.tsx — Bar kontrol status tampilan kedai dan slider titik kurva.
 * Berisi Segmented Control (Sekarang | Disarankan | Atur sendiri),
 * Slider titik API untuk "Atur sendiri", tombol "Cari yang terbaik", dan toggle "Mode Form ⇄".
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Sparkles, SlidersHorizontal, LayoutGrid, Play } from "lucide-react";
import { useSimulation, type KedaiViewState } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { CurvePoint } from "@/types/api";
import { RunDaySimulationModal } from "./RunDaySimulationModal";

export function KedaiControlsBar() {
  const {
    viewState,
    setViewState,
    displayMode,
    setDisplayMode,
    data,
    selectedCurveIndex,
    setSelectedCurveIndex,
  } = useSimulation();

  const points = useMemo(() => data?.curves.points ?? [], [data?.curves.points]);
  const [isRunDayOpen, setIsRunDayOpen] = useState<boolean>(false);
  const maxIdx = Math.max(0, points.length - 1);
  const currentIdx = selectedCurveIndex ?? Math.floor(maxIdx / 2);
  const activePt = points[currentIdx];

  // Atur default selectedCurveIndex saat data curves tiba
  useEffect(() => {
    if (data?.curves.markers.optimum && points.length > 0 && selectedCurveIndex === null) {
      const optX = data.curves.markers.optimum.x;
      let closestIdx = 0;
      let minDiff = Infinity;
      points.forEach((p: CurvePoint, idx: number) => {
        const diff = Math.abs(p.x - optX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setSelectedCurveIndex(closestIdx);
    }
  }, [data, points, selectedCurveIndex, setSelectedCurveIndex]);

  const handleSliderChange = (newIdx: number) => {
    setSelectedCurveIndex(newIdx);
    if (viewState !== "atur_sendiri") {
      setViewState("atur_sendiri");
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#241e1b] border border-[#3d322c] rounded-2xl">
      {/* Baris Atas: Pemilih Segmen & Tombol Tindakan */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Segmented Control 3 Keadaan */}
        <div className="flex items-center p-1 rounded-xl bg-[#1a1614] border border-[#3d322c]">
          {(
            [
              { id: "sekarang", label: "Sekarang" },
              { id: "disarankan", label: "Disarankan" },
              { id: "atur_sendiri", label: "Atur Sendiri" },
            ] as const
          ).map((seg) => {
            const isSelected = viewState === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                onClick={() => setViewState(seg.id as KedaiViewState)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#e07a5f] text-white shadow-sm"
                    : "text-[#c8b8a8] hover:text-[#f4ede2]"
                }`}
              >
                {seg.label}
              </button>
            );
          })}
        </div>

        {/* Tombol Cari yang Terbaik, Jalankan 1 Hari & Toggle Mode Form */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRunDayOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#f2cc8f] text-[#f2cc8f] hover:text-[#f4ede2] text-xs font-medium transition-colors"
            title="Simulasikan operasional kedai selama 1 hari"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Jalankan 1 Hari</span>
          </button>

          <button
            type="button"
            onClick={() => setViewState("disarankan")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2e1f1a] border border-[#e07a5f]/40 text-[#e07a5f] hover:bg-[#e07a5f] hover:text-white text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cari yang terbaik</span>
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode(displayMode === "kedai" ? "form" : "kedai")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#e07a5f] text-[#c8b8a8] hover:text-[#f4ede2] text-xs font-medium transition-colors"
          >
            {displayMode === "kedai" ? (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Mode Form ⇄</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kedai 3D ⇄</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Baris Bawah: Slider Titik API bila keadaan "Atur sendiri" aktif */}
      {viewState === "atur_sendiri" && points.length > 0 && (
        <div className="pt-3 border-t border-[#3d322c] flex flex-col gap-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#c8b8a8]">Geser papan harga:</span>
            {activePt && (
              <span className="text-[#f4ede2]">
                {formatRupiah(activePt.price)} · {formatNumber(Math.round(activePt.x))} cangkir → Untung:{" "}
                <span className={activePt.P >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"}>
                  {formatRupiah(activePt.P)}
                </span>
              </span>
            )}
          </div>

          <input
            type="range"
            min={0}
            max={maxIdx}
            step={1}
            value={currentIdx}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            aria-label="Geser titik harga pada kurva simulasi"
            className="w-full accent-[#e07a5f] bg-[#1a1614] h-2 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between text-[10px] font-mono text-[#c8b8a8]">
            <span>{formatRupiah(points[0]?.price ?? 0)}</span>
            <span className="text-[#e07a5f]">Titik {currentIdx + 1} dari {points.length}</span>
            <span>{formatRupiah(points[points.length - 1]?.price ?? 0)}</span>
          </div>
        </div>
      )}

      {/* Modal Simulasi Jalankan 1 Hari */}
      <RunDaySimulationModal
        isOpen={isRunDayOpen}
        onClose={() => setIsRunDayOpen(false)}
        targetCups={Math.round(activePt?.x ?? data?.optimum.integer.x ?? 75)}
        pricePerCup={activePt?.price ?? data?.optimum.integer.price ?? 23000}
        totalRevenue={activePt?.R ?? data?.optimum.integer.revenue ?? 1725000}
        totalCost={activePt?.C ?? data?.optimum.integer.cost ?? 900000}
        netProfit={activePt?.P ?? data?.optimum.integer.profit ?? 825000}
      />
    </div>
  );
}
