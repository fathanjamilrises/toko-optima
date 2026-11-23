/**
 * KedaiObjectList.tsx — Daftar tombol alternatif "Objek di Kedai" untuk aksesibilitas.
 * Memungkinkan pengguna keyboard, pembaca layar (screen reader), dan pengguna mobile
 * mengoperasikan seluruh 7 parameter kedai tanpa harus berinteraksi dengan kanvas 3D.
 */

"use client";

import React from "react";
import { HOTSPOT_CONFIGS, type ParamKey } from "@/lib/kedai/hotspots";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

export function KedaiObjectList() {
  const { params, activeHotspot, setActiveHotspot, copy } = useSimulation();

  const keys = Object.keys(HOTSPOT_CONFIGS) as ParamKey[];

  const formatParamValue = (key: ParamKey, val: number | null | undefined) => {
    if (val === null || val === undefined) return "Tidak aktif";
    if (key === "fixed_cost" || key === "variable_cost" || key === "ref_price") {
      return formatRupiah(val);
    }
    if (key === "quad_cost") {
      return val > 0 ? `c = ${val}` : "Tidak ada";
    }
    if (key === "sensitivity") {
      return `${val} cangkir/Rp1rb`;
    }
    if (key === "ref_demand") {
      return `${formatNumber(val)} cangkir`;
    }
    if (key === "capacity") {
      return `${formatNumber(val)} cangkir`;
    }
    return String(val);
  };

  return (
    <div className="bg-[#1a1614] border border-[#3d322c] rounded-2xl p-4">
      <h4 className="text-xs font-mono uppercase tracking-wider text-[#c8b8a8] mb-3 flex items-center justify-between">
        <span>Objek di Kedai (Aksesibilitas / Navigasi Keyboard)</span>
        <span className="text-[10px] text-[#e07a5f]">7 Objek</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {keys.map((key) => {
          const config = HOTSPOT_CONFIGS[key];
          const val = params[key] as number | null;
          const isActive = activeHotspot === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveHotspot(isActive ? null : key)}
              aria-label={`Ubah ${config.getLabel(copy)}, nilai saat ini ${formatParamValue(key, val)}`}
              className={`flex flex-col text-left p-2.5 rounded-xl border text-xs transition-all ${
                isActive
                  ? "bg-[#2e1f1a] border-[#e07a5f] ring-1 ring-[#e07a5f]"
                  : "bg-[#241e1b] border-[#3d322c] hover:border-[#e07a5f]/60 text-[#c8b8a8] hover:text-[#f4ede2]"
              }`}
            >
              <span className="text-[10px] font-mono text-[#e07a5f] truncate">
                {config.objectName}
              </span>
              <span className="font-medium text-[#f4ede2] mt-0.5">
                {config.getLabel(copy)}
              </span>
              <span className="font-mono text-[11px] text-[#c8b8a8] mt-1">
                {formatParamValue(key, val)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
