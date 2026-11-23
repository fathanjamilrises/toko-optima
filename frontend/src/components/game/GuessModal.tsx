/**
 * GuessModal.tsx — Modal "Tebak Dulu" khusus Level 2 (DESIGN.md 7.4).
 * Melatih intuisi pemain menebak jumlah cangkir sebelum kontrol slider dibuka.
 */

"use client";

import React, { useState } from "react";
import { Sparkles } from "lucide-react";

interface GuessModalProps {
  isOpen: boolean;
  onLockGuess: (guessedCups: number) => void;
}

export function GuessModal({ isOpen, onLockGuess }: GuessModalProps) {
  const [guessInput, setGuessInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(guessInput);
    if (!val || val <= 0) {
      setError("Masukkan perkiraan jumlah cangkir (misal: 65)");
      return;
    }
    setError(null);
    onLockGuess(val);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tebak dulu target penjualan"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-[#241e1b] border border-[#3d322c] rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center gap-2 mb-2 text-[#e07a5f]">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">
            Intuisi Bisnis
          </span>
        </div>

        <h3 className="text-lg font-serif font-bold text-[#f4ede2] mb-2">
          Menurut Anda, berapa cangkir yang harus terjual agar untung paling besar?
        </h3>

        <p className="text-xs text-[#c8b8a8] leading-relaxed mb-5">
          Di kedai ini ada biaya lembur jika memproduksi terlalu banyak cangkir. Uji insting Anda sebelum menggeser papan harga. Tebakan dalam rentang ±10% akan mendapatkan bonus +15 XP!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="500"
                placeholder="Contoh: 65"
                value={guessInput}
                onChange={(e) => {
                  setGuessInput(e.target.value);
                  setError(null);
                }}
                className="w-full h-12 rounded-xl bg-[#1a1614] border border-[#3d322c] focus:border-[#e07a5f] text-[#f4ede2] font-mono text-base px-4 outline-none transition-all"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#c8b8a8]">
                cangkir / hari
              </span>
            </div>
            {error && (
              <p className="text-xs text-[#d95d39] mt-1.5 font-mono">{error}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#e07a5f] hover:bg-[#f28e73] text-white font-medium text-sm transition-all shadow-md active:scale-98 cursor-pointer"
          >
            Kunci Tebakan & Mulai Geser
          </button>
        </form>
      </div>
    </div>
  );
}
