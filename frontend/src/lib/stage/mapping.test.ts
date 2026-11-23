/**
 * mapping.test.ts — Unit tests untuk fungsi normalisasi stage/mapping.ts
 * Memastikan hasil pemetaan koordinat/skala 3D akurat untuk G1–G5
 * tanpa adanya perhitungan rumus kalkulus di sisi frontend.
 */

import { describe, it, expect } from "vitest";
import { mapKedaiVisuals } from "./mapping";
import g1 from "../../../tests/fixtures/g1.json";
import g2 from "../../../tests/fixtures/g2.json";
import g3 from "../../../tests/fixtures/g3.json";
import g4 from "../../../tests/fixtures/g4.json";
import g5 from "../../../tests/fixtures/g5.json";
import type { OptimizeRequest, OptimizeResponse } from "@/types/api";

describe("Stage Visual Mapping (DESIGN.md 6.3 & Bagian 9)", () => {
  const g1Data = g1 as unknown as OptimizeResponse;
  const g2Data = g2 as unknown as OptimizeResponse;
  const g3Data = g3 as unknown as OptimizeResponse;
  const g4Data = g4 as unknown as OptimizeResponse;
  const g5Data = g5 as unknown as OptimizeResponse;

  const baseParams: OptimizeRequest = {
    fixed_cost: 300000,
    variable_cost: 8000,
    quad_cost: 0,
    ref_price: 22000,
    ref_demand: 80,
    sensitivity: 5,
    capacity: null,
  };

  it("memetakan G1 pada keadaan 'disarankan' ke optimum 75 cangkir dan Rp23.000", () => {
    const visual = mapKedaiVisuals(baseParams, g1Data, "disarankan", null);

    expect(visual.activeX).toBe(75);
    expect(visual.activePrice).toBe(23000);
    expect(visual.activeProfit).toBe(825000);
    expect(visual.isProfitNegative).toBe(false);
    expect(visual.cupCount).toBe(75);
    expect(visual.customerCount).toBeGreaterThan(0);
    expect(visual.customerCount).toBeLessThanOrEqual(30);
    expect(visual.hasCapacityFence).toBe(false);
    expect(visual.chalkboard.statusBadgeText).toBe("UNTUNG MAKS");
  });

  it("memetakan G1 pada keadaan 'sekarang' ke acuan 80 cangkir dan Rp22.000", () => {
    const visual = mapKedaiVisuals(baseParams, g1Data, "sekarang", null);

    expect(visual.activeX).toBe(80);
    expect(visual.activePrice).toBe(22000);
    expect(visual.cupCount).toBe(80);
  });

  it("memetakan G1 pada keadaan 'atur_sendiri' ke indeks titik kurva yang dipilih", () => {
    const visual = mapKedaiVisuals(baseParams, g1Data, "atur_sendiri", 10);
    const expectedPt = g1Data.curves.points[10];

    expect(visual.activeX).toBe(expectedPt.x);
    expect(visual.activePrice).toBe(expectedPt.price);
    expect(visual.activeProfit).toBe(expectedPt.P);
  });

  it("memetakan G2 (biaya lembur) ke barista busy level > 0 dan 68 cangkir", () => {
    const g2Params: OptimizeRequest = { ...baseParams, quad_cost: 20 };
    const visual = mapKedaiVisuals(g2Params, g2Data, "disarankan", null);

    expect(visual.activeX).toBe(68);
    expect(visual.baristaBusyLevel).toBe(0.2); // 20 / 100
  });

  it("memetakan G3 (kapasitas 60) dengan pagar kapasitas aktif dan badge KAPASITAS PENUH", () => {
    const g3Params: OptimizeRequest = { ...baseParams, capacity: 60 };
    const visual = mapKedaiVisuals(g3Params, g3Data, "disarankan", null);

    expect(visual.activeX).toBe(60);
    expect(visual.hasCapacityFence).toBe(true);
    expect(visual.capacityLimit).toBe(60);
    expect(visual.chalkboard.statusBadgeText).toBe("KAPASITAS PENUH");
  });

  it("memetakan G4 (selalu rugi) dengan struk merah dan koin 0", () => {
    const g4Params: OptimizeRequest = {
      fixed_cost: 600000,
      variable_cost: 15000,
      quad_cost: 0,
      ref_price: 18000,
      ref_demand: 50,
      sensitivity: 5,
      capacity: null,
    };
    const visual = mapKedaiVisuals(g4Params, g4Data, "disarankan", null);

    expect(visual.isProfitNegative).toBe(true);
    expect(visual.isReceiptRed).toBe(true);
    expect(visual.coinStackHeight).toBe(0);
    expect(visual.chalkboard.statusBadgeText).toBe("RUGI");
  });

  it("memetakan G5 (tidak layak) ke 0 cangkir dan badge TUTUP SAJA", () => {
    const g5Params: OptimizeRequest = {
      fixed_cost: 300000,
      variable_cost: 45000,
      quad_cost: 0,
      ref_price: 22000,
      ref_demand: 80,
      sensitivity: 5,
      capacity: null,
    };
    const visual = mapKedaiVisuals(g5Params, g5Data, "disarankan", null);

    expect(visual.activeX).toBe(0);
    expect(visual.status).toBe("NO_PRODUCTION");
    expect(visual.chalkboard.statusBadgeText).toBe("TUTUP SAJA");
  });
});
