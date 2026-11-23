/**
 * ComparisonCard.tsx — Perbandingan "Sekarang vs Disarankan".
 * Sumber data: curves.markers.reference vs optimum.integer.
 * Sesuai DESIGN.md Bagian 9 butir 4: selisih dua nilai API diperbolehkan dan dicatat sebagai usulan B2.
 */

"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus, Lightbulb } from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

export function ComparisonCard() {
  const { params, result, copy } = useSimulation();

  const currentCups = params.ref_demand;
  const currentPrice = params.ref_price;
  // Laba kondisi sekarang dari API marker reference
  const currentProfit = result?.curves?.markers?.reference?.P ??
    (currentPrice * currentCups - (params.fixed_cost + params.variable_cost * currentCups));

  const suggestedCups = result?.optimum?.integer?.x ?? 75;
  const suggestedPrice = result?.optimum?.integer?.price ?? 23000;
  const suggestedProfit = result?.optimum?.integer?.profit ?? 825000;

  const deltaProfit = suggestedProfit - currentProfit;
  const deltaCups = suggestedCups - currentCups;
  const isPositiveDelta = deltaProfit > 0;
  const isZeroDelta = deltaProfit === 0;

  return (
    <div className="bento comparison-card p-6 flex flex-col gap-5" data-testid="comparison-card">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-[var(--text-1)] m-0">
          {copy.comparison.title}
        </h4>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--line)] text-[var(--text-2)] uppercase">
          Selisih Optimal
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kolom Sekarang */}
        <div className="p-4 rounded-xl bg-[var(--bg-base)] border border-[var(--line)] flex flex-col gap-2">
          <span className="text-xs font-mono text-[var(--text-3)] uppercase tracking-wider">
            {copy.comparison.currentTitle}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-2)]">{copy.comparison.cupsLabel}:</span>
            <span className="font-mono text-sm text-[var(--text-1)] font-semibold">
              {formatNumber(currentCups)} cangkir
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-2)]">{copy.comparison.priceLabel}:</span>
            <span className="font-mono text-sm text-[var(--text-1)] font-semibold">
              {formatRupiah(currentPrice)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-[var(--line)]">
            <span className="text-xs text-[var(--text-2)]">{copy.comparison.profitLabel}:</span>
            <span className="font-mono text-sm text-[var(--text-1)] font-bold">
              {formatRupiah(currentProfit)}
            </span>
          </div>
        </div>

        {/* Kolom Disarankan */}
        <div className="p-4 rounded-xl bg-[var(--bg-raised)] border border-[var(--line)] flex flex-col gap-2">
          <span className="text-xs font-mono text-[var(--accent)] uppercase tracking-wider font-semibold">
            {copy.comparison.suggestedTitle}
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-2)]">{copy.comparison.cupsLabel}:</span>
            <span className="font-mono text-sm text-[var(--text-1)] font-semibold">
              {formatNumber(suggestedCups)} cangkir
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-[var(--text-2)]">{copy.comparison.priceLabel}:</span>
            <span className="font-mono text-sm text-[var(--text-1)] font-semibold">
              {formatRupiah(suggestedPrice)}
            </span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-[var(--line)]">
            <span className="text-xs text-[var(--text-2)]">{copy.comparison.profitLabel}:</span>
            <span className="font-mono text-sm text-[var(--profit)] font-bold">
              {formatRupiah(suggestedProfit)}
            </span>
          </div>
        </div>
      </div>

      {/* Ringkasan Perbedaan Delta */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-base)] border border-[var(--line)] flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          {isPositiveDelta ? (
            <TrendingUp className="w-4 h-4 text-[var(--profit)]" />
          ) : isZeroDelta ? (
            <Minus className="w-4 h-4 text-[var(--text-3)]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[var(--loss)]" />
          )}
          <span className="font-medium text-[var(--text-1)]">
            {isZeroDelta
              ? copy.comparison.deltaProfitSame
              : isPositiveDelta
              ? copy.comparison.deltaProfitMore(formatRupiah(Math.abs(deltaProfit)))
              : copy.comparison.deltaProfitLess(formatRupiah(Math.abs(deltaProfit)))}
          </span>
        </div>
        <span className="font-mono text-[var(--text-3)]">
          &Delta; cangkir: {deltaCups >= 0 ? `+${deltaCups}` : deltaCups}
        </span>
      </div>

      {/* Kotak Edukasi: Logika Bisnis */}
      <div className="p-4 rounded-xl bg-[#241e1b] border border-[#e07a5f]/40 flex flex-col gap-2 text-xs leading-relaxed">
        <div className="flex items-center gap-2 text-[#f2cc8f] font-bold">
          <Lightbulb className="w-4 h-4 shrink-0 text-[#f2cc8f]" />
          <span>
            {deltaCups < 0
              ? `Logika: Jual ${suggestedCups} vs ${currentCups} cangkir`
              : deltaCups > 0
              ? `Logika: Tambah ke ${suggestedCups} cangkir`
              : "Posisi Optimal Tercapai"}
          </span>
        </div>
        <p className="m-0 text-[#c8b8a8]">
          {deltaCups < 0 ? (
            <>
              Harga dinaikkan ke <strong className="text-[#f2cc8f]">{formatRupiah(suggestedPrice)}</strong>. Penjualan turun <strong className="text-[#f4ede2]">{Math.abs(deltaCups)} cup</strong>, tetapi menghemat modal bahan <strong className="text-[#81b29a]">{formatRupiah(Math.abs(deltaCups) * params.variable_cost)}</strong>. Hasilnya: laba bersih bertambah <strong className="text-[#81b29a]">+{formatRupiah(Math.abs(deltaProfit))}</strong>/hari dengan beban kerja barista lebih efisien.
            </>
          ) : deltaCups > 0 ? (
            <>
              Dengan harga <strong className="text-[#f2cc8f]">{formatRupiah(suggestedPrice)}</strong>, volume pembeli bertambah <strong className="text-[#f4ede2]">{deltaCups} cup</strong> sehingga lonjakan pemasukan jauh melampaui modal bahan tambahan.
            </>
          ) : (
            <>
              Harga dan kuantitas saat ini sudah berada tepat di puncak bukit laba maksimum.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
