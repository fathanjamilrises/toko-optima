/**
 * ProfitHillScene.tsx — Adegan 3D Bukit Untung (DESIGN.md 6.4, P1).
 * Menggambarkan fungsi keuntungan secara plastisin taktil:
 * - Bentuk bukit dengan elevasi P(x), dipotong tegas di BEP (atas hijau, bawah merah).
 * - Cangkir di titik x terpilih yang miring mengikuti kemiringan turunan dP (maks ±25°).
 * - Pita Pemasukan R(x) dan Pengeluaran C(x) di latar belakang.
 * - Penanda titik puncak x*, gerbang impas, pagar kapasitas, dan rumah kondisi sekarang.
 * - Kontrol kamera: Tampak Miring vs Tampak Depan (2D) untuk tangkapan layar laporan.
 */

"use client";

import React, { useState, useMemo, useRef, useEffect, type ElementRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import { useSimulation } from "@/lib/store/simulation-context";
import { HillMesh } from "./HillMesh";
import { RevenueCostRibbons } from "./RevenueCostRibbons";
import { HillMarkers } from "./HillMarkers";
import { TiltingCup } from "./TiltingCup";
import { HillControlsBar, type CameraViewMode } from "./HillControlsBar";
import { formatNumber, formatRupiah } from "@/lib/format";
import type { CurvePoint } from "@/types/api";

function CameraController({
  viewMode,
  resetCount,
}: {
  viewMode: CameraViewMode;
  resetCount: number;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<ElementRef<typeof OrbitControls>>(null);

  useEffect(() => {
    if (viewMode === "depan") {
      camera.position.set(0, 1.8, 11);
      camera.lookAt(0, 1.8, 0);
    } else {
      camera.position.set(0, 3.2, 9.5);
      camera.lookAt(0, 1.6, 0);
    }
    camera.updateProjectionMatrix();
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 1.6, 0);
      controlsRef.current.update();
    }
  }, [viewMode, resetCount, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={0.05}
      minDistance={6}
      maxDistance={15}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.05}
      minAzimuthAngle={-Math.PI / 3}
      maxAzimuthAngle={Math.PI / 3}
    />
  );
}

export function ProfitHillScene() {
  const { data, mode } = useSimulation();
  const [viewMode, setViewMode] = useState<CameraViewMode>("miring");
  const [resetCount, setResetCount] = useState<number>(0);
  const [cupIndex, setCupIndex] = useState<number>(0);

  const points: CurvePoint[] = useMemo(
    () => data?.curves.points ?? [],
    [data?.curves.points]
  );

  // Inisialisasi cupIndex ke titik optimum jika ada
  useEffect(() => {
    if (data?.curves.markers.optimum && points.length > 0) {
      const optX = data.curves.markers.optimum.x;
      let closestIdx = 0;
      let minDiff = Infinity;
      points.forEach((p, idx) => {
        const diff = Math.abs(p.x - optX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setCupIndex(closestIdx);
    }
  }, [data?.curves.markers.optimum, points]);

  // Kalkulasi batas normalisasi linear visual (DESIGN.md 6.4 & Bagian 9)
  const { mapX, mapY, xMin, xMax, y0 } = useMemo(() => {
    if (points.length === 0) {
      return {
        mapX: (x: number) => x,
        mapY: (y: number) => y,
        xMin: 0,
        xMax: 100,
        y0: 0,
      };
    }

    const xs = points.map((p) => p.x);
    const profits = points.map((p) => p.P);
    const revenues = points.map((p) => p.R);
    const costs = points.map((p) => p.C);

    const xMinVal = Math.min(...xs);
    const xMaxVal = Math.max(...xs);

    // Ambil rentang minimum dan maksimum laba/pemasukan/biaya
    const allY = [...profits, ...revenues, ...costs];
    const pMinVal = Math.min(...allY);
    const pMaxVal = Math.max(...allY);

    const W = 10; // Lebar panggung [-5, +5]
    const H = 4.0; // Tinggi panggung [0, 4]

    const mX = (x: number) => {
      if (xMaxVal === xMinVal) return 0;
      return -W / 2 + ((x - xMinVal) / (xMaxVal - xMinVal)) * W;
    };

    const mY = (pVal: number) => {
      if (pMaxVal === pMinVal) return 0;
      return ((pVal - pMinVal) / (pMaxVal - pMinVal)) * H;
    };

    return {
      mapX: mX,
      mapY: mY,
      xMin: xMinVal,
      xMax: xMaxVal,
      y0: mY(0),
    };
  }, [points]);

  const activePoint = points[cupIndex] || points[0];
  const isOptimum = useMemo(() => {
    if (!data?.curves.markers.optimum || !activePoint) return false;
    return Math.abs(activePoint.x - data.curves.markers.optimum.x) < 2;
  }, [data?.curves.markers.optimum, activePoint]);

  if (!data || points.length === 0) {
    return (
      <div className="bento p-12 text-center text-[#c8b8a8] font-mono text-sm">
        Menunggu data kurva keuntungan...
      </div>
    );
  }

  const ariaDescription = `Visualisasi 3D Bukit Untung dari ${formatNumber(
    xMin
  )} hingga ${formatNumber(xMax)} cangkir. Titik puncak untung berada pada ${
    data.optimum.integer.x
  } cangkir dengan keuntungan ${formatRupiah(data.optimum.integer.profit)}.`;

  return (
    <div className="flex flex-col gap-4">
      {/* Container Kanvas 3D R3F */}
      <div
        className="relative w-full h-[460px] sm:h-[540px] bg-[#12100e] border border-[#3d322c] rounded-2xl overflow-hidden shadow-2xl"
        role="img"
        aria-label={ariaDescription}
      >
        <Canvas
          frameloop="demand"
          dpr={[1, 1.75]}
          camera={{ position: [0, 3.2, 9.5], fov: 45 }}
          shadows
        >
          {/* Pencahayaan Taktil Hangat */}
          <ambientLight intensity={0.7} color="#f4ede2" />
          <directionalLight
            position={[-5, 8, 6]}
            intensity={1.2}
            color="#fff6eb"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight
            position={[5, 4, -4]}
            intensity={0.4}
            color="#e07a5f"
          />

          {/* Kontrol Kamera Terarah */}
          <CameraController
            viewMode={viewMode}
            resetCount={resetCount}
          />

          {/* Lantai / Bidang Tanah Y=0 (Batas Balik Modal) */}
          <group position={[0, y0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[12, 6]} />
              <meshStandardMaterial
                color="#1a1614"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>
            <gridHelper
              args={[12, 12, "#3d322c", "#241e1b"]}
              position={[0, 0.01, 0]}
            />
          </group>

          {/* Geometri Bukit Untung Solid */}
          <HillMesh points={points} mapX={mapX} mapY={mapY} />

          {/* Pita Pemasukan & Pengeluaran 3D di Belakang */}
          <RevenueCostRibbons points={points} mapX={mapX} mapY={mapY} />

          {/* Penanda Puncak, BEP, Kapasitas, Kondisi Sekarang */}
          <HillMarkers
            curves={data.curves}
            mapX={mapX}
            mapY={mapY}
            mode={mode}
          />

          {/* Cangkir Penanda yang Miring Mengikuti Kemiringan dP */}
          {activePoint && (
            <TiltingCup
              position={[mapX(activePoint.x), mapY(activePoint.P) + 0.15, 0]}
              dP={activePoint.dP}
              xVal={activePoint.x}
              priceVal={activePoint.price}
              profitVal={activePoint.P}
              isPeak={isOptimum}
              mode={mode}
            />
          )}

          {/* Bayangan Kontak Halus pada Lantai */}
          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.6}
            scale={14}
            blur={1.5}
            far={6}
          />
        </Canvas>

        {/* Badge Info Edukasi di Sudut Atas */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none select-none bg-[#1a1614]/90 border border-[#3d322c] rounded-xl px-3 py-2">
          <div className="text-[11px] font-mono text-[#e07a5f] font-semibold">
            {mode === "akademik"
              ? "Kemiringan = Turunan P'(x)"
              : "Kemiringan Bukit = Laju Untung"}
          </div>
          <div className="text-[10px] text-[#c8b8a8] mt-0.5">
            {mode === "akademik"
              ? "Di puncak x*, garis singgung mendatar (P' = 0)"
              : "Di puncak, bukit mendatar dan cangkir berdiri tegak"}
          </div>
        </div>
      </div>

      {/* Kontrol Penelusuran dan Kamera */}
      <HillControlsBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onResetCamera={() => setResetCount((c) => c + 1)}
        points={points}
        currentIndex={cupIndex}
        onIndexChange={setCupIndex}
        mode={mode}
      />

      {/* Ringkasan Teks Aksesibel di Bawah 3D (DESIGN.md 6.7) */}
      <div className="p-4 bg-[#1a1614] border border-[#3d322c] rounded-xl text-xs text-[#c8b8a8] font-mono">
        <strong className="text-[#f4ede2]">Ringkasan Bukit: </strong>
        Puncak laba harian maksimum {formatRupiah(data.optimum.integer.profit)}{" "}
        tercapai saat menjual {data.optimum.integer.x} cangkir pada harga{" "}
        {formatRupiah(data.optimum.integer.price)}. Titik impas (balik modal){" "}
        mulai tercapai pada {data.curves.markers.break_even[0]?.x ?? "—"}{" "}
        cangkir.
      </div>
    </div>
  );
}
