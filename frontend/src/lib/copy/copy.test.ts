import { describe, expect, it } from "vitest";
import { awam } from "./awam";
import { akademik } from "./akademik";

const forbiddenAwamWords = ["turunan", "titik kritis", "diskriminan", "elastisitas", "marginal", "optimum", "optimal"];

function extractStrings(obj: unknown): string[] {
  if (typeof obj === "string") return [obj];
  if (typeof obj === "function") {
    try {
      const fn = obj as (...args: unknown[]) => unknown;
      const res = fn("10", "20");
      if (typeof res === "string") return [res];
    } catch {
      return [];
    }
  }
  if (typeof obj === "object" && obj !== null) {
    return Object.values(obj).flatMap(extractStrings);
  }
  return [];
}

describe("copy mode awam", () => {
  it("tidak memakai istilah kalkulus terlarang pada seluruh kamus awam", () => {
    const strings = extractStrings(awam);
    const source = strings.join(" ").toLocaleLowerCase("id-ID");
    forbiddenAwamWords.forEach((word) => {
      expect(source).not.toContain(word);
    });
  });

  it("memiliki paritas kunci teratas antara awam dan akademik", () => {
    const awamKeys = Object.keys(awam).sort();
    const akademikKeys = Object.keys(akademik).sort();
    expect(awamKeys).toEqual(akademikKeys);
  });
});
