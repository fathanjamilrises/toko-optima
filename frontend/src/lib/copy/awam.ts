/**
 * awam.ts — Teks Mode Awam untuk KopiOptima.
 * ATURAN KETAT: Dilarang memuat kata:
 * "turunan", "titik kritis", "diskriminan", "elastisitas", "marginal", "optimum", "optimal".
 * Bahasa ramah, mudah dipahami pemilik kedai kopi, tanpa jargon kalkulus.
 */

export const awam = {
  mode: "Awam",
  navigation: { simulation: "Simulasi", challenge: "Tantangan" },
  empty: "Pilih contoh kedai untuk melihat arah untungnya.",
  noProduction: "Untuk kondisi ini, lebih baik jeda jualan sambil menekan biaya.",

  form: {
    presetsTitle: "Pilihan contoh kedai",
    presetsPlaceholder: "Pilih salah satu contoh kedai...",
    btnTryExample: "Coba contoh kedai",
    btnClear: "Kosongkan",
    groupCost: "Biaya Anda",
    groupMarket: "Harga dan pembeli Anda",
    groupAdvanced: "Pengaturan lanjutan (opsional: lembur, batas cangkir)",

    fixedCost: {
      label: "Biaya tetap per hari",
      help: "Sewa tempat, gaji pokok, listrik, dan kebersihan yang harus dibayar berapapun cangkir yang terjual.",
      tooltip: "Diambil dari total biaya operasional bulanan dibagi jumlah hari buka dalam sebulan.",
      example: "Misal: Rp300.000 / hari",
      unit: "Rp/hari",
    },
    variableCost: {
      label: "Modal bahan per cangkir",
      help: "Biji kopi, susu, cangkir, sedotan, dan gula untuk membuat 1 cangkir.",
      tooltip: "Dihitung dari harga pembelian bahan dibagi porsi tiap cangkir kopi.",
      example: "Misal: Rp8.000 / cangkir",
      unit: "Rp/cangkir",
    },
    quadCost: {
      label: "Biaya tambahan saat ramai / lembur",
      help: "Biaya lembur barista atau sewa mesin tambahan saat pesanan melonjak sangat tinggi.",
      tooltip: "Bila makin ramai kedai butuh barista cadangan atau listrik genset ekstra, isi biaya ini.",
      example: "Biaya bertambah kuadratik seiring lonjakan cangkir.",
      unit: "Tingkat lembur",
      chips: {
        none: "Tidak ada (0)",
        light: "Ringan (10)",
        medium: "Sedang (20)",
        heavy: "Berat (50)",
      },
    },
    refPrice: {
      label: "Harga menu saat ini",
      help: "Harga jual yang biasa Anda pasang di kedai saat ini.",
      tooltip: "Harga patokan yang tercantum di papan menu kedai Anda sekarang.",
      example: "Misal: Rp22.000 / cangkir",
      unit: "Rp/cangkir",
    },
    refDemand: {
      label: "Jumlah pembeli pada harga saat ini",
      help: "Rata-rata cangkir yang laku terjual per hari pada harga menu saat ini.",
      tooltip: "Rata-rata penjualan harian dari buku catatan kasir Anda.",
      example: "Misal: 80 cangkir / hari",
      unit: "cangkir/hari",
    },
    sensitivity: {
      label: "Kepekaan pembeli terhadap harga",
      help: "Berapa cangkir penjualan berkurang jika Anda menaikkan harga Rp1.000?",
      tooltip: "Menggambarkan seberapa sensitif pelanggan Anda saat harga dinaikkan seribu rupiah.",
      example: "Misal: 5 cangkir per kenaikan Rp1.000",
      unit: "cangkir per Rp1.000",
    },
    capacity: {
      label: "Batas kemampuan produksi harian",
      toggle: "Ada batas kapasitas cangkir",
      help: "Batas cangkir maksimal yang sanggup diseduh oleh barista dan mesin Anda dalam sehari.",
      tooltip: "Kapasitas maksimal ruang dan alat Anda sebelum kedai kewalahan.",
      example: "Misal: 60 cangkir / hari",
      unit: "cangkir/hari",
    },
  },

  headline: {
    title: "Untung bersih terbesar",
    subtitle: (cups: string, price: string) => `Jual ${cups} cangkir per hari dengan harga Rp${price}.`,
    btnCalculate: "Coba hitung",
    calculating: "Sedang menghitung...",
  },

  receipt: {
    title: "STRUK UNTUNG TERBESAR",
    subtitle: "KopiOptima — Ringkasan Hasil",
    targetCups: "Jumlah terbaik",
    targetPrice: "Harga terbaik",
    revenue: "Pemasukan",
    cost: "Pengeluaran",
    profit: "UNTUNG BERSIH",
    breakEven: (start: string, end?: string) =>
      end ? `Mulai untung di ${start} cangkir (batas atas ${end} cangkir)` : `Mulai untung di ${start} cangkir`,
    noBreakEven: "Belum balik modal pada kondisi ini",
    comparisonTitle: "Sekarang vs Disarankan",
    stamps: {
      profit: "UNTUNG",
      loss: "RUGI",
      closed: "TUTUP SAJA",
    },
  },

  comparison: {
    title: "Perbandingan: Sekarang vs Disarankan",
    currentTitle: "Kondisi Menu Sekarang",
    suggestedTitle: "Saran Paling Menguntungkan",
    cupsLabel: "Penjualan harian",
    priceLabel: "Harga menu",
    profitLabel: "Untung bersih",
    deltaProfitMore: (diff: string) => `Untung bertambah ${diff} per hari`,
    deltaProfitLess: (diff: string) => `Untung berkurang ${diff} per hari`,
    deltaProfitSame: "Untung sama dengan kondisi sekarang",
  },

  warnings: {
    sectionTitle: "Perlu diperhatikan",
    meaningTitle: "Arti bagi usaha Anda",
    actionTitle: "Saran tindakan",
  },

  tabs: {
    story: "Cerita",
    charts: "Grafik",
    hill: "Peta Untung (3D)",
    sensitivity: "Daya Tahan",
    table: "Tabel Data",
    math: "Hitungan Rinci",
  },

  charts: {
    guideRevenueCost: "Cara membaca grafik: Titik tertinggi kurva hijau adalah puncak keuntungan Anda. Garis putus-putus abu-abu menandai batas saat kedai mulai balik modal.",
    legendRevenue: "Pemasukan",
    legendCost: "Pengeluaran",
    legendProfit: "Untung Bersih",
    markerOptimum: "Puncak Untung",
    markerBreakEven: "Balik Modal",
    markerCurrent: "Kondisi Sekarang",
    ariaProfitChart: "Grafik hubungan jumlah penjualan cangkir terhadap untung bersih, pemasukan, dan pengeluaran harian kedai.",
  },

  table: {
    title: "Tabel Penjualan per 10 Cangkir",
    subtitle: "Perkiraan pemasukan, biaya, dan laba pada berbagai tingkat penjualan.",
    colCups: "Cangkir",
    colPrice: "Harga Satuan",
    colRevenue: "Pemasukan",
    colCost: "Pengeluaran",
    colProfit: "Untung Bersih",
    btnDownloadCsv: "Unduh CSV Tabel",
  },

  sensitivity: {
    title: "Daya Tahan Terhadap Perubahan Biaya",
    subtitle: "Seberapa kuat keuntungan Anda jika modal bahan atau biaya tetap berubah.",
    colScenario: "Skenario Perubahan",
    colCups: "Cangkir",
    colPrice: "Harga",
    colProfit: "Untung Baru",
    colDiff: "Selisih Untung",
  },

  math: {
    title: "Langkah Penjelasan Terbuka",
    subtitle: "Rangkaian perhitungan lengkap yang mendasari hasil simulasi ini.",
    btnCopyLatex: "Salin Rumus",
    copiedLatex: "Rumus tersalin!",
  },

  export: {
    btnJson: "Unduh Data (JSON)",
    btnCsv: "Unduh Tabel (CSV)",
  },

  errors: {
    networkTitle: "Tidak dapat terhubung ke server",
    networkDesc: "Periksa sambungan backend KopiOptima di port 8000.",
    fieldRequired: "Bagian ini wajib diisi.",
    fieldInvalid: "Isian angka tidak sah.",
  },
};

export type AppCopy = typeof awam;
