/**
 * Chalkboard.tsx — Papan tulis kapur dinding belakang kedai.
 * Menggambar kurva laba mini dari data curves.points, garis batas impas (zero line),
 * bendera puncak optimum, serta teks ringkasan laba via CanvasTexture prosedural.
 */

"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { KedaiVisualMapping } from "@/lib/stage/mapping";

interface ChalkboardProps {
  mapping: KedaiVisualMapping;
}

export function Chalkboard({ mapping }: ChalkboardProps) {
  // Buat kanvas in-memory sekali
  const canvas = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
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

    const w = canvas.width;
    const h = canvas.height;

    // 1. Latar papan tulis gelap bertekstur
    ctx.fillStyle = "#181513";
    ctx.fillRect(0, 0, w, h);

    // Grid halus samar
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 1;
    for (let x = 40; x < w - 20; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, h - 30);
      ctx.stroke();
    }
    for (let y = 40; y < h - 30; y += 30) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    // 2. Header Papan Tulis
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillStyle = "#f4ede2";
    ctx.fillText("KURVA LABA BERSIH", 24, 28);

    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "#c8b8a8";
    ctx.fillText(`Maks: ${mapping.chalkboard.maxProfitText}`, w - 170, 28);

    // Batas area gambar grafik
    const plotX = 35;
    const plotY = 45;
    const plotW = w - 70;
    const plotH = h - 80;

    // Garis Sumbu Nol (Break-Even Line)
    const zeroY = plotY + plotH - mapping.chalkboard.zeroNormalizedY * plotH;
    if (zeroY >= plotY && zeroY <= plotY + plotH) {
      ctx.strokeStyle = "rgba(244, 237, 226, 0.25)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(plotX, zeroY);
      ctx.lineTo(plotX + plotW, zeroY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(244, 237, 226, 0.4)";
      ctx.font = "9px monospace";
      ctx.fillText("Rp0 (BEP)", plotX + 4, zeroY - 4);
    }

    // 3. Gambar Kurva Laba
    const pts = mapping.chalkboard.normalizedPoints;
    if (pts.length > 1) {
      ctx.strokeStyle = mapping.isProfitNegative ? "#d95d39" : "#f2cc8f";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.beginPath();

      pts.forEach((pt, i) => {
        const cx = plotX + pt.x * plotW;
        const cy = plotY + plotH - pt.y * plotH;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
    }

    // 4. Titik & Bendera Puncak (Optimum)
    const peak = mapping.chalkboard.peakNormalized;
    if (peak) {
      const px = plotX + peak.x * plotW;
      const py = plotY + plotH - peak.y * plotH;

      // Tiang & bendera puncak
      ctx.strokeStyle = "#e07a5f";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, py - 18);
      ctx.stroke();

      // Segitiga bendera
      ctx.fillStyle = "#e07a5f";
      ctx.beginPath();
      ctx.moveTo(px, py - 18);
      ctx.lineTo(px + 12, py - 13);
      ctx.lineTo(px, py - 8);
      ctx.closePath();
      ctx.fill();

      // Titik lingkaran
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Titik Posisi Saat Ini
    const cur = mapping.chalkboard.currentNormalized;
    if (cur) {
      const cx = plotX + cur.x * plotW;
      const cy = plotY + plotH - cur.y * plotH;

      ctx.fillStyle = "#81b29a";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#181513";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 6. Footer: Status Badge
    ctx.fillStyle = mapping.isProfitNegative ? "#d95d39" : "#2e1f1a";
    ctx.fillRect(plotX, h - 26, 120, 18);
    ctx.fillStyle = "#f4ede2";
    ctx.font = "bold 9px monospace";
    ctx.fillText(mapping.chalkboard.statusBadgeText, plotX + 8, h - 14);

    texture.needsUpdate = true;
  }, [canvas, texture, mapping]);

  return (
    <group position={[0, 2.7, -3.8]}>
      {/* Bingkai Kayu Papan */}
      <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.4, 0.08]} />
        <meshStandardMaterial color="#4a3525" roughness={0.7} />
      </mesh>

      {/* Permukaan Kapur dengan Tekstur Kanvas */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[4.0, 2.2]} />
        {texture && <meshBasicMaterial map={texture} />}
      </mesh>
    </group>
  );
}
