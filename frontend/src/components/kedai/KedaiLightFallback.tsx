/**
 * KedaiLightFallback.tsx — Fallback Mode Ringan dan non-WebGL.
 * Menggantikan kanvas 3D dengan visualisasi 2D Recharts interaktif
 * saat WebGL tidak tersedia atau pengguna mengaktifkan prefers-reduced-motion.
 */

"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatRupiah } from "@/lib/format";

export function KedaiLightFallback() {
  const { data, viewState, selectedCurveIndex, params } = useSimulation();

  const points = data?.curves.points ?? [];
  const currentIdx = selectedCurveIndex ?? Math.floor(points.length / 2);
  const activePt = points[currentIdx];

  const activeX =
    viewState === "sekarang"
      ? params.ref_demand
      : viewState === "disarankan"
        ? (data?.optimum.integer.x ?? 75)
        : (activePt?.x ?? 75);

  const activeProfit =
    viewState === "sekarang"
      ? (data?.curves.markers.reference?.P ?? 0)
      : viewState === "disarankan"
        ? (data?.optimum.integer.profit ?? 0)
        : (activePt?.P ?? 0);

  return (
    <div className="flex flex-col gap-3 p-5 bg-[#1a1614] border border-[#3d322c] rounded-2xl">
      <div className="flex items-center justify-between border-b border-[#3d322c] pb-3">
        <div>
          <span className="text-[11px] font-mono text-[#e07a5f] uppercase tracking-wider block">
            Mode Ringan 2D (Fallback Grafis)
          </span>
          <h3 className="text-sm font-serif font-bold text-[#f4ede2]">
            Simulasi Kurva Keuntungan Bersih
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono text-[#c8b8a8] block">Kondisi Aktif:</span>
          <span className="text-sm font-mono font-bold text-[#81b29a]">
            {formatRupiah(activeProfit)}
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-80 w-full">
        {points.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 10, right: 20, left: 20, bottom: 20 }}>
              <XAxis
                dataKey="x"
                stroke="#c8b8a8"
                tick={{ fontSize: 11, fill: "#c8b8a8" }}
                tickFormatter={(val) => `${Math.round(val)}`}
              />
              <YAxis
                stroke="#c8b8a8"
                tick={{ fontSize: 11, fill: "#c8b8a8" }}
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#241e1b] border border-[#3d322c] p-2.5 rounded-lg text-xs font-mono">
                      <p className="text-[#f4ede2] font-semibold">{Math.round(item.x)} cangkir</p>
                      <p className="text-[#e07a5f]">Harga: {formatRupiah(item.price)}</p>
                      <p className={item.P >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"}>
                        Untung: {formatRupiah(item.P)}
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={0} stroke="rgba(244, 237, 226, 0.2)" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="P"
                name="Untung"
                stroke="#f2cc8f"
                strokeWidth={2.5}
                dot={false}
              />
              <ReferenceDot
                x={activeX}
                y={activeProfit}
                r={6}
                fill="#e07a5f"
                stroke="#f4ede2"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-[#c8b8a8]">
            Memuat data simulasi...
          </div>
        )}
      </div>
    </div>
  );
}
