import type { CurvesResponse, OptimizeRequest, OptimizeResponse, Preset, Sensitivity } from "@/types/api";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}/api/v1${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!response.ok) throw await response.json();
  return response.json() as Promise<T>;
}

export const api = {
  health: () => fetch(`${apiUrl}/api/v1/health`).then((response) => response.json() as Promise<{ status: string; version: string }>),
  presets: () => request<Preset[]>("/presets"),
  optimize: (payload: OptimizeRequest, signal?: AbortSignal) => request<OptimizeResponse>("/optimize", { method: "POST", body: JSON.stringify(payload), signal }),
  curves: (payload: OptimizeRequest, signal?: AbortSignal) => request<CurvesResponse>("/curves", { method: "POST", body: JSON.stringify(payload), signal }),
  sensitivity: (payload: OptimizeRequest, signal?: AbortSignal) => request<Sensitivity>("/sensitivity", { method: "POST", body: JSON.stringify(payload), signal }),
};
