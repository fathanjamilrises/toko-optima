/**
 * CashRegisterTable.tsx — Meja kasir, tumpukan tagihan (fixed_cost), dan koin laba / struk rugi.
 * Menggambarkan modal tetap harian dan hasil keuntungan finansial kedai.
 */

"use client";

import React from "react";
import { HotspotMesh } from "./HotspotMesh";
import type { KedaiVisualMapping } from "@/lib/stage/mapping";
import { formatRupiah } from "@/lib/format";
import { useSimulation } from "@/lib/store/simulation-context";

interface CashRegisterTableProps {
  mapping: KedaiVisualMapping;
}

export function CashRegisterTable({ mapping }: CashRegisterTableProps) {
  const { params } = useSimulation();

  return (
    <HotspotMesh
      hotspotKey="fixed_cost"
      position={[1.5, 0, -0.6]}
      tagOffset={[0, 1.4, 0]}
      label="Sewa & Gaji"
      valueDisplay={formatRupiah(params.fixed_cost)}
      ariaLabel={`Meja kasir dan tagihan tetap: biaya sewa dan operasional harian ${formatRupiah(params.fixed_cost)}. Klik untuk mengubah.`}
    >
      <group>
        {/* Meja Kasir Kayu Membulat */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.9, 0.8]} />
          <meshStandardMaterial color="#4a3525" roughness={0.6} />
        </mesh>

        {/* Daun Meja Lebih Lebar dengan Lis Kayu Halus */}
        <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.06, 0.9]} />
          <meshStandardMaterial color="#5c3d28" roughness={0.5} />
        </mesh>
        {/* Lis Aksen Muka Meja Kasir */}
        <mesh position={[0, 0.45, 0.41]}>
          <planeGeometry args={[1.1, 0.7]} />
          <meshStandardMaterial color="#3a2517" roughness={0.8} />
        </mesh>

        {/* Mesin Kasir POS Modern-Vintage */}
        <group position={[-0.25, 0.95, -0.05]}>
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.35, 0.24, 0.35]} />
            <meshStandardMaterial color="#2e2926" roughness={0.4} />
          </mesh>
          {/* Layar Terminal Kasir */}
          <mesh position={[0, 0.26, -0.05]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[0.26, 0.14, 0.03]} />
            <meshStandardMaterial color="#1a1816" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Tampilan Layar Kasir Bercahaya Lembut */}
          <mesh position={[0, 0.262, -0.032]} rotation={[-0.35, 0, 0]}>
            <planeGeometry args={[0.22, 0.1]} />
            <meshBasicMaterial color="#342820" />
          </mesh>
        </group>

        {/* Tumpukan Cangkir Take-away dengan Sleeve Karton Cokelat di Kasir */}
        <group position={[-0.45, 0.95, 0.2]}>
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.05, 0.26, 16]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.6} />
          </mesh>
          {/* Sleeve Karton Cokelat Penahan Panas */}
          <mesh position={[0, 0.13, 0]}>
            <cylinderGeometry args={[0.068, 0.057, 0.1, 16]} />
            <meshStandardMaterial color="#8a5b38" roughness={0.9} />
          </mesh>
          {/* Tutup Cangkir Hitam */}
          <mesh position={[0, 0.27, 0]}>
            <cylinderGeometry args={[0.068, 0.068, 0.02, 16]} />
            <meshStandardMaterial color="#1a1614" />
          </mesh>
        </group>

        {/* Tumpukan Tagihan Kertas (fixed_cost): makin tebal bila biaya tetap besar */}
        <group position={[0.25, 0.95, 0.15]}>
          <mesh
            position={[0, (mapping.billStackHeight * 0.2) / 2, 0]}
            rotation={[0, 0.1, 0]}
            castShadow
          >
            <boxGeometry args={[0.26, Math.max(mapping.billStackHeight * 0.2, 0.02), 0.35]} />
            <meshStandardMaterial color="#f4ede2" roughness={0.8} />
          </mesh>
        </group>

        {/* Tumpukan Koin Emas (Laba Bersih) atau Struk Merah (Bila Rugi) */}
        <group position={[0.25, 0.95, -0.15]}>
          {mapping.isReceiptRed ? (
            // Struk Merah bertumpuk (tanda rugi)
            <mesh position={[0, 0.06, 0]} rotation={[0, -0.15, 0]} castShadow>
              <boxGeometry args={[0.2, 0.12, 0.25]} />
              <meshStandardMaterial color="#d95d39" roughness={0.7} />
            </mesh>
          ) : (
            // Tumpukan Koin Emas
            <mesh
              position={[0, (mapping.coinStackHeight * 0.25) / 2, 0]}
              castShadow
            >
              <cylinderGeometry
                args={[
                  0.12,
                  0.12,
                  Math.max(mapping.coinStackHeight * 0.25, 0.03),
                  16,
                ]}
              />
              <meshStandardMaterial
                color="#f2cc8f"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          )}
        </group>
      </group>
    </HotspotMesh>
  );
}
