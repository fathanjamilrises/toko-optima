/**
 * progress.test.ts — Unit test penyimpanan progres permainan dan status lencana (4E).
 */

import { describe, it, expect } from "vitest";
import { getBadgesStatus, type GameProgress } from "@/lib/game/progress";

describe("Game Progress & Badges (Sub-Fase 4E)", () => {
  it("semua lencana terkunci pada progres awal", () => {
    const emptyProgress: GameProgress = {
      totalXp: 0,
      levels: {},
      unlockedBadges: [],
    };

    const badges = getBadgesStatus(emptyProgress);
    expect(badges).toHaveLength(6);
    badges.forEach((b) => {
      expect(b.unlocked).toBe(false);
    });
  });

  it("membuka lencana Seduhan Pertama setelah Level 1 selesai", () => {
    const progress: GameProgress = {
      totalXp: 120,
      levels: {
        "1": { completed: true, bestScore: 95, bestStars: 2, attempts: 1 },
      },
      unlockedBadges: [],
    };

    const badges = getBadgesStatus(progress);
    const seduhan = badges.find((b) => b.id === "seduhan_pertama");
    expect(seduhan?.unlocked).toBe(true);
    const puncak = badges.find((b) => b.id === "puncak_untung");
    expect(puncak?.unlocked).toBe(false);
  });

  it("membuka lencana Puncak Untung bila meraih 3 bintang di Level 1 atau Level 2", () => {
    const progress: GameProgress = {
      totalXp: 150,
      levels: {
        "1": { completed: true, bestScore: 100, bestStars: 3, attempts: 1 },
      },
      unlockedBadges: [],
    };

    const badges = getBadgesStatus(progress);
    const puncak = badges.find((b) => b.id === "puncak_untung");
    expect(puncak?.unlocked).toBe(true);
  });

  it("membuka lencana Barista Teladan jika seluruh level 1-5 selesai dan XP >= 500", () => {
    const progress: GameProgress = {
      totalXp: 650,
      levels: {
        "1": { completed: true, bestScore: 100, bestStars: 3, attempts: 1 },
        "2": { completed: true, bestScore: 100, bestStars: 3, attempts: 1 },
        "3": { completed: true, bestScore: 100, bestStars: 3, attempts: 1 },
        "4": { completed: true, bestScore: 100, bestStars: 3, attempts: 1 },
        "5": { completed: true, bestScore: 100, bestStars: 3, attempts: 1 },
      },
      unlockedBadges: [],
    };

    const badges = getBadgesStatus(progress);
    const barista = badges.find((b) => b.id === "barista_teladan");
    expect(barista?.unlocked).toBe(true);
  });
});
