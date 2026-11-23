/**
 * ChartsTab.tsx — Grafik 2D Interaktif (Recharts).
 * Mengimplementasikan:
 * - Grafik Utama: Pemasukan (R), Pengeluaran (C), dan Untung (P)
 * - Penanda titik optimum, batas balik modal (BEP), dan kondisi sekarang
 * - Mode Akademik: tambahan Grafik Marginal MR vs MC dan Turunan Laba P'(x)
 * - Panduan "Cara membaca grafik ini" dan aria-label
 */

"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

export function ChartsTab() {
  const { result, mode, copy } = useSimulation();

  const isAkademik = mode === "akademik";
  const points = result?.curves?.points ?? [];
  const markers = result?.curves?.markers;
  const optimum = result?.optimum;

  const optX = markers?.optimum?.x ?? optimum?.integer?.x ?? 75;
  const optP = markers?.optimum?.P ?? optimum?.integer?.profit ?? 825000;
  const refX = markers?.reference?.x ?? 80;
  const refP = markers?.reference?.P ?? 800000;

  const bep1 = markers?.break_even?.[0]?.x;
  const bep2 = markers?.break_even?.[1]?.x;

  return (
    <div className="flex flex-col gap-6" data-testid="charts-tab">
      {/* 1. Grafik Utama: Pemasukan, Pengeluaran, Untung */}
      <div className="bento p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-base text-[var(--text-1)] m-0">
            {isAkademik ? "Kurva R(x), C(x), dan Laba P(x)" : "Grafik Keuntungan & Biaya Kedai"}
          </h4>
          <p className="text-xs text-[var(--text-2)] m-0">
            {isAkademik
              ? "Visualisasi hubungan fungsi total pendapatan, biaya, dan laba kuadratik."
              : copy.charts.guideRevenueCost}
          </p>
        </div>

        <div
          className="w-full h-80 sm:h-96"
          role="img"
          aria-label={copy.charts.ariaProfitChart}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid stroke="#3A322B" strokeDasharray="3 3" opacity={0.6} />
              <XAxis
                dataKey="x"
                stroke="#B9AC98"
                fontSize={11}
                tickFormatter={(val) => `${val}`}
                label={{
                  value: isAkademik ? "Kuantitas x (cangkir)" : "Jumlah Cangkir Terjual",
                  position: "insideBottom",
                  offset: -12,
                  fill: "#B9AC98",
                  fontSize: 11,
                }}
              />
              <YAxis
                stroke="#B9AC98"
                fontSize={11}
                tickFormatter={(val) => `${val / 1000}k`}
                label={{
                  value: "Rupiah (Rp)",
                  angle: -90,
                  position: "insideLeft",
                  offset: 0,
                  fill: "#B9AC98",
                  fontSize: 11,
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const row = payload[0]?.payload;
                    return (
                      <div className="p-3 bg-[var(--bg-base)] border border-[var(--line)] rounded-xl text-xs font-mono flex flex-col gap-1 shadow-lg">
                        <span className="font-bold text-[var(--text-1)]">
                          {label} cangkir &middot; {formatRupiah(row?.price)}
                        </span>
                        <span className="text-[var(--profit)]">
                          Untung: {formatRupiah(row?.P)}
                        </span>
                        <span className="text-[var(--revenue)]">
                          Pemasukan: {formatRupiah(row?.R)}
                        </span>
                        <span className="text-[var(--cost)]">
                          Pengeluaran: {formatRupiah(row?.C)}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
              />

              {/* Garis Pemasukan */}
              <Line
                type="monotone"
                dataKey="R"
                name={copy.charts.legendRevenue}
                stroke="#5FB4D6"
                strokeWidth={2}
                dot={false}
              />
              {/* Garis Pengeluaran */}
              <Line
                type="monotone"
                dataKey="C"
                name={copy.charts.legendCost}
                stroke="#D49A6A"
                strokeWidth={2}
                dot={false}
              />
              {/* Garis Untung Bersih */}
              <Line
                type="monotone"
                dataKey="P"
                name={copy.charts.legendProfit}
                stroke="#B7E35A"
                strokeWidth={2.5}
                dot={false}
              />

              {/* Garis horizontal Y=0 (Garis Impas) */}
              <ReferenceLine y={0} stroke="#9A8F7F" strokeDasharray="4 4" />

              {/* Penanda Titik Optimal */}
              <ReferenceLine
                x={optX}
                stroke="#FF8A3D"
                strokeDasharray="3 3"
                label={{
                  value: isAkademik ? `x* = ${optX}` : `Puncak: ${optX} cangkir`,
                  position: "top",
                  fill: "#FF8A3D",
                  fontSize: 11,
                }}
              />
              <ReferenceDot
                x={optX}
                y={optP}
                r={6}
                fill="#FF8A3D"
                stroke="#12100E"
                strokeWidth={2}
              />

              {/* Penanda BEP 1 */}
              {bep1 !== undefined && (
                <ReferenceLine
                  x={bep1}
                  stroke="#9A8F7F"
                  strokeDasharray="2 2"
                  label={{
                    value: `BEP: ${formatNumber(bep1, 1)}`,
                    position: "insideTopLeft",
                    fill: "#9A8F7F",
                    fontSize: 10,
                  }}
                />
              )}

              {/* Penanda BEP 2 */}
              {bep2 !== undefined && (
                <ReferenceLine
                  x={bep2}
                  stroke="#9A8F7F"
                  strokeDasharray="2 2"
                  label={{
                    value: `BEP: ${formatNumber(bep2, 1)}`,
                    position: "insideTopRight",
                    fill: "#9A8F7F",
                    fontSize: 10,
                  }}
                />
              )}

              {/* Penanda Kondisi Sekarang */}
              {refX !== undefined && (
                <ReferenceDot
                  x={refX}
                  y={refP}
                  r={5}
                  fill="#5FB4D6"
                  stroke="#12100E"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grafik Khusus Mode Akademik: Marginal MR vs MC & Turunan Laba P'(x) */}
      {isAkademik && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Grafik Marginal MR vs MC */}
          <div className="bento p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h5 className="font-semibold text-sm text-[var(--text-1)] m-0">
                Analisis Marginal: MR(x) vs MC(x)
              </h5>
              <p className="text-[11px] text-[var(--text-2)] m-0">
                Titik optimal tercapai saat MR = MC ({formatRupiah(result?.marginal?.mr_at_opt)}).
              </p>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid stroke="#3A322B" strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="x" stroke="#B9AC98" fontSize={10} />
                  <YAxis stroke="#B9AC98" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="MR" name="MR(x) = R'(x)" stroke="#5FB4D6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="MC" name="MC(x) = C'(x)" stroke="#D49A6A" strokeWidth={2} dot={false} />
                  <ReferenceLine x={optX} stroke="#FF8A3D" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grafik Turunan Pertama Laba P'(x) */}
          <div className="bento p-5 flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h5 className="font-semibold text-sm text-[var(--text-1)] m-0">
                Turunan Pertama Laba: P&prime;(x)
              </h5>
              <p className="text-[11px] text-[var(--text-2)] m-0">
                P&prime;(x) &gt; 0 (laba naik), P&prime;(x) = 0 di x* = {optX}, P&prime;(x) &lt; 0 (laba turun).
              </p>
            </div>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <CartesianGrid stroke="#3A322B" strokeDasharray="3 3" opacity={0.5} />
                  <XAxis dataKey="x" stroke="#B9AC98" fontSize={10} />
                  <YAxis stroke="#B9AC98" fontSize={10} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="dP" name="P'(x) = MR - MC" stroke="#FF8A3D" strokeWidth={2} dot={false} />
                  <ReferenceLine y={0} stroke="#9A8F7F" strokeDasharray="3 3" />
                  <ReferenceLine x={optX} stroke="#B7E35A" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
