/**
 * ParameterForm.tsx — Mode Form untuk input simulasi KopiOptima.
 * Mengimplementasikan:
 * - 3 bagian berurutan: Biaya Anda -> Harga & Pembeli -> Pengaturan Lanjutan
 * - Stepper − / +, input terformat Rupiah, kirim angka murni
 * - Tooltip "Dari mana angka ini?", chip cepat lembur, toggle kapasitas
 * - Dropdown preset ramah dengan deskripsi 1 baris, tombol "Coba contoh kedai" & "Kosongkan"
 * - Galat 422 di bawah field terkait
 */

"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Store,
  ChevronDown,
} from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";
import { HOTSPOT_CONFIGS, type ParamKey } from "@/lib/kedai/hotspots";
import { formatRupiah, formatNumber } from "@/lib/format";

export function ParameterForm() {
  const {
    params,
    updateParam,
    presets,
    selectedPresetId,
    applyPreset,
    clearParams,
    fieldErrors,
    copy,
  } = useSimulation();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleTooltip = (key: string) => {
    setActiveTooltip((prev) => (prev === key ? null : key));
  };

  const handleStep = (key: ParamKey, direction: 1 | -1) => {
    const config = HOTSPOT_CONFIGS[key];
    const current = (params[key] as number) ?? 0;
    const step = config.softLimits.step;
    const next = Math.max(
      config.validation.min,
      Math.min(config.softLimits.max, current + direction * step)
    );
    updateParam(key, next);
  };

  const hasCapacity = params.capacity !== null && params.capacity !== undefined;

  return (
    <div className="bento parameter-form-panel p-6 flex flex-col gap-6" data-testid="parameter-form">
      {/* Header Form & Presets Selector */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[var(--line)]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-semibold text-base m-0 text-[var(--text-1)]">
              {copy.form.presetsTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const first = presets[0];
                if (first) applyPreset(first);
              }}
              className="button-secondary text-xs py-1.5 px-3 min-h-[36px] flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>{copy.form.btnTryExample}</span>
            </button>
            <button
              type="button"
              onClick={clearParams}
              className="button-secondary text-xs py-1.5 px-3 min-h-[36px] flex items-center gap-1.5"
              title="Kosongkan semua isian"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--text-2)]" />
              <span>{copy.form.btnClear}</span>
            </button>
          </div>
        </div>

        {/* Preset Dropdown */}
        <div className="relative">
          <select
            value={selectedPresetId ?? ""}
            onChange={(e) => {
              const found = presets.find((p) => p.id === e.target.value);
              if (found) applyPreset(found);
            }}
            aria-label={copy.form.presetsTitle}
            className="w-full appearance-none bg-[var(--bg-raised)] border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)] pr-10 cursor-pointer"
          >
            <option value="" disabled>
              {copy.form.presetsPlaceholder}
            </option>
            {presets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.id}: {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[var(--text-2)] absolute right-3.5 top-3.5 pointer-events-none" />
        </div>
      </div>

      {/* Bagian 1: Biaya Anda */}
      <section className="flex flex-col gap-4">
        <h3 className="eyebrow m-0 text-[var(--accent)]">{copy.form.groupCost}</h3>

        {/* Fixed Cost */}
        <div className="field-group flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="field-fixed-cost" className="font-medium text-sm text-[var(--text-1)] flex items-center gap-1.5">
              <span>{HOTSPOT_CONFIGS.fixed_cost.getLabel(copy)}</span>
              <button
                type="button"
                onClick={() => toggleTooltip("fixed_cost")}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-0.5 cursor-pointer"
                aria-label="Penjelasan biaya tetap"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <span className="font-mono text-xs text-[var(--crema)]">
              {formatRupiah(params.fixed_cost)}
            </span>
          </div>

          {activeTooltip === "fixed_cost" && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--line)] text-xs text-[var(--text-2)] animate-in fade-in duration-150">
              {HOTSPOT_CONFIGS.fixed_cost.getTooltip(copy)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep("fixed_cost", -1)}
              aria-label="Kurangi biaya tetap"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[var(--text-3)]">Rp</span>
              <input
                id="field-fixed-cost"
                type="number"
                min={0}
                step={HOTSPOT_CONFIGS.fixed_cost.softLimits.step}
                value={isNaN(params.fixed_cost) ? "" : params.fixed_cost}
                onChange={(e) => updateParam("fixed_cost", parseFloat(e.target.value) || 0)}
                className={`w-full bg-[var(--bg-raised)] border ${
                  fieldErrors.fixed_cost ? "border-[var(--loss)]" : "border-[var(--line)]"
                } rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleStep("fixed_cost", 1)}
              aria-label="Tambah biaya tetap"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.fixed_cost.getHelp(copy)}</p>
          {fieldErrors.fixed_cost && (
            <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.fixed_cost}</span>
            </p>
          )}
        </div>

        {/* Variable Cost */}
        <div className="field-group flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="field-variable-cost" className="font-medium text-sm text-[var(--text-1)] flex items-center gap-1.5">
              <span>{HOTSPOT_CONFIGS.variable_cost.getLabel(copy)}</span>
              <button
                type="button"
                onClick={() => toggleTooltip("variable_cost")}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-0.5 cursor-pointer"
                aria-label="Penjelasan biaya bahan per cangkir"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <span className="font-mono text-xs text-[var(--crema)]">
              {formatRupiah(params.variable_cost)}
            </span>
          </div>

          {activeTooltip === "variable_cost" && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--line)] text-xs text-[var(--text-2)] animate-in fade-in duration-150">
              {HOTSPOT_CONFIGS.variable_cost.getTooltip(copy)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep("variable_cost", -1)}
              aria-label="Kurangi modal bahan"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[var(--text-3)]">Rp</span>
              <input
                id="field-variable-cost"
                type="number"
                min={0}
                step={HOTSPOT_CONFIGS.variable_cost.softLimits.step}
                value={isNaN(params.variable_cost) ? "" : params.variable_cost}
                onChange={(e) => updateParam("variable_cost", parseFloat(e.target.value) || 0)}
                className={`w-full bg-[var(--bg-raised)] border ${
                  fieldErrors.variable_cost ? "border-[var(--loss)]" : "border-[var(--line)]"
                } rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleStep("variable_cost", 1)}
              aria-label="Tambah modal bahan"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.variable_cost.getHelp(copy)}</p>
          {fieldErrors.variable_cost && (
            <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.variable_cost}</span>
            </p>
          )}
        </div>
      </section>

      {/* Bagian 2: Harga dan Pembeli Anda */}
      <section className="flex flex-col gap-4 pt-4 border-t border-[var(--line)]">
        <h3 className="eyebrow m-0 text-[var(--accent)]">{copy.form.groupMarket}</h3>

        {/* Ref Price */}
        <div className="field-group flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="field-ref-price" className="font-medium text-sm text-[var(--text-1)] flex items-center gap-1.5">
              <span>{HOTSPOT_CONFIGS.ref_price.getLabel(copy)}</span>
              <button
                type="button"
                onClick={() => toggleTooltip("ref_price")}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-0.5 cursor-pointer"
                aria-label="Penjelasan harga menu saat ini"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <span className="font-mono text-xs text-[var(--crema)]">
              {formatRupiah(params.ref_price)}
            </span>
          </div>

          {activeTooltip === "ref_price" && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--line)] text-xs text-[var(--text-2)] animate-in fade-in duration-150">
              {HOTSPOT_CONFIGS.ref_price.getTooltip(copy)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep("ref_price", -1)}
              aria-label="Kurangi harga menu"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-2.5 text-xs font-mono text-[var(--text-3)]">Rp</span>
              <input
                id="field-ref-price"
                type="number"
                min={1}
                step={HOTSPOT_CONFIGS.ref_price.softLimits.step}
                value={isNaN(params.ref_price) ? "" : params.ref_price}
                onChange={(e) => updateParam("ref_price", parseFloat(e.target.value) || 0)}
                className={`w-full bg-[var(--bg-raised)] border ${
                  fieldErrors.ref_price ? "border-[var(--loss)]" : "border-[var(--line)]"
                } rounded-xl pl-9 pr-3 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleStep("ref_price", 1)}
              aria-label="Tambah harga menu"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.ref_price.getHelp(copy)}</p>
          {fieldErrors.ref_price && (
            <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.ref_price}</span>
            </p>
          )}
        </div>

        {/* Ref Demand */}
        <div className="field-group flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="field-ref-demand" className="font-medium text-sm text-[var(--text-1)] flex items-center gap-1.5">
              <span>{HOTSPOT_CONFIGS.ref_demand.getLabel(copy)}</span>
              <button
                type="button"
                onClick={() => toggleTooltip("ref_demand")}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-0.5 cursor-pointer"
                aria-label="Penjelasan jumlah pembeli"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <span className="font-mono text-xs text-[var(--crema)]">
              {formatNumber(params.ref_demand)} cangkir
            </span>
          </div>

          {activeTooltip === "ref_demand" && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--line)] text-xs text-[var(--text-2)] animate-in fade-in duration-150">
              {HOTSPOT_CONFIGS.ref_demand.getTooltip(copy)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep("ref_demand", -1)}
              aria-label="Kurangi jumlah cangkir"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              id="field-ref-demand"
              type="number"
              min={1}
              step={HOTSPOT_CONFIGS.ref_demand.softLimits.step}
              value={isNaN(params.ref_demand) ? "" : params.ref_demand}
              onChange={(e) => updateParam("ref_demand", parseFloat(e.target.value) || 0)}
              className={`flex-1 bg-[var(--bg-raised)] border ${
                fieldErrors.ref_demand ? "border-[var(--loss)]" : "border-[var(--line)]"
              } rounded-xl px-4 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
            />
            <button
              type="button"
              onClick={() => handleStep("ref_demand", 1)}
              aria-label="Tambah jumlah cangkir"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.ref_demand.getHelp(copy)}</p>
          {fieldErrors.ref_demand && (
            <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.ref_demand}</span>
            </p>
          )}
        </div>

        {/* Sensitivity */}
        <div className="field-group flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="field-sensitivity" className="font-medium text-sm text-[var(--text-1)] flex items-center gap-1.5">
              <span>{HOTSPOT_CONFIGS.sensitivity.getLabel(copy)}</span>
              <button
                type="button"
                onClick={() => toggleTooltip("sensitivity")}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-0.5 cursor-pointer"
                aria-label="Penjelasan kepekaan harga"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <span className="font-mono text-xs text-[var(--crema)]">
              {params.sensitivity} cangkir / Rp1.000
            </span>
          </div>

          {activeTooltip === "sensitivity" && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--line)] text-xs text-[var(--text-2)] animate-in fade-in duration-150">
              {HOTSPOT_CONFIGS.sensitivity.getTooltip(copy)}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStep("sensitivity", -1)}
              aria-label="Kurangi sensitivitas harga"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              id="field-sensitivity"
              type="number"
              min={0.1}
              step={HOTSPOT_CONFIGS.sensitivity.softLimits.step}
              value={isNaN(params.sensitivity) ? "" : params.sensitivity}
              onChange={(e) => updateParam("sensitivity", parseFloat(e.target.value) || 0)}
              className={`flex-1 bg-[var(--bg-raised)] border ${
                fieldErrors.sensitivity ? "border-[var(--loss)]" : "border-[var(--line)]"
              } rounded-xl px-4 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
            />
            <button
              type="button"
              onClick={() => handleStep("sensitivity", 1)}
              aria-label="Tambah sensitivitas harga"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.sensitivity.getHelp(copy)}</p>
          {fieldErrors.sensitivity && (
            <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.sensitivity}</span>
            </p>
          )}
        </div>
      </section>

      {/* Bagian 3: Pengaturan Lanjutan */}
      <section className="flex flex-col gap-4 pt-4 border-t border-[var(--line)]">
        <h3 className="eyebrow m-0 text-[var(--accent)]">{copy.form.groupAdvanced}</h3>

        {/* Quad Cost (Lembur) */}
        <div className="field-group flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="field-quad-cost" className="font-medium text-sm text-[var(--text-1)] flex items-center gap-1.5">
              <span>{HOTSPOT_CONFIGS.quad_cost.getLabel(copy)}</span>
              <button
                type="button"
                onClick={() => toggleTooltip("quad_cost")}
                className="text-[var(--text-3)] hover:text-[var(--text-1)] p-0.5 cursor-pointer"
                aria-label="Penjelasan biaya lembur"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            </label>
            <span className="font-mono text-xs text-[var(--crema)]">
              {params.quad_cost || 0}
            </span>
          </div>

          {activeTooltip === "quad_cost" && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-base)] border border-[var(--line)] text-xs text-[var(--text-2)] animate-in fade-in duration-150">
              {HOTSPOT_CONFIGS.quad_cost.getTooltip(copy)}
            </div>
          )}

          {/* Chips cepat untuk lembur */}
          <div className="flex flex-wrap gap-1.5">
            {HOTSPOT_CONFIGS.quad_cost.chips?.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => updateParam("quad_cost", chip.value)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  params.quad_cost === chip.value
                    ? "bg-[var(--accent)] text-[var(--bg-base)] border-[var(--accent)] font-semibold"
                    : "bg-[var(--bg-raised)] text-[var(--text-2)] border-[var(--line)] hover:text-[var(--text-1)]"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => handleStep("quad_cost", -1)}
              aria-label="Kurangi biaya kuadratik"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              id="field-quad-cost"
              type="number"
              min={0}
              step={HOTSPOT_CONFIGS.quad_cost.softLimits.step}
              value={isNaN(params.quad_cost) ? "" : params.quad_cost}
              onChange={(e) => updateParam("quad_cost", parseFloat(e.target.value) || 0)}
              className={`flex-1 bg-[var(--bg-raised)] border ${
                fieldErrors.quad_cost ? "border-[var(--loss)]" : "border-[var(--line)]"
              } rounded-xl px-4 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
            />
            <button
              type="button"
              onClick={() => handleStep("quad_cost", 1)}
              aria-label="Tambah biaya kuadratik"
              className="button-secondary min-h-[42px] px-3 text-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.quad_cost.getHelp(copy)}</p>
          {fieldErrors.quad_cost && (
            <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{fieldErrors.quad_cost}</span>
            </p>
          )}
        </div>

        {/* Capacity (Batas Cangkir) */}
        <div className="field-group flex flex-col gap-2 pt-2 border-t border-[var(--line)]">
          <div className="flex items-center justify-between">
            <label className="font-medium text-sm text-[var(--text-1)] flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasCapacity}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateParam("capacity", 60);
                  } else {
                    updateParam("capacity", null);
                  }
                }}
                className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
              <span>{HOTSPOT_CONFIGS.capacity.getLabel(copy)}</span>
            </label>
            {hasCapacity && (
              <span className="font-mono text-xs text-[var(--crema)]">
                {params.capacity} cangkir/hari
              </span>
            )}
          </div>

          {hasCapacity && (
            <div className="flex flex-col gap-1.5 mt-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStep("capacity", -1)}
                  aria-label="Kurangi batas kapasitas"
                  className="button-secondary min-h-[42px] px-3 text-sm"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="field-capacity"
                  type="number"
                  min={1}
                  step={HOTSPOT_CONFIGS.capacity.softLimits.step}
                  value={params.capacity ?? ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    updateParam("capacity", isNaN(val) ? null : val);
                  }}
                  className={`flex-1 bg-[var(--bg-raised)] border ${
                    fieldErrors.capacity ? "border-[var(--loss)]" : "border-[var(--line)]"
                  } rounded-xl px-4 py-2 text-sm font-mono text-[var(--text-1)] focus:outline-none focus:border-[var(--accent)]`}
                />
                <button
                  type="button"
                  onClick={() => handleStep("capacity", 1)}
                  aria-label="Tambah batas kapasitas"
                  className="button-secondary min-h-[42px] px-3 text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[var(--text-3)] m-0">{HOTSPOT_CONFIGS.capacity.getHelp(copy)}</p>
              {fieldErrors.capacity && (
                <p className="text-xs text-[var(--loss)] flex items-center gap-1 m-0">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{fieldErrors.capacity}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
