/**
 * engine.test.ts — Unit test mesin kalkulasi game KopiOptima (DESIGN.md 13 & 14).
 * Kriteria Definition of Done 4D:
 * - Skor di titik puncak = 100% (★★★) untuk G1–G4 menggunakan data fixture nyata.
 * - Level 5 dievaluasi sesuai status kelayakan bisnis NO_PRODUCTION.
 * - Petunjuk arah dP dan evaluasi suhu bekerja akurat di kedua mode bahasa.
 */

import { describe, it, expect } from "vitest";
import {
  evaluateLevelResult,
  evaluateSlopeHint,
  evaluateHotColdHint,
  evaluateRangeHint,
  evaluateDecisionLevel,
  calculateRewards,
  getRankFromXp,
} from "@/lib/game/engine";
import g1 from "../../tests/fixtures/g1.json";
import g2 from "../../tests/fixtures/g2.json";
import g3 from "../../tests/fixtures/g3.json";
import g4 from "../../tests/fixtures/g4.json";
import g5 from "../../tests/fixtures/g5.json";
import type { OptimizeResponse } from "@/types/api";

describe("Game Engine & Scoring (Definition of Done 4D)", () => {
  const g1Data = g1 as unknown as OptimizeResponse;
  const g2Data = g2 as unknown as OptimizeResponse;
  const g3Data = g3 as unknown as OptimizeResponse;
  const g4Data = g4 as unknown as OptimizeResponse;
  const g5Data = g5 as unknown as OptimizeResponse;

  describe("Golden Test: Skor Titik Puncak = 100% (★★★) untuk G1–G4", () => {
    it("Kasus G1 (Level 1 — Warung Pertama): titik optimum 75 cangkir bernilai skor 100% dan 3 bintang", () => {
      const pts = g1Data.curves.points;
      const minP = Math.min(...pts.map((p) => p.P));
      const maxP = g1Data.optimum.integer.profit; // 825000

      const result = evaluateLevelResult(maxP, minP, maxP);

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.stampText).toBe("UNTUNG BESAR!");
      expect(result.isOptimal).toBe(true);
    });

    it("Kasus G2 (Level 2 — Pesanan Membludak): titik optimum 68 cangkir bernilai skor 100% dan 3 bintang", () => {
      const pts = g2Data.curves.points;
      const minP = Math.min(...pts.map((p) => p.P));
      const maxP = g2Data.optimum.integer.profit; // 722720

      const result = evaluateLevelResult(maxP, minP, maxP);

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.stampText).toBe("UNTUNG BESAR!");
    });

    it("Kasus G3 (Level 3 — Dapur Mungil): titik terikat kapasitas 60 cangkir bernilai skor 100% dan 3 bintang", () => {
      const pts = g3Data.curves.points;
      const minP = Math.min(...pts.map((p) => p.P));
      const maxP = g3Data.optimum.integer.profit; // 780000

      const result = evaluateLevelResult(maxP, minP, maxP);

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.stampText).toBe("UNTUNG BESAR!");
    });

    it("Kasus G4 (Level 4 — Badai Biaya): titik rugi terkecil bernilai skor 100% tanpa pembagian negatif", () => {
      const pts = g4Data.curves.points;
      const minP = Math.min(...pts.map((p) => p.P)); // misal -600000
      const maxP = g4Data.optimum.integer.profit; // -375000

      const result = evaluateLevelResult(maxP, minP, maxP);

      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
      expect(result.stampText).toBe("UNTUNG BESAR!");
    });
  });

  describe("Kasus G5 (Level 5 — Kapan Harus Tutup?)", () => {
    it("memvalidasi bahwa status G5 adalah NO_PRODUCTION", () => {
      expect(g5Data.optimum.status).toBe("NO_PRODUCTION");
    });

    it("memberikan skor 100% dan 3 bintang jika memilih TUTUP_SEMENTARA", () => {
      const result = evaluateDecisionLevel("TUTUP_SEMENTARA");
      expect(result.isCorrect).toBe(true);
      expect(result.score).toBe(100);
      expect(result.stars).toBe(3);
    });

    it("memberikan skor 0% jika memilih BUKA pada kondisi tidak layak produksi", () => {
      const result = evaluateDecisionLevel("BUKA");
      expect(result.isCorrect).toBe(false);
      expect(result.score).toBe(0);
      expect(result.stars).toBe(0);
    });
  });

  describe("Logika Petunjuk (Hint System)", () => {
    it("menghasilkan petunjuk arah kemiringan yang tepat untuk Mode Awam dan Mode Akademik", () => {
      // Saat kurva masih naik (dP > 300)
      const awamUp = evaluateSlopeHint(1200, "awam");
      expect(awamUp).toContain("naik");
      expect(awamUp).not.toContain("P'");

      const akademikUp = evaluateSlopeHint(1200, "akademik");
      expect(akademikUp).toContain("P'(x) > 0");

      // Saat kurva menurun (dP < -300)
      const awamDown = evaluateSlopeHint(-800, "awam");
      expect(awamDown).toContain("menurun");

      const akademikDown = evaluateSlopeHint(-800, "akademik");
      expect(akademikDown).toContain("P'(x) < 0");

      // Saat di sekitar puncak (|dP| <= 300)
      const awamFlat = evaluateSlopeHint(50, "awam");
      expect(awamFlat).toContain("Rata");

      const akademikFlat = evaluateSlopeHint(50, "akademik");
      expect(akademikFlat).toContain("P'(x) ≈ 0");
    });

    it("menghasilkan petunjuk suhu (Hangat/Dingin) berdasarkan skor", () => {
      expect(evaluateHotColdHint(30).level).toBe("dingin");
      expect(evaluateHotColdHint(75).level).toBe("hangat");
      expect(evaluateHotColdHint(95).level).toBe("panas");
    });

    it("menentukan batas rentang petunjuk 3 di sekitar puncak", () => {
      const range = evaluateRangeHint(50, 100);
      expect(range.minIndex).toBe(45);
      expect(range.maxIndex).toBe(55);
    });
  });

  describe("Sistem Hadiah XP dan Pangkat", () => {
    it("menghitung XP total secara adil sesuai bintang dan petunjuk", () => {
      // 3 bintang, tanpa petunjuk, tebakan tepat
      const rewards = calculateRewards(100, 3, 0, true);
      // 50 (selesai) + 75 (3 bintang) + 20 (tanpa hint) + 15 (tebak akurat) = 160
      expect(rewards.earnedXp).toBe(160);

      // Dengan pemakaian 2 petunjuk: 50 + 75 - 20 = 105
      const penalized = calculateRewards(100, 3, 2, false);
      expect(penalized.earnedXp).toBe(105);
    });

    it("menentukan kenaikan pangkat berdasarkan akumulasi XP", () => {
      expect(getRankFromXp(50).title).toBe("Magang");
      expect(getRankFromXp(200).title).toBe("Barista");
      expect(getRankFromXp(400).title).toBe("Kepala Barista");
      expect(getRankFromXp(750).title).toBe("Pemilik Kedai");
      expect(getRankFromXp(1200).title).toBe("Juragan Kopi");
    });
  });
});
