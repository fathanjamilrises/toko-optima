/**
 * HillMesh.tsx — Membangun geometri profil Bukit Untung dari titik (x, P).
 * Menggunakan ExtrudeGeometry dengan bevel kecil bergaya tanah liat lembut (DESIGN.md 6.2, 6.4).
 * Segmen di atas nol berwarna solid --profit (#81b29a), segmen di bawah nol berwarna solid --loss (#d95d39).
 * Dipotong tegas pada garis BEP (dua mesh terpisah, tanpa interpolasi gradien).
 */

"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import type { CurvePoint } from "@/types/api";

interface HillMeshProps {
  points: CurvePoint[];
  mapX: (x: number) => number;
  mapY: (val: number) => number;
}

export function HillMesh({ points, mapX, mapY }: HillMeshProps) {
  // Bangun geometri terpisah untuk segmen untung (P >= 0) dan segmen rugi (P < 0)
  const { profitGeo, lossGeo } = useMemo(() => {
    if (!points || points.length < 2) {
      return { profitGeo: null, lossGeo: null };
    }

    const y0 = mapY(0);

    // 1. Bentuk Shape untuk Segmen Untung (P >= 0)
    const profitShape = new THREE.Shape();
    // Cari titik-titik yang memiliki P >= 0
    const profitPoints = points.filter((p) => p.P >= 0);

    let pGeo: THREE.ExtrudeGeometry | null = null;
    let lGeo: THREE.ExtrudeGeometry | null = null;

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: 1.0,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
    };

    if (profitPoints.length >= 2) {
      const first = profitPoints[0];
      profitShape.moveTo(mapX(first.x), y0);

      profitPoints.forEach((p) => {
        profitShape.lineTo(mapX(p.x), Math.max(y0, mapY(p.P)));
      });

      const last = profitPoints[profitPoints.length - 1];
      profitShape.lineTo(mapX(last.x), y0);
      profitShape.closePath();

      pGeo = new THREE.ExtrudeGeometry(profitShape, extrudeSettings);
    }

    // 2. Bentuk Shape untuk Segmen Rugi (P < 0)
    // Bisa ada di sisi kiri sebelum BEP1 atau di sisi kanan setelah BEP2
    const lossShape = new THREE.Shape();
    const lossPoints = points.filter((p) => p.P < 0);

    if (lossPoints.length >= 2) {
      const firstL = lossPoints[0];
      lossShape.moveTo(mapX(firstL.x), y0);

      lossPoints.forEach((p) => {
        lossShape.lineTo(mapX(p.x), Math.min(y0, mapY(p.P)));
      });

      const lastL = lossPoints[lossPoints.length - 1];
      lossShape.lineTo(mapX(lastL.x), y0);
      lossShape.closePath();

      lGeo = new THREE.ExtrudeGeometry(lossShape, extrudeSettings);
    }

    return { profitGeo: pGeo, lossGeo: lGeo };
  }, [points, mapX, mapY]);

  return (
    <group position={[0, 0, -0.5]}>
      {/* Segmen Untung — Hijau Daun Salvia Solid */}
      {profitGeo && (
        <mesh geometry={profitGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color="#81b29a"
            roughness={0.55}
            metalness={0.05}
          />
        </mesh>
      )}

      {/* Segmen Rugi — Terracotta Merah Bata Solid */}
      {lossGeo && (
        <mesh geometry={lossGeo} castShadow receiveShadow>
          <meshStandardMaterial
            color="#d95d39"
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
      )}
    </group>
  );
}
