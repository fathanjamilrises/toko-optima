/**
 * SkeletonLoader.tsx — Skeleton berbentuk ubin bento saat status loading.
 * Mengikuti DESIGN.md 2.6: kerangka bento berbentuk ubin.
 */

"use client";

import React from "react";

export function SkeletonLoader() {
  return (
    <div className="flex flex-col gap-6 animate-pulse" aria-label="Sedang memuat data">
      <div className="bento p-8 flex flex-col gap-4 min-h-[220px]">
        <div className="h-4 w-32 bg-[var(--bg-raised)] rounded" />
        <div className="h-16 w-3/4 bg-[var(--bg-raised)] rounded-lg my-2" />
        <div className="h-4 w-1/2 bg-[var(--bg-raised)] rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bento p-6 min-h-[260px] bg-[var(--bg-raised)]/40 rounded-xl" />
        <div className="bento p-6 min-h-[260px] bg-[var(--bg-raised)]/40 rounded-xl" />
      </div>
    </div>
  );
}
