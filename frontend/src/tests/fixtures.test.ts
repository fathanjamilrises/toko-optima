/**
 * fixtures.test.ts — Verifikasi nilai matematis fixture G1–G5 sesuai DEFINITION OF DONE 4B.
 * - G1: 75 cangkir, Rp23.000, untung Rp825.000, BEP di 11 cangkir
 * - G2: 68 cangkir
 * - G3: status kapasitas 60 dengan untung Rp780.000
 * - G4: tanpa BEP + peringatan rugi (W_NEG_PROFIT)
 * - G5: tidak layak produksi (NO_PRODUCTION, W_NO_PRODUCTION)
 * Diuji pada Mode Awam dan Mode Akademik.
 */

import { describe, it, expect } from "vitest";
import g1 from "../../tests/fixtures/g1.json";
import g2 from "../../tests/fixtures/g2.json";
import g3 from "../../tests/fixtures/g3.json";
import g4 from "../../tests/fixtures/g4.json";
import g5 from "../../tests/fixtures/g5.json";
import { copyFor } from "@/lib/copy";
import { formatNumber } from "@/lib/format";
import type { OptimizeResponse } from "@/types/api";

describe("Verifikasi Fixture G1–G5 (Definition of Done 4B)", () => {
  const g1Data = g1 as unknown as OptimizeResponse;
  const g2Data = g2 as unknown as OptimizeResponse;
  const g3Data = g3 as unknown as OptimizeResponse;
  const g4Data = g4 as unknown as OptimizeResponse;
  const g5Data = g5 as unknown as OptimizeResponse;

  describe("Kasus G1 — Baseline Kedai Kecil", () => {
    it("menampilkan 75 cangkir, Rp23.000, laba Rp825.000, dan BEP di 11 cangkir", () => {
      expect(g1Data.optimum.integer.x).toBe(75);
      expect(g1Data.optimum.integer.price).toBe(23000);
      expect(g1Data.optimum.integer.profit).toBe(825000);
      expect(g1Data.break_even.exists).toBe(true);
      expect(g1Data.break_even.x_low_int).toBe(11);
      expect(g1Data.optimum.status).toBe("INTERIOR_OPTIMUM");
    });

    it("menghasilkan teks Mode Awam dan Mode Akademik yang konsisten", () => {
      const awamCopy = copyFor("awam");
      const akademikCopy = copyFor("akademik");

      const awamSubtitle = awamCopy.headline.subtitle(
        formatNumber(g1Data.optimum.integer.x),
        formatNumber(g1Data.optimum.integer.price)
      );
      expect(awamSubtitle).toContain("75 cangkir");
      expect(awamSubtitle).toContain("23.000");

      const akademikSubtitle = akademikCopy.headline.subtitle(
        formatNumber(g1Data.optimum.integer.x),
        formatNumber(g1Data.optimum.integer.price)
      );
      expect(akademikSubtitle).toContain("x* = 75 unit");
      expect(akademikSubtitle).toContain("p* = Rp23.000");
    });
  });

  describe("Kasus G2 — Kedai dengan Biaya Lembur", () => {
    it("menghasilkan kuantitas optimal 68 cangkir akibat biaya kuadratik c = 20", () => {
      expect(g2Data.optimum.integer.x).toBe(68);
      expect(g2Data.optimum.status).toBe("INTERIOR_OPTIMUM");
      // Harga di x=68: 38000 - 200*68 = 24400
      expect(g2Data.optimum.integer.price).toBe(24400);
    });
  });

  describe("Kasus G3 — Kedai Kapasitas Terbatas", () => {
    it("menghasilkan kuantitas terikat kapasitas 60 cangkir dan laba Rp780.000", () => {
      expect(g3Data.optimum.status).toBe("CAPACITY_BOUND");
      expect(g3Data.optimum.integer.x).toBe(60);
      expect(g3Data.optimum.integer.profit).toBe(780000);
      expect(g3Data.warnings.some((w) => w.code === "W_CAPACITY_BINDING")).toBe(true);
    });
  });

  describe("Kasus G4 — Selalu Rugi (Tanpa BEP)", () => {
    it("memiliki discriminant < 0, tanpa BEP, dan memiliki peringatan W_NEG_PROFIT", () => {
      expect(g4Data.break_even.exists).toBe(false);
      expect(g4Data.break_even.discriminant).toBeLessThan(0);
      expect(g4Data.optimum.integer.profit).toBeLessThan(0);
      expect(g4Data.warnings.some((w) => w.code === "W_NEG_PROFIT")).toBe(true);

      const awamCopy = copyFor("awam");
      expect(awamCopy.receipt.noBreakEven).toBe("Belum balik modal pada kondisi ini");
    });
  });

  describe("Kasus G5 — Tidak Layak Produksi", () => {
    it("berstatus NO_PRODUCTION dengan kuantitas optimal 0 dan peringatan W_NO_PRODUCTION", () => {
      expect(g5Data.optimum.status).toBe("NO_PRODUCTION");
      expect(g5Data.optimum.integer.x).toBe(0);
      expect(g5Data.warnings.some((w) => w.code === "W_NO_PRODUCTION")).toBe(true);

      const awamCopy = copyFor("awam");
      expect(awamCopy.noProduction).toBe("Untuk kondisi ini, lebih baik jeda jualan sambil menekan biaya.");
    });
  });

  describe("Verifikasi 16 Langkah Derivasi (KaTeX)", () => {
    it("setiap preset memuat 16 langkah derivasi lengkap dari API", () => {
      [g1Data, g2Data, g3Data, g4Data, g5Data].forEach((data) => {
        expect(data.steps).toBeDefined();
        expect(data.steps.length).toBe(16);
        data.steps.forEach((step) => {
          expect(step.id).toBeGreaterThanOrEqual(1);
          expect(step.id).toBeLessThanOrEqual(16);
          expect(step.latex).toBeTruthy();
          expect(step.title).toBeTruthy();
          expect(step.explanation).toBeTruthy();
        });
      });
    });
  });
});
