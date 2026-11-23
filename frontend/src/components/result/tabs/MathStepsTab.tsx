/**
 * MathStepsTab.tsx — Accordion 16 Langkah Solusi Matematis dengan KaTeX.
 * Mengimplementasikan:
 * - 16 langkah terstruktur dari respons API steps[]
 * - Render rumus LaTeX dengan KaTeX dan fallback teks murni
 * - Tombol "Salin LaTeX" per langkah
 * - Buka/tutup interaktif per langkah
 */

"use client";

import React, { useState } from "react";
import katex from "katex";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";

function LatexView({ formula }: { formula: string }) {
  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true,
    });
    return <div dangerouslySetInnerHTML={{ __html: html }} className="overflow-x-auto py-1" />;
  } catch {
    return <pre className="font-mono text-xs text-[var(--accent)] p-2 bg-[var(--bg-base)]">{formula}</pre>;
  }
}

export function MathStepsTab() {
  const { result, copy } = useSimulation();
  const [openStepIds, setOpenStepIds] = useState<number[]>([1, 7, 8, 16]); // Buka beberapa langkah kunci secara default
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const steps = result?.steps ?? [];

  const toggleStep = (id: number) => {
    setOpenStepIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (openStepIds.length === steps.length) {
      setOpenStepIds([]);
    } else {
      setOpenStepIds(steps.map((s) => s.id));
    }
  };

  const handleCopyLatex = async (id: number, latex: string) => {
    try {
      await navigator.clipboard.writeText(latex);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col gap-5" data-testid="math-steps-tab">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-base text-[var(--text-1)] m-0">
            {copy.math.title}
          </h4>
          <p className="text-xs text-[var(--text-2)] m-0">
            {copy.math.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="button-secondary text-xs py-1.5 px-3 min-h-[36px] cursor-pointer"
        >
          {openStepIds.length === steps.length ? "Tutup Semua" : "Buka Semua"}
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {steps.map((step) => {
          const isOpen = openStepIds.includes(step.id);
          const isCopied = copiedId === step.id;

          return (
            <div
              key={step.id}
              className="bento overflow-hidden border border-[var(--line)] transition-colors"
            >
              {/* Header Accordion Step */}
              <button
                type="button"
                onClick={() => toggleStep(step.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--bg-raised)]/50 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--bg-raised)] border border-[var(--line)] font-mono text-xs font-bold text-[var(--accent)]">
                    {step.id}
                  </span>
                  <span className="font-semibold text-sm text-[var(--text-1)]">
                    {step.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[var(--text-3)]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[var(--text-3)]" />
                )}
              </button>

              {/* Isi Langkah */}
              {isOpen && (
                <div className="p-4 pt-1 border-t border-[var(--line)]/50 bg-[var(--bg-base)]/40 flex flex-col gap-3">
                  {/* KaTeX Equation */}
                  <div className="p-3 rounded-xl bg-[var(--bg-base)] border border-[var(--line)] flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[var(--text-3)]">
                        Rumus LaTeX:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyLatex(step.id, step.latex)}
                        className="text-xs text-[var(--text-2)] hover:text-[var(--text-1)] flex items-center gap-1 cursor-pointer p-1"
                        title="Salin rumus LaTeX"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-[var(--profit)]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{isCopied ? copy.math.copiedLatex : copy.math.btnCopyLatex}</span>
                      </button>
                    </div>

                    <LatexView formula={step.latex} />
                  </div>

                  {/* Penjelasan Langkah */}
                  <p className="text-xs text-[var(--text-2)] leading-relaxed m-0 font-sans">
                    {step.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
