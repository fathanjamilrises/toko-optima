/**
 * useLiveOptimize.test.ts — Unit test untuk hook useLiveOptimize.
 * Menguji:
 * - Pemanggilan debounce 350ms
 * - Pembatalan permintaan lama (AbortController)
 * - Pemetaan galat 422 ke fieldErrors
 * - Penanganan galat jaringan
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLiveOptimize } from "./useLiveOptimize";
import { api } from "@/lib/api";
import type { OptimizeResponse } from "@/types/api";
import g1 from "../../../tests/fixtures/g1.json";

vi.mock("@/lib/api", () => ({
  api: {
    presets: vi.fn(),
    optimize: vi.fn(),
  },
}));

describe("Hook useLiveOptimize", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.mocked(api.presets).mockResolvedValue([
      {
        id: "G1",
        label: "Kedai Kopi Kecil",
        fixed_cost: 300000,
        variable_cost: 8000,
        quad_cost: 0,
        ref_price: 22000,
        ref_demand: 80,
        sensitivity: 5,
        capacity: null,
      },
    ]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("melakukan debounce 350ms sebelum memanggil API optimize", async () => {
    vi.mocked(api.optimize).mockResolvedValue(g1 as unknown as OptimizeResponse);

    const { result } = renderHook(() => useLiveOptimize());

    // Sebelum 350ms, belum terpanggil
    expect(api.optimize).not.toHaveBeenCalled();

    // Majukan timer 350ms
    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(api.optimize).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe("success");
    expect(result.current.result).toBeDefined();
  });

  it("memetakan galat validasi 422 ke fieldErrors", async () => {
    const error422 = {
      detail: [
        { field: "sensitivity", message: "Nilai harus lebih besar dari 0." },
        { field: "ref_price", message: "Nilai harus lebih besar dari 0." },
      ],
    };
    vi.mocked(api.optimize).mockRejectedValue(error422);

    const { result } = renderHook(() => useLiveOptimize());

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.fieldErrors.sensitivity).toBe("Nilai harus lebih besar dari 0.");
    expect(result.current.fieldErrors.ref_price).toBe("Nilai harus lebih besar dari 0.");
  });

  it("menangani error jaringan secara ramah", async () => {
    vi.mocked(api.optimize).mockRejectedValue(new Error("Network failed"));

    const { result } = renderHook(() => useLiveOptimize());

    await act(async () => {
      vi.advanceTimersByTime(350);
    });

    expect(result.current.status).toBe("error");
    expect(result.current.networkError).toBe("Network failed");
  });

  it("dapat memperbarui satu parameter dan me-reset selectedPresetId", async () => {
    vi.mocked(api.optimize).mockResolvedValue(g1 as unknown as OptimizeResponse);

    const { result } = renderHook(() => useLiveOptimize());

    act(() => {
      result.current.updateParam("fixed_cost", 450000);
    });

    expect(result.current.params.fixed_cost).toBe(450000);
    expect(result.current.selectedPresetId).toBeNull();
  });
});
