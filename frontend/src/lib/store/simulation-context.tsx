/**
 * simulation-context.tsx — Context & State Store Terpusat KopiOptima.
 * Menyimpan: params, hasil API apa adanya, status, fieldErrors, preset, mode copy, dan tab aktif.
 * Disiapkan agar 4C dapat menambahkan viewState (sekarang/disarankan/atur sendiri) tanpa merombak ulang.
 */

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useLiveOptimize, type UseLiveOptimizeReturn } from "@/lib/kedai/useLiveOptimize";
import { copyFor, type LanguageMode, type AppCopy } from "@/lib/copy";
import type { ParamKey } from "@/lib/kedai/hotspots";

export type SimulationTab = "cerita" | "grafik" | "peta" | "sensitivitas" | "tabel" | "hitungan";
export type KedaiViewState = "sekarang" | "disarankan" | "atur_sendiri";
export type KedaiDisplayMode = "kedai" | "form";

export interface SimulationContextValue extends UseLiveOptimizeReturn {
  mode: LanguageMode;
  copy: AppCopy;
  activeTab: SimulationTab;
  setActiveTab: (tab: SimulationTab) => void;
  // Aliases untuk konsistensi
  data: UseLiveOptimizeReturn["result"];
  setParam: UseLiveOptimizeReturn["updateParam"];
  // Sub-fase 4C (Kedai Langsung)
  viewState: KedaiViewState;
  setViewState: (vs: KedaiViewState) => void;
  selectedCurveIndex: number | null;
  setSelectedCurveIndex: (idx: number | null) => void;
  activeHotspot: ParamKey | null;
  setActiveHotspot: (hotspot: ParamKey | null) => void;
  displayMode: KedaiDisplayMode;
  setDisplayMode: (mode: KedaiDisplayMode) => void;
  isLightMode: boolean;
  setIsLightMode: (light: boolean) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const mode: LanguageMode = modeParam === "akademik" ? "akademik" : "awam";
  const copy = copyFor(mode);

  const liveOptimize = useLiveOptimize();

  const [activeTab, setActiveTab] = useState<SimulationTab>("cerita");
  const [viewState, setViewState] = useState<KedaiViewState>("disarankan");
  const [selectedCurveIndex, setSelectedCurveIndex] = useState<number | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<ParamKey | null>(null);
  const [displayMode, setDisplayMode] = useState<KedaiDisplayMode>("kedai");
  const [isLightMode, setIsLightMode] = useState<boolean>(false);

  const value: SimulationContextValue = {
    ...liveOptimize,
    data: liveOptimize.result,
    setParam: liveOptimize.updateParam,
    mode,
    copy,
    activeTab,
    setActiveTab,
    viewState,
    setViewState,
    selectedCurveIndex,
    setSelectedCurveIndex,
    activeHotspot,
    setActiveHotspot,
    displayMode,
    setDisplayMode,
    isLightMode,
    setIsLightMode,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation(): SimulationContextValue {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation harus digunakan di dalam SimulationProvider");
  }
  return context;
}
