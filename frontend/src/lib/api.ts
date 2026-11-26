import type { CurvesResponse, OptimizeRequest, OptimizeResponse, Preset, Sensitivity } from "@/types/api";
import { calculateOptimizer, PRESETS } from "./calculator";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) {
    throw new Error("No remote API configured");
  }
  const response = await fetch(`${apiUrl}/api/v1${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) throw await response.json();
  return response.json() as Promise<T>;
}

export const api = {
  health: async () => {
    try {
      if (!apiUrl) return { status: "ok", version: "1.0.0 (client)" };
      const res = await fetch(`${apiUrl}/api/v1/health`);
      return (await res.json()) as { status: string; version: string };
    } catch {
      return { status: "ok", version: "1.0.0 (client)" };
    }
  },
  presets: async (): Promise<Preset[]> => {
    try {
      return await request<Preset[]>("/presets");
    } catch {
      return PRESETS;
    }
  },
  optimize: async (payload: OptimizeRequest, signal?: AbortSignal): Promise<OptimizeResponse> => {
    try {
      return await request<OptimizeResponse>("/optimize", {
        method: "POST",
        body: JSON.stringify(payload),
        signal,
      });
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      // Client-side fallback: kalkulasi langsung di browser jika API offline / di GitHub Pages
      return calculateOptimizer(payload);
    }
  },
  curves: async (payload: OptimizeRequest, signal?: AbortSignal): Promise<CurvesResponse> => {
    try {
      return await request<CurvesResponse>("/curves", {
        method: "POST",
        body: JSON.stringify(payload),
        signal,
      });
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      return calculateOptimizer(payload).curves;
    }
  },
  sensitivity: async (payload: OptimizeRequest, signal?: AbortSignal): Promise<Sensitivity> => {
    try {
      return await request<Sensitivity>("/sensitivity", {
        method: "POST",
        body: JSON.stringify(payload),
        signal,
      });
    } catch (err: unknown) {
      if (signal?.aborted) throw err;
      return calculateOptimizer(payload).sensitivity;
    }
  },
};
