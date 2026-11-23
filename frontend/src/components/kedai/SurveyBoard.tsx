/**
 * SurveyBoard.tsx — Papan survei pembeli di dekat jendela kedai.
 * Mewakili parameter sensitivity (kepekaan pembeli terhadap kenaikan harga).
 */

"use client";

import React from "react";
import { HotspotMesh } from "./HotspotMesh";
import { useSimulation } from "@/lib/store/simulation-context";

export function SurveyBoard() {
  const { params } = useSimulation();

  return (
    <HotspotMesh
      hotspotKey="sensitivity"
      position={[-2.8, 0, 1.2]}
      tagOffset={[0, 1.45, 0]}
      label="Kepekaan"
      valueDisplay={`${params.sensitivity} cangkir/Rp1rb`}
      ariaLabel={`Papan survei di jendela: kepekaan harga ${params.sensitivity} cangkir berkurang tiap kenaikan Rp1.000. Klik untuk mengubah.`}
    >
      <group rotation={[0, 0.4, 0]}>
        {/* Kaki Tiang Papan Survei */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.3]} />
          <meshStandardMaterial color="#4a3525" roughness={0.7} />
        </mesh>
        {/* Dudukan Dasar */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 16]} />
          <meshStandardMaterial color="#382618" roughness={0.7} />
        </mesh>

        {/* Papan Klip Kayu */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <boxGeometry args={[0.65, 0.8, 0.04]} />
          <meshStandardMaterial color="#5c3d28" roughness={0.6} />
        </mesh>

        {/* Kertas Survei Krem */}
        <mesh position={[0, 1.2, 0.025]}>
          <planeGeometry args={[0.55, 0.7]} />
          <meshStandardMaterial color="#f4ede2" roughness={0.8} />
        </mesh>

        {/* Klip Logam di Atas Papan */}
        <mesh position={[0, 1.55, 0.03]} castShadow>
          <boxGeometry args={[0.2, 0.06, 0.04]} />
          <meshStandardMaterial color="#d95d39" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* Sosok Kecil 'Berbalik Pergi' Simbolik di Samping */}
        <group position={[-0.45, 0, 0.3]} rotation={[0, -2.2, 0]}>
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.45, 12]} />
            <meshStandardMaterial color="#c8b8a8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </HotspotMesh>
  );
}
