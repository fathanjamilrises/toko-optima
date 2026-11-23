/**
 * RankBadge.tsx — Komponen penampil pangkat barista dan perolehan XP pemain.
 */

"use client";

import React from "react";
import { Award, Zap } from "lucide-react";
import { getRankFromXp } from "@/lib/game/engine";

interface RankBadgeProps {
  xp: number;
  className?: string;
}

export function RankBadge({ xp, className = "" }: RankBadgeProps) {
  const rank = getRankFromXp(xp);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#241e1b] border border-[#3d322c] text-xs font-mono ${className}`}
      aria-label={`Pangkat: ${rank.title}, Akumulasi XP: ${xp}`}
    >
      <div className="flex items-center gap-1 text-[#e07a5f] font-semibold">
        <Award className="w-3.5 h-3.5" />
        <span>{rank.title}</span>
      </div>
      <span className="text-[#3d322c]">|</span>
      <div className="flex items-center gap-1 text-[#f2cc8f]">
        <Zap className="w-3.5 h-3.5 fill-[#f2cc8f]" />
        <span>{xp} XP</span>
      </div>
    </div>
  );
}
