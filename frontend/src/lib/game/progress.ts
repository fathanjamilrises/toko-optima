/**
 * progress.ts — Manajemen penyimpanan progres permainan di localStorage.
 * Aman dijalankan di lingkungan SSR Next.js.
 */

export interface LevelProgress {
  completed: boolean;
  bestScore: number;
  bestStars: number;
  attempts: number;
}

export interface GameProgress {
  totalXp: number;
  levels: Record<string, LevelProgress>;
  unlockedBadges: string[];
}

const STORAGE_KEY = "kopioptima_game_progress";

const DEFAULT_PROGRESS: GameProgress = {
  totalXp: 0,
  levels: {
    "1": { completed: false, bestScore: 0, bestStars: 0, attempts: 0 },
    "2": { completed: false, bestScore: 0, bestStars: 0, attempts: 0 },
    "3": { completed: false, bestScore: 0, bestStars: 0, attempts: 0 },
    "4": { completed: false, bestScore: 0, bestStars: 0, attempts: 0 },
    "5": { completed: false, bestScore: 0, bestStars: 0, attempts: 0 },
    "bebas": { completed: false, bestScore: 0, bestStars: 0, attempts: 0 },
  },
  unlockedBadges: [],
};

export function getProgress(): GameProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      levels: {
        ...DEFAULT_PROGRESS.levels,
        ...(parsed.levels || {}),
      },
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore localStorage quota or private browsing errors
  }
}

export function recordLevelCompletion(
  levelId: string,
  score: number,
  stars: number,
  earnedXp: number
): GameProgress {
  const current = getProgress();
  const existingLevel = current.levels[levelId] || {
    completed: false,
    bestScore: 0,
    bestStars: 0,
    attempts: 0,
  };

  const updatedLevel: LevelProgress = {
    completed: true,
    bestScore: Math.max(existingLevel.bestScore, score),
    bestStars: Math.max(existingLevel.bestStars, stars),
    attempts: existingLevel.attempts + 1,
  };

  const updatedProgress: GameProgress = {
    ...current,
    totalXp: current.totalXp + earnedXp,
    levels: {
      ...current.levels,
      [levelId]: updatedLevel,
    },
  };

  saveProgress(updatedProgress);
  return updatedProgress;
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  iconName: "coffee" | "flame" | "shield" | "zap" | "scale" | "award";
}

export function getBadgesStatus(progress: GameProgress): BadgeItem[] {
  const l1 = progress.levels["1"];
  const l2 = progress.levels["2"];
  const l3 = progress.levels["3"];
  const l4 = progress.levels["4"];
  const l5 = progress.levels["5"];

  const allCompleted =
    Boolean(l1?.completed) &&
    Boolean(l2?.completed) &&
    Boolean(l3?.completed) &&
    Boolean(l4?.completed) &&
    Boolean(l5?.completed);

  return [
    {
      id: "seduhan_pertama",
      title: "Seduhan Pertama",
      description: "Berhasil meluncurkan kedai kecil dan menemukan titik impas pertama Anda.",
      requirement: "Selesaikan Level 1",
      unlocked: Boolean(l1?.completed),
      iconName: "coffee",
    },
    {
      id: "puncak_untung",
      title: "Puncak Untung",
      description: "Menemukan target cangkir tepat di puncak keuntungan tertinggi tanpa sisa.",
      requirement: "Raih 3 bintang di Level 1 atau Level 2",
      unlocked: (l1?.bestStars ?? 0) === 3 || (l2?.bestStars ?? 0) === 3,
      iconName: "flame",
    },
    {
      id: "penyelamat_biaya",
      title: "Penyelamat Biaya",
      description: "Berhasil mengendalikan lonjakan biaya lembur barista saat kedai ramai.",
      requirement: "Selesaikan Level 3",
      unlocked: Boolean(l3?.completed),
      iconName: "shield",
    },
    {
      id: "dapur_tangguh",
      title: "Dapur Tangguh",
      description: "Mampu beroperasi maksimal dan efisien tanpa melanggar batas kapasitas fisik.",
      requirement: "Selesaikan Level 4",
      unlocked: Boolean(l4?.completed),
      iconName: "zap",
    },
    {
      id: "keputusan_berani",
      title: "Keputusan Berani",
      description: "Mengambil keputusan manajerial rasional di masa krisis kenaikan biaya sewa.",
      requirement: "Selesaikan Level 5",
      unlocked: Boolean(l5?.completed),
      iconName: "scale",
    },
    {
      id: "barista_teladan",
      title: "Barista Teladan",
      description: "Menguasai seluruh seni optimasi keuntungan bisnis kedai kopi UMKM.",
      requirement: "Selesaikan semua level & kumpulkan min. 500 XP",
      unlocked: allCompleted && progress.totalXp >= 500,
      iconName: "award",
    },
  ];
}

export function resetProgress(): GameProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return DEFAULT_PROGRESS;
}
