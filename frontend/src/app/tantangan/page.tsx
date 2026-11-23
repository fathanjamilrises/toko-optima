/**
 * page.tsx — Halaman Peta Jalur Tantangan (/tantangan).
 * Menampilkan daftar stasiun level 1–5 dan level bebas (DESIGN.md 3.3).
 */

import React from "react";
import { LevelMap } from "@/components/game/LevelMap";

export const metadata = {
  title: "Peta Tantangan — KopiOptima",
  description: "Jalur misi gamifikasi kalkulus diferensial pada kedai kopi UMKM.",
};

export default function TantanganMapPage() {
  return (
    <div className="page-shell min-h-[calc(100vh-80px)]">
      <LevelMap />
    </div>
  );
}
