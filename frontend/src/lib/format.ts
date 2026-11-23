/**
 * format.ts — Pemformatan angka, Rupiah, dan CSV untuk KopiOptima.
 * Mengikuti konvensi Bahasa Indonesia (titik untuk ribuan, koma untuk desimal).
 * Sumber kebenaran: PRD Bagian 4 & DESIGN Bagian 9.
 */

export function formatNumber(value: number | null | undefined, maxDecimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return "-";
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function formatRupiah(value: number | null | undefined, withPrefix = true, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return "-";
  const isNegative = value < 0;
  const absVal = Math.abs(value);
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(absVal);

  if (withPrefix) {
    return isNegative ? `-Rp${formatted}` : `Rp${formatted}`;
  }
  return isNegative ? `-${formatted}` : formatted;
}

export function parseNumberInput(raw: string): number {
  if (!raw) return 0;
  // Hapus "Rp", spasi, dan titik ribuan, ganti koma dengan titik
  const sanitized = raw.replace(/[^0-9,-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(sanitized);
  return isNaN(num) ? 0 : num;
}
