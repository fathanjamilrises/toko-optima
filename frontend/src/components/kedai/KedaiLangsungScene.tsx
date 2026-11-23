/**
 * KedaiLangsungScene.tsx — Scene 3D utama "Kedai Langsung" menggunakan React Three Fiber.
 * Memetakan seluruh parameter bisnis kopi ke objek interaktif 3D taktil bergaya tanah liat lembut.
 * Render hemat baterai dengan frameloop="demand", DPR [1, 1.75], bebas unduhan aset eksternal.
 */

"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { KedaiLighting } from "./KedaiLighting";
import { Chalkboard } from "./Chalkboard";
import { PriceBoard } from "./PriceBoard";
import { CashRegisterTable } from "./CashRegisterTable";
import { ShelvesAndStock } from "./ShelvesAndStock";
import { BaristaStation } from "./BaristaStation";
import { CustomerQueue } from "./CustomerQueue";
import { SurveyBoard } from "./SurveyBoard";
import { mapKedaiVisuals } from "@/lib/stage/mapping";
import { useSimulation } from "@/lib/store/simulation-context";

export default function KedaiLangsungScene() {
  const { params, data, viewState, selectedCurveIndex } = useSimulation();

  // Hitung pemetaan visual 3D dari fungsi murni mapping.ts
  const visualMapping = useMemo(() => {
    return mapKedaiVisuals(params, data, viewState, selectedCurveIndex);
  }, [params, data, viewState, selectedCurveIndex]);

  return (
    <div className="relative w-full h-[380px] sm:h-[480px] md:h-[580px] lg:h-[640px] bg-[#1a1614] rounded-2xl overflow-hidden border border-[#3d322c]">
      <Canvas
        camera={{ position: [9.2, 9.0, 9.8], fov: 40 }}
        dpr={[1, 1.75]}
        frameloop="demand"
        shadows
        role="img"
        aria-label={`Diorama 3D Kedai Kopi: Rekomendasi ${visualMapping.priceBoardSubtext} dengan harga ${visualMapping.priceBoardText}. Laba bersih ${visualMapping.chalkboard.maxProfitText}.`}
      >
        <KedaiLighting />

        {/* Orbit Controls Dibatasi (Azimuth ±15°, Polar terkunci, Zoom/Pan mati agar stabil) */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          target={[0, 0.4, 0]}
          minAzimuthAngle={Math.PI / 4 - 0.25}
          maxAzimuthAngle={Math.PI / 4 + 0.25}
          minPolarAngle={Math.PI / 3 - 0.15}
          maxPolarAngle={Math.PI / 3 + 0.15}
        />

        {/* --- LINGKUNGAN RUANG KEDAI TAKTIL & OTENTIK --- */}
        <group>
          {/* Lantai Diorama: Papan Kayu Parket Roastery Hangat (Plank Slats) */}
          <group position={[0, -0.01, 0]}>
            {[-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6].map((xOffset, idx) => {
              const plankColors = ["#2b1e17", "#33241b", "#2e2018", "#38281e", "#2f2119"];
              const color = plankColors[idx % plankColors.length];
              return (
                <mesh
                  key={idx}
                  position={[xOffset, -0.01, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  receiveShadow
                >
                  <planeGeometry args={[1.16, 12]} />
                  <meshStandardMaterial color={color} roughness={0.75} />
                </mesh>
              );
            })}
            {/* Dasar Lantai Pinggiran */}
            <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[13, 13]} />
              <meshStandardMaterial color="#191310" roughness={0.9} />
            </mesh>
          </group>

          {/* Dinding Belakang dengan Panel Kayu Bawah (Wainscoting) */}
          <group position={[0, 3.2, -4.0]}>
            {/* Dinding Atas Plester Hangat */}
            <mesh position={[0, 0.9, 0]} receiveShadow>
              <boxGeometry args={[10, 4.5, 0.2]} />
              <meshStandardMaterial color="#26201c" roughness={0.9} />
            </mesh>
            {/* Panel Kayu Bawah (Wainscot) */}
            <mesh position={[0, -1.8, 0.02]} receiveShadow>
              <boxGeometry args={[10, 2.8, 0.22]} />
              <meshStandardMaterial color="#382618" roughness={0.7} />
            </mesh>
            {/* Lis Kayu Pembatas Tengah */}
            <mesh position={[0, -0.38, 0.14]} castShadow>
              <boxGeometry args={[10.1, 0.08, 0.06]} />
              <meshStandardMaterial color="#4a3525" roughness={0.6} />
            </mesh>
          </group>

          {/* Dinding Kiri dengan Jendela Kayu Khas Roastery */}
          <group position={[-4.0, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}>
            <mesh receiveShadow>
              <boxGeometry args={[8, 6.5, 0.2]} />
              <meshStandardMaterial color="#26201c" roughness={0.9} />
            </mesh>
            {/* Panel Kayu Bawah Dinding Kiri */}
            <mesh position={[0, -1.8, 0.02]} receiveShadow>
              <boxGeometry args={[8, 2.8, 0.22]} />
              <meshStandardMaterial color="#382618" roughness={0.7} />
            </mesh>
          </group>

          {/* Kusen Jendela Kayu dengan Cahaya Siang Menembus */}
          <group position={[-3.88, 3.0, 0.8]} rotation={[0, Math.PI / 2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[2.6, 2.4, 0.1]} />
              <meshStandardMaterial color="#4a3525" roughness={0.7} />
            </mesh>
            {/* Kaca Jendela Hangat */}
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[2.3, 2.1]} />
              <meshStandardMaterial color="#f4ede2" roughness={0.2} transparent opacity={0.25} />
            </mesh>
            {/* Teralis Salib Kayu Jendela */}
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[0.06, 2.1, 0.04]} />
              <meshStandardMaterial color="#382618" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <boxGeometry args={[2.3, 0.06, 0.04]} />
              <meshStandardMaterial color="#382618" roughness={0.8} />
            </mesh>
          </group>

          {/* 2 Lampu Gantung Pendant Tembaga Vintage di Atas Bar */}
          <group position={[-0.4, 3.8, -0.6]}>
            {/* Kabel Gantung */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 1.2]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            {/* Kap Lampu Tembaga / Kuningan Hangat */}
            <mesh position={[0, -0.12, 0]} castShadow>
              <coneGeometry args={[0.26, 0.22, 16, 1, true]} />
              <meshStandardMaterial color="#d48c46" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Bohlam Menyala */}
            <mesh position={[0, -0.16, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#fff0d4" emissive="#ffe6b3" emissiveIntensity={1.2} />
            </mesh>
          </group>

          <group position={[1.4, 3.8, -0.6]}>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 1.2]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            <mesh position={[0, -0.12, 0]} castShadow>
              <coneGeometry args={[0.26, 0.22, 16, 1, true]} />
              <meshStandardMaterial color="#d48c46" metalness={0.6} roughness={0.3} />
            </mesh>
            <mesh position={[0, -0.16, 0]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#fff0d4" emissive="#ffe6b3" emissiveIntensity={1.2} />
            </mesh>
          </group>

          {/* Bangku Barstool Kayu untuk Pelanggan */}
          <group position={[0.4, 0, 0.5]}>
            {/* Dudukan Bulat Kayu */}
            <mesh position={[0, 0.58, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
              <meshStandardMaterial color="#5c3d28" roughness={0.6} />
            </mesh>
            {/* Kaki Bangku */}
            <mesh position={[-0.12, 0.28, -0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshStandardMaterial color="#1a1614" />
            </mesh>
            <mesh position={[0.12, 0.28, -0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            <mesh position={[-0.12, 0.28, 0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            <mesh position={[0.12, 0.28, 0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
          </group>

          <group position={[-0.6, 0, 0.5]}>
            <mesh position={[0, 0.58, 0]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
              <meshStandardMaterial color="#5c3d28" roughness={0.6} />
            </mesh>
            <mesh position={[-0.12, 0.28, -0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            <mesh position={[0.12, 0.28, -0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            <mesh position={[-0.12, 0.28, 0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
            <mesh position={[0.12, 0.28, 0.12]}>
              <cylinderGeometry args={[0.02, 0.02, 0.56]} />
              <meshBasicMaterial color="#1a1614" />
            </mesh>
          </group>

          {/* Tanaman Hijau dalam Pot Terakota di Sudut Dekat Jendela */}
          <group position={[-3.2, 0, 2.2]}>
            {/* Pot Terakota */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.26, 0.18, 0.6, 16]} />
              <meshStandardMaterial color="#c86446" roughness={0.8} />
            </mesh>
            {/* Tanah Hitam */}
            <mesh position={[0, 0.58, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.04, 16]} />
              <meshStandardMaterial color="#241912" roughness={0.9} />
            </mesh>
            {/* Daun-daun Hijau Monstera Taktil */}
            <mesh position={[0, 0.85, 0]} rotation={[0.2, 0.4, 0]} castShadow>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial color="#81b29a" roughness={0.6} />
            </mesh>
            <mesh position={[0.15, 0.75, 0.1]} rotation={[-0.2, 0.8, 0.3]} castShadow>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial color="#6a9b83" roughness={0.6} />
            </mesh>
            <mesh position={[-0.12, 0.78, -0.1]} rotation={[0.3, -0.5, -0.2]} castShadow>
              <sphereGeometry args={[0.19, 8, 8]} />
              <meshStandardMaterial color="#81b29a" roughness={0.6} />
            </mesh>
          </group>
        </group>

        {/* --- OBJEK DAN HOTSPOT INTERAKTIF --- */}
        <Chalkboard mapping={visualMapping} />
        <CashRegisterTable mapping={visualMapping} />
        <ShelvesAndStock mapping={visualMapping} />
        <BaristaStation mapping={visualMapping} />
        <CustomerQueue mapping={visualMapping} />
        <PriceBoard mapping={visualMapping} />
        <SurveyBoard />
      </Canvas>
    </div>
  );
}
