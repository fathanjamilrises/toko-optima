/**
 * mapping.ts — Fungsi murni untuk memetakan data API & parameter input
 * ke nilai visual koordinat/skala 3D Diorama Kedai Langsung.
 *
 * ATURAN KETAT DESIGN.MD:
 * - Fungsi murni tanpa React/Three.js agar 100% testable.
 * - Nol kalkulasi rumus kalkulus di frontend. Hanya normalisasi linear visual.
 */

import type { OptimizeRequest, OptimizeResponse } from "@/types/api";
import { formatNumber, formatRupiah } from "@/lib/format";

export type KedaiViewState = "sekarang" | "disarankan" | "atur_sendiri";

export interface KedaiVisualMapping {
  activeX: number;
  activePrice: number;
  activeProfit: number;
  isProfitNegative: boolean;
  status: string;

  customerCount: number; // 0..30
  cupCount: number; // 0..200
  coinStackHeight: number; // 0..1 normalisasi
  isReceiptRed: boolean; // True jika laba < 0
  billStackHeight: number; // 0..1 normalisasi dari fixed_cost
  shelfFullness: number; // 0..1 normalisasi dari variable_cost
  baristaBusyLevel: number; // 0..1 normalisasi dari quad_cost
  hasCapacityFence: boolean;
  capacityLimit: number | null;

  priceBoardText: string;
  priceBoardSubtext: string;

  chalkboard: {
    normalizedPoints: Array<{ x: number; y: number; profit: number }>;
    peakNormalized: { x: number; y: number } | null;
    currentNormalized: { x: number; y: number } | null;
    zeroNormalizedY: number;
    maxProfitText: string;
    statusBadgeText: string;
  };
}

export function mapKedaiVisuals(
  params: OptimizeRequest,
  data: OptimizeResponse | null,
  viewState: KedaiViewState,
  selectedCurveIndex: number | null
): KedaiVisualMapping {
  // Nilai default bila data belum ada
  if (!data) {
    const fixedNorm = Math.min(Math.max(params.fixed_cost / 5_000_000, 0.1), 1);
    const varNorm = Math.min(Math.max(params.variable_cost / 50_000, 0.1), 1);
    const busyNorm = Math.min(Math.max(params.quad_cost / 100, 0), 1);

    return {
      activeX: params.ref_demand,
      activePrice: params.ref_price,
      activeProfit: 0,
      isProfitNegative: false,
      status: "IDLE",
      customerCount: Math.min(Math.round((30 * params.ref_demand) / 200), 30),
      cupCount: Math.min(params.ref_demand, 200),
      coinStackHeight: 0.1,
      isReceiptRed: false,
      billStackHeight: fixedNorm,
      shelfFullness: varNorm,
      baristaBusyLevel: busyNorm,
      hasCapacityFence: params.capacity !== null && params.capacity !== undefined,
      capacityLimit: params.capacity ?? null,
      priceBoardText: formatRupiah(params.ref_price),
      priceBoardSubtext: `${params.ref_demand} cangkir`,
      chalkboard: {
        normalizedPoints: [],
        peakNormalized: null,
        currentNormalized: null,
        zeroNormalizedY: 0.5,
        maxProfitText: "-",
        statusBadgeText: "SIAP",
      },
    };
  }

  // Tentukan titik yang sedang aktif berdasarkan viewState
  let activeX = data.optimum.integer.x;
  let activePrice = data.optimum.integer.price;
  let activeProfit = data.optimum.integer.profit;

  if (viewState === "sekarang") {
    activeX = params.ref_demand;
    activePrice = params.ref_price;
    if (data.curves.markers.reference) {
      activeProfit = data.curves.markers.reference.P;
      activeX = data.curves.markers.reference.x;
    }
  } else if (viewState === "atur_sendiri" && selectedCurveIndex !== null) {
    const pts = data.curves.points;
    const boundedIdx = Math.max(0, Math.min(selectedCurveIndex, pts.length - 1));
    const pt = pts[boundedIdx];
    if (pt) {
      activeX = pt.x;
      activePrice = pt.price;
      activeProfit = pt.P;
    }
  }

  // Normalisasi kurva untuk chalkboard (lebar 0..1, tinggi 0..1)
  const pts = data.curves.points;
  let pMin = 0;
  let pMax = 1;
  const xMax = data.curves.x_range ? data.curves.x_range[1] : (pts[pts.length - 1]?.x || 100);

  if (pts.length > 0) {
    pMin = Math.min(...pts.map((p) => p.P));
    pMax = Math.max(...pts.map((p) => p.P));
  }
  const pSpan = pMax === pMin ? 1 : pMax - pMin;

  const normalizedPoints = pts.map((p) => ({
    x: xMax > 0 ? p.x / xMax : 0,
    y: (p.P - pMin) / pSpan,
    profit: p.P,
  }));

  const zeroNormalizedY = (0 - pMin) / pSpan;

  // Titik puncak (optimum)
  let peakNormalized: { x: number; y: number } | null = null;
  if (data.curves.markers.optimum) {
    peakNormalized = {
      x: xMax > 0 ? data.curves.markers.optimum.x / xMax : 0,
      y: (data.curves.markers.optimum.P - pMin) / pSpan,
    };
  }

  // Titik sekarang yang aktif
  const currentNormalized = {
    x: xMax > 0 ? Math.min(activeX / xMax, 1) : 0,
    y: Math.max(0, Math.min((activeProfit - pMin) / pSpan, 1)),
  };

  // Normalisasi visual kedai (DESIGN.md 6.3)
  const customerCount = Math.max(0, Math.min(Math.round((30 * activeX) / (xMax || 100)), 30));
  const cupCount = Math.max(0, Math.min(activeX, 200));

  const isProfitNegative = activeProfit < 0;
  const isReceiptRed = isProfitNegative;
  const coinStackHeight = isProfitNegative ? 0 : Math.max(0.05, Math.min(activeProfit / (pMax || 1), 1));

  const billStackHeight = Math.max(0.1, Math.min(params.fixed_cost / 5_000_000, 1));
  const shelfFullness = Math.max(0.1, Math.min(params.variable_cost / 50_000, 1));
  const baristaBusyLevel = Math.max(0, Math.min(params.quad_cost / 100, 1));

  const statusBadgeText =
    data.optimum.status === "CAPACITY_BOUND"
      ? "KAPASITAS PENUH"
      : data.optimum.status === "NO_PRODUCTION"
        ? "TUTUP SAJA"
        : isProfitNegative
          ? "RUGI"
          : "UNTUNG MAKS";

  return {
    activeX,
    activePrice,
    activeProfit,
    isProfitNegative,
    status: data.optimum.status,
    customerCount,
    cupCount,
    coinStackHeight,
    isReceiptRed,
    billStackHeight,
    shelfFullness,
    baristaBusyLevel,
    hasCapacityFence: params.capacity !== null && params.capacity !== undefined,
    capacityLimit: params.capacity ?? null,
    priceBoardText: formatRupiah(activePrice),
    priceBoardSubtext: `${formatNumber(activeX)} cangkir`,
    chalkboard: {
      normalizedPoints,
      peakNormalized,
      currentNormalized,
      zeroNormalizedY,
      maxProfitText: formatRupiah(data.optimum.integer.profit),
      statusBadgeText,
    },
  };
}
