/**
 * DataTableTab.tsx — Tabel Data per +-10 cangkir & Ekspor CSV.
 * Menampilkan data kurva dari API dan menyediakan fitur unduh berkas CSV di sisi klien.
 */

"use client";

import React, { useState } from "react";
import { Download, Check } from "lucide-react";
import { useSimulation } from "@/lib/store/simulation-context";
import { formatNumber, formatRupiah } from "@/lib/format";

export function DataTableTab() {
  const { result, copy } = useSimulation();
  const [downloaded, setDownloaded] = useState(false);

  const points = result?.curves?.points ?? [];

  // Filter titik untuk kelipatan 10 cangkir (atau titik terdekat)
  const sampledPoints = points.filter((p, index) => {
    const isStep10 = Math.round(p.x) % 10 === 0;
    return isStep10 || index === 0 || index === points.length - 1;
  });

  const tableData = sampledPoints.length > 5 ? sampledPoints : points;

  const handleDownloadCsv = () => {
    const headers = ["Cangkir (x)", "Harga (Rp)", "Pemasukan R(x)", "Pengeluaran C(x)", "Untung P(x)"];
    const rows = tableData.map((row) => [
      row.x,
      Math.round(row.price),
      Math.round(row.R),
      Math.round(row.C),
      Math.round(row.P),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `kopioptima-tabel-data-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="bento p-6 flex flex-col gap-5" data-testid="data-table-tab">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold text-base text-[var(--text-1)] m-0">
            {copy.table.title}
          </h4>
          <p className="text-xs text-[var(--text-2)] m-0">
            {copy.table.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="button-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
        >
          {downloaded ? (
            <Check className="w-3.5 h-3.5 text-[var(--profit)]" />
          ) : (
            <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
          )}
          <span>{downloaded ? "CSV Terunduh!" : copy.table.btnDownloadCsv}</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-[var(--bg-surface)] border-b border-[var(--line)] shadow-sm">
            <tr className="text-[var(--text-3)]">
              <th className="py-2.5 px-3 font-medium">{copy.table.colCups}</th>
              <th className="py-2.5 px-3 font-medium text-right">{copy.table.colPrice}</th>
              <th className="py-2.5 px-3 font-medium text-right">{copy.table.colRevenue}</th>
              <th className="py-2.5 px-3 font-medium text-right">{copy.table.colCost}</th>
              <th className="py-2.5 px-3 font-medium text-right">{copy.table.colProfit}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => {
              const isProfitPositive = row.P >= 0;
              return (
                <tr
                  key={idx}
                  className="border-b border-[var(--line)]/40 hover:bg-[var(--bg-raised)]/60 transition-colors"
                >
                  <td className="py-2.5 px-3 text-[var(--text-1)] font-bold">
                    {formatNumber(row.x)} cangkir
                  </td>
                  <td className="py-2.5 px-3 text-right text-[var(--text-2)]">
                    {formatRupiah(row.price)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[var(--revenue)]">
                    {formatRupiah(row.R)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-[var(--cost)]">
                    {formatRupiah(row.C)}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      isProfitPositive ? "text-[var(--profit)]" : "text-[var(--loss)]"
                    }`}
                  >
                    {formatRupiah(row.P)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
