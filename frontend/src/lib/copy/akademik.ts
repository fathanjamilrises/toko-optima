/**
 * akademik.ts — Teks Mode Akademik untuk KopiOptima.
 * Menggunakan istilah matematis resmi kalkulus diferensial:
 * turunan, titik kritis P'(x)=0, elastisitas permintaan, analisis marginal MR=MC,
 * break-even point (BEP), konveksitas kurva, dan notasi x*, p*, R*, C*, P*.
 */

import type { AppCopy } from "./awam";

export const akademik: AppCopy = {
  mode: "Akademik",
  navigation: { simulation: "Simulasi", challenge: "Tantangan" },
  empty: "Pilih preset untuk menganalisis titik kritis fungsi laba.",
  noProduction: "Kondisi a <= v: fungsi laba monoton turun (status NO_PRODUCTION).",

  form: {
    presetsTitle: "Pilihan Preset Studi Kasus (G1–G5)",
    presetsPlaceholder: "Pilih preset pengujian optimasi...",
    btnTryExample: "Muat Preset Kasus",
    btnClear: "Reset Parameter",
    groupCost: "Struktur Fungsi Biaya C(x)",
    groupMarket: "Fungsi Permintaan Terbalik p(x)",
    groupAdvanced: "Kendala Tambahan: Koefisien Kuadratik c & Kapasitas x_max",

    fixedCost: {
      label: "Biaya Tetap FC (Fixed Cost)",
      help: "Konstanta biaya independen terhadap kuantitas output x: C(0) = FC.",
      tooltip: "Komponen intersep pada fungsi biaya C(x) = FC + vx + cx^2.",
      example: "Parameter FC >= 0, batas 1e10",
      unit: "Rp/periode",
    },
    variableCost: {
      label: "Biaya Variabel Linier v (Variable Cost)",
      help: "Gradien linier biaya per unit output cangkir kopi (Rp/cangkir).",
      tooltip: "Turunan pertama biaya linier: dC/dx = v (saat c = 0).",
      example: "Parameter v >= 0, batas 1e7",
      unit: "Rp/cangkir",
    },
    quadCost: {
      label: "Koefisien Biaya Kuadratik c (Quad Cost)",
      help: "Koefisien penalti kapasitas: C_quad(x) = c * x^2 (hukum disekonomi skala).",
      tooltip: "Menjadikan MC = v + 2cx naik linier seiring kuantitas x.",
      example: "Nilai c >= 0 (default 0)",
      unit: "Rp/cangkir^2",
      chips: {
        none: "c = 0 (Linier)",
        light: "c = 10",
        medium: "c = 20 (G2 Lembur)",
        heavy: "c = 50",
      },
    },
    refPrice: {
      label: "Harga Referensi p_0",
      help: "Titik harga acuan pasar untuk mengonstruksi fungsi permintaan linear.",
      tooltip: "Dipakai bersama q_0 dan s untuk menentukan intersep a = p_0 + b*q_0.",
      example: "p_0 > 0",
      unit: "Rp",
    },
    refDemand: {
      label: "Kuantitas Permintaan Referensi q_0",
      help: "Kuantitas permintaan pasar teramati pada tingkat harga p_0.",
      tooltip: "Titik koordinat (q_0, p_0) pada kurva permintaan terbalik p(x).",
      example: "q_0 > 0",
      unit: "unit/hari",
    },
    sensitivity: {
      label: "Sensitivitas Harga s (dq/dp * 1000)",
      help: "Penurunan kuantitas demand tiap kenaikan harga Rp1.000: s = -1000 * dq/dp.",
      tooltip: "Kemiringan inversi demand b = 1000 / s.",
      example: "s > 0 (gradien b = 1000/s)",
      unit: "cangkir/Rp1.000",
    },
    capacity: {
      label: "Batas Kapasitas Maksimum x_max",
      toggle: "Aktifkan kendala batas produksi x <= x_max",
      help: "Kendala pertidaksamaan x <= x_max (KKT boundary optimum).",
      tooltip: "Jika x* > capacity, solusi optimum terpotong pada batas x_opt = capacity.",
      example: "capacity > 0 atau null",
      unit: "unit/hari",
    },
  },

  headline: {
    title: "Solusi Titik Optimum Laba P*(x)",
    subtitle: (cups: string, price: string) => `Kuantitas optimal x* = ${cups} unit dengan harga kliring pasar p* = Rp${price}.`,
    btnCalculate: "Evaluasi Model",
    calculating: "Menghitung turunan dan optimum...",
  },

  receipt: {
    title: "STRUK OPTIMASI KALKULUS",
    subtitle: "KopiOptima — Bukti Titik Kritis",
    targetCups: "Kuantitas Optimal x*",
    targetPrice: "Harga Optimal p*",
    revenue: "Pendapatan R(x*)",
    cost: "Biaya Total C(x*)",
    profit: "Laba Maksimum P*(x*)",
    breakEven: (start: string, end?: string) =>
      end ? `Akar BEP: x_BEP1 = ${start}, x_BEP2 = ${end}` : `Akar BEP Tunggal: x_BEP = ${start}`,
    noBreakEven: "Diskriminan D < 0 (Tidak ada akar riil BEP, rugi global)",
    comparisonTitle: "Analisis Komparatif: Baseline vs Optimum",
    stamps: {
      profit: "OPTIMUM",
      loss: "DEFISIT",
      closed: "NO_PRODUCTION",
    },
  },

  comparison: {
    title: "Analisis Komparatif: Kondisi Referensi vs Optimum",
    currentTitle: "Titik Referensi (q_0, p_0)",
    suggestedTitle: "Titik Kritis Maksimum (x*, p*)",
    cupsLabel: "Kuantitas x",
    priceLabel: "Harga p",
    profitLabel: "Fungsi Laba P(x)",
    deltaProfitMore: (diff: string) => `Peningkatan efisiensi laba Delta P = +${diff}`,
    deltaProfitLess: (diff: string) => `Penurunan efisiensi laba Delta P = -${diff}`,
    deltaProfitSame: "Titik referensi tepat berada di titik kritis",
  },

  warnings: {
    sectionTitle: "Evaluasi Validasi & Diagnostik Model",
    meaningTitle: "Implikasi Analitis",
    actionTitle: "Rekomendasi Manajerial & Matematis",
  },

  tabs: {
    story: "Naratif Model",
    charts: "Analisis Kurva 2D",
    hill: "Peta Laba & Turunan (3D)",
    sensitivity: "Sensitivitas & Parsial",
    table: "Tabel Diskret",
    math: "Derivasi 16 Langkah",
  },

  charts: {
    guideRevenueCost: "Analisis Marginal: Puncak laba P(x) tercapai tepat saat kurva Pendapatan Marginal berpotongan dengan Biaya Marginal: MR(x*) = MC(x*), ekuivalen dengan turunan pertama P'(x*) = 0 dan P''(x*) < 0.",
    legendRevenue: "Pendapatan R(x)",
    legendCost: "Biaya Total C(x)",
    legendProfit: "Laba P(x)",
    markerOptimum: "Titik Optimum (x*, P*)",
    markerBreakEven: "Break-Even Point (BEP)",
    markerCurrent: "Titik Referensi (q_0, P_0)",
    ariaProfitChart: "Grafik fungsi pendapatan R(x), biaya C(x), dan keuntungan P(x) terhadap kuantitas produksi x.",
  },

  table: {
    title: "Tabel Evaluasi Titik Diskret",
    subtitle: "Evaluasi nilai fungsi R(x), C(x), dan P(x) pada interval kuantitas diskret.",
    colCups: "Kuantitas x",
    colPrice: "Harga p(x)",
    colRevenue: "R(x)",
    colCost: "C(x)",
    colProfit: "P(x)",
    btnDownloadCsv: "Ekspor Format CSV",
  },

  sensitivity: {
    title: "Analisis Sensitivitas & Turunan Parsial",
    subtitle: "Laju perubahan titik optimum terhadap parameter biaya dan pasar (Teorema Envelope).",
    colScenario: "Variasi Parameter",
    colCups: "x*(v, FC)",
    colPrice: "p*(v, FC)",
    colProfit: "P*(v, FC)",
    colDiff: "Delta Laba",
  },

  math: {
    title: "Derivasi Simbolik & 16 Langkah Solusi",
    subtitle: "Langkah terstruktur penurunan fungsi dari pembentukan model hingga verifikasi turunan kedua.",
    btnCopyLatex: "Salin Kode LaTeX",
    copiedLatex: "Kode LaTeX berhasil disalin!",
  },

  export: {
    btnJson: "Ekspor JSON Lengkap",
    btnCsv: "Ekspor Tabel CSV",
  },

  errors: {
    networkTitle: "Galat Koneksi API Backend",
    networkDesc: "Gagal berkomunikasi dengan service REST FastAPI pada port 8000.",
    fieldRequired: "Parameter wajib ditentukan.",
    fieldInvalid: "Nilai parameter tidak memenuhi batasan domain.",
  },
};
