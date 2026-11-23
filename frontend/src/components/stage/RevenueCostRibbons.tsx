/**
 * RevenueCostRibbons.tsx — Pita 3D Pemasukan (R) dan Pengeluaran (C) di belakang Bukit Untung.
 * Memperlihatkan hubungan fundamental kalkulus: Untung P(x) = Pemasukan R(x) - Pengeluaran C(x).
 */

"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import type { CurvePoint } from "@/types/api";

interface RevenueCostRibbonsProps {
  points: CurvePoint[];
  mapX: (x: number) => number;
  mapY: (val: number) => number;
}

export function RevenueCostRibbons({
  points,
  mapX,
  mapY,
}: RevenueCostRibbonsProps) {
  // Buat geometri kurva tabung untuk Pemasukan (R)
  const revenueCurve = useMemo(() => {
    if (!points || points.length < 2) return null;
    const vectors = points.map((p) => new THREE.Vector3(mapX(p.x), mapY(p.R), -1.2));
    const path = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(path, 64, 0.05, 8, false);
  }, [points, mapX, mapY]);

  // Buat geometri kurva tabung untuk Pengeluaran (C)
  const costCurve = useMemo(() => {
    if (!points || points.length < 2) return null;
    const vectors = points.map((p) => new THREE.Vector3(mapX(p.x), mapY(p.C), -2.4));
    const path = new THREE.CatmullRomCurve3(vectors);
    return new THREE.TubeGeometry(path, 64, 0.05, 8, false);
  }, [points, mapX, mapY]);

  return (
    <group>
      {/* Pita Pemasukan R(x) — Emas */}
      {revenueCurve && (
        <mesh geometry={revenueCurve} castShadow>
          <meshStandardMaterial
            color="#f2cc8f"
            roughness={0.4}
            metalness={0.2}
          />
        </mesh>
      )}

      {/* Pita Pengeluaran C(x) — Terracotta */}
      {costCurve && (
        <mesh geometry={costCurve} castShadow>
          <meshStandardMaterial
            color="#e07a5f"
            roughness={0.5}
            metalness={0.1}
          />
        </mesh>
      )}
    </group>
  );
}
