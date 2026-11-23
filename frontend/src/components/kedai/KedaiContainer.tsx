/**
 * KedaiContainer.tsx — Kontainer utama area "Kedai Langsung".
 * Mengorkestrasi:
 * - Lazy load scene 3D R3F via next/dynamic ssr: false
 * - Fallback Mode Ringan otomatis (non-WebGL / prefers-reduced-motion)
 * - Switch ke Mode Form (ParameterForm) sinkron dwiarah
 * - Bar kontrol status (Sekarang | Disarankan | Atur sendiri)
 * - HotspotSheet popover & daftar objek aksesibel
 */

"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { KedaiControlsBar } from "./KedaiControlsBar";
import { HotspotSheet } from "./HotspotSheet";
import { KedaiObjectList } from "./KedaiObjectList";
import { KedaiLightFallback } from "./KedaiLightFallback";
import { ParameterForm } from "@/components/form/ParameterForm";
import { useSimulation } from "@/lib/store/simulation-context";

// Lazy load komponen 3D berat
const DynamicKedaiScene = dynamic(() => import("./KedaiLangsungScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] sm:h-[480px] md:h-[580px] lg:h-[640px] bg-[#1a1614] rounded-2xl border border-[#3d322c] flex flex-col items-center justify-center gap-3 animate-pulse">
      <div className="w-12 h-12 rounded-full border-2 border-[#e07a5f] border-t-transparent animate-spin" />
      <span className="text-xs font-mono text-[#c8b8a8]">Menyiapkan Kedai 3D...</span>
    </div>
  ),
});

export function KedaiContainer() {
  const { displayMode, isLightMode, setIsLightMode } = useSimulation();
  const [mounted, setMounted] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Deteksi WebGL
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        setIsLightMode(true);
      }
    } catch {
      setHasWebGL(false);
      setIsLightMode(true);
    }

    // Deteksi prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsLightMode(true);
    }
  }, [setIsLightMode]);

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Jika pengguna memilih Mode Form, tampilkan ParameterForm */}
      {displayMode === "form" ? (
        <div className="flex flex-col gap-4">
          <KedaiControlsBar />
          <ParameterForm />
        </div>
      ) : (
        /* Jika pengguna memilih tampilan Kedai 3D */
        <div className="flex flex-col gap-4">
          {/* Kontrol Status Tampilan (Sekarang | Disarankan | Atur sendiri) */}
          <KedaiControlsBar />

          {/* Area Visual: 3D Scene atau Fallback 2D */}
          <div className="relative">
            {mounted && hasWebGL && !isLightMode ? (
              <DynamicKedaiScene />
            ) : (
              <KedaiLightFallback />
            )}

            {/* Popover / Sheet Hotspot Benda Terpilih */}
            <HotspotSheet />
          </div>

          {/* Daftar Objek Kedai (Aksesibilitas Keyboard & Screen Reader) */}
          <KedaiObjectList />
        </div>
      )}
    </div>
  );
}
