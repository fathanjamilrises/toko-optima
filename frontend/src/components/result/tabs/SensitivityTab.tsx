/**
 * SensitivityTab.tsx — Analisis Sensitivitas & Tabel Skenario.
 * Mengimplementasikan:
 * - Tabel Skenario perubahan biaya variabel dan biaya tetap (+-10%, +-20%)
 * - Tabel Turunan Parsial (Teorema Envelope) di Mode Akademik
 */

"use client";

import React from "react";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

export function SensitivityTab() {
  const { result, mode, copy } = useSimulation();

  const isAkademik = mode === "akademik";
  const scenarios = result?.sensitivity?.scenarios ?? [];
  const partials = result?.sensitivity?.partials;

  const partialItems = partials
    ? [
        {
          symbol: "∂x*/∂v",
          value: partials.dx_dv,
          meaning: isAkademik
            ? "Laju perubahan kuantitas optimal terhadap biaya variabel v: -1/(2(b+c))"
            : "Jika modal bahan per cangkir naik Rp1, jumlah target penjualan berubah sebesar ini.",
        },
        {
          symbol: "∂x*/∂FC",
          value: partials.dx_dFC,
          meaning: isAkademik
            ? "Independensi kuantitas optimal terhadap biaya tetap (FC tidak mempengaruhi x*)"
            : "Biaya sewa/tetap tidak mengubah jumlah cangkir yang seharusnya dijual.",
        },
        {
          symbol: "∂x*/∂a",
          value: partials.dx_da,
          meaning: isAkademik
            ? "Daya tarik pasar a naik -> kuantitas optimal naik: 1/(2(b+c))"
            : "Jika pasar makin ramai, target penjualan cangkir ikut bertambah.",
        },
        {
          symbol: "∂P*/∂FC",
          value: partials.dP_dFC,
          meaning: isAkademik
            ? "Biaya tetap FC naik Rp1 -> laba maksimum berkurang tepat Rp1"
            : "Setiap kenaikan sewa Rp1 langsung memotong untung bersih sebesar Rp1.",
        },
        {
          symbol: "∂P*/∂v",
          value: partials.dP_dv,
          meaning: isAkademik
            ? "Teorema Envelope: dP*/dv = -x* (biaya variabel naik Rp1 memotong laba sebesar x*)"
            : "Kenaikan modal bahan Rp1 memotong keuntungan harian sebesar total cangkir terjual.",
        },
        {
          symbol: "∂P*/∂a",
          value: partials.dP_da,
          meaning: isAkademik
            ? "Intersep pasar a naik Rp1 -> laba maksimum bertambah sebesar x*"
            : "Kenaikan daya beli pelanggan menambah keuntungan sebanding dengan cangkir terjual.",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6" data-testid="sensitivity-tab">
      {/* 1. Tabel Skenario Perubahan Biaya */}
      <div className="bento p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-base text-[var(--text-1)] m-0">
            {copy.sensitivity.title}
          </h4>
          <p className="text-xs text-[var(--text-2)] m-0">
            {copy.sensitivity.subtitle}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--text-3)]">
                <th className="py-2.5 px-3 font-medium">{copy.sensitivity.colScenario}</th>
                <th className="py-2.5 px-3 font-medium text-right">{copy.sensitivity.colCups}</th>
                <th className="py-2.5 px-3 font-medium text-right">{copy.sensitivity.colPrice}</th>
                <th className="py-2.5 px-3 font-medium text-right">{copy.sensitivity.colProfit}</th>
                <th className="py-2.5 px-3 font-medium text-right">{copy.sensitivity.colDiff}</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((row, idx) => {
                const isPositive = row.delta_profit > 0;
                const isZero = row.delta_profit === 0;

                return (
                  <tr
                    key={idx}
                    className="border-b border-[var(--line)]/50 hover:bg-[var(--bg-raised)]/50 transition-colors"
                  >
                    <td className="py-3 px-3 text-[var(--text-1)] font-sans font-medium">
                      {row.label}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--text-2)]">
                      {formatNumber(row.x)} cangkir
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--text-2)]">
                      {formatRupiah(row.price)}
                    </td>
                    <td className="py-3 px-3 text-right text-[var(--text-1)] font-semibold">
                      {formatRupiah(row.profit)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        isZero
                          ? "text-[var(--text-3)]"
                          : isPositive
                          ? "text-[var(--profit)]"
                          : "text-[var(--loss)]"
                      }`}
                    >
                      {isZero ? "-" : isPositive ? `+${formatRupiah(row.delta_profit)}` : formatRupiah(row.delta_profit)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Turunan Parsial (Teorema Envelope) */}
      {partialItems.length > 0 && (
        <div className="bento p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h4 className="font-semibold text-base text-[var(--text-1)] m-0">
              {isAkademik ? "Turunan Parsial & Teorema Envelope" : "Tingkat Kepekaan Laba Terhadap Komponen Biaya"}
            </h4>
            <p className="text-xs text-[var(--text-2)] m-0">
              {isAkademik
                ? "Laju perubahan marjinal terhadap vektor parameter masukan model (alpha, beta, FC, v, a)."
                : "Mengukur seberapa besar dampak perubahan Rp1 pada masing-masing biaya terhadap untung bersih."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {partialItems.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--line)] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[var(--accent)]">
                    {p.symbol}
                  </span>
                  <span className="font-mono text-sm font-semibold text-[var(--crema)]">
                    {formatNumber(p.value, 4)}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-2)] leading-relaxed m-0">
                  {p.meaning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
