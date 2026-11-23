/**
 * page.tsx — Halaman Ruang Lencana & Pencapaian KopiOptima (/lencana).
 * Menampilkan lemari medali barista, status perolehan lencana, dan pangkat pengelola kedai.
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coffee,
  Flame,
  ShieldCheck,
  Zap,
  Scale,
  Award,
  Lock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Trophy,
} from "lucide-react";
import { getProgress, getBadgesStatus, type BadgeItem, type GameProgress } from "@/lib/game/progress";
import { getRankFromXp } from "@/lib/game/engine";

const ICON_MAP = {
  coffee: Coffee,
  flame: Flame,
  shield: ShieldCheck,
  zap: Zap,
  scale: Scale,
  award: Award,
};

export default function BadgesPage() {
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const currentXp = progress?.totalXp ?? 0;
  const rank = getRankFromXp(currentXp);
  const badges: BadgeItem[] = progress
    ? getBadgesStatus(progress)
    : [
        {
          id: "seduhan_pertama",
          title: "Seduhan Pertama",
          description: "Berhasil meluncurkan kedai kecil dan menemukan titik impas pertama Anda.",
          requirement: "Selesaikan Level 1",
          unlocked: false,
          iconName: "coffee",
        },
        {
          id: "puncak_untung",
          title: "Puncak Untung",
          description: "Menemukan target cangkir tepat di puncak keuntungan tertinggi tanpa sisa.",
          requirement: "Raih 3 bintang di Level 1 atau Level 2",
          unlocked: false,
          iconName: "flame",
        },
        {
          id: "penyelamat_biaya",
          title: "Penyelamat Biaya",
          description: "Berhasil mengendalikan lonjakan biaya lembur barista saat kedai ramai.",
          requirement: "Selesaikan Level 3",
          unlocked: false,
          iconName: "shield",
        },
        {
          id: "dapur_tangguh",
          title: "Dapur Tangguh",
          description: "Mampu beroperasi maksimal dan efisien tanpa melanggar batas kapasitas fisik.",
          requirement: "Selesaikan Level 4",
          unlocked: false,
          iconName: "zap",
        },
        {
          id: "keputusan_berani",
          title: "Keputusan Berani",
          description: "Mengambil keputusan manajerial rasional di masa krisis kenaikan biaya sewa.",
          requirement: "Selesaikan Level 5",
          unlocked: false,
          iconName: "scale",
        },
        {
          id: "barista_teladan",
          title: "Barista Teladan",
          description: "Menguasai seluruh seni optimasi keuntungan bisnis kedai kopi UMKM.",
          requirement: "Selesaikan semua level & kumpulkan min. 500 XP",
          unlocked: false,
          iconName: "award",
        },
      ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="page-shell flex flex-col gap-8 pb-28">
      {/* Header Lemari Penghargaan */}
      <div className="bento p-6 flex flex-col gap-6 border border-[#3d322c]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tantangan"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1614] border border-[#3d322c] hover:border-[#e07a5f] text-xs font-mono text-[#c8b8a8] hover:text-[#f4ede2] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Peta Tantangan</span>
            </Link>

            <div>
              <span className="text-[10px] font-mono text-[#e07a5f] uppercase tracking-wider block font-semibold">
                Lemari Penghargaan Kedai
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f4ede2] m-0">
                Ruang Lencana Barista
              </h1>
            </div>
          </div>

          {/* Badge Pangkat Barista Saat Ini */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#1a1614] border border-[#3d322c]">
            <Trophy className="w-5 h-5 text-[#f2cc8f]" />
            <div>
              <span className="text-[9px] font-mono uppercase text-[#a89888] block">
                Pangkat Pengelola
              </span>
              <span className="text-sm font-serif font-bold text-[#f4ede2]">
                {rank.title}
              </span>
            </div>
          </div>
        </div>

        {/* Statistik Pencapaian Lemari Medali */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#3d322c]">
          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a89888]">
              Lencana Terbuka
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-mono font-bold text-[#f2cc8f]">
                {unlockedCount}
              </span>
              <span className="text-xs font-mono text-[#a89888]">
                / {badges.length} Medali
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a89888]">
              Total XP Diperoleh
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-mono font-bold text-[#e07a5f]">
                {currentXp}
              </span>
              <span className="text-xs font-mono text-[#a89888]">XP</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1a1614] border border-[#3d322c] flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#a89888]">
              Status Kelulusan
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono text-sm font-bold text-[#81b29a]">
              <Sparkles className="w-4 h-4 text-[#f2cc8f]" />
              <span>{unlockedCount === badges.length ? "Master Barista" : "Sedang Magang"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 6 Lencana Taktil Mewah */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {badges.map((badge) => {
          const IconComponent = ICON_MAP[badge.iconName];
          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all shadow-md relative ${
                badge.unlocked
                  ? "bg-[#241e1b] border-[#e07a5f]/60 hover:border-[#e07a5f]"
                  : "bg-[#1a1614] border-[#3d322c] opacity-80"
              }`}
            >
              {/* Baris Atas: Ikon Medali & Status Terbuka/Terkunci */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`p-3 rounded-2xl border ${
                    badge.unlocked
                      ? "bg-[#e07a5f]/20 border-[#e07a5f]/50 text-[#f2cc8f] shadow-sm"
                      : "bg-[#241e1b] border-[#3d322c] text-[#a89888]"
                  }`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>

                {badge.unlocked ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#81b29a] bg-[#81b29a]/10 font-mono text-[10px] font-bold text-[#81b29a] uppercase">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terbuka</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#3d322c] bg-[#12100e] font-mono text-[10px] text-[#a89888] uppercase">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Terkunci</span>
                  </div>
                )}
              </div>

              {/* Judul & Penjelasan Medali */}
              <div className="flex flex-col gap-1.5">
                <h2
                  className={`text-base font-serif font-bold ${
                    badge.unlocked ? "text-[#f4ede2]" : "text-[#c8b8a8]"
                  }`}
                >
                  {badge.title}
                </h2>
                <p className="text-xs text-[#c8b8a8] leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Syarat Pembukaan */}
              <div className="pt-3 border-t border-[#3d322c] text-[11px] font-mono text-[#a89888] flex items-center justify-between">
                <div>
                  <span className="text-[#e07a5f] font-semibold">Syarat: </span>
                  <span>{badge.requirement}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigasi Bawah Banner */}
      <div className="p-5 rounded-2xl bg-[#241e1b] border border-[#3d322c] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-[#c8b8a8]">
          <Sparkles className="w-4 h-4 text-[#f2cc8f]" />
          <span>Selesaikan setiap skenario di Peta Tantangan untuk membuka medali berikutnya.</span>
        </div>

        <Link
          href="/tantangan"
          className="px-4 py-2 rounded-xl bg-[#e07a5f] text-[#12100e] text-xs font-bold hover:bg-[#e07a5f]/90 transition-colors"
        >
          Lanjut ke Tantangan
        </Link>
      </div>
    </div>
  );
}
