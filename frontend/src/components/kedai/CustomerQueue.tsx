/**
 * CustomerQueue.tsx — Pintu masuk dan antrean pelanggan kedai.
 * Sosok pelanggan kapsul (0..30) berbaris menggambarkan permintaan pembeli (ref_demand & x).
 */

"use client";

import React, { useMemo } from "react";
import { HotspotMesh } from "./HotspotMesh";
import type { KedaiVisualMapping } from "@/lib/stage/mapping";
import { formatNumber } from "@/lib/format";
import { useSimulation } from "@/lib/store/simulation-context";

interface CustomerQueueProps {
  mapping: KedaiVisualMapping;
}

export function CustomerQueue({ mapping }: CustomerQueueProps) {
  const { params } = useSimulation();

  // Susunan posisi antrean pelanggan
  const customers = useMemo(() => {
    const list = [];
    const count = Math.min(mapping.customerCount, 30);
    for (let i = 0; i < count; i++) {
      // Baris antre melengkung dari luar pintu menuju konter
      const t = i / 12;
      const x = 3.2 + Math.sin(t * 1.5) * 0.4;
      const z = -0.8 + i * 0.35;
      list.push({ id: i, pos: [x, 0, z] as [number, number, number] });
    }
    return list;
  }, [mapping.customerCount]);

  return (
    <HotspotMesh
      hotspotKey="ref_demand"
      position={[3.2, 0, 0.5]}
      tagOffset={[0, 2.2, 0]}
      label="Pembeli Acuan"
      valueDisplay={`${formatNumber(params.ref_demand)} cangkir`}
      ariaLabel={`Pintu masuk dan antrean pelanggan: perkiraan pembeli ${formatNumber(params.ref_demand)} cangkir per hari. Klik untuk mengubah.`}
    >
      <group>
        {/* Kusen Pintu Masuk Kedai */}
        <group position={[3.3, 0, -1.2]}>
          {/* Tiang Pintu Kiri & Kanan */}
          <mesh position={[-0.45, 1.25, 0]} castShadow>
            <boxGeometry args={[0.08, 2.5, 0.1]} />
            <meshStandardMaterial color="#382618" roughness={0.7} />
          </mesh>
          <mesh position={[0.45, 1.25, 0]} castShadow>
            <boxGeometry args={[0.08, 2.5, 0.1]} />
            <meshStandardMaterial color="#382618" roughness={0.7} />
          </mesh>
          {/* Ambang Atas Pintu */}
          <mesh position={[0, 2.45, 0]} castShadow>
            <boxGeometry args={[1.0, 0.1, 0.12]} />
            <meshStandardMaterial color="#382618" roughness={0.7} />
          </mesh>
        </group>

        {/* Sosok Kapsul Pelanggan yang Antre */}
        {customers.map((c, idx) => {
          // Warna pakaian bervariasi harmonis
          const colors = ["#81b29a", "#f2cc8f", "#e07a5f", "#c8b8a8", "#f4ede2"];
          const bodyColor = colors[idx % colors.length];

          return (
            <group key={c.id} position={c.pos}>
              {/* Badan Kapsul Pelanggan */}
              <mesh position={[0, 0.65, 0]} castShadow>
                <cylinderGeometry args={[0.13, 0.15, 0.7, 12]} />
                <meshStandardMaterial color={bodyColor} roughness={0.7} />
              </mesh>
              {/* Kepala Pelanggan */}
              <mesh position={[0, 1.15, 0]} castShadow>
                <sphereGeometry args={[0.12, 12, 12]} />
                <meshStandardMaterial color="#f4ede2" roughness={0.6} />
              </mesh>
            </group>
          );
        })}
      </group>
    </HotspotMesh>
  );
}
