/**
 * useLiveOptimize.ts — Custom Hook untuk kalkulasi optimasi real-time.
 * - Debounce 350 ms
 * - AbortController untuk membatalkan request lama
 * - Pengambilan otomatis /presets & inisialisasi G1 (tanpa empty state)
 * - Pemetaan galat 422 ke fieldErrors
 * - Penanganan error jaringan secara ramah
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import type { OptimizeRequest, OptimizeResponse, Preset, ApiValidationError } from "@/types/api";

export const DEFAULT_G1_PARAMS: OptimizeRequest = {
  fixed_cost: 300000,
  variable_cost: 8000,
  quad_cost: 0,
  ref_price: 22000,
  ref_demand: 80,
  sensitivity: 5,
  capacity: null,
  options: {
    include_steps: true,
    include_curves: true,
    include_sensitivity: true,
    curve_points: 200,
  },
};

export type OptimizeStatus = "idle" | "loading" | "success" | "error";

export interface UseLiveOptimizeReturn {
  params: OptimizeRequest;
  result: OptimizeResponse | null;
  status: OptimizeStatus;
  fieldErrors: Record<string, string>;
  networkError: string | null;
  presets: Preset[];
  selectedPresetId: string | null;
  updateParam: <K extends keyof OptimizeRequest>(key: K, value: OptimizeRequest[K]) => void;
  setAllParams: (newParams: OptimizeRequest, presetId?: string | null) => void;
  applyPreset: (preset: Preset) => void;
  clearParams: () => void;
  retry: () => void;
}

export function useLiveOptimize(initialParams?: Partial<OptimizeRequest>): UseLiveOptimizeReturn {
  const [params, setParams] = useState<OptimizeRequest>({
    ...DEFAULT_G1_PARAMS,
    ...initialParams,
  });

  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [status, setStatus] = useState<OptimizeStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>("G1");

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ambil daftar preset saat inisialisasi
  useEffect(() => {
    let mounted = true;
    api.presets()
      .then((data) => {
        if (mounted && data && data.length > 0) {
          setPresets(data);
        }
      })
      .catch(() => {
        // Fallback jika API presets belum siap atau offline
        setPresets([
          {
            id: "G1",
            label: "Kedai Kopi Kecil (Baseline)",
            fixed_cost: 300000,
            variable_cost: 8000,
            quad_cost: 0,
            ref_price: 22000,
            ref_demand: 80,
            sensitivity: 5,
            capacity: null,
          },
          {
            id: "G2",
            label: "Kedai dengan Biaya Lembur",
            fixed_cost: 300000,
            variable_cost: 8000,
            quad_cost: 20,
            ref_price: 22000,
            ref_demand: 80,
            sensitivity: 5,
            capacity: null,
          },
          {
            id: "G3",
            label: "Kedai Kapasitas Terbatas",
            fixed_cost: 300000,
            variable_cost: 8000,
            quad_cost: 0,
            ref_price: 22000,
            ref_demand: 80,
            sensitivity: 5,
            capacity: 60,
          },
        ]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Eksekusi optimasi dengan AbortController
  const executeOptimize = useCallback(async (currentParams: OptimizeRequest) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStatus("loading");
    setNetworkError(null);

    try {
      const response = await api.optimize(
        {
          ...currentParams,
          options: {
            include_steps: true,
            include_curves: true,
            include_sensitivity: true,
            curve_points: 200,
          },
        },
        controller.signal
      );

      setResult(response);
      setStatus("success");
      setFieldErrors({});
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return; // Dibatalkan oleh permintaan yang lebih baru
      }

      setStatus("error");

      // Cek apakah error validasi 422
      if (err && typeof err === "object" && "detail" in err) {
        const valErr = err as ApiValidationError;
        const mappedErrors: Record<string, string> = {};
        if (Array.isArray(valErr.detail)) {
          valErr.detail.forEach((item) => {
            if (item.field) {
              mappedErrors[item.field] = item.message;
            }
          });
        }
        setFieldErrors(mappedErrors);
      } else {
        const message = err instanceof Error ? err.message : "Gagal menghubungi server";
        setNetworkError(message);
      }
    }
  }, []);

  // Debounce 350ms setiap kali params berubah
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeOptimize(params);
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [params, executeOptimize]);

  const updateParam = useCallback(
    <K extends keyof OptimizeRequest>(key: K, value: OptimizeRequest[K]) => {
      setSelectedPresetId(null); // Menandai bahwa nilai telah dikustomisasi
      setParams((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );

  const setAllParams = useCallback((newParams: OptimizeRequest, presetId: string | null = null) => {
    setSelectedPresetId(presetId);
    setParams(newParams);
  }, []);

  const applyPreset = useCallback((preset: Preset) => {
    setSelectedPresetId(preset.id);
    setParams({
      fixed_cost: preset.fixed_cost,
      variable_cost: preset.variable_cost,
      quad_cost: preset.quad_cost,
      ref_price: preset.ref_price,
      ref_demand: preset.ref_demand,
      sensitivity: preset.sensitivity,
      capacity: preset.capacity,
      options: {
        include_steps: true,
        include_curves: true,
        include_sensitivity: true,
        curve_points: 200,
      },
    });
  }, []);

  const clearParams = useCallback(() => {
    setSelectedPresetId(null);
    setParams({
      fixed_cost: 0,
      variable_cost: 0,
      quad_cost: 0,
      ref_price: 1000,
      ref_demand: 1,
      sensitivity: 1,
      capacity: null,
      options: {
        include_steps: true,
        include_curves: true,
        include_sensitivity: true,
        curve_points: 200,
      },
    });
  }, []);

  const retry = useCallback(() => {
    executeOptimize(params);
  }, [executeOptimize, params]);

  return {
    params,
    result,
    status,
    fieldErrors,
    networkError,
    presets,
    selectedPresetId,
    updateParam,
    setAllParams,
    applyPreset,
    clearParams,
    retry,
  };
}
