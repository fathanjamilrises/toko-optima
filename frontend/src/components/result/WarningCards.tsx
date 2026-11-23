/**
 * WarningCards.tsx — Kartu "Perlu diperhatikan" untuk diagnostik dan peringatan bisnis.
 * Menampilkan: apa yang terjadi, arti bagi usaha, dan saran tindakan dari API warnings[].
 */

"use client";

import React from "react";
import { AlertTriangle, Info, AlertOctagon, ShieldCheck } from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";
import type { ApiWarning } from "@/types/api";

interface WarningExplanation {
  whatHappened: string;
  businessMeaning: string;
  recommendedAction: string;
}

function getExplanation(warning: ApiWarning, isAkademik: boolean): WarningExplanation {
  switch (warning.code) {
    case "W_NEG_PROFIT":
      return {
        whatHappened: isAkademik
          ? "Nilai fungsi laba maksimum P*(x*) < 0 (defisit pada semua domain produksi)."
          : "Bahkan pada jumlah penjualan terbaik, kedai kopi masih mengalami kerugian.",
        businessMeaning: isAkademik
          ? "Biaya tetap FC melampaui kontribusi margin maksimum: FC > beta^2 / (4*alpha)."
          : "Biaya sewa dan operasional harian terlalu besar dibanding keuntungan per cangkir.",
        recommendedAction: isAkademik
          ? "Restrukturisasi fixed cost FC atau renegosiasi variable cost v untuk menggeser kurva laba ke atas."
          : "Turunkan biaya tetap harian (sewa/listrik) atau cari bahan baku yang lebih terjangkau.",
      };
    case "W_NO_PRODUCTION":
      return {
        whatHappened: isAkademik
          ? "Intersep permintaan a <= v (harga tertinggi pasar di bawah biaya variabel per cangkir)."
          : "Biaya membuat 1 cangkir kopi lebih mahal daripada harga yang mau dibayar pembeli.",
        businessMeaning: isAkademik
          ? "Gradien laba negatif untuk semua x > 0. Pilihan optimal x = 0 (status NO_PRODUCTION)."
          : "Setiap cangkir yang Anda buat justru menambah kerugian bagi kedai.",
        recommendedAction: isAkademik
          ? "Evaluasi ulang kelayakan produk; turunkan v atau naikkan daya tarik a."
          : "Jeda operasional sementara. Jangan memproduksi kopi sebelum biaya bahan bisa diturunkan.",
      };
    case "W_CAPACITY_BINDING":
      return {
        whatHappened: isAkademik
          ? "Titik kritis x* melampaui kendala kapasitas: x* > x_max. Solusi terikat di x_opt = x_max."
          : "Pesanan yang sanggup Anda buat dibatasi oleh mesin dan ruang dapur kedai.",
        businessMeaning: isAkademik
          ? "Nilai pengali Lagrange lambda > 0; kapasitas produksi menjadi kendala aktif (bottleneck)."
          : "Ada pembeli yang ingin membeli kopi, namun barista dan mesin Anda sudah mencapai batas maksimal.",
        recommendedAction: isAkademik
          ? "Tingkatkan kapasitas x_max jika biaya investasi marginal lebih kecil dari keuntungan marginal."
          : "Pertimbangkan menambah mesin espresso atau barista baru jika ingin mengejar keuntungan lebih tinggi.",
      };
    case "W_EXTRAPOLATION":
      return {
        whatHappened: isAkademik
          ? "Kuantitas optimal x* > 2 * q_0 (ekstrapolasi linier jauh melampaui data observasi referensi)."
          : "Target penjualan terbaik jauh lebih tinggi dibanding rata-rata penjualan Anda saat ini.",
        businessMeaning: isAkademik
          ? "Asumsi elastisitas linier di luar domain lokal mungkin mengalami deviasi empiris."
          : "Perkiraan pembeli ini mengasumsikan pasar Anda masih sangat luas untuk menampung lonjakan pesanan.",
        recommendedAction: isAkademik
          ? "Verifikasi elastisitas pasar secara berkala pada kuantitas produksi yang lebih besar."
          : "Tingkatkan produksi secara bertahap sambil memantau apakah pembeli benar-benar bertambah banyak.",
      };
    default:
      return {
        whatHappened: warning.message,
        businessMeaning: isAkademik
          ? "Diagnostik parameter model memerlukan peninjauan asumsi pasar."
          : "Kondisi ini memerlukan perhatian khusus pada jalannya operasional kedai Anda.",
        recommendedAction: isAkademik
          ? "Lakukan kalibrasi ulang parameter referensi."
          : "Sesuaikan harga menu atau modal bahan secara berkala.",
      };
  }
}

export function WarningCards() {
  const { result, mode, copy } = useSimulation();

  const warnings = result?.warnings ?? [];
  const isAkademik = mode === "akademik";

  if (warnings.length === 0) {
    return (
      <div className="bento p-5 flex items-center gap-3 text-xs text-[var(--profit)]" data-testid="warning-cards">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <span className="text-[var(--text-2)] font-medium">
          {isAkademik
            ? "Model optimal berada pada interior domain yang stabil tanpa anomali struktural."
            : "Kondisi kedai Anda sehat: perhitungan berada di titik aman tanpa kendala biaya."}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" data-testid="warning-cards">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-[var(--warn)]" />
        <h4 className="font-semibold text-xs tracking-wider uppercase text-[var(--text-1)] m-0">
          {copy.warnings.sectionTitle} ({warnings.length})
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {warnings.map((w, idx) => {
          const explanation = getExplanation(w, isAkademik);
          const isError = w.level === "error" || w.code === "W_NO_PRODUCTION" || w.code === "W_NEG_PROFIT";

          return (
            <div
              key={`${w.code}-${idx}`}
              className="bento p-5 flex flex-col gap-2.5"
              style={{
                borderLeft: `4px solid ${isError ? "var(--loss)" : "var(--warn)"}`,
              }}
            >
              <div className="flex items-center gap-2">
                {isError ? (
                  <AlertOctagon className="w-4 h-4 text-[var(--loss)] shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-[var(--warn)] shrink-0" />
                )}
                <span className="font-mono text-xs font-bold text-[var(--text-1)]">
                  {w.code} &middot; {explanation.whatHappened}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--line)] text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--text-3)] font-medium">
                    {copy.warnings.meaningTitle}:
                  </span>
                  <p className="text-[var(--text-2)] m-0 leading-relaxed">
                    {explanation.businessMeaning}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[var(--crema)] font-medium">
                    {copy.warnings.actionTitle}:
                  </span>
                  <p className="text-[var(--text-1)] m-0 leading-relaxed">
                    {explanation.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
