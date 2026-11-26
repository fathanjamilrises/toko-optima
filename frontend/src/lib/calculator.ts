/**
 * calculator.ts — Mesin Kalkulasi Optimasi Kalkulus (Client-Side Fallback).
 * Mengimplementasikan seluruh rumus matematika dari backend (model, optimizer,
 * breakeven, marginal, curves, sensitivity, validation, dan 16 langkah KaTeX).
 * Memungkinkan aplikasi web berjalan 100% mandiri di GitHub Pages tanpa backend server.
 */

import type {
  OptimizeRequest,
  OptimizeResponse,
  OptimizationStatus,
  Model,
  Optimum,
  BreakEven,
  Marginal,
  Sensitivity,
  Curves,
  CurvePoint,
  Step,
  ApiWarning,
  Preset,
} from "@/types/api";

export const PRESETS: Preset[] = [
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
];

function fmtNum(val: number, decimals = 2): string {
  if (Number.isInteger(val)) {
    return val.toLocaleString("en-US");
  }
  return Number(val.toFixed(decimals)).toLocaleString("en-US");
}

function fmtRupiah(val: number): string {
  return `Rp${Math.round(val).toLocaleString("id-ID")}`;
}

export function calculateOptimizer(req: OptimizeRequest): OptimizeResponse {
  const {
    fixed_cost: FC,
    variable_cost: v,
    quad_cost: c,
    ref_price: p0,
    ref_demand: q0,
    sensitivity: s,
    capacity: cap,
  } = req;

  // 1. Model Permintaan & Harga
  const b = 1000.0 / s;
  const a = p0 + b * q0;
  const alphaVal = b + c;
  const betaVal = a - v;
  const x_end = a / b;

  const priceFn = (x: number) => a - b * x;
  const revenueFn = (x: number) => a * x - b * x * x;
  const costFn = (x: number) => FC + v * x + c * x * x;
  const profitFn = (x: number) => revenueFn(x) - costFn(x);
  const mrFn = (x: number) => a - 2.0 * b * x;
  const mcFn = (x: number) => v + 2.0 * c * x;
  const dProfitFn = (x: number) => mrFn(x) - mcFn(x);
  const d2Profit = -2.0 * alphaVal;

  // 2. Optimum Kontinu
  let status: OptimizationStatus = "INTERIOR_OPTIMUM";
  let x_star: number | null = null;
  let x_opt = 0;

  if (betaVal <= 0) {
    status = "NO_PRODUCTION";
    x_opt = 0;
  } else {
    x_star = betaVal / (2.0 * alphaVal);
    if (cap !== null && cap !== undefined && cap < x_star) {
      status = "CAPACITY_BOUND";
      x_opt = Math.max(0, cap);
    } else {
      status = "INTERIOR_OPTIMUM";
      x_opt = Math.min(Math.max(0, x_star), x_end);
    }
  }

  const p_opt = priceFn(x_opt);
  const R_opt = revenueFn(x_opt);
  const C_opt = costFn(x_opt);
  const P_opt = profitFn(x_opt);

  // 3. Optimum Integer
  let x_int = Math.round(x_opt);
  const candidates: Array<{ x: number; profit: number }> = [];

  if (status === "NO_PRODUCTION") {
    x_int = 0;
    candidates.push({ x: 0, profit: profitFn(0) });
  } else {
    const x_floor = Math.floor(x_opt);
    const x_ceil = Math.ceil(x_opt);
    const p_floor = profitFn(x_floor);
    const p_ceil = profitFn(x_ceil);

    candidates.push({ x: x_floor, profit: p_floor });
    if (x_ceil !== x_floor) {
      candidates.push({ x: x_ceil, profit: p_ceil });
    }

    if (x_ceil === x_floor) {
      x_int = x_floor;
    } else if (p_floor >= p_ceil) {
      x_int = x_floor;
    } else {
      x_int = x_ceil;
    }

    if (cap !== null && cap !== undefined && x_int > cap) {
      x_int = Math.floor(cap);
    }
  }

  const p_int = priceFn(x_int);
  const R_int = revenueFn(x_int);
  const C_int = costFn(x_int);
  const P_int = profitFn(x_int);

  // 4. Break-Even Point
  const D = betaVal * betaVal - 4.0 * alphaVal * FC;
  const bepExists = D >= 0;
  let x_low: number | null = null;
  let x_high: number | null = null;
  let x_low_int: number | null = null;
  let x_high_int: number | null = null;

  if (bepExists) {
    const sqrt_D = Math.sqrt(D);
    x_low = (betaVal - sqrt_D) / (2.0 * alphaVal);
    x_high = (betaVal + sqrt_D) / (2.0 * alphaVal);
    x_low_int = Math.ceil(x_low);
    x_high_int = Math.floor(x_high);
  }

  // 5. Marginal & Elastisitas
  const mr_val = mrFn(x_opt);
  const mc_val = mcFn(x_opt);
  let eps: number | null = null;
  let eps_label: string | null = null;

  if (x_opt > 0) {
    eps = -p_opt / (b * x_opt);
    const absEps = Math.abs(eps);
    if (absEps > 1.0) eps_label = "elastis";
    else if (absEps < 1.0) eps_label = "inelastis";
    else eps_label = "uniter";
  }

  // 6. Sensitivitas Partials & Skenario
  let partials = null;
  if (status === "INTERIOR_OPTIMUM" && x_star !== null) {
    const two_alpha = 2.0 * alphaVal;
    partials = {
      dx_dv: -1.0 / two_alpha,
      dx_dFC: 0.0,
      dx_da: 1.0 / two_alpha,
      dP_dFC: -1.0,
      dP_dv: -x_star,
      dP_da: x_star,
    };
  }

  const scenarios: Sensitivity["scenarios"] = [];
  const pctSteps = [-20, -10, 10, 20];

  // Skenario variable_cost
  for (const pct of pctSteps) {
    const new_v = v * (1 + pct / 100);
    const new_beta = a - new_v;
    let s_x = 0;
    if (new_beta > 0) {
      const s_star = new_beta / (2 * alphaVal);
      s_x = cap !== null && cap !== undefined && cap < s_star ? cap : Math.min(Math.max(0, s_star), x_end);
    }
    const s_price = a - b * s_x;
    const s_profit = a * s_x - b * s_x * s_x - (FC + new_v * s_x + c * s_x * s_x);
    scenarios.push({
      label: `Biaya variabel ${pct > 0 ? "+" : ""}${pct}%`,
      delta_pct: pct,
      param_changed: "variable_cost",
      x: Math.round(s_x * 10) / 10,
      price: Math.round(s_price),
      profit: Math.round(s_profit),
      delta_profit: Math.round(s_profit - P_opt),
    });
  }

  // Skenario fixed_cost
  for (const pct of pctSteps) {
    const new_FC = FC * (1 + pct / 100);
    const s_profit = R_opt - (new_FC + v * x_opt + c * x_opt * x_opt);
    scenarios.push({
      label: `Biaya tetap ${pct > 0 ? "+" : ""}${pct}%`,
      delta_pct: pct,
      param_changed: "fixed_cost",
      x: Math.round(x_opt * 10) / 10,
      price: Math.round(p_opt),
      profit: Math.round(s_profit),
      delta_profit: Math.round(s_profit - P_opt),
    });
  }

  // 7. Kurva
  const candidates_max = [1.5 * x_opt, 1.2 * q0];
  if (bepExists && x_high !== null) {
    candidates_max.push(1.1 * x_high);
  }
  let x_plot_max = Math.max(...candidates_max);
  x_plot_max = Math.min(x_plot_max, x_end);
  x_plot_max = Math.max(x_plot_max, 1.0);

  const n_points = req.options?.curve_points || 200;
  const rawPoints: number[] = [];
  for (let i = 0; i <= n_points; i++) {
    rawPoints.push((i / n_points) * x_plot_max);
  }
  // Masukkan x_opt dan BEP eksplisit
  if (x_opt <= x_plot_max) rawPoints.push(x_opt);
  if (x_low !== null && x_low >= 0 && x_low <= x_plot_max) rawPoints.push(x_low);
  if (x_high !== null && x_high >= 0 && x_high <= x_plot_max) rawPoints.push(x_high);

  const sortedPoints = Array.from(new Set(rawPoints.sort((n1, n2) => n1 - n2)));
  const curvePoints: CurvePoint[] = sortedPoints.map((xVal) => ({
    x: xVal,
    price: priceFn(xVal),
    R: revenueFn(xVal),
    C: costFn(xVal),
    P: profitFn(xVal),
    MR: mrFn(xVal),
    MC: mcFn(xVal),
    dP: dProfitFn(xVal),
  }));

  const bepMarkers: Array<{ x: number }> = [];
  if (bepExists) {
    if (x_low !== null) bepMarkers.push({ x: x_low });
    if (x_high !== null) bepMarkers.push({ x: x_high });
  }

  const curves: Curves = {
    x_range: [0, x_plot_max],
    points: curvePoints,
    markers: {
      optimum: { x: x_opt, P: P_opt },
      break_even: bepMarkers,
      capacity: cap !== null && cap !== undefined ? { x: cap } : null,
      reference: { x: q0, P: profitFn(q0) },
    },
  };

  // 8. Warning
  const warnings: ApiWarning[] = [];
  if (P_opt < 0) {
    warnings.push({
      code: "W_NEG_PROFIT",
      level: "warning",
      message: `Laba maksimum bernilai negatif (${fmtRupiah(P_opt)}). Pertimbangkan menurunkan biaya tetap/variabel atau meninjau ulang harga acuan.`,
    });
  }
  if (Math.abs(x_opt - q0) > 0.5 * q0) {
    warnings.push({
      code: "W_EXTRAPOLATION",
      level: "info",
      message: `Jumlah optimal (${fmtNum(x_opt, 1)} cangkir) jauh dari data acuan (${fmtNum(q0, 0)} cangkir). Model linier mungkin kurang akurat di luar rentang survei.`,
    });
  }
  if (Math.abs(p_opt - p0) > 0.5 * p0) {
    warnings.push({
      code: "W_PRICE_JUMP",
      level: "info",
      message: `Harga optimal (${fmtRupiah(p_opt)}) berbeda lebih dari 50% dari harga acuan (${fmtRupiah(p0)}). Verifikasi apakah harga ini realistis untuk pasar Anda.`,
    });
  }
  if (status === "CAPACITY_BOUND") {
    warnings.push({
      code: "W_CAPACITY_BINDING",
      level: "warning",
      message: `Kapasitas produksi (${fmtNum(cap || 0, 0)} cangkir) membatasi hasil optimal. Titik optimal tanpa batas ada di ${fmtNum(x_star || 0, 1)} cangkir.`,
    });
  }

  // 9. 16 Langkah KaTeX
  const quadratic_cost_note = c === 0 ? "Komponen biaya kuadrat tidak berlaku karena c = 0." : "Komponen biaya kuadrat digunakan karena c > 0.";
  const cost_latex = c === 0 ? `C(x) = ${fmtNum(FC)} + ${fmtNum(v)}x` : `C(x) = ${fmtNum(FC)} + ${fmtNum(v)}x + ${fmtNum(c)}x^2`;

  const steps: Step[] = [
    {
      id: 1,
      title: "Data yang diketahui",
      latex: `FC=${fmtNum(FC)},\\; v=${fmtNum(v)},\\; c=${fmtNum(c)},\\; p_0=${fmtNum(p0)},\\; q_0=${fmtNum(q0)},\\; s=${fmtNum(s)}`,
      explanation: "Data biaya dan permintaan acuan dimasukkan untuk satu periode harian.",
      values: { fixed_cost: FC, variable_cost: v, quad_cost: c, ref_price: p0, ref_demand: q0, sensitivity: s, capacity: cap },
    },
    {
      id: 2,
      title: "Menyusun fungsi harga-permintaan",
      latex: `b=\\frac{1000}{${fmtNum(s)}}=${fmtNum(b)},\\quad a=${fmtNum(p0)}+${fmtNum(b)}\\cdot${fmtNum(q0)}=${fmtNum(a)},\\quad p(x)=${fmtNum(a)}-${fmtNum(b)}x`,
      explanation: "Kemiringan dan intersep diperoleh dari data harga serta permintaan acuan.",
      values: { a, b },
    },
    {
      id: 3,
      title: "Fungsi pendapatan",
      latex: `R(x)=x\\,p(x)=${fmtNum(a)}x-${fmtNum(b)}x^2`,
      explanation: "Pendapatan adalah jumlah cangkir dikalikan harga pada jumlah tersebut.",
      values: { a, b },
    },
    {
      id: 4,
      title: "Fungsi biaya",
      latex: cost_latex,
      explanation: `Biaya tetap, biaya variabel, dan biaya kuadrat membentuk fungsi biaya. ${quadratic_cost_note}`,
      values: { fixed_cost: FC, variable_cost: v, quad_cost: c },
    },
    {
      id: 5,
      title: "Fungsi keuntungan",
      latex: `P(x)=-${fmtNum(alphaVal)}x^2+${fmtNum(betaVal)}x-${fmtNum(FC)}`,
      explanation: "Keuntungan diperoleh dari pendapatan dikurangi biaya.",
      values: { alpha: alphaVal, beta: betaVal, fixed_cost: FC },
    },
    {
      id: 6,
      title: "Turunan pertama fungsi keuntungan",
      latex: `P'(x)=-2(${fmtNum(alphaVal)})x+${fmtNum(betaVal)}=${fmtNum(d2Profit)}x+${fmtNum(betaVal)}`,
      explanation: "Turunan pertama digunakan untuk mencari titik kritis.",
      values: { alpha: alphaVal, beta: betaVal, second_derivative: d2Profit },
    },
    {
      id: 7,
      title: "Titik kritis",
      latex: x_star === null ? "x^*\\text{ tidak berlaku karena }a-v\\leq0" : `P'(x)=0\\Rightarrow x^*=\\frac{${fmtNum(betaVal)}}{2(${fmtNum(alphaVal)})}=${fmtNum(x_star)}`,
      explanation: x_star === null ? "Tidak berlaku: titik kritis positif tidak ada karena harga tertinggi pasar tidak menutup biaya variabel." : "Titik kritis tanpa kendala diperoleh dengan menyamakan turunan pertama dengan nol.",
      values: { x_star, beta: betaVal, alpha: alphaVal },
    },
    {
      id: 8,
      title: "Uji turunan kedua",
      latex: `P''(x)=${fmtNum(d2Profit)}<0`,
      explanation: status !== "NO_PRODUCTION" ? "Karena turunan kedua negatif, parabola keuntungan terbuka ke bawah." : "Turunan kedua negatif, tetapi titik kritis berada di luar domain produksi.",
      values: { second_derivative: d2Profit, is_maximum: true },
    },
    {
      id: 9,
      title: "Uji tanda turunan pertama",
      latex: x_star !== null ? `x<${fmtNum(x_star)}:P'(x)>0,\\quad x=${fmtNum(x_star)}:P'(x)=0,\\quad x>${fmtNum(x_star)}:P'(x)<0` : "\\text{Tidak berlaku: }P'(x)\\leq0\\text{ untuk }x\\geq0",
      explanation: x_star !== null ? "Keuntungan naik sebelum titik kritis dan turun sesudahnya." : "Tidak berlaku karena tidak ada titik kritis positif.",
      values: { x_star },
    },
    {
      id: 10,
      title: "Pemeriksaan kendala",
      latex: `x_{opt}=${fmtNum(x_opt)},\\quad \\mathrm{status}=\\text{${status}}`,
      explanation: status === "CAPACITY_BOUND" ? `Kapasitas ${fmtNum(cap || 0)} cangkir lebih kecil dari x*=${fmtNum(x_star || 0)}, sehingga batas kapasitas dipilih.` : status === "NO_PRODUCTION" ? "Produksi nol dipilih karena beta = a-v tidak positif." : `x*=${fmtNum(x_opt)} berada dalam domain [0, ${fmtNum(x_end)}], sehingga titik interior dipilih.`,
      values: { x_opt, x_end, capacity: cap, status },
    },
    {
      id: 11,
      title: "Pembulatan",
      latex: `\\{\\lfloor x_{opt}\\rfloor,\\lceil x_{opt}\\rceil\\}\\Rightarrow ${candidates.map((cand) => `P(${fmtNum(cand.x)})=${fmtNum(cand.profit)}`).join(",\\; ")};\\quad x_{int}=${fmtNum(x_int)}`,
      explanation: "Kandidat bilangan bulat dibandingkan; jika seri, dipilih jumlah yang lebih kecil.",
      values: { x_int, profit_int: P_int, candidates },
    },
    {
      id: 12,
      title: "Harga, pendapatan, biaya, laba optimal",
      latex: `p^*=${fmtNum(p_opt)},\\quad R^*=${fmtNum(R_opt)},\\quad C^*=${fmtNum(C_opt)},\\quad P^*=${fmtNum(P_opt)}`,
      explanation: `Pada hasil kontinu, harga optimal ${fmtRupiah(p_opt)} menghasilkan laba ${fmtRupiah(P_opt)}.`,
      values: { x: x_opt, price: p_opt, revenue: R_opt, cost: C_opt, profit: P_opt },
    },
    {
      id: 13,
      title: "Titik impas (BEP)",
      latex: bepExists ? `D=${fmtNum(D)},\\quad x_{BEP,1}=${fmtNum(x_low || 0)},\\quad x_{BEP,2}=${fmtNum(x_high || 0)}` : `D=${fmtNum(D)}<0`,
      explanation: bepExists ? `Usaha berada pada rentang untung di antara ${fmtNum(x_low || 0)} dan ${fmtNum(x_high || 0)} cangkir.` : "Tidak berlaku: tidak ada titik impas karena laba negatif di seluruh domain.",
      values: { exists: bepExists, discriminant: D, x_low, x_high, x_low_int, x_high_int },
    },
    {
      id: 14,
      title: "Analisis marginal",
      latex: `MR=${fmtNum(mr_val)},\\quad MC=${fmtNum(mc_val)}`,
      explanation: status === "INTERIOR_OPTIMUM" ? "MR dan MC sama pada titik optimum interior." : "Kesetaraan MR dan MC tidak berlaku sebagai keputusan akhir karena optimum dibatasi kendala/domain.",
      values: { mr_at_opt: mr_val, mc_at_opt: mc_val },
    },
    {
      id: 15,
      title: "Elastisitas",
      latex: status === "INTERIOR_OPTIMUM" && eps !== null ? `\\varepsilon^*=${fmtNum(eps, 4)}` : "\\text{Tidak berlaku}",
      explanation: status === "INTERIOR_OPTIMUM" && eps !== null ? `Permintaan bersifat ${eps_label}.` : "Tidak berlaku karena elastisitas optimal hanya diinterpretasikan untuk optimum interior dengan x*>0.",
      values: { elasticity: eps, elasticity_label: eps_label },
    },
    {
      id: 16,
      title: "Kesimpulan & rekomendasi",
      latex: "\\text{Lihat penjelasan}",
      explanation: status === "NO_PRODUCTION" ? "Harga tertinggi yang dapat diterima pasar tidak melampaui biaya variabel per cangkir; produksi tidak menguntungkan." : status === "CAPACITY_BOUND" ? `Kapasitas ${fmtNum(cap || 0)} cangkir membatasi produksi; titik optimal tanpa batas ada di ${fmtNum(x_star || 0)} cangkir.` : P_opt < 0 ? `Pada parameter ini laba maksimum bernilai negatif (${fmtRupiah(P_opt)}). Pertimbangkan menurunkan biaya tetap/variabel.` : `Keuntungan maksimum diperoleh saat menjual ${fmtNum(x_int)} cangkir per hari dengan harga ${fmtRupiah(p_int)} per cangkir, menghasilkan laba ${fmtRupiah(P_int)}. Usaha mulai untung pada penjualan ≥ ${bep_low_label(bepExists, x_low_int)} cangkir.`,
      values: { status, x: x_int, price: p_int, profit: P_int },
    },
  ];

  function bep_low_label(exists: boolean, low: number | null): string {
    return exists && low !== null ? low.toString() : "tidak tersedia";
  }

  const model: Model = {
    a,
    b,
    alpha: alphaVal,
    beta: betaVal,
    formulas: {
      price: `p(x) = ${a} - ${b}x`,
      revenue: `R(x) = ${a}x - ${b}x^2`,
      cost: `C(x) = ${FC} + ${v}x${c > 0 ? ` + ${c}x^2` : ""}`,
      profit: `P(x) = -${alphaVal}x^2 + ${betaVal}x - ${FC}`,
      dprofit: `P'(x) = ${d2Profit}x + ${betaVal}`,
      d2profit: `P''(x) = ${d2Profit}`,
    },
  };

  const optimum: Optimum = {
    status,
    continuous: { x: x_opt, price: p_opt, revenue: R_opt, cost: C_opt, profit: P_opt },
    integer: { x: x_int, price: p_int, revenue: R_int, cost: C_int, profit: P_int, candidates },
    second_derivative: d2Profit,
    is_maximum: true,
  };

  const break_even: BreakEven = {
    exists: bepExists,
    discriminant: D,
    x_low,
    x_high,
    x_low_int,
    x_high_int,
  };

  const marginal: Marginal = {
    mr_at_opt: mr_val,
    mc_at_opt: mc_val,
    elasticity: eps,
    elasticity_label: eps_label,
  };

  const sensitivity: Sensitivity = {
    partials,
    scenarios,
  };

  return {
    model,
    optimum,
    break_even,
    marginal,
    sensitivity,
    curves,
    steps,
    warnings,
    verification: null,
  };
}
