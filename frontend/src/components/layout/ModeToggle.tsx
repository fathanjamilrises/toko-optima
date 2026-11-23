"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LanguageMode } from "@/lib/copy";

export function ModeToggle({ mode }: { mode: LanguageMode }) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const setMode = (nextMode: LanguageMode) => {
    const next = new URLSearchParams(params.toString());
    if (nextMode === "awam") {
      next.delete("mode");
    } else {
      next.set("mode", "akademik");
    }
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`);
  };
  return <div aria-label="Mode bahasa" className="mode-toggle" role="group">
    <button aria-pressed={mode === "awam"} onClick={() => setMode("awam")} type="button">Awam</button>
    <button aria-pressed={mode === "akademik"} onClick={() => setMode("akademik")} type="button">Akademik</button>
  </div>;
}
