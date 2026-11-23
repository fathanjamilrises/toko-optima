/**
 * page.tsx — Halaman Utama Simulasi KopiOptima (Sub-Fase 4C Kedai Langsung).
 * Mengimplementasikan tata letak Bento 12 kolom (DESIGN.md 3.2):
 * - Kiri (kolom 1–7): KedaiContainer (Diorama 3D Kedai Langsung / Mode Form sinkron + HotspotSheet)
 * - Kanan (kolom 8–12): AnswerHeadline, ReceiptCard, WarningCards, ComparisonCard, ExportBar
 * - Bawah (penuh 12 kolom): Tab Navigasi (Cerita, Grafik 2D, Sensitivitas, Tabel, Hitungan Rinci KaTeX)
 */

"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import {
  SimulationProvider,
  useSimulation,
  type SimulationTab,
} from "@/lib/store/simulation-context";
import { KedaiContainer } from "@/components/kedai/KedaiContainer";
import { AnswerHeadline } from "@/components/result/AnswerHeadline";
import { ReceiptCard } from "@/components/result/ReceiptCard";
import { WarningCards } from "@/components/result/WarningCards";
import { ComparisonCard } from "@/components/result/ComparisonCard";
import { ExportBar } from "@/components/result/ExportBar";
import { SkeletonLoader } from "@/components/result/SkeletonLoader";
import { StoryTab } from "@/components/result/tabs/StoryTab";
import { ChartsTab } from "@/components/result/tabs/ChartsTab";
import { SensitivityTab } from "@/components/result/tabs/SensitivityTab";
import { DataTableTab } from "@/components/result/tabs/DataTableTab";
import { MathStepsTab } from "@/components/result/tabs/MathStepsTab";
import {
  BookOpen,
  LineChart,
  Mountain,
  Gauge,
  Table,
  Calculator,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const ProfitHillScene = dynamic(
  () =>
    import("@/components/stage/ProfitHillScene").then(
      (mod) => mod.ProfitHillScene
    ),
  {
    ssr: false,
    loading: () => <SkeletonLoader />,
  }
);

function SimulationContent() {
  const { networkError, activeTab, setActiveTab, copy, retry } = useSimulation();

  const tabList: Array<{ id: SimulationTab; label: string; icon: React.ElementType }> = [
    { id: "cerita", label: copy.tabs.story, icon: BookOpen },
    { id: "grafik", label: copy.tabs.charts, icon: LineChart },
    { id: "peta", label: copy.tabs.hill, icon: Mountain },
    { id: "sensitivitas", label: copy.tabs.sensitivity, icon: Gauge },
    { id: "tabel", label: copy.tabs.table, icon: Table },
    { id: "hitungan", label: copy.tabs.math, icon: Calculator },
  ];

  return (
    <div className="page-shell flex flex-col gap-8 pb-16">
      {/* Banner Error Jaringan jika ada */}
      {networkError && (
        <div className="bento p-4 flex items-center justify-between gap-4 border-[var(--loss)]/50 bg-[var(--loss)]/10 text-xs text-[var(--loss)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>{copy.errors.networkTitle}:</strong> {networkError} ({copy.errors.networkDesc})
            </span>
          </div>
          <button
            type="button"
            onClick={retry}
            className="button-secondary text-xs py-1 px-3 min-h-[32px] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Grid Bento Atas: Kedai Langsung 3D (1–7) & Hasil/Struk (8–12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Kedai Langsung 3D Diorama & Hotspot (Kolom 1–7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <KedaiContainer />
        </div>

        {/* Kolom Kanan: Hasil Inti, Struk, Diagnostik (Kolom 8–12) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
          {/* Jawaban Untung Terbesar Raksasa */}
          <AnswerHeadline />

          {/* Struk Kasir Khas KopiOptima */}
          <ReceiptCard />

          {/* Kartu Peringatan & Diagnostik */}
          <WarningCards />

          {/* Analisis Komparatif Sekarang vs Disarankan */}
          <ComparisonCard />

          {/* Bar Ekspor Laporan JSON / CSV */}
          <ExportBar />
        </div>
      </div>

      {/* Baris Bawah: Tab Navigasi & Detail Hasil (Penuh 12 Kolom) */}
      <div className="flex flex-col gap-6 mt-4">
        {/* Tab Navigasi Hasil */}
        <div className="bento p-1.5 flex items-center gap-1 overflow-x-auto" role="tablist">
          {tabList.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--accent)] text-[var(--bg-base)] font-bold shadow-sm"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-[var(--bg-raised)]/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Konten Tab Aktif */}
        <div className="tab-panel-container">
          {activeTab === "cerita" && <StoryTab />}
          {activeTab === "grafik" && <ChartsTab />}
          {activeTab === "peta" && <ProfitHillScene />}
          {activeTab === "sensitivitas" && <SensitivityTab />}
          {activeTab === "tabel" && <DataTableTab />}
          {activeTab === "hitungan" && <MathStepsTab />}
        </div>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <Suspense
      fallback={
        <div className="page-shell">
          <SkeletonLoader />
        </div>
      }
    >
      <SimulationProvider>
        <SimulationContent />
      </SimulationProvider>
    </Suspense>
  );
}
