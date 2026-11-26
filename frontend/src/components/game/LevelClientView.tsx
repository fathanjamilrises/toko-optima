"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LEVELS } from "@/lib/game/config";
import {
  evaluateLevelResult,
  evaluateDecisionLevel,
  calculateRewards,
  type ScoreResult,
} from "@/lib/game/engine";
import { getProgress, recordLevelCompletion } from "@/lib/game/progress";
import { api } from "@/lib/api";
import type { OptimizeRequest, OptimizeResponse, CurvePoint } from "@/types/api";
import { LevelHUD } from "@/components/game/LevelHUD";
import { ChallengeSlider } from "@/components/game/ChallengeSlider";
import { HintBox } from "@/components/game/HintBox";
import { GuessModal } from "@/components/game/GuessModal";
import { DecisionCard } from "@/components/game/DecisionCard";
import { ResultPanel } from "@/components/game/ResultPanel";
import { KedaiLightFallback } from "@/components/kedai/KedaiLightFallback";
import { SimulationProvider } from "@/lib/store/simulation-context";
import { DEFAULT_G1_PARAMS } from "@/lib/kedai/useLiveOptimize";

const PRESET_PARAMS_MAP: Record<string, OptimizeRequest> = {
  "1": { ...DEFAULT_G1_PARAMS },
  "2": { ...DEFAULT_G1_PARAMS, quad_cost: 20 },
  "3": { ...DEFAULT_G1_PARAMS, capacity: 60 },
  "4": {
    fixed_cost: 600000,
    variable_cost: 15000,
    quad_cost: 0,
    ref_price: 18000,
    ref_demand: 50,
    sensitivity: 5,
    capacity: null,
  },
  "5": {
    fixed_cost: 300000,
    variable_cost: 45000,
    quad_cost: 0,
    ref_price: 22000,
    ref_demand: 80,
    sensitivity: 5,
    capacity: null,
  },
  bebas: { ...DEFAULT_G1_PARAMS },
};

export function LevelClientView({ levelId }: { levelId: string }) {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "akademik" ? "akademik" : "awam";

  const levelConfig = useMemo(() => {
    return LEVELS.find((l) => l.id === levelId) || LEVELS[0];
  }, [levelId]);

  // State Game
  const [data, setData] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLocked, setIsLocked] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [playerXp, setPlayerXp] = useState(0);

  // Mekanik Tebak Dulu (Level 2)
  const [guessModalOpen, setGuessModalOpen] = useState(false);
  const [userGuess, setUserGuess] = useState<number | null>(null);
  const [guessAccurate, setGuessAccurate] = useState(false);

  // Mekanik Petunjuk
  const [hintBoxOpen, setHintBoxOpen] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  // Hadiah XP
  const [earnedXp, setEarnedXp] = useState(0);
  const [rewardDetails, setRewardDetails] = useState<string[]>([]);

  // 1. Ambil data progres dari localStorage saat mount
  useEffect(() => {
    const prog = getProgress();
    setPlayerXp(prog.totalXp);
  }, []);

  // 2. Ambil data kalkulasi kurva
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setIsLocked(false);
    setResult(null);
    setHintsRevealed(0);

    const baseParams = PRESET_PARAMS_MAP[levelId] || DEFAULT_G1_PARAMS;
    const payload: OptimizeRequest = {
      ...baseParams,
      options: {
        include_steps: true,
        include_curves: true,
        include_sensitivity: true,
        curve_points: 200,
      },
    };

    api
      .optimize(payload)
      .then((res) => {
        if (isCancelled) return;
        setData(res);
        setLoading(false);

        // Pilih titik awal acuan di tengah kurva
        if (res.curves.points.length > 0) {
          setCurrentIndex(Math.floor(res.curves.points.length / 3));
        }

        // Buka modal tebak dulu jika Level 2
        if (levelConfig.hasGuessPhase) {
          setGuessModalOpen(true);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Gagal memuat level game:", err);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [levelId, levelConfig]);

  const points = data?.curves.points ?? [];
  const activePt: CurvePoint | undefined = points[currentIndex];

  // Penanganan tebakan awal Level 2
  const handleLockGuess = (guessedCups: number) => {
    setUserGuess(guessedCups);
    setGuessModalOpen(false);

    if (data?.optimum.integer.x) {
      const actualOptX = data.optimum.integer.x;
      const diff = Math.abs(guessedCups - actualOptX);
      const isAccurate = diff <= actualOptX * 0.1; // ±10%
      setGuessAccurate(isAccurate);
    }
  };

  // Kunci Jawaban (Level Slider 1–4, Bebas)
  const handleLockAnswer = () => {
    if (!data || !activePt) return;

    const allP = points.map((p) => p.P);
    const minP = Math.min(...allP);
    const maxP = data.optimum.integer.profit;
    const chosenP = activePt.P;

    const res = evaluateLevelResult(chosenP, minP, maxP);
    setResult(res);
    setIsLocked(true);

    // Hitung perolehan XP
    const rewards = calculateRewards(res.score, res.stars, hintsRevealed, guessAccurate);
    setEarnedXp(rewards.earnedXp);
    setRewardDetails(rewards.details);

    // Simpan progres ke localStorage
    const updated = recordLevelCompletion(levelId, res.score, res.stars, rewards.earnedXp);
    setPlayerXp(updated.totalXp);
  };

  // Kunci Jawaban (Level 5 — Keputusan Tutup/Buka)
  const handleDecision = (decision: "BUKA" | "TUTUP_SEMENTARA") => {
    if (!data) return;

    const decResult = evaluateDecisionLevel(decision);
    const res: ScoreResult = {
      score: decResult.score,
      stars: decResult.stars,
      stampText: decResult.isCorrect ? "KEPUTUSAN TEPAT!" : "COBA LAGI",
      isOptimal: decResult.isCorrect,
    };
    setResult(res);
    setIsLocked(true);

    const rewards = calculateRewards(res.score, res.stars, 0, false);
    setEarnedXp(rewards.earnedXp);
    setRewardDetails(rewards.details);

    const updated = recordLevelCompletion(levelId, res.score, res.stars, rewards.earnedXp);
    setPlayerXp(updated.totalXp);
  };

  const handleRetry = () => {
    setIsLocked(false);
    setResult(null);
    if (levelConfig.hasGuessPhase) {
      setGuessModalOpen(true);
    }
  };

  const nextLevelIndex = levelConfig.number;
  const nextLevelId = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex].id : null;

  return (
    <div className="page-shell min-h-[calc(100vh-80px)] flex flex-col gap-6 pb-16">
      {/* Header HUD */}
      <LevelHUD
        level={levelConfig}
        xp={playerXp}
        hintsUsedCount={hintsRevealed}
        onOpenHint={() => setHintBoxOpen(true)}
        isCompleted={isLocked}
      />

      {/* Misi Level Banner */}
      <div className="p-4 rounded-2xl bg-[#241e1b] border border-[#3d322c] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-[#e07a5f] uppercase tracking-wider block font-semibold">
            Tujuan Misi
          </span>
          <p className="text-xs sm:text-sm text-[#f4ede2] mt-0.5">{levelConfig.mission}</p>
        </div>

        {/* Umpan balik tebakan awal (Level 2) */}
        {userGuess !== null && (
          <div className="text-right shrink-0">
            <span className="text-[10px] font-mono text-[#c8b8a8] block">Tebakan Anda:</span>
            <span className="text-xs font-mono text-[#f2cc8f]">
              {userGuess} cangkir {guessAccurate ? "(Akurat! +15 XP)" : ""}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full h-80 rounded-2xl bg-[#1a1614] border border-[#3d322c] flex flex-col items-center justify-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full border-2 border-[#e07a5f] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#c8b8a8]">Memuat tantangan level...</span>
        </div>
      ) : data ? (
        <SimulationProvider>
          {/* Stage Visual: Kanvas 2D/3D untuk Game */}
          <div className="flex flex-col gap-5">
            <KedaiLightFallback />

            {/* Kontrol Jawaban: Slider Titik API atau Kartu Keputusan */}
            {!levelConfig.isDecisionLevel ? (
              <ChallengeSlider
                points={points}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
                onLockAnswer={handleLockAnswer}
                isLocked={isLocked}
                highlightRange={
                  hintsRevealed >= 3 && data.curves.markers.optimum
                    ? {
                        minIndex: Math.max(0, currentIndex - 5),
                        maxIndex: Math.min(points.length - 1, currentIndex + 5),
                      }
                    : null
                }
              />
            ) : (
              <DecisionCard
                warnings={data.warnings}
                onChoose={handleDecision}
                disabled={isLocked}
              />
            )}

            {/* Panel Hasil Setelah Jawaban Dikunci */}
            {isLocked && result && (
              <ResultPanel
                result={result}
                chosenProfit={activePt ? activePt.P : 0}
                maxProfit={data.optimum.integer.profit}
                lesson={levelConfig.lesson}
                nextLevelId={nextLevelId}
                presetId={levelConfig.presetId}
                onRetry={handleRetry}
                earnedXp={earnedXp}
                rewardDetails={rewardDetails}
              />
            )}
          </div>

          {/* Modal Tebak Dulu (Level 2) */}
          <GuessModal isOpen={guessModalOpen} onLockGuess={handleLockGuess} />

          {/* Modal Petunjuk Analisis (3 Tingkat) */}
          <HintBox
            isOpen={hintBoxOpen}
            onClose={() => setHintBoxOpen(false)}
            activePoint={activePt}
            curves={data.curves}
            mode={mode}
            hintsRevealed={hintsRevealed}
            onRevealNextHint={() => setHintsRevealed((prev) => Math.min(3, prev + 1))}
          />
        </SimulationProvider>
      ) : null}
    </div>
  );
}
