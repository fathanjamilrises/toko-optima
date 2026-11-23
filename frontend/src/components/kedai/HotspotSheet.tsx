/**
 * HotspotSheet.tsx — Panel popover/sheet interaktif saat hotspot objek kedai disentuh.
 * Menampilkan kontrol stepper, input angka terformat, chip opsi cepat,
 * tooltip "Dari mana angka ini?", serta pesan galat validasi 422 terkait.
 */

"use client";

import React, { useEffect, useState } from "react";
import { X, HelpCircle, Minus, Plus } from "lucide-react";
import { HOTSPOT_CONFIGS } from "@/lib/kedai/hotspots";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, parseNumberInput } from "@/lib/format";

export function HotspotSheet() {
  const {
    activeHotspot,
    setActiveHotspot,
    params,
    setParam,
    fieldErrors,
    copy,
  } = useSimulation();

  const [showTooltip, setShowTooltip] = useState(false);
  const [localInput, setLocalInput] = useState("");

  const config = activeHotspot ? HOTSPOT_CONFIGS[activeHotspot] : null;
  const currentValue = activeHotspot ? (params[activeHotspot] as number | null) : null;
  const errorMsg = activeHotspot ? fieldErrors[activeHotspot] : null;

  // Sinkronkan input lokal saat hotspot dibuka atau nilai berubah dari luar
  useEffect(() => {
    if (currentValue !== null && currentValue !== undefined) {
      if (activeHotspot === "fixed_cost" || activeHotspot === "variable_cost" || activeHotspot === "ref_price") {
        setLocalInput(formatNumber(currentValue));
      } else {
        setLocalInput(String(currentValue));
      }
    } else {
      setLocalInput("");
    }
    setShowTooltip(false);
  }, [activeHotspot, currentValue]);

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveHotspot(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setActiveHotspot]);

  if (!activeHotspot || !config) return null;

  const isRupiah =
    activeHotspot === "fixed_cost" ||
    activeHotspot === "variable_cost" ||
    activeHotspot === "ref_price";

  const handleStep = (direction: -1 | 1) => {
    const val = currentValue ?? 0;
    const step = config.softLimits.step;
    const next = Math.max(config.validation.min, val + direction * step);
    setParam(activeHotspot, next);
  };

  const handleInputChange = (raw: string) => {
    setLocalInput(raw);
    const num = parseNumberInput(raw);
    setParam(activeHotspot, num);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ubah ${config.getLabel(copy)}`}
      className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 bg-[#241e1b] border border-[#3d322c] rounded-2xl p-5 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {/* Header Panel */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-mono text-[#e07a5f] uppercase tracking-wider block mb-0.5">
            {config.objectName}
          </span>
          <h3 className="text-base font-serif font-bold text-[#f4ede2] flex items-center gap-2">
            {config.getLabel(copy)}
            <button
              type="button"
              onClick={() => setShowTooltip((prev) => !prev)}
              aria-label="Penjelasan angka ini"
              className="text-[#c8b8a8] hover:text-[#e07a5f] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setActiveHotspot(null)}
          aria-label="Tutup panel"
          className="text-[#c8b8a8] hover:text-[#f4ede2] p-1 rounded-lg hover:bg-[#2e1f1a] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tooltip Penjelas */}
      {showTooltip && (
        <div className="mb-3 p-3 rounded-lg bg-[#1a1614] border border-[#3d322c] text-xs text-[#c8b8a8] leading-relaxed">
          {config.getTooltip(copy)}
        </div>
      )}

      {/* Satu Kalimat Bantuan Awam */}
      <p className="text-xs text-[#c8b8a8] mb-4">{config.getHelp(copy)}</p>

      {/* Kontrol Stepper & Input Terformat */}
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          aria-label={`Kurangi ${config.getLabel(copy)}`}
          className="w-10 h-10 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#e07a5f] hover:text-[#f4ede2] text-[#c8b8a8] flex items-center justify-center transition-colors active:scale-95"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          {isRupiah && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#c8b8a8]">
              Rp
            </span>
          )}
          <input
            type="text"
            inputMode="numeric"
            value={localInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className={`w-full h-10 rounded-xl bg-[#1a1614] border text-[#f4ede2] font-mono text-sm px-3 ${
              isRupiah ? "pl-9" : ""
            } ${
              errorMsg
                ? "border-[#d95d39] ring-1 ring-[#d95d39]"
                : "border-[#3d322c] focus:border-[#e07a5f] focus:ring-1 focus:ring-[#e07a5f]"
            } outline-none transition-all`}
          />
        </div>

        <button
          type="button"
          onClick={() => handleStep(1)}
          aria-label={`Tambah ${config.getLabel(copy)}`}
          className="w-10 h-10 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#e07a5f] hover:text-[#f4ede2] text-[#c8b8a8] flex items-center justify-center transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Chip Cepat (bila ada, mis. lembur) */}
      {config.chips && config.chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {config.chips.map((chip) => {
            const isSelected = currentValue === chip.value;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => setParam(activeHotspot, chip.value)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-colors ${
                  isSelected
                    ? "bg-[#e07a5f] text-white border-[#e07a5f]"
                    : "bg-[#1a1614] text-[#c8b8a8] border-[#3d322c] hover:border-[#e07a5f] hover:text-[#f4ede2]"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Galat Validasi 422 */}
      {errorMsg && (
        <p className="text-xs text-[#d95d39] mt-2 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d95d39]" />
          {errorMsg}
        </p>
      )}

      {/* Contoh isi acuan */}
      <div className="mt-3 pt-3 border-t border-[#3d322c] flex items-center justify-between text-[11px] text-[#c8b8a8]">
        <span>Contoh: {config.getExample(copy)}</span>
        <button
          type="button"
          onClick={() => setActiveHotspot(null)}
          className="text-[#e07a5f] hover:underline font-medium"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}
