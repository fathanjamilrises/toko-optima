/**
 * KedaiLighting.tsx — Pencahayaan procedural hangat untuk Diorama Kedai Langsung.
 * Kunci hangat dari kiri-atas, isi lembut dari kanan, kontur tipis, bayangan lantai.
 * Bebas unduhan HDRI eksternal (DESIGN.md 6.2).
 */

"use client";

import React from "react";
import { ContactShadows } from "@react-three/drei";

export function KedaiLighting() {
  return (
    <>
      {/* Cahaya lingkungan dasar */}
      <ambientLight intensity={0.65} color="#fff6ea" />

      {/* Kunci utama: hangat dari kiri-atas depan */}
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.2}
        color="#ffe8d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />

      {/* Cahaya pengisi lembut: agak sejuk/netral dari kanan-bawah */}
      <directionalLight position={[-6, 5, -4]} intensity={0.4} color="#dbe5eb" />

      {/* Rim light (kontur belakang) untuk menonjolkan tepi objek plastisin */}
      <directionalLight position={[0, 8, -8]} intensity={0.5} color="#e07a5f" />

      {/* Bayangan kontak halus pada lantai */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.45}
        scale={14}
        blur={2}
        far={6}
        color="#100b08"
      />
    </>
  );
}
