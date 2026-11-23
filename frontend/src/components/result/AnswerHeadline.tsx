/**
 * AnswerHeadline.tsx — Tampilan angka jawaban untung terbesar raksasa (Bento Headline).
 * Mengimplementasikan:
 * - Tipografi raksasa Fraunces (clamp(3.5rem, 9vw, 7.5rem)) dengan warna --accent
 * - Kinetik sumbu variabel Fraunces (opsz, SOFT, WONK) saat status selesai
 * - Mikro-interaksi #1: Odometer rolling digit (<= 700ms, nonaktif di prefers-reduced-motion)
 * - Kalimat jawaban awam/akademik piramida terbalik
 * - Tombol "Coba hitung"
 */

"use client";

import React, { useEffect, useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

function OdometerDigit({ char, reduceMotion }: { char: string; reduceMotion: boolean }) {
  const isDigit = /[0-9]/.test(char);

  if (!isDigit || reduceMotion) {
    return <span className="inline-block tabular-nums">{char}</span>;
  }

  const digit = parseInt(char, 10);

  return (
    <span
      className="inline-block h-[1em] overflow-hidden align-top leading-none tabular-nums"
      style={{ width: "0.62em" }}
      aria-hidden="true"
    >
      <span
        className="flex flex-col transition-transform duration-500 ease-out"
        style={{ transform: `translateY(-${digit * 10}%)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="flex h-[1em] items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export function AnswerHeadline() {
  const { result, status, copy, retry } = useSimulation();

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

  const profit = result?.optimum?.integer?.profit ?? 825000;
  const cups = result?.optimum?.integer?.x ?? 75;
  const price = result?.optimum?.integer?.price ?? 23000;
  const isNoProduction = result?.optimum?.status === "NO_PRODUCTION";

  const formattedProfit = formatRupiah(profit);
  const formattedCups = formatNumber(cups);
  const formattedPrice = formatNumber(price);

  // Kinetik: Sumbu Fraunces berubah saat selesai menghitung
  const fontVariationStyle = {
    fontVariationSettings: status === "loading"
      ? '"opsz" 72, "SOFT" 0, "WONK" 0'
      : '"opsz" 72, "SOFT" 100, "WONK" 1',
    fontWeight: status === "loading" ? 500 : 650,
  };

  return (
    <div className="bento answer-headline-tile p-6 sm:p-8 flex flex-col justify-between gap-6" data-testid="answer-headline">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="eyebrow m-0 text-[var(--accent)]">{copy.headline.title}</p>
          {status === "loading" && (
            <span className="text-xs font-mono text-[var(--crema)] animate-pulse flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>{copy.headline.calculating}</span>
            </span>
          )}
        </div>

        {/* Angka Raksasa dengan Odometer (Bebas Terpotong) */}
        <div
          className="headline-amount text-[var(--accent)] tracking-[-0.03em] select-all my-2 flex items-baseline flex-nowrap whitespace-nowrap overflow-x-auto overflow-y-hidden"
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontSize: "clamp(2.1rem, 4.5vw, 3.6rem)",
            lineHeight: 1,
            ...fontVariationStyle,
          }}
          aria-label={formattedProfit}
        >
          <span className="flex items-baseline flex-nowrap shrink-0">
            {formattedProfit.split("").map((c, i) => (
              <OdometerDigit key={i} char={c} reduceMotion={reduceMotion} />
            ))}
          </span>
          <span className="text-xs sm:text-sm font-sans font-normal text-[var(--text-2)] ml-2.5 whitespace-nowrap tracking-normal shrink-0">
            / hari
          </span>
        </div>

        {/* Kalimat Jawaban Ramah */}
        <p className="text-sm sm:text-base text-[var(--text-1)] m-0 font-medium leading-relaxed max-w-2xl">
          {isNoProduction
            ? copy.noProduction
            : copy.headline.subtitle(formattedCups, formattedPrice)}
        </p>
      </div>

      {/* Aksi Tambahan */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
        <span className="text-xs text-[var(--text-3)] font-mono">
          {cups} cangkir &middot; Rp{formattedPrice}/cangkir
        </span>
        <button
          type="button"
          onClick={retry}
          className="button-primary text-xs py-2 px-4 flex items-center gap-1.5"
        >
          <span>{copy.headline.btnCalculate}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
