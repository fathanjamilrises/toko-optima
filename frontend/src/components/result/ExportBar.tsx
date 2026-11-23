/**
 * ExportBar.tsx — Ekspor hasil kalkulasi ke berkas JSON dan CSV.
 * Berjalan sepenuhnya di sisi klien dari data respons API.
 */

"use client";

import React, { useState } from "react";
import { Download, FileJson, FileSpreadsheet, Check } from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";

export function ExportBar() {
  const { result, params, copy } = useSimulation();
  const [downloadedJson, setDownloadedJson] = useState(false);
  const [downloadedCsv, setDownloadedCsv] = useState(false);

  const handleDownloadJson = () => {
    if (!result) return;
    const exportData = {
      timestamp: new Date().toISOString(),
      inputParams: params,
      optimizationResult: result,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `kopioptima-hasil-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    setDownloadedJson(true);
    setTimeout(() => setDownloadedJson(false), 2000);
  };

  const handleDownloadCsv = () => {
    if (!result?.curves?.points) return;
    const headers = ["x", "price", "revenue", "cost", "profit", "marginal_revenue", "marginal_cost", "dprofit"];
    const rows = result.curves.points.map((p) => [
      p.x,
      p.price,
      p.R,
      p.C,
      p.P,
      p.MR,
      p.MC,
      p.dP,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `kopioptima-kurva-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    setDownloadedCsv(true);
    setTimeout(() => setDownloadedCsv(false), 2000);
  };

  return (
    <div className="bento p-4 flex items-center justify-between flex-wrap gap-3 text-xs" data-testid="export-bar">
      <div className="flex items-center gap-2">
        <Download className="w-4 h-4 text-[var(--accent)]" />
        <span className="font-medium text-[var(--text-1)]">
          Ekspor Dokumen Laporan:
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadJson}
          className="button-secondary py-1.5 px-3 min-h-[36px] flex items-center gap-1.5 cursor-pointer"
        >
          {downloadedJson ? (
            <Check className="w-3.5 h-3.5 text-[var(--profit)]" />
          ) : (
            <FileJson className="w-3.5 h-3.5 text-[var(--text-2)]" />
          )}
          <span>{downloadedJson ? "JSON Terunduh!" : copy.export.btnJson}</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="button-secondary py-1.5 px-3 min-h-[36px] flex items-center gap-1.5 cursor-pointer"
        >
          {downloadedCsv ? (
            <Check className="w-3.5 h-3.5 text-[var(--profit)]" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--text-2)]" />
          )}
          <span>{downloadedCsv ? "CSV Terunduh!" : copy.export.btnCsv}</span>
        </button>
      </div>
    </div>
  );
}
