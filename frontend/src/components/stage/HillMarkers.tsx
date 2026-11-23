/**
 * HillMarkers.tsx — Penanda 3D di atas Bukit Untung (DESIGN.md 6.4):
 * - Bendera puncak karamel di x* (optimum)
 * - Gerbang impas di titik BEP
 * - Pagar kapasitas dapur (jika ada)
 * - Rumah acuan kondisi sekarang
 */

"use client";

import React from "react";
import { Html } from "@react-three/drei";
import type { Curves } from "@/types/api";
import type { LanguageMode } from "@/lib/copy";

interface HillMarkersProps {
  curves: Curves;
  mapX: (x: number) => number;
  mapY: (val: number) => number;
  mode: LanguageMode;
}

export function HillMarkers({
  curves,
  mapX,
  mapY,
  mode,
}: HillMarkersProps) {
  const opt = curves.markers.optimum;
  const bepList = curves.markers.break_even || [];
  const cap = curves.markers.capacity;
  const ref = curves.markers.reference;

  return (
    <group>
      {/* 1. Bendera Puncak Keuntungan */}
      {opt && (
        <group position={[mapX(opt.x), mapY(opt.P), 0.5]}>
          {/* Tiang Bendera */}
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.2]} />
            <meshStandardMaterial color="#4a3525" roughness={0.7} />
          </mesh>

          {/* Kain Bendera Segitiga Karamel */}
          <mesh position={[0.2, 1.05, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
            <coneGeometry args={[0.22, 0.4, 3]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.5} />
          </mesh>

          {/* Label HTML Bendera */}
          <Html position={[0, 1.35, 0]} center distanceFactor={10}>
            <div className="bg-[#241e1b]/95 border border-[#e07a5f] rounded-lg px-2 py-0.5 text-[10px] font-mono text-[#f4ede2] whitespace-nowrap shadow-md">
              {mode === "akademik" ? "Titik Kritis x*" : "Puncak Untung"}
            </div>
          </Html>
        </group>
      )}

      {/* 2. Gerbang Kayu Mulai Untung (BEP) */}
      {bepList.length > 0 && bepList[0] && (
        <group position={[mapX(bepList[0].x), 0, 0.5]}>
          {/* Dua Tiang Gerbang */}
          <mesh position={[-0.15, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.7]} />
            <meshStandardMaterial color="#81b29a" roughness={0.6} />
          </mesh>
          <mesh position={[0.15, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.7]} />
            <meshStandardMaterial color="#81b29a" roughness={0.6} />
          </mesh>
          {/* Balok Atas Gerbang */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <boxGeometry args={[0.36, 0.04, 0.05]} />
            <meshStandardMaterial color="#81b29a" roughness={0.6} />
          </mesh>

          <Html position={[0, 0.9, 0]} center distanceFactor={10}>
            <div className="bg-[#1a1614]/90 border border-[#81b29a] rounded px-1.5 py-0.5 text-[9px] font-mono text-[#81b29a] whitespace-nowrap">
              {mode === "akademik" ? "BEP 1" : "Mulai Untung"}
            </div>
          </Html>
        </group>
      )}

      {/* 3. Pagar Batas Kapasitas */}
      {cap && (
        <group position={[mapX(cap.x), 1.0, 0]}>
          <mesh>
            <boxGeometry args={[0.04, 2.5, 1.2]} />
            <meshStandardMaterial
              color="#d95d39"
              transparent
              opacity={0.4}
              roughness={0.3}
            />
          </mesh>
          <Html position={[0, 1.5, 0]} center distanceFactor={10}>
            <div className="bg-[#2e1f1a]/95 border border-[#d95d39] rounded px-1.5 py-0.5 text-[9px] font-mono text-[#d95d39] whitespace-nowrap">
              Batas Kapasitas
            </div>
          </Html>
        </group>
      )}

      {/* 4. Rumah Acuan Kondisi Sekarang */}
      {ref && (
        <group position={[mapX(ref.x), mapY(ref.P), 0.6]}>
          {/* Badan Rumah Kecil */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.26, 0.24, 0.24]} />
            <meshStandardMaterial color="#4a3525" roughness={0.7} />
          </mesh>
          {/* Atap Rumah Segitiga */}
          <mesh position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.22, 0.16, 4]} />
            <meshStandardMaterial color="#d95d39" roughness={0.6} />
          </mesh>
          <Html position={[0, 0.48, 0]} center distanceFactor={10}>
            <div className="bg-[#1a1614]/90 border border-[#c8b8a8] rounded px-1.5 py-0.5 text-[9px] font-mono text-[#c8b8a8] whitespace-nowrap">
              Sekarang
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
