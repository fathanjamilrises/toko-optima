/**
 * TiltingCup.tsx — Model cangkir 3D di atas Bukit Untung.
 * Miring mengikuti kemiringan turunan dP (maks ±25°), tegak lurus di titik puncak.
 * Mengimplementasikan momen edukasi kalkulus: Kemiringan = Turunan (DESIGN.md 6.4, Mikro-interaksi #5).
 */

"use client";

import React, { useMemo } from "react";
import { Html } from "@react-three/drei";
import type { LanguageMode } from "@/lib/copy";
import { formatNumber, formatRupiah } from "@/lib/format";

interface TiltingCupProps {
  position: [number, number, number];
  dP: number; // Nilai kemiringan / turunan pada titik ini
  xVal: number;
  priceVal: number;
  profitVal: number;
  isPeak: boolean;
  mode: LanguageMode;
}

export function TiltingCup({
  position,
  dP,
  xVal,
  priceVal,
  profitVal,
  isPeak,
  mode,
}: TiltingCupProps) {
  // Hitung sudut kemiringan cangkir (maks ±25 derajat = ±0.436 radian)
  const tiltAngle = useMemo(() => {
    if (isPeak || Math.abs(dP) < 100) return 0;
    // Normalisasi kemiringan dP (-10000..+10000 dipetakan ke ±0.43 rad)
    const normalized = Math.max(-1, Math.min(1, dP / 5000));
    return -normalized * 0.436; // minus agar miring searah tanjakan kurva
  }, [dP, isPeak]);

  return (
    <group position={position}>
      {/* Grup Cangkir dengan Rotasi Kemiringan */}
      <group rotation={[0, 0, tiltAngle]}>
        {/* Badan Cangkir Low-Poly Plastisin */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.38, 16]} />
          <meshStandardMaterial color="#f4ede2" roughness={0.6} />
        </mesh>

        {/* Isi Kopi Cair di Dalam Cangkir */}
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 16]} />
          <meshStandardMaterial color="#3e2723" roughness={0.3} />
        </mesh>

        {/* Busa Latte Art Hati di Permukaan Kopi */}
        <mesh position={[0, 0.366, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#f4ede2" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.368, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.04, 16]} />
          <meshStandardMaterial color="#c48f65" roughness={0.7} />
        </mesh>

        {/* Gagang / Telinga Cangkir */}
        <mesh position={[0.24, 0.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.1, 0.035, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#f4ede2" roughness={0.6} />
        </mesh>

        {/* Uap Halus di Puncak (hanya bila di titik puncak keuntungan) */}
        {isPeak && (
          <group position={[0, 0.45, 0]}>
            <mesh position={[-0.04, 0.08, 0]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.4} />
            </mesh>
            <mesh position={[0.04, 0.16, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
            </mesh>
          </group>
        )}

        {/* Garis Singgung & Vektor Turunan (Hanya Mode Akademik) */}
        {mode === "akademik" && (
          <group position={[0, 0.2, 0.3]}>
            <mesh rotation={[0, 0, tiltAngle + Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 1.2]} />
              <meshBasicMaterial color="#e07a5f" />
            </mesh>
          </group>
        )}
      </group>

      {/* Label HTML Taktil Mengambang di Atas Cangkir */}
      <Html position={[0, 0.85, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
        <div className="bg-[#1a1614]/95 border border-[#e07a5f] rounded-xl px-2.5 py-1 text-center shadow-lg pointer-events-none select-none whitespace-nowrap">
          <div className="text-[10px] font-mono text-[#e07a5f] font-semibold">
            {formatNumber(Math.round(xVal))} cangkir · {formatRupiah(priceVal)}
          </div>
          <div
            className={`text-xs font-mono font-bold ${
              profitVal >= 0 ? "text-[#81b29a]" : "text-[#d95d39]"
            }`}
          >
            {formatRupiah(profitVal)}
          </div>
          {mode === "akademik" ? (
            <div className="text-[9px] font-mono text-[#c8b8a8] mt-0.5 border-t border-[#3d322c] pt-0.5">
              P&apos;(x) = {Math.round(dP)}
            </div>
          ) : (
            <div className="text-[9px] font-mono text-[#f2cc8f] mt-0.5 border-t border-[#3d322c] pt-0.5">
              {isPeak
                ? "Puncak (Tegak & Paling Untung)"
                : dP > 100
                ? "Lereng Naik: Menambah cangkir masih menaikkan untung"
                : "Lereng Turun: Menambah cangkir mengurangi untung"}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
