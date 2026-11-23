/**
 * StoryTab.tsx — Cerita naratif langkah demi langkah bagi orang awam & dosen.
 * Menjelaskan secara gamblang logika bisnis dan kalkulus:
 * - Mengapa jual lebih sedikit cangkir bisa menghasilkan untung bersih lebih banyak (Trade-off Margin vs Volume).
 * - Perbandingan nyata 4 skenario harga (Obral Murah, Kondisi Sekarang, Rekomendasi Puncak, Kemahalan).
 * - 6 langkah runtut memahami pembentukan keuntungan kedai UMKM.
 */

"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  DollarSign,
  Coffee,
  ShieldAlert,
  Award,
  Lightbulb,
  Scale,
  Sparkles,
} from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { CurvePoint } from "@/types/api";

export function StoryTab() {
  const { params, result, mode, copy } = useSimulation();

  const optimum = result?.optimum;
  const breakEven = result?.break_even;
  const cups = optimum?.integer?.x ?? 75;
  const price = optimum?.integer?.price ?? 23000;
  const profit = optimum?.integer?.profit ?? 825000;

  const currentCups = params.ref_demand;
  const currentPrice = params.ref_price;
  const currentProfit =
    result?.curves?.markers?.reference?.P ??
    currentPrice * currentCups - (params.fixed_cost + params.variable_cost * currentCups);

  const deltaCups = cups - currentCups;
  const deltaProfit = profit - currentProfit;

  const isAkademik = mode === "akademik";

  // Ambil 4 skenario nyata dari titik array kurva API
  const points: CurvePoint[] = useMemo(
    () => result?.curves?.points ?? [],
    [result?.curves?.points]
  );

  const scenarios = useMemo(() => {
    if (!points || points.length === 0) return [];

    // Cari titik obral murah (kuantitas lebih banyak ~1.3x cups)
    const cheapTargetX = Math.min(cups * 1.33, points[points.length - 1]?.x ?? cups);
    let cheapPoint = points[0];
    let minCheapDiff = Infinity;

    // Cari titik mahal (kuantitas lebih sedikit ~0.66x cups)
    const expensiveTargetX = Math.max(cups * 0.66, points[0]?.x ?? 0);
    let expensivePoint = points[0];
    let minExpDiff = Infinity;

    // Titik optimum
    let optPoint = points[0];
    let minOptDiff = Infinity;

    points.forEach((p) => {
      const diffCheap = Math.abs(p.x - cheapTargetX);
      if (diffCheap < minCheapDiff) {
        minCheapDiff = diffCheap;
        cheapPoint = p;
      }

      const diffExp = Math.abs(p.x - expensiveTargetX);
      if (diffExp < minExpDiff) {
        minExpDiff = diffExp;
        expensivePoint = p;
      }

      const diffOpt = Math.abs(p.x - cups);
      if (diffOpt < minOptDiff) {
        minOptDiff = diffOpt;
        optPoint = p;
      }
    });

    return [
      {
        tag: "Obral Terlalu Murah",
        title: "Banting Harga",
        cups: Math.round(cheapPoint.x),
        price: cheapPoint.price,
        revenue: cheapPoint.R,
        cost: cheapPoint.C,
        profit: cheapPoint.P,
        highlight: false,
        badgeColor: "border-[#d95d39] text-[#d95d39]",
        verdict: "Barista kelelahan membuat banyak kopi, modal bahan membengkak, untung tipis.",
      },
      {
        tag: "Kondisi Anda Saat Ini",
        title: "Kondisi Acuan",
        cups: Math.round(currentCups),
        price: currentPrice,
        revenue: currentPrice * currentCups,
        cost: params.fixed_cost + params.variable_cost * currentCups,
        profit: currentProfit,
        highlight: false,
        badgeColor: "border-[#bfa89b] text-[#bfa89b]",
        verdict: "Kedai sudah berjalan, namun belum menyentuh potensi laba terbaiknya.",
      },
      {
        tag: "Rekomendasi KopiOptima",
        title: "Puncak Rezeki (Sweet Spot)",
        cups: Math.round(optPoint.x),
        price: optPoint.price,
        revenue: optPoint.R,
        cost: optPoint.C,
        profit: optPoint.P,
        highlight: true,
        badgeColor: "border-[#81b29a] text-[#81b29a] bg-[#81b29a]/10",
        verdict: "Keseimbangan emas antara daya beli dan margin tebal. Keuntungan tertinggi!",
      },
      {
        tag: "Terlalu Mahal",
        title: "Harga Elit",
        cups: Math.round(expensivePoint.x),
        price: expensivePoint.price,
        revenue: expensivePoint.R,
        cost: expensivePoint.C,
        profit: expensivePoint.P,
        highlight: false,
        badgeColor: "border-[#d95d39] text-[#d95d39]",
        verdict: "Margin per cangkir tebal, tapi pelanggan kabur karena kemahalan.",
      },
    ];
  }, [points, cups, currentCups, currentPrice, currentProfit, params]);

  const storySteps = [
    {
      step: 1,
      icon: Coffee,
      title: isAkademik
        ? "1. Identifikasi Fungsi Permintaan Terbalik p(x)"
        : "1. Membaca Watak & Daya Beli Pelanggan Kedai",
      desc: isAkademik
        ? `Memformulasikan kurva permintaan p(x) = ${result?.model?.formulas?.price ?? "p(x)"} dari harga acuan p0=${formatRupiah(params.ref_price)}, q0=${params.ref_demand}, dan sensitivitas s=${params.sensitivity}.`
        : `Dari kebiasaan kedai Anda menjual ${formatNumber(params.ref_demand)} cangkir pada harga ${formatRupiah(params.ref_price)}, kita mengetahui karakter pembeli: setiap harga dinaikkan Rp1.000, ada sekitar ${params.sensitivity} pelanggan yang berpikir ulang atau beralih.`,
    },
    {
      step: 2,
      icon: DollarSign,
      title: isAkademik
        ? "2. Struktur Biaya Operasional Total C(x)"
        : "2. Memilah Biaya Sewa/Gaji vs Modal Bahan Baku",
      desc: isAkademik
        ? `Fungsi biaya total C(x) = FC + v*x + c*x^2 = ${result?.model?.formulas?.cost ?? "C(x)"}. Biaya tetap harian Rp${formatNumber(params.fixed_cost)} dan biaya variabel Rp${formatNumber(params.variable_cost)}/unit.`
        : `Ada dua jenis modal: Biaya Tetap (${formatRupiah(params.fixed_cost)}/hari untuk sewa tempat, listrik, dan gaji) yang wajib dibayar berapapun kopi yang laku, serta Modal Bahan Baku (${formatRupiah(params.variable_cost)}/cangkir untuk biji kopi, susu, dan gelas).`,
    },
    {
      step: 3,
      icon: Scale,
      title: isAkademik
        ? "3. Paradoks Volume & Margin: Analisis Fungsi Laba P(x)"
        : "3. Mengapa Menjual Terbanyak Bukan Berarti Paling Untung?",
      desc: isAkademik
        ? `Fungsi laba P(x) = R(x) - C(x) = ${result?.model?.formulas?.profit ?? "P(x)"}. Hubungan non-linear kuadratik: kenaikan volume x membutuhkan penurunan harga p(x), memicu diminishing marginal returns.`
        : `Banyak pemilik kedai mengira makin banyak cangkir yang laku selalu makin baik. Padahal, untuk menjual cangkir ekstra, Anda terpaksa menurunkan harga atau menanggung biaya bahan yang terus mengalir. Ada satu titik di mana biaya tambahan mulai menggerogoti keuntungan bersih.`,
    },
    {
      step: 4,
      icon: TrendingUp,
      title: isAkademik
        ? "4. Kondisi Orde Pertama: P'(x*) = 0 & Uji Turunan Kedua"
        : "4. Menemukan Puncak Bukit Keuntungan (Prinsip Kalkulus)",
      desc: isAkademik
        ? `Turunan pertama P'(x) = ${result?.model?.formulas?.dprofit ?? "P'(x)"} = 0 menghasilkan kuantitas stasioner x* = ${formatNumber(optimum?.continuous?.x ?? 75, 2)} unit. Uji turunan kedua P''(x*) = ${optimum?.second_derivative ?? -400} < 0 membuktikan titik maksimum global.`
        : `Bayangkan keuntungan kedai Anda seperti bukit: saat menambah penjualan dari sedikit, bukit menanjak naik. Tetapi setelah melewati ${cups} cangkir, bukit mulai menurun. Kalkulus diferensial bertugas mencari titik di mana lereng bukit mendatar sempurna—itulah puncak rezeki kedai Anda!`,
    },
    {
      step: 5,
      icon: ShieldAlert,
      title: isAkademik
        ? "5. Titik Impas (BEP) & Kendala Kapasitas"
        : "5. Batas Aman Balik Modal (Break-Even Point)",
      desc: isAkademik
        ? breakEven?.exists
          ? `Diskriminan D = ${formatNumber(breakEven.discriminant)} >= 0. Rentang laba positif berada pada interval x in (${formatNumber(breakEven.x_low ?? 0, 2)}, ${formatNumber(breakEven.x_high ?? 0, 2)}). Kuantitas integer aman: ${breakEven.x_low_int} sampai ${breakEven.x_high_int} cangkir.`
          : `Diskriminan D < 0. Tidak ada akar riil BEP (operasi mengalami defisit pada semua level produksi).`
        : breakEven?.exists
        ? `Berapa cangkir pertama yang dibutuhkan untuk menutup sewa dan gaji harian? Di cangkir ke-${formatNumber(breakEven.x_low_int ?? 11)}, modal harian Anda sudah kembali 100%. Mulai cangkir ke-${(breakEven.x_low_int ?? 11) + 1} dan seterusnya adalah untung bersih murni!`
        : `Pada konfigurasi saat ini, biaya harian lebih besar dari margin. Perlu penyesuaian sewa atau harga menu agar mencapai titik impas.`,
    },
    {
      step: 6,
      icon: Award,
      title: isAkademik
        ? "6. Rekomendasi Manajerial & Kebijakan Harga"
        : "6. Saran Nyata yang Bisa Diterapkan Besok Pagi",
      desc: isAkademik
        ? `Tetapkan target produksi x* = ${cups} unit/hari dengan harga menu p* = ${formatRupiah(price)} untuk merealisasikan laba bersih ${formatRupiah(profit)}/hari.`
        : `Pasang harga menu Anda di Rp${formatNumber(price)}. Targetkan menjual ${cups} cangkir sehari. Jika penjualan harian turun sedikit dari biasanya, jangan panik—karena laba bersih harian Anda justru naik menjadi ${formatRupiah(profit)} per hari dengan beban kerja bahan yang lebih hemat.`,
    },
  ];

  return (
    <div className="flex flex-col gap-6" data-testid="story-tab">
      {/* Header Tab */}
      <div className="flex flex-col gap-1">
        <h4 className="font-semibold text-base text-[var(--text-1)] m-0">
          {copy.tabs.story}
        </h4>
        <p className="text-xs text-[var(--text-2)] m-0">
          {isAkademik
            ? "Penjelasan matematis terpadu: deduksi fungsi permintaan, biaya, turunan, hingga titik kritis optimum."
            : "Mengapa kalkulus bisa membantu kedai kopi Anda membawa pulang uang lebih banyak setiap hari."}
        </p>
      </div>

      {/* Kartu Penjelasan Inti: Mengapa Jual Lebih Sedikit Bisa Lebih Untung? */}
      <div className="p-5 rounded-2xl bg-[#241e1b] border-2 border-[#e07a5f]/60 shadow-xl flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-[#e07a5f]">
          <div className="p-2 rounded-xl bg-[#e07a5f]/15 border border-[#e07a5f]/30">
            <Lightbulb className="w-5 h-5 text-[#f2cc8f]" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f2cc8f] block">
              Paling Sering Ditanyakan Dosen & Pemilik Kedai
            </span>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#f4ede2] m-0">
              {deltaCups < 0
                ? `Mengapa Menjual ${cups} Cangkir Lebih Untung Daripada ${currentCups} Cangkir?`
                : `Bagaimana Menemukan Titik Penjualan Paling Menguntungkan?`}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col gap-3 text-xs sm:text-sm text-[#bfa89b] leading-relaxed">
          <p className="m-0">
            {deltaCups < 0 ? (
              <>
                Bagi orang awam, menjual <strong>{cups} cangkir</strong> terdengar lebih sedikit daripada <strong>{currentCups} cangkir</strong>. Tapi perhatikan matematika kasir nyatanya:
              </>
            ) : (
              <>
                Kalkulus diferensial bekerja dengan menyeimbangkan dua kekuatan bisnis yang saling tarik-menarik:
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-1">
            <div className="p-3 rounded-lg bg-[#241e1b] border border-[#3d322c]">
              <span className="text-[11px] font-mono text-[#e07a5f] font-bold block mb-1">
                1. Hemat Modal Bahan
              </span>
              <span className="text-xs text-[#f4ede2]">
                {deltaCups < 0 ? (
                  <>
                    Jual {Math.abs(deltaCups)} cangkir lebih sedikit menghemat modal bahan sebesar{" "}
                    <strong className="text-[#81b29a]">{formatRupiah(Math.abs(deltaCups) * params.variable_cost)}</strong>{" "}
                    ({Math.abs(deltaCups)} x {formatRupiah(params.variable_cost)}).
                  </>
                ) : (
                  <>
                    Volume naik {deltaCups} cangkir dengan tambahan modal bahan terkontrol{" "}
                    <strong className="text-[#81b29a]">{formatRupiah(deltaCups * params.variable_cost)}</strong>.
                  </>
                )}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#241e1b] border border-[#3d322c]">
              <span className="text-[11px] font-mono text-[#f2cc8f] font-bold block mb-1">
                2. Margin Per Cangkir Tebal
              </span>
              <span className="text-xs text-[#f4ede2]">
                Harga menu disesuaikan ke {formatRupiah(price)}. Margin per cangkir berubah dari{" "}
                <strong>{formatRupiah(currentPrice - params.variable_cost)}</strong> menjadi{" "}
                <strong className="text-[#81b29a]">{formatRupiah(price - params.variable_cost)}</strong>.
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#241e1b] border border-[#3d322c]">
              <span className="text-[11px] font-mono text-[#81b29a] font-bold block mb-1">
                3. Untung Bersih Masuk Dompet
              </span>
              <span className="text-xs text-[#f4ede2]">
                Laba bersih bertambah{" "}
                <strong className="text-[#81b29a]">
                  {deltaProfit >= 0 ? `+${formatRupiah(deltaProfit)}` : formatRupiah(deltaProfit)}
                </strong>
                /hari ({formatRupiah(Math.abs(deltaProfit) * 30)}/bulan) dengan beban kerja barista lebih terukur!
              </span>
            </div>
          </div>

          <p className="m-0 text-xs italic text-[#8a7a70]">
            Kalkulus tidak sekadar mencari volume terbanyak, melainkan mencari titik paling efisien (sweet spot) di mana setiap gram biji kopi dan tetes susu menghasilkan keuntungan rupiah tertinggi.
          </p>
        </div>
      </div>

      {/* Tabel 4 Skenario Harga Nyata */}
      {scenarios.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-sm text-[var(--text-1)] m-0 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#f2cc8f]" />
              <span>Simulasi 4 Pilihan Harga (Mengapa Rekomendasi Ini Paling Menang?)</span>
            </h5>
            <span className="text-[11px] font-mono text-[#8a7a70]">
              Data asli dari kurva kalkulus harian
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {scenarios.map((sc, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                  sc.highlight
                    ? "bg-[#241e1b] border-[#81b29a] shadow-lg ring-1 ring-[#81b29a]"
                    : "bg-[#1a1614] border-[#3d322c]"
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase w-fit ${sc.badgeColor}`}
                  >
                    {sc.tag}
                  </span>
                  <h6 className="font-serif font-bold text-base text-[#f4ede2] m-0">
                    {formatRupiah(sc.price)} <span className="text-xs font-normal text-[#bfa89b]">/ cup</span>
                  </h6>
                  <span className="text-xs font-mono text-[#bfa89b]">
                    Target jual: <strong>{formatNumber(sc.cups)} cangkir</strong>
                  </span>
                </div>

                <div className="py-2.5 border-y border-[#3d322c] flex flex-col gap-1 font-mono text-xs">
                  <div className="flex justify-between text-[#8a7a70]">
                    <span>Pemasukan:</span>
                    <span>{formatRupiah(sc.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-[#8a7a70]">
                    <span>Biaya Total:</span>
                    <span>{formatRupiah(sc.cost)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-[#3d322c]/60">
                    <span className="text-[#f4ede2]">Untung Bersih:</span>
                    <span className={sc.profit >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"}>
                      {formatRupiah(sc.profit)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#bfa89b] leading-tight m-0">
                  {sc.verdict}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6 Langkah Runtut Penjelasan */}
      <div className="flex flex-col gap-3">
        <h5 className="font-semibold text-sm text-[var(--text-1)] m-0">
          6 Langkah Runtut Menghitung Keuntungan Kedai Anda
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {storySteps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bento p-4 flex flex-col gap-2 transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--bg-raised)] text-[var(--accent)] border border-[var(--line)] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h5 className="font-semibold text-xs sm:text-sm text-[var(--text-1)] m-0">
                    {s.title}
                  </h5>
                </div>
                <p className="text-xs text-[#c8b8a8] leading-relaxed m-0">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
