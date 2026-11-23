/**
 * BaristaStation.tsx — Mesin espresso, sosok barista kapsul, cangkir di konter,
 * dan pagar kapasitas (bila capacity terisi).
 * Mewakili parameter quad_cost (lembur) & capacity (batas dapur).
 */

"use client";

import React from "react";
import { HotspotMesh } from "./HotspotMesh";
import type { KedaiVisualMapping } from "@/lib/stage/mapping";
import { useSimulation } from "@/lib/store/simulation-context";

interface BaristaStationProps {
  mapping: KedaiVisualMapping;
}

export function BaristaStation({ mapping }: BaristaStationProps) {
  const { params } = useSimulation();

  return (
    <HotspotMesh
      hotspotKey="quad_cost"
      position={[-0.6, 0, -1.2]}
      tagOffset={[0, 1.8, 0]}
      label="Biaya Lembur"
      valueDisplay={params.quad_cost > 0 ? `c = ${params.quad_cost}` : "Tidak Ada"}
      ariaLabel={`Mesin espresso dan barista: biaya lembur kuadratik c=${params.quad_cost}. Klik untuk mengubah.`}
    >
      <group>
        {/* Meja Barista Kayu Solid dengan Lis Panel */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.9, 0.85]} />
          <meshStandardMaterial color="#3a271a" roughness={0.65} />
        </mesh>
        {/* Daun Meja Kayu Oak Hangat */}
        <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.06, 0.95]} />
          <meshStandardMaterial color="#543722" roughness={0.5} />
        </mesh>
        {/* Panel Aksen Tembaga di Muka Meja */}
        <mesh position={[0, 0.45, 0.43]}>
          <planeGeometry args={[1.5, 0.7]} />
          <meshStandardMaterial color="#2c1d13" roughness={0.8} />
        </mesh>

        {/* Mesin Espresso 2-Group Professional */}
        <group position={[0.15, 0.95, -0.05]}>
          {/* Bodi Utama Mesin Baja & Tembaga */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.75, 0.52, 0.48]} />
            <meshStandardMaterial color="#262220" metalness={0.5} roughness={0.35} />
          </mesh>
          {/* Panel Depan Terracotta / Karamel */}
          <mesh position={[0, 0.28, 0.245]}>
            <planeGeometry args={[0.66, 0.42]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.5} />
          </mesh>
          {/* Rak Pemanas Cangkir di Atas Mesin */}
          <mesh position={[0, 0.55, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.42]} />
            <meshStandardMaterial color="#403935" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Barisan Cangkir Espresso Keramik Hangat di Atas Mesin */}
          {[-0.22, -0.08, 0.08, 0.22].map((cx, i) => (
            <mesh key={i} position={[cx, 0.62, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.035, 0.08, 12]} />
              <meshStandardMaterial color={i % 2 === 0 ? "#f4ede2" : "#f2cc8f"} roughness={0.5} />
            </mesh>
          ))}

          {/* Drip Tray Logam di Bawah */}
          <mesh position={[0, 0.03, 0.28]}>
            <boxGeometry args={[0.65, 0.04, 0.16]} />
            <meshStandardMaterial color="#38322e" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Portafilter Kiri & Kanan */}
          <mesh position={[-0.15, 0.14, 0.29]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16]} />
            <meshStandardMaterial color="#100b08" />
          </mesh>
          <mesh position={[0.15, 0.14, 0.29]} rotation={[0.4, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16]} />
            <meshStandardMaterial color="#100b08" />
          </mesh>

          {/* Steam Wand Baja Mengkilap di Sisi Kanan */}
          <mesh position={[0.34, 0.2, 0.24]} rotation={[0.2, 0, -0.3]}>
            <cylinderGeometry args={[0.012, 0.012, 0.22]} />
            <meshStandardMaterial color="#dbe5eb" metalness={0.9} roughness={0.1} />
          </mesh>

          {/* Pitcher Susu Stainless Steel Kecil di Drip Tray */}
          <mesh position={[0.26, 0.11, 0.28]} castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.11, 12]} />
            <meshStandardMaterial color="#dbe5eb" metalness={0.85} roughness={0.2} />
          </mesh>

          {/* Uap Lembur (bila lembur aktif / quad_cost > 0) */}
          {mapping.baristaBusyLevel > 0 && (
            <group position={[0, 0.68, 0.1]}>
              <mesh position={[-0.1, 0.06, 0]}>
                <sphereGeometry args={[0.07, 8, 8]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
              </mesh>
              <mesh position={[0.08, 0.16, 0]}>
                <sphereGeometry args={[0.09, 8, 8]} />
                <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
              </mesh>
            </group>
          )}
        </group>

        {/* Mesin Grinder Biji Kopi di Samping Espresso Machine */}
        <group position={[-0.45, 0.95, -0.1]}>
          {/* Bodi Silinder Grinder */}
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.38, 16]} />
            <meshStandardMaterial color="#1f1a17" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* Corong Hopper Bening di Atas */}
          <mesh position={[0, 0.44, 0]}>
            <coneGeometry args={[0.13, 0.16, 16]} />
            <meshStandardMaterial color="#a89888" transparent opacity={0.45} roughness={0.2} />
          </mesh>
          {/* Biji Kopi Sangrai di Dalam Hopper */}
          <mesh position={[0, 0.41, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#3e2718" roughness={0.9} />
          </mesh>
        </group>

        {/* Sosok Barista Kapsul Tanah Liat */}
        <group position={[-0.45, 0, -0.6]}>
          {/* Badan Barista */}
          <mesh position={[0, 0.85, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.24, 0.9, 16]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.8} />
          </mesh>
          {/* Celemek / Apron Cokelat */}
          <mesh position={[0, 0.85, 0.05]}>
            <cylinderGeometry args={[0.205, 0.245, 0.75, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#4a3525" roughness={0.8} />
          </mesh>
          {/* Kepala Barista */}
          <mesh position={[0, 1.45, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.7} />
          </mesh>
          {/* Topi Beanie Barista */}
          <mesh position={[0, 1.58, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.17, 0.1, 16]} />
            <meshStandardMaterial color="#1a1614" roughness={0.9} />
          </mesh>
        </group>

        {/* Tumpukan Cangkir di Konter Barista */}
        <group position={[-0.5, 0.95, 0.15]}>
          <mesh position={[0, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.2, 12]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.6} />
          </mesh>
          <mesh position={[0.18, 0.1, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.2, 12]} />
            <meshStandardMaterial color="#e07a5f" roughness={0.6} />
          </mesh>
        </group>

        {/* Pagar Kapasitas Rendah di Depan Konter (Muncul hanya bila capacity aktif) */}
        {mapping.hasCapacityFence && (
          <group position={[0, 0.96, 0.42]}>
            {/* Tiang Pagar Kiri, Tengah, Kanan */}
            <mesh position={[-0.7, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.3]} />
              <meshStandardMaterial color="#d95d39" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.3]} />
              <meshStandardMaterial color="#d95d39" roughness={0.4} />
            </mesh>
            <mesh position={[0.7, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.3]} />
              <meshStandardMaterial color="#d95d39" roughness={0.4} />
            </mesh>
            {/* Batang Rel Horizontal */}
            <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 1.45]} />
              <meshStandardMaterial color="#d95d39" roughness={0.4} />
            </mesh>
          </group>
        )}
      </group>
    </HotspotMesh>
  );
}
