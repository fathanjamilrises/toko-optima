/**
 * HotspotMesh.tsx — Pembungkus interaktif objek kedai.
 * Mengaktifkan sorotan saat hover/fokus, kursor pointer,
 * dan tombol tag DOM HTML aksesibel via @react-three/drei <Html>.
 */

"use client";

import React, { useState } from "react";
import { Html } from "@react-three/drei";
import type { ParamKey } from "@/lib/kedai/hotspots";
import { useSimulation } from "@/lib/store/simulation-context";

interface HotspotMeshProps {
  hotspotKey: ParamKey;
  position?: [number, number, number];
  tagOffset?: [number, number, number];
  label: string;
  valueDisplay: string;
  ariaLabel: string;
  children: React.ReactNode;
}

export function HotspotMesh({
  hotspotKey,
  position = [0, 0, 0],
  tagOffset = [0, 1.2, 0],
  label,
  valueDisplay,
  ariaLabel,
  children,
}: HotspotMeshProps) {
  const { activeHotspot, setActiveHotspot } = useSimulation();
  const [hovered, setHovered] = useState(false);
  const isActive = activeHotspot === hotspotKey;

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveHotspot(isActive ? null : hotspotKey);
  };

  return (
    <group position={position}>
      {/* Mesh Konten dengan handler interaksi */}
      <group
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        {children}

        {/* Sorotan kontur halus saat hover / aktif */}
        {(hovered || isActive) && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        )}
      </group>

      {/* Tag HTML Aksesibel di atas objek */}
      <Html
        position={tagOffset}
        center
        distanceFactor={10}
        zIndexRange={[100, 0]}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveHotspot(isActive ? null : hotspotKey);
          }}
          aria-label={ariaLabel}
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border shadow-sm transition-all duration-200 select-none whitespace-nowrap ${
            isActive
              ? "bg-[#e07a5f] text-white border-[#e07a5f] ring-2 ring-[#e07a5f]/40 scale-105"
              : hovered
                ? "bg-[#2e1f1a] text-[#f4ede2] border-[#e07a5f] scale-105"
                : "bg-[#1a1614]/90 text-[#c8b8a8] border-[#3d322c] hover:border-[#e07a5f] hover:text-[#f4ede2]"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#e07a5f] group-hover:scale-125 transition-transform" />
          <span className="text-[11px] font-sans font-medium text-[#c8b8a8] group-hover:text-white">
            {label}:
          </span>
          <span className="text-[11px] text-[#f4ede2] font-semibold">{valueDisplay}</span>
        </button>
      </Html>
    </group>
  );
}
