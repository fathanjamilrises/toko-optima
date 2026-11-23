/**
 * PriceBoard.tsx — Papan harga kayu berdiri (standing board) di depan kedai.
 * Menampilkan harga jual yang aktif, cangkir terpilih, dan hotspot ref_price.
 * Di keadaan "Atur sendiri", papan menjadi fokus interaksi penyesuaian harga.
 */

"use client";

import React, { useMemo, useEffect } from "react";
import * as THREE from "three";
import { HotspotMesh } from "./HotspotMesh";
import type { KedaiVisualMapping } from "@/lib/stage/mapping";
import { useSimulation } from "@/lib/store/simulation-context";

interface PriceBoardProps {
  mapping: KedaiVisualMapping;
}

export function PriceBoard({ mapping }: PriceBoardProps) {
  const { viewState } = useSimulation();

  // Kanvas tekstur kapur tulisan tangan pada papan harga
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 320;
    return c;
  }, []);

  const texture = useMemo(() => {
    if (!canvas) return null;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [canvas]);

  useEffect(() => {
    if (!canvas || !texture) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Latar hitam papan kapur
    ctx.fillStyle = "#181412";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Garis bingkai kapur
    ctx.strokeStyle = "rgba(244, 237, 226, 0.4)";
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    // Judul Menu
    ctx.font = "bold 20px serif";
    ctx.fillStyle = "#f2cc8f";
    ctx.textAlign = "center";
    ctx.fillText("MENU KEDAI", canvas.width / 2, 50);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#f4ede2";
    ctx.fillText("Kopi Susu Aren", canvas.width / 2, 85);

    // Garis batas kapur
    ctx.strokeStyle = "rgba(244, 237, 226, 0.3)";
    ctx.beginPath();
    ctx.moveTo(35, 105);
    ctx.lineTo(canvas.width - 35, 105);
    ctx.stroke();

    // Harga yang sedang aktif
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#e07a5f";
    ctx.fillText(mapping.priceBoardText, canvas.width / 2, 150);

    ctx.font = "13px monospace";
    ctx.fillStyle = "#c8b8a8";
    ctx.fillText(mapping.priceBoardSubtext, canvas.width / 2, 182);

    // Sketsa cangkir kopi kapur di bawah
    ctx.strokeStyle = "#f4ede2";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(canvas.width / 2 - 25, 215, 50, 36, [0, 0, 8, 8]);
    ctx.stroke();

    // Gagang cangkir
    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 25, 233, 10, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Uap kopi halus
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(244, 237, 226, 0.6)";
    ctx.fillText("~ Fresh Brew ~", canvas.width / 2, 285);

    texture.needsUpdate = true;
  }, [canvas, texture, mapping.priceBoardText, mapping.priceBoardSubtext]);

  return (
    <HotspotMesh
      hotspotKey="ref_price"
      position={[2.4, 0, 2.0]}
      tagOffset={[0, 1.6, 0]}
      label="Harga Menu"
      valueDisplay={mapping.priceBoardText}
      ariaLabel={`Papan harga di depan kedai: harga saat ini ${mapping.priceBoardText}. Klik untuk mengubah.`}
    >
      <group rotation={[0, -0.3, 0]}>
        {/* Kaki Kuda-Kuda Kayu Belakang */}
        <mesh position={[0, 0.65, -0.25]} rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.4]} />
          <meshStandardMaterial color="#4a3525" roughness={0.7} />
        </mesh>

        {/* Kaki Kuda-Kuda Depan Kiri & Kanan */}
        <mesh position={[-0.35, 0.65, 0.08]} rotation={[-0.1, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.4]} />
          <meshStandardMaterial color="#4a3525" roughness={0.7} />
        </mesh>
        <mesh position={[0.35, 0.65, 0.08]} rotation={[-0.1, 0, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 1.4]} />
          <meshStandardMaterial color="#4a3525" roughness={0.7} />
        </mesh>

        {/* Bingkai Papan Kayu */}
        <mesh position={[0, 0.95, 0]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[0.9, 1.1, 0.06]} />
          <meshStandardMaterial color="#382618" roughness={0.65} />
        </mesh>

        {/* Muka Papan Tulis Hitam dengan Tekstur Kapur Asli */}
        <mesh position={[0, 0.95, 0.035]} rotation={[-0.1, 0, 0]}>
          <planeGeometry args={[0.78, 0.96]} />
          {texture ? (
            <meshBasicMaterial map={texture} />
          ) : (
            <meshStandardMaterial color="#1f1b18" roughness={0.8} />
          )}
        </mesh>

        {/* Indikator "Atur Sendiri" visual */}
        {viewState === "atur_sendiri" && (
          <mesh position={[0, 1.55, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.08, 0.15, 4]} />
            <meshStandardMaterial color="#e07a5f" emissive="#e07a5f" emissiveIntensity={0.5} />
          </mesh>
        )}
      </group>
    </HotspotMesh>
  );
}
