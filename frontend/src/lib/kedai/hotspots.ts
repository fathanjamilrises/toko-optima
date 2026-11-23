/**
 * hotspots.ts — Konfigurasi terpusat seluruh field input parameter KopiOptima.
 * Digunakan bersama oleh ParameterForm (Mode Form 4B) dan Hotspot Kedai 3D (4C).
 * Sumber kebenaran: PRD 7.2 (Batas Validasi) & DESIGN.md 3.2.1 (Batas Lunak & Langkah).
 */

import type { AppCopy } from "@/lib/copy";

export type ParamKey =
  | "fixed_cost"
  | "variable_cost"
  | "quad_cost"
  | "ref_price"
  | "ref_demand"
  | "sensitivity"
  | "capacity";

export interface ChipOption {
  label: string;
  value: number;
}

export interface HotspotConfig {
  key: ParamKey;
  objectName: string; // Nama objek 3D untuk 4C (meja kasir, rak bahan, dll.)
  getLabel: (copy: AppCopy) => string;
  getHelp: (copy: AppCopy) => string;
  getTooltip: (copy: AppCopy) => string;
  getExample: (copy: AppCopy) => string;
  getUnit: (copy: AppCopy) => string;
  // Batas validasi mutlak (PRD 7.2)
  validation: {
    min: number;
    max?: number;
    allowZero: boolean;
    required: boolean;
  };
  // Batas lunak slider & stepper (DESIGN 3.2.1)
  softLimits: {
    min: number;
    max: number;
    step: number;
  };
  // Chip opsi cepat (jika ada)
  chips?: ChipOption[];
}

export const HOTSPOT_CONFIGS: Record<ParamKey, HotspotConfig> = {
  fixed_cost: {
    key: "fixed_cost",
    objectName: "Meja kasir & tumpukan tagihan",
    getLabel: (c) => c.form.fixedCost.label,
    getHelp: (c) => c.form.fixedCost.help,
    getTooltip: (c) => c.form.fixedCost.tooltip,
    getExample: (c) => c.form.fixedCost.example,
    getUnit: (c) => c.form.fixedCost.unit,
    validation: { min: 0, max: 1e10, allowZero: true, required: true },
    softLimits: { min: 0, max: 5000000, step: 50000 },
  },
  variable_cost: {
    key: "variable_cost",
    objectName: "Rak bahan (biji, susu, cangkir)",
    getLabel: (c) => c.form.variableCost.label,
    getHelp: (c) => c.form.variableCost.help,
    getTooltip: (c) => c.form.variableCost.tooltip,
    getExample: (c) => c.form.variableCost.example,
    getUnit: (c) => c.form.variableCost.unit,
    validation: { min: 0, max: 1e7, allowZero: true, required: true },
    softLimits: { min: 0, max: 50000, step: 500 },
  },
  quad_cost: {
    key: "quad_cost",
    objectName: "Mesin espresso & barista lembur",
    getLabel: (c) => c.form.quadCost.label,
    getHelp: (c) => c.form.quadCost.help,
    getTooltip: (c) => c.form.quadCost.tooltip,
    getExample: (c) => c.form.quadCost.example,
    getUnit: (c) => c.form.quadCost.unit,
    validation: { min: 0, allowZero: true, required: false },
    softLimits: { min: 0, max: 100, step: 5 },
    chips: [
      { label: "Tidak ada (0)", value: 0 },
      { label: "Ringan (10)", value: 10 },
      { label: "Sedang (20)", value: 20 },
      { label: "Berat (50)", value: 50 },
    ],
  },
  ref_price: {
    key: "ref_price",
    objectName: "Papan harga menu depan kedai",
    getLabel: (c) => c.form.refPrice.label,
    getHelp: (c) => c.form.refPrice.help,
    getTooltip: (c) => c.form.refPrice.tooltip,
    getExample: (c) => c.form.refPrice.example,
    getUnit: (c) => c.form.refPrice.unit,
    validation: { min: 1, allowZero: false, required: true },
    softLimits: { min: 1000, max: 100000, step: 500 },
  },
  ref_demand: {
    key: "ref_demand",
    objectName: "Pintu masuk & antrean pelanggan",
    getLabel: (c) => c.form.refDemand.label,
    getHelp: (c) => c.form.refDemand.help,
    getTooltip: (c) => c.form.refDemand.tooltip,
    getExample: (c) => c.form.refDemand.example,
    getUnit: (c) => c.form.refDemand.unit,
    validation: { min: 1, allowZero: false, required: true },
    softLimits: { min: 1, max: 500, step: 5 },
  },
  sensitivity: {
    key: "sensitivity",
    objectName: "Papan survei harga di jendela",
    getLabel: (c) => c.form.sensitivity.label,
    getHelp: (c) => c.form.sensitivity.help,
    getTooltip: (c) => c.form.sensitivity.tooltip,
    getExample: (c) => c.form.sensitivity.example,
    getUnit: (c) => c.form.sensitivity.unit,
    validation: { min: 0.1, allowZero: false, required: true },
    softLimits: { min: 0.5, max: 50, step: 0.5 },
  },
  capacity: {
    key: "capacity",
    objectName: "Pagar pembatas kapasitas konter",
    getLabel: (c) => c.form.capacity.label,
    getHelp: (c) => c.form.capacity.help,
    getTooltip: (c) => c.form.capacity.tooltip,
    getExample: (c) => c.form.capacity.example,
    getUnit: (c) => c.form.capacity.unit,
    validation: { min: 1, allowZero: false, required: false },
    softLimits: { min: 10, max: 500, step: 5 },
  },
};
