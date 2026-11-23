"""
optimizer.py — Pencarian titik optimal, penanganan kendala, dan pembulatan bilangan bulat.

Sumber kebenaran: PRD Bagian 4.6, 4.8, 4.9, 4.10, Lampiran B
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

from app.core.model import alpha, beta, cost, d2profit, demand_params, price, profit, revenue


class OptimizationStatus(str, Enum):
    """Status hasil optimasi (PRD 4.9)."""

    INTERIOR_OPTIMUM = "INTERIOR_OPTIMUM"
    CAPACITY_BOUND = "CAPACITY_BOUND"
    NO_PRODUCTION = "NO_PRODUCTION"


@dataclass
class ContinuousResult:
    """Hasil optimum kontinu (sebelum pembulatan)."""

    x: float
    price: float
    revenue: float
    cost: float
    profit: float


@dataclass
class IntegerCandidate:
    """Kandidat bilangan bulat beserta nilai keuntungannya."""

    x: int
    profit: float


@dataclass
class IntegerResult:
    """Hasil optimum setelah pembulatan ke bilangan bulat (PRD 4.10)."""

    x: int
    price: float
    revenue: float
    cost: float
    profit: float
    candidates: list[IntegerCandidate]


@dataclass
class OptimizationResult:
    """Hasil lengkap optimasi keuntungan."""

    status: OptimizationStatus
    continuous: ContinuousResult
    integer: IntegerResult
    second_derivative: float
    is_maximum: bool
    # Parameter turunan yang berguna untuk modul lain
    a: float
    b: float
    alpha: float
    beta: float
    x_star_unconstrained: Optional[float]  # x* sebelum kendala (None jika NO_PRODUCTION)
    x_end: float  # batas domain praktis


@dataclass
class OptimizeParams:
    """Parameter input untuk optimasi (dipakai lintas modul core/)."""

    fixed_cost: float
    variable_cost: float
    quad_cost: float
    ref_price: float
    ref_demand: float
    sensitivity: float
    capacity: Optional[float] = None


def critical_point(a: float, b: float, v: float, c: float) -> float:
    """Hitung titik kritis x* (kontinu, tanpa kendala).

    Rumus (PRD 4.6): x* = beta / (2*alpha) = (a-v) / (2*(b+c))

    Args:
        a: Intersep fungsi harga
        b: Kemiringan fungsi harga, b > 0
        v: Biaya variabel per cangkir
        c: Koefisien biaya kuadrat

    Returns:
        x* — titik yang memaksimalkan P(x) tanpa kendala
    """
    al = alpha(b, c)
    be = beta(a, v)
    return be / (2.0 * al)


def round_to_integer(
    x_opt: float,
    x_end: float,
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
) -> IntegerResult:
    """Bulatkan hasil kontinu ke bilangan bulat dengan membandingkan nilai P.

    Algoritma (PRD 4.10):
        1. Kandidat: floor(x_opt) dan ceil(x_opt), dikliping ke [0, floor(x_end)]
        2. Hitung P pada tiap kandidat, pilih yang terbesar
        3. Jika nilai P sama, pilih x lebih kecil
        4. Harga dihitung ulang: p_int = a - b*x_int

    Args:
        x_opt:         Hasil kontinu x_opt (bisa x* atau x_end)
        x_end:         Batas domain praktis (capacity atau a/b)
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga
        fixed_cost:    Biaya tetap FC
        variable_cost: Biaya variabel per cangkir v
        quad_cost:     Koefisien biaya kuadrat c

    Returns:
        IntegerResult dengan x_int terpilih beserta kandidat
    """
    x_end_int = int(math.floor(x_end))
    lo = min(int(math.floor(x_opt)), x_end_int)
    hi = min(int(math.ceil(x_opt)), x_end_int)

    # Pastikan dalam domain yang valid
    lo = max(0, lo)
    hi = max(0, hi)

    # Kumpulkan kandidat unik
    candidate_xs: list[int] = sorted(set([lo, hi]))

    candidates: list[IntegerCandidate] = []
    for cx in candidate_xs:
        p_val = profit(float(cx), a, b, fixed_cost, variable_cost, quad_cost)
        candidates.append(IntegerCandidate(x=cx, profit=p_val))

    # Pilih kandidat dengan profit terbesar; seri → pilih x terkecil
    best = max(candidates, key=lambda c: (c.profit, -c.x))

    x_int = best.x
    p_int = price(float(x_int), a, b)
    r_int = revenue(float(x_int), a, b)
    c_int = cost(float(x_int), fixed_cost, variable_cost, quad_cost)
    pft_int = profit(float(x_int), a, b, fixed_cost, variable_cost, quad_cost)

    return IntegerResult(
        x=x_int,
        price=p_int,
        revenue=r_int,
        cost=c_int,
        profit=pft_int,
        candidates=candidates,
    )


def optimize(params: OptimizeParams) -> OptimizationResult:
    """Hitung titik optimal keuntungan kedai kopi sesuai algoritma PRD Lampiran B.

    Algoritma (PRD 4.9 & Lampiran B):
        1. Hitung a, b dari fungsi permintaan
        2. Hitung alpha = b+c, beta = a-v
        3. x_end = capacity atau a/b
        4. Jika beta <= 0  → NO_PRODUCTION, x=0
        5. Hitung x* = beta/(2*alpha)
        6. Jika x* <= x_end → INTERIOR_OPTIMUM
           Jika x* > x_end  → CAPACITY_BOUND, x_opt = x_end
        7. Bulatkan ke integer

    Args:
        params: OptimizeParams berisi semua parameter model

    Returns:
        OptimizationResult lengkap
    """
    FC = params.fixed_cost
    v = params.variable_cost
    c = params.quad_cost
    p0 = params.ref_price
    q0 = params.ref_demand
    s = params.sensitivity
    capacity = params.capacity

    a, b = demand_params(p0, q0, s)
    al = alpha(b, c)
    be = beta(a, v)

    # Batas domain praktis (PRD 4.9)
    x_demand = a / b  # harga = 0 di sini
    x_end = capacity if (capacity is not None and capacity > 0) else x_demand

    d2 = d2profit(b, c)

    # --- Langkah 1: NO_PRODUCTION ---
    if be <= 0.0:
        x_opt = 0.0
        status = OptimizationStatus.NO_PRODUCTION
        x_star_unconstrained = None

        cont = _make_continuous(x_opt, a, b, FC, v, c)
        int_res = _make_integer_no_production(a, b, FC, v, c)

        return OptimizationResult(
            status=status,
            continuous=cont,
            integer=int_res,
            second_derivative=d2,
            is_maximum=(d2 < 0.0),
            a=a,
            b=b,
            alpha=al,
            beta=be,
            x_star_unconstrained=x_star_unconstrained,
            x_end=x_end,
        )

    # --- Langkah 2: Hitung x* ---
    x_star = be / (2.0 * al)
    x_star_unconstrained = x_star

    # --- Langkah 3: Terapkan kendala ---
    if x_star <= x_end:
        x_opt = x_star
        status = OptimizationStatus.INTERIOR_OPTIMUM
    else:
        x_opt = x_end
        status = OptimizationStatus.CAPACITY_BOUND

    cont = _make_continuous(x_opt, a, b, FC, v, c)
    int_res = round_to_integer(x_opt, x_end, a, b, FC, v, c)

    return OptimizationResult(
        status=status,
        continuous=cont,
        integer=int_res,
        second_derivative=d2,
        is_maximum=(d2 < 0.0),
        a=a,
        b=b,
        alpha=al,
        beta=be,
        x_star_unconstrained=x_star_unconstrained,
        x_end=x_end,
    )


# ---------------------------------------------------------------------------
# Helper privat
# ---------------------------------------------------------------------------


def _make_continuous(
    x_opt: float,
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
) -> ContinuousResult:
    p = price(x_opt, a, b)
    r = revenue(x_opt, a, b)
    c_val = cost(x_opt, fixed_cost, variable_cost, quad_cost)
    pft = r - c_val
    return ContinuousResult(x=x_opt, price=p, revenue=r, cost=c_val, profit=pft)


def _make_integer_no_production(
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
) -> IntegerResult:
    """Untuk status NO_PRODUCTION: x_int = 0, profit = -FC."""
    p_val = price(0.0, a, b)
    r_val = revenue(0.0, a, b)
    c_val = cost(0.0, fixed_cost, variable_cost, quad_cost)
    pft = r_val - c_val  # = -FC
    cand = IntegerCandidate(x=0, profit=pft)
    return IntegerResult(x=0, price=p_val, revenue=r_val, cost=c_val, profit=pft, candidates=[cand])
