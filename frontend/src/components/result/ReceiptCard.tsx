/**
 * ReceiptCard.tsx — Struk Kasir Khas KopiOptima.
 * Mengimplementasikan:
 * - Permukaan kertas krem terang (#E9DFCB) dengan teks espresso (#1B1815)
 * - Tepi bawah bergerigi (zigzag cut)
 * - Pemisah putus-putus, angka mono rata kanan
 * - Stempel miring −4° (UNTUNG / RUGI / TUTUP SAJA) dengan animasi jatuh (Mikro-interaksi #3)
 * - Animasi "struk dicetak" (Mikro-interaksi #2 reveal)
 * - Mode Akademik memakai label teknis (x*, p*, R*, C*, P*)
 */

"use client";

import React, { useEffect, useState } from "react";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

export function ReceiptCard() {
  const { result, mode, copy } = useSimulation();

  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReduceMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  const optimum = result?.optimum;
  const breakEven = result?.break_even;
  const cups = optimum?.integer?.x ?? 75;
  const price = optimum?.integer?.price ?? 23000;
  const revenue = optimum?.integer?.revenue ?? 1725000;
  const cost = optimum?.integer?.cost ?? 900000;
  const profit = optimum?.integer?.profit ?? 825000;

  const isAkademik = mode === "akademik";
  const isLoss = profit < 0;
  const isNoProduction = optimum?.status === "NO_PRODUCTION";

  // Penentuan stempel
  let stampText = copy.receipt.stamps.profit;
  let stampColor = "border-emerald-800 text-emerald-800";
  if (isNoProduction) {
    stampText = copy.receipt.stamps.closed;
    stampColor = "border-amber-900 text-amber-900";
  } else if (isLoss) {
    stampText = copy.receipt.stamps.loss;
    stampColor = "border-rose-800 text-rose-800";
  }

  // Teks balik modal
  let breakEvenText = copy.receipt.noBreakEven;
  if (breakEven?.exists && breakEven.x_low_int !== null && breakEven.x_low_int !== undefined) {
    breakEvenText = copy.receipt.breakEven(
      formatNumber(breakEven.x_low_int),
      breakEven.x_high_int ? formatNumber(breakEven.x_high_int) : undefined
    );
  }

  return (
    <div
      className={`receipt-container relative bg-[#E9DFCB] text-[#1B1815] rounded-t-xl p-6 shadow-xl overflow-hidden ${
        reduceMotion ? "" : "animate-receipt-print"
      }`}
      style={{
        boxShadow: "0 12px 30px -10px rgba(0,0,0,0.5)",
      }}
      data-testid="receipt-card"
    >
      {/* Header Struk */}
      <div className="text-center pb-3 border-b border-dashed border-[#8C7E6C]/60 flex flex-col gap-0.5">
        <h4 className="font-mono text-sm tracking-wider font-bold uppercase m-0">
          {copy.receipt.title}
        </h4>
        <p className="font-mono text-xs text-[#5C5042] m-0">
          {copy.receipt.subtitle}
        </p>
      </div>

      {/* Rincian Angka Struk */}
      <div className="py-4 flex flex-col gap-2 font-mono text-xs sm:text-sm">
        <div className="flex items-center justify-between">
          <span className="text-[#5C5042]">{isAkademik ? "x* (Kuantitas)" : copy.receipt.targetCups}</span>
          <span className="font-bold text-right">{formatNumber(cups)} cangkir</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#5C5042]">{isAkademik ? "p* (Harga)" : copy.receipt.targetPrice}</span>
          <span className="font-bold text-right">{formatRupiah(price)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#5C5042]">{isAkademik ? "R(x*) (Pemasukan)" : copy.receipt.revenue}</span>
          <span className="text-right">{formatRupiah(revenue)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#5C5042]">{isAkademik ? "C(x*) (Pengeluaran)" : copy.receipt.cost}</span>
          <span className="text-right">{formatRupiah(cost)}</span>
        </div>

        {/* Garis Pembatas Putus-putus */}
        <div className="my-1 border-t border-dashed border-[#8C7E6C]/70" />

        {/* Untung Bersih */}
        <div className="flex items-center justify-between font-bold text-sm sm:text-base">
          <span>{isAkademik ? "P*(x*) (Laba)" : copy.receipt.profit}</span>
          <span className="text-right flex items-center gap-1 font-mono">
            {formatRupiah(profit)}
            <span className="text-xs" aria-hidden="true">
              {profit >= 0 ? "▲" : "▼"}
            </span>
          </span>
        </div>

        {/* Informasi Balik Modal */}
        <div className="mt-2 pt-2 border-t border-dashed border-[#8C7E6C]/60 text-[11px] text-[#5C5042]">
          <p className="m-0 leading-tight">{breakEvenText}</p>
        </div>
      </div>

      {/* Stempel Miring Taktil */}
      <div
        className={`stamp-box inline-block border-2 font-mono font-bold text-xs uppercase px-3 py-1 tracking-widest opacity-90 ${stampColor} ${
          reduceMotion ? "" : "animate-stamp-drop"
        }`}
        style={{
          transform: "rotate(-5deg)",
        }}
        aria-label={`Status: ${stampText}`}
      >
        [ {stampText} ]
      </div>

      {/* Zigzag Bottom Edge (Tepi Bergerigi menggunakan SVG) */}
      <svg
        className="absolute bottom-0 left-0 w-full h-2.5 text-[#12100E] fill-current"
        viewBox="0 0 120 8"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,8 L5,0 L10,8 L15,0 L20,8 L25,0 L30,8 L35,0 L40,8 L45,0 L50,8 L55,0 L60,8 L65,0 L70,8 L75,0 L80,8 L85,0 L90,8 L95,0 L100,8 L105,0 L110,8 L115,0 L120,8 L120,8 L0,8 Z" />
      </svg>
    </div>
  );
}
