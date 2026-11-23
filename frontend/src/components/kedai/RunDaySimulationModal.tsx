/**
 * RunDaySimulationModal.tsx — Simulasi interaktif "Jalankan 1 Hari" operasional kedai kopi.
 * Mensimulasikan jam buka (07:00 s.d 21:00), aliran pelanggan & cangkir,
 * penghitungan kasir harian (Pemasukan R, Pengeluaran C, Untung Bersih P),
 * serta ringkasan evaluasi harian bisnis UMKM (Mikro-interaksi taktil).
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, Play, Clock, Coffee, CheckCircle } from "lucide-react";
import { formatNumber, formatRupiah } from "@/lib/format";

interface RunDaySimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCups: number;
  pricePerCup: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
}

const OPERATING_HOURS = [
  "07:00",
  "08:30",
  "10:00",
  "11:30",
  "13:00",
  "15:00",
  "17:00",
  "19:00",
  "21:00",
];

export function RunDaySimulationModal({
  isOpen,
  onClose,
  targetCups,
  pricePerCup,
  totalRevenue,
  totalCost,
  netProfit,
}: RunDaySimulationModalProps) {
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Periksa prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (isOpen) {
      if (prefersReducedMotion) {
        setStepIndex(OPERATING_HOURS.length - 1);
        setIsFinished(true);
        setIsRunning(false);
      } else {
        setStepIndex(0);
        setIsFinished(false);
        setIsRunning(true);
      }
    }
  }, [isOpen, prefersReducedMotion]);

  useEffect(() => {
    if (!isRunning || isFinished) return;

    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev + 1 >= OPERATING_HOURS.length) {
          setIsRunning(false);
          setIsFinished(true);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [isRunning, isFinished]);

  if (!isOpen) return null;

  const progressFraction = stepIndex / (OPERATING_HOURS.length - 1);
  const currentCups = Math.round(targetCups * progressFraction);
  const currentRevenue = Math.round(totalRevenue * progressFraction);
  const currentCost = Math.round(totalCost * progressFraction);
  const currentProfit = currentRevenue - currentCost;
  const currentHour = OPERATING_HOURS[stepIndex];

  const handleReplay = () => {
    setStepIndex(0);
    setIsFinished(false);
    setIsRunning(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-day-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#12100e]/85 select-none"
    >
      <div className="relative w-full max-w-lg bg-[#241e1b] border border-[#3d322c] rounded-2xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-[#3d322c] pb-3">
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-[#e07a5f]" />
            <h2 id="run-day-title" className="text-base font-serif font-bold text-[#f4ede2]">
              Simulasi 1 Hari Operasional Kedai
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup simulasi"
            className="p-1 rounded-lg text-[#c8b8a8] hover:text-[#f4ede2] hover:bg-[#3d322c]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bilah Waktu & Jam Operasional */}
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-[#1a1614] border border-[#3d322c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#c8b8a8]">
              <Clock className="w-4 h-4 text-[#f2cc8f]" />
              <span>Jam Operasional Kedai</span>
            </div>
            <span className="text-lg font-mono font-bold text-[#f2cc8f]">
              {currentHour} {isFinished ? "(TUTUP)" : "WIB"}
            </span>
          </div>

          {/* Progress Bar Hari */}
          <div className="w-full h-2.5 bg-[#241e1b] rounded-full overflow-hidden border border-[#3d322c]">
            <div
              className="h-full bg-[#e07a5f] transition-all duration-300"
              style={{ width: `${Math.round(progressFraction * 100)}%` }}
            />
          </div>
        </div>

        {/* Metrik Hari Ini Berjalan */}
        <div className="grid grid-cols-2 gap-3 font-mono">
          {/* Cangkir Terjual */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <span className="text-[10px] uppercase text-[#a89888] block">
              Cangkir Terhidang
            </span>
            <span className="text-xl font-bold text-[#f4ede2]">
              {formatNumber(currentCups)}{" "}
              <span className="text-xs font-normal text-[#c8b8a8]">
                / {formatNumber(targetCups)}
              </span>
            </span>
          </div>

          {/* Harga Rata-Rata */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <span className="text-[10px] uppercase text-[#a89888] block">
              Harga Jual
            </span>
            <span className="text-xl font-bold text-[#f2cc8f]">
              {formatRupiah(pricePerCup)}
            </span>
          </div>

          {/* Pemasukan Kasir */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <span className="text-[10px] uppercase text-[#a89888] block">
              Pemasukan (R)
            </span>
            <span className="text-lg font-bold text-[#f2cc8f]">
              {formatRupiah(currentRevenue)}
            </span>
          </div>

          {/* Pengeluaran Kasir */}
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c]">
            <span className="text-[10px] uppercase text-[#a89888] block">
              Biaya Total (C)
            </span>
            <span className="text-lg font-bold text-[#e07a5f]">
              {formatRupiah(currentCost)}
            </span>
          </div>
        </div>

        {/* Laba Bersih & Status Stempel */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${
            currentProfit >= 0
              ? "bg-[#81b29a]/10 border-[#81b29a]/40"
              : "bg-[#d95d39]/10 border-[#d95d39]/40"
          }`}
        >
          <div>
            <span className="text-[10px] font-mono uppercase text-[#c8b8a8] block">
              Estimasi Laba Bersih
            </span>
            <span
              className={`text-2xl font-mono font-black ${
                currentProfit >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"
              }`}
            >
              {formatRupiah(currentProfit)}
            </span>
          </div>

          {isFinished && (
            <div
              className={`px-3 py-1 rounded-lg border-2 font-mono text-xs font-black tracking-wider uppercase rotate-[-4deg] select-none ${
                netProfit > 0
                  ? "border-[#81b29a] text-[#81b29a]"
                  : "border-[#d95d39] text-[#d95d39]"
              }`}
            >
              {netProfit > 0 ? "UNTUNG BERSIH" : "EVALUASI BIAYA"}
            </div>
          )}
        </div>

        {/* Ringkasan & Tombol Aksi */}
        <div className="flex items-center justify-between pt-2 border-t border-[#3d322c]">
          {isFinished ? (
            <button
              type="button"
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#c8b8a8] text-xs font-mono text-[#c8b8a8] hover:text-[#f4ede2] transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Putar Ulang Hari</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-[#a89888]">
              Menghitung transaksi harian...
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e07a5f] text-[#12100e] text-xs font-bold hover:bg-[#e07a5f]/90 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Selesai & Tutup</span>
          </button>
        </div>
      </div>
    </div>
  );
}
