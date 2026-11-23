import { describe, it, expect } from "vitest";
import { formatNumber, formatRupiah, parseNumberInput } from "./format";

describe("format.ts", () => {
  it("formatNumber memformat ribuan dengan titik", () => {
    expect(formatNumber(1000)).toBe("1.000");
    expect(formatNumber(825000)).toBe("825.000");
    expect(formatNumber(75.5, 1)).toBe("75,5");
    expect(formatNumber(null)).toBe("-");
  });

  it("formatRupiah memformat mata uang IDR dengan awalan Rp", () => {
    expect(formatRupiah(825000)).toBe("Rp825.000");
    expect(formatRupiah(-300000)).toBe("-Rp300.000");
    expect(formatRupiah(0)).toBe("Rp0");
    expect(formatRupiah(null)).toBe("-");
  });

  it("parseNumberInput mengurai input string ke angka float", () => {
    expect(parseNumberInput("Rp300.000")).toBe(300000);
    expect(parseNumberInput("8.000,5")).toBe(8000.5);
    expect(parseNumberInput("")).toBe(0);
  });
});
