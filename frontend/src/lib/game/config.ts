/**
 * config.ts — Konfigurasi level, pangkat, ambang bintang, dan aturan tantangan KopiOptima.
 * Sumber kebenaran: DESIGN.md Bagian 7.
 */

export interface LevelConfig {
  id: string; // "1", "2", "3", "4", "5", "bebas"
  number: number;
  title: string;
  subtitle: string;
  mission: string;
  presetId: "G1" | "G2" | "G3" | "G4" | "G5" | null;
  lesson: string;
  hasGuessPhase?: boolean; // Level 2: Tebak dulu
  isDecisionLevel?: boolean; // Level 5: Kartu keputusan tutup/buka
}

export const LEVELS: LevelConfig[] = [
  {
    id: "1",
    number: 1,
    title: "Warung Pertama",
    subtitle: "Untung punya puncak",
    mission: "Cari kombinasi harga dan jumlah cangkir yang menghasilkan keuntungan harian paling besar.",
    presetId: "G1",
    lesson: "Untung punya puncak: pada harga dan cangkir yang tepat, keuntungan mencapai nilai tertinggi.",
  },
  {
    id: "2",
    number: 2,
    title: "Pesanan Membludak",
    subtitle: "Biaya lembur saat ramai",
    mission: "Tebak lalu temukan titik untung terbaik saat ada biaya lembur kuadratik yang membengkak.",
    presetId: "G2",
    lesson: "Biaya lembur membuat puncak bergeser ke kiri: menjual sedikit lebih sedikit justru lebih untung daripada memaksakan lembur.",
    hasGuessPhase: true,
  },
  {
    id: "3",
    number: 3,
    title: "Dapur Mungil",
    subtitle: "Batas kapasitas mesin kopi",
    mission: "Dapur hanya mampu membuat 60 cangkir per hari. Cari cara meraih keuntungan terbesar dalam batas kapasitas ini.",
    presetId: "G3",
    lesson: "Batas kapasitas menahan untung terbesar: menaikkan harga membantu menyaring pesanan agar sesuai kemampuan mesin.",
  },
  {
    id: "4",
    number: 4,
    title: "Badai Biaya",
    subtitle: "Kondisi modal tinggi",
    mission: "Sewa tempat dan bahan baku melonjak tinggi. Ketika rugi tak terhindarkan, cari titik dengan kerugian paling kecil.",
    presetId: "G4",
    lesson: "Ketika modal terlalu tinggi dan pasti rugi, kalkulus membantu menemukan titik aman dengan kerugian paling minim.",
  },
  {
    id: "5",
    number: 5,
    title: "Kapan Harus Tutup?",
    subtitle: "Keputusan kelayakan usaha",
    mission: "Biaya bahan per cangkir lebih mahal daripada harga yang mampu dibeli pasar. Tentukan keputusan bisnis terbaik.",
    presetId: "G5",
    lesson: "Ketika harga pasar tidak mampu menutup biaya modal bahan per cangkir, keputusan terbaik adalah jeda beroperasi daripada terus merugi.",
    isDecisionLevel: true,
  },
  {
    id: "bebas",
    number: 6,
    title: "Eksplorasi Bebas",
    subtitle: "Uji kedai impian Anda",
    mission: "Atur parameter biaya dan harga sesuka Anda, lalu cari titik puncak keuntungan terbaik.",
    presetId: null,
    lesson: "Kalkulus diferensial berlaku pada segala skala kedai kopi: dari gerobak keliling hingga roastery modern.",
  },
];

export interface RankConfig {
  title: string;
  minXp: number;
}

export const RANKS: RankConfig[] = [
  { title: "Magang", minXp: 0 },
  { title: "Barista", minXp: 150 },
  { title: "Kepala Barista", minXp: 350 },
  { title: "Pemilik Kedai", minXp: 600 },
  { title: "Juragan Kopi", minXp: 900 },
];

export const STAR_THRESHOLDS = {
  threeStars: 99,
  twoStars: 95,
  oneStar: 80,
};

export const XP_REWARDS = {
  completeLevel: 50,
  perStar: 25,
  noHintsBonus: 20,
  accurateGuessBonus: 15,
  hintPenalty: 10,
};
