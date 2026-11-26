import { Suspense } from "react";
import { LevelClientView } from "@/components/game/LevelClientView";

export function generateStaticParams() {
  return [
    { level: "1" },
    { level: "2" },
    { level: "3" },
    { level: "4" },
    { level: "5" },
    { level: "bebas" },
  ];
}

interface LevelPageProps {
  params: Promise<{ level: string }>;
}

export default async function LevelPage({ params }: LevelPageProps) {
  const resolvedParams = await params;
  return (
    <Suspense
      fallback={
        <div className="w-full h-80 flex items-center justify-center text-sm font-mono text-[#c8b8a8]">
          Memuat level tantangan...
        </div>
      }
    >
      <LevelClientView levelId={resolvedParams.level} />
    </Suspense>
  );
}
