/**
 * ShelvesAndStock.tsx — Rak bahan baku (biji kopi, susu, cangkir).
 * Mewakili variable_cost (biaya modal variabel per cangkir kopi).
 */

"use client";

import React from "react";
import { HotspotMesh } from "./HotspotMesh";
import type { KedaiVisualMapping } from "@/lib/stage/mapping";
import { formatRupiah } from "@/lib/format";
import { useSimulation } from "@/lib/store/simulation-context";

interface ShelvesAndStockProps {
  mapping: KedaiVisualMapping;
}

export function ShelvesAndStock({ mapping }: ShelvesAndStockProps) {
  const { params } = useSimulation();

  return (
    <HotspotMesh
      hotspotKey="variable_cost"
      position={[-2.2, 0, -2.6]}
      tagOffset={[0, 2.3, 0]}
      label="Bahan Baku"
      valueDisplay={formatRupiah(params.variable_cost)}
      ariaLabel={`Rak bahan baku: modal per cangkir ${formatRupiah(params.variable_cost)}. Klik untuk mengubah.`}
    >
      <group>
        {/* Tiang Rak Kayu Kiri & Kanan */}
        <mesh position={[-0.8, 1.1, 0]} castShadow>
          <boxGeometry args={[0.08, 2.2, 0.4]} />
          <meshStandardMaterial color="#382618" roughness={0.7} />
        </mesh>
        <mesh position={[0.8, 1.1, 0]} castShadow>
          <boxGeometry args={[0.08, 2.2, 0.4]} />
          <meshStandardMaterial color="#382618" roughness={0.7} />
        </mesh>

        {/* 3 Tingkat Papan Rak */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[1.7, 0.05, 0.45]} />
          <meshStandardMaterial color="#4a3525" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[1.7, 0.05, 0.45]} />
          <meshStandardMaterial color="#4a3525" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.7, 0]} castShadow>
          <boxGeometry args={[1.7, 0.05, 0.45]} />
          <meshStandardMaterial color="#4a3525" roughness={0.6} />
        </mesh>

        {/* Tingkat 1: Karung Biji Kopi */}
        <group position={[0, 0.53, 0]}>
          <mesh position={[-0.45, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.32, 12]} />
            <meshStandardMaterial color="#735338" roughness={0.9} />
          </mesh>
          {mapping.shelfFullness > 0.3 && (
            <mesh position={[0.45, 0.16, 0]} castShadow>
              <cylinderGeometry args={[0.18, 0.22, 0.32, 12]} />
              <meshStandardMaterial color="#735338" roughness={0.9} />
            </mesh>
          )}
        </group>

        {/* Tingkat 2: Kotak Karton Susu */}
        <group position={[0, 1.13, 0]}>
          <mesh position={[-0.4, 0.15, 0]} castShadow>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.5} />
          </mesh>
          <mesh position={[-0.1, 0.15, 0]} castShadow>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.5} />
          </mesh>
          <mesh position={[0.2, 0.15, 0]} castShadow>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.5} />
          </mesh>
        </group>

        {/* Tingkat 3: Tumpukan Gelas Kertas */}
        <group position={[0, 1.73, 0]}>
          <mesh position={[-0.4, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.32, 12]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.32, 12]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.6} />
          </mesh>
          <mesh position={[0.4, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.07, 0.32, 12]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </HotspotMesh>
  );
}
