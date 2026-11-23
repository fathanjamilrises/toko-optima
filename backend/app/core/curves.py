"""
curves.py — Generator data titik untuk grafik R(x), C(x), P(x), MR(x), MC(x), P'(x).

Sumber kebenaran: PRD Bagian 7.3
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Optional

from app.core.breakeven import BEPResult
from app.core.marginal import mc, mr
from app.core.model import cost, dprofit, price, profit, revenue


@dataclass
class CurvePoint:
    """Satu titik pada semua kurva."""

    x: float
    price: float
    R: float
    C: float
    P: float
    MR: float
    MC: float
    dP: float  # P'(x)


@dataclass
class CurveMarkers:
    """Penanda khusus pada grafik."""

    optimum: dict        # {"x": float, "P": float}
    break_even: list     # [{"x": float}, ...] atau []
    capacity: Optional[dict]  # {"x": float} atau None
    reference: dict      # {"x": float, "P": float}  → P(q0)


@dataclass
class CurveData:
    """Hasil lengkap data kurva."""

    x_range: tuple[float, float]
    points: list[CurvePoint]
    markers: CurveMarkers


def build_curves(
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
    ref_demand: float,         # q0 — untuk titik referensi dan x_plot_max
    x_opt: float,              # titik optimal (kontinu)
    bep: Optional[BEPResult],
    capacity: Optional[float],
    n_points: int = 200,
) -> CurveData:
    """Bangun data kurva untuk grafik.

    Aturan rentang x (PRD 7.3):
        x_plot_max = max(1.5*x_opt, 1.1*x_bep_high (jika ada), 1.2*q0)
        lalu dipotong ke min(x_plot_max, a/b) agar harga tidak negatif

    Titik sampel merata dari 0 sampai x_plot_max (n_points titik).
    Titik x_opt dan titik BEP selalu disertakan secara eksplisit.

    Args:
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga
        fixed_cost:    Biaya tetap FC
        variable_cost: Biaya variabel per cangkir v
        quad_cost:     Koefisien biaya kuadrat c
        ref_demand:    Permintaan acuan q0
        x_opt:         Titik optimal kontinu
        bep:           Hasil BEP (atau None jika tidak berlaku)
        capacity:      Kapasitas (atau None)
        n_points:      Jumlah titik grafik (50–1000)

    Returns:
        CurveData
    """
    x_max_demand = a / b  # harga = 0 di sini

    # Hitung x_plot_max
    candidates_max = [
        1.5 * x_opt,
        1.2 * ref_demand,
    ]
    if bep is not None and bep.exists and bep.x_high is not None:
        candidates_max.append(1.1 * bep.x_high)

    x_plot_max = max(candidates_max)
    x_plot_max = min(x_plot_max, x_max_demand)
    x_plot_max = max(x_plot_max, 1.0)  # pastikan minimal ada rentang

    # Kumpulkan x khusus yang harus ada
    special_xs: set[float] = {0.0, x_opt}
    if bep is not None and bep.exists:
        if bep.x_low is not None:
            special_xs.add(bep.x_low)
        if bep.x_high is not None:
            special_xs.add(bep.x_high)

    # Buat grid merata
    step = x_plot_max / max(n_points - 1, 1)
    grid_xs = [i * step for i in range(n_points)]

    # Gabung dengan special_xs dan sort, buang duplikat
    all_xs = sorted(set(grid_xs) | {x for x in special_xs if 0.0 <= x <= x_plot_max})

    # Bangun titik-titik kurva
    points: list[CurvePoint] = []
    for x in all_xs:
        p_val = price(x, a, b)
        r_val = revenue(x, a, b)
        c_val = cost(x, fixed_cost, variable_cost, quad_cost)
        p_profit = profit(x, a, b, fixed_cost, variable_cost, quad_cost)
        mr_val = mr(x, a, b)
        mc_val = mc(x, variable_cost, quad_cost)
        dp_val = dprofit(x, a, b, variable_cost, quad_cost)

        points.append(CurvePoint(
            x=x,
            price=p_val,
            R=r_val,
            C=c_val,
            P=p_profit,
            MR=mr_val,
            MC=mc_val,
            dP=dp_val,
        ))

    # Markers
    p_opt_profit = profit(x_opt, a, b, fixed_cost, variable_cost, quad_cost)
    optimum_marker = {"x": x_opt, "P": p_opt_profit}

    bep_markers: list[dict] = []
    if bep is not None and bep.exists:
        if bep.x_low is not None:
            bep_markers.append({"x": bep.x_low})
        if bep.x_high is not None and bep.x_high != bep.x_low:
            bep_markers.append({"x": bep.x_high})

    capacity_marker = {"x": capacity} if capacity is not None else None

    # Referensi: P(q0) — laba jika tetap pada (p0, q0)
    p_ref = profit(ref_demand, a, b, fixed_cost, variable_cost, quad_cost)
    reference_marker = {"x": ref_demand, "P": p_ref}

    markers = CurveMarkers(
        optimum=optimum_marker,
        break_even=bep_markers,
        capacity=capacity_marker,
        reference=reference_marker,
    )

    return CurveData(
        x_range=(0.0, x_plot_max),
        points=points,
        markers=markers,
    )
