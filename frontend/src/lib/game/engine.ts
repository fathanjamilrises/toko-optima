/**
 * engine.ts — Fungsi murni untuk kalkulasi skor game, bintang, petunjuk arah/suhu,
 * dan evaluasi keputusan bisnis.
 *
 * ATURAN KETAT DESIGN.MD:
 * - Fungsi murni tanpa React/Three.js agar 100% testable.
 * - Rumus skor memakai rumus rentang DESIGN.md 7.5:
 *   skor(%) = ((P_pilih - P_min) / (P_maks - P_min)) * 100
 * - Nilai P_pilih, P_maks, dan P_min semuanya murni dari API.
 */

import { STAR_THRESHOLDS, XP_REWARDS, RANKS, type RankConfig } from "./config";
import type { LanguageMode } from "@/lib/copy";

export interface ScoreResult {
  score: number; // 0..100
  stars: number; // 0..3
  stampText: "UNTUNG BESAR!" | "HAMPIR!" | "COBA LAGI" | "KEPUTUSAN TEPAT!";
  isOptimal: boolean;
}

/**
 * Menghitung skor game menggunakan rumus rentang DESIGN.md 7.5.
 * Aman untuk level rugi (Level 4) dan bebas pembagian dengan nol.
 */
export function calculateScore(
  chosenProfit: number,
  minProfit: number,
  maxProfit: number
): number {
  if (maxProfit === minProfit) {
    return 100;
  }
  const rawScore = ((chosenProfit - minProfit) / (maxProfit - minProfit)) * 100;
  return Math.max(0, Math.min(Math.round(rawScore * 10) / 10, 100));
}

/**
 * Mengevaluasi perolehan bintang dari persentase skor.
 */
export function evaluateStars(score: number): number {
  if (score >= STAR_THRESHOLDS.threeStars) return 3;
  if (score >= STAR_THRESHOLDS.twoStars) return 2;
  if (score >= STAR_THRESHOLDS.oneStar) return 1;
  return 0;
}

/**
 * Menghitung evaluasi lengkap skor, bintang, dan stempel visual.
 */
export function evaluateLevelResult(
  chosenProfit: number,
  minProfit: number,
  maxProfit: number
): ScoreResult {
  const score = calculateScore(chosenProfit, minProfit, maxProfit);
  const stars = evaluateStars(score);

  let stampText: ScoreResult["stampText"] = "COBA LAGI";
  if (stars === 3) stampText = "UNTUNG BESAR!";
  else if (stars >= 1) stampText = "HAMPIR!";

  return {
    score,
    stars,
    stampText,
    isOptimal: stars === 3,
  };
}

/**
 * Petunjuk 1: Arah berdasarkan tanda dP pada titik saat ini (DESIGN.md 7.8).
 */
export function evaluateSlopeHint(dP: number, mode: LanguageMode): string {
  if (mode === "akademik") {
    if (dP > 300) return "Turunan positif: P'(x) > 0 → tingkatkan x untuk mendekati titik kritis";
    if (dP < -300) return "Turunan negatif: P'(x) < 0 → kurangi x untuk mendekati titik kritis";
    return "Turunan mendekati nol: P'(x) ≈ 0 (syarat orde pertama maksimum tercapai)";
  }

  // Mode Awam (Bebas kata terlarang kalkulus)
  if (dP > 300) return "Kemiringan masih naik ↗ — tambah cangkir untuk untung lebih besar";
  if (dP < -300) return "Mulai menurun ↘ — kurangi cangkir agar untung tidak tergerus";
  return "Rata — Anda sudah berada tepat di dekat puncak keuntungan!";
}

/**
 * Petunjuk 2: Hangat / Dingin berdasarkan persentase skor saat ini.
 */
export function evaluateHotColdHint(score: number): {
  level: "dingin" | "hangat" | "panas";
  message: string;
} {
  if (score >= 90) {
    return {
      level: "panas",
      message: "Panas! Anda sangat dekat sekali dengan untung terbesar!",
    };
  }
  if (score >= 50) {
    return {
      level: "hangat",
      message: "Hangat! Arah Anda sudah benar, geser sedikit lagi.",
    };
  }
  return {
    level: "dingin",
    message: "Dingin. Posisi ini masih jauh dari keuntungan maksimal.",
  };
}

/**
 * Petunjuk 3: Rentang sempit di sekitar puncak (±5 titik dari titik optimum).
 */
export function evaluateRangeHint(
  optimumIndex: number,
  totalPoints: number
): { minIndex: number; maxIndex: number } {
  return {
    minIndex: Math.max(0, optimumIndex - 5),
    maxIndex: Math.min(totalPoints - 1, optimumIndex + 5),
  };
}

/**
 * Evaluasi keputusan bisnis untuk Level 5 (Status NO_PRODUCTION).
 */
export function evaluateDecisionLevel(decision: "BUKA" | "TUTUP_SEMENTARA"): {
  isCorrect: boolean;
  score: number;
  stars: number;
  feedback: string;
} {
  if (decision === "TUTUP_SEMENTARA") {
    return {
      isCorrect: true,
      score: 100,
      stars: 3,
      feedback: "Tepat sekali! Ketika harga pasar lebih rendah dari modal bahan, jeda beroperasi mencegah kerugian harian semakin membengkak.",
    };
  }
  return {
    isCorrect: false,
    score: 0,
    stars: 0,
    feedback: "Kurang tepat. Menjual kopi saat harga di bawah modal bahan baku justru membuat kedai merugi di setiap cangkir yang diseduh.",
  };
}

/**
 * Menghitung perolehan XP pemain.
 */
export function calculateRewards(
  score: number,
  stars: number,
  hintsUsedCount: number,
  guessAccurate: boolean
): { earnedXp: number; details: string[] } {
  const details: string[] = [];
  let xp = 0;

  // XP selesai level
  xp += XP_REWARDS.completeLevel;
  details.push(`Selesai level: +${XP_REWARDS.completeLevel} XP`);

  // XP bintang
  if (stars > 0) {
    const starXp = stars * XP_REWARDS.perStar;
    xp += starXp;
    details.push(`${stars} Bintang: +${starXp} XP`);
  }

  // Bonus tanpa petunjuk
  if (hintsUsedCount === 0 && stars >= 2) {
    xp += XP_REWARDS.noHintsBonus;
    details.push(`Mandiri tanpa petunjuk: +${XP_REWARDS.noHintsBonus} XP`);
  }

  // Bonus tebakan akurat
  if (guessAccurate) {
    xp += XP_REWARDS.accurateGuessBonus;
    details.push(`Tebakan awal akurat (±10%): +${XP_REWARDS.accurateGuessBonus} XP`);
  }

  // Penalti petunjuk jika digunakan
  if (hintsUsedCount > 0) {
    const penalty = hintsUsedCount * XP_REWARDS.hintPenalty;
    xp = Math.max(0, xp - penalty);
    details.push(`Biaya petunjuk (${hintsUsedCount}x): -${penalty} XP`);
  }

  return { earnedXp: xp, details };
}

/**
 * Menentukan pangkat pemain berdasarkan total akumulasi XP.
 */
export function getRankFromXp(xp: number): RankConfig {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      currentRank = rank;
    }
  }
  return currentRank;
}
