"""
marginal.py — Analisis Marginal: MR, MC, Elastisitas Harga.

Sumber kebenaran: PRD Bagian 4.12, 4.13
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class MarginalResult:
    """Hasil analisis marginal pada titik optimal."""

    mr_at_opt: float
    mc_at_opt: float
    elasticity: float | None       # None jika x* = 0 (NO_PRODUCTION)
    elasticity_label: str | None   # "elastis" / "inelastis" / "uniter"


def mr(x: float, a: float, b: float) -> float:
    """Pendapatan marginal MR(x) = R'(x).

    Rumus (PRD 4.12): MR(x) = a - 2*b*x

    Args:
        x: Jumlah cangkir
        a: Intersep fungsi harga
        b: Kemiringan fungsi harga

    Returns:
        MR(x)
    """
    return a - 2.0 * b * x


def mc(x: float, variable_cost: float, quad_cost: float) -> float:
    """Biaya marginal MC(x) = C'(x).

    Rumus (PRD 4.12): MC(x) = v + 2*c*x

    Args:
        x:             Jumlah cangkir
        variable_cost: Biaya variabel per cangkir v
        quad_cost:     Koefisien biaya kuadrat c

    Returns:
        MC(x)
    """
    return variable_cost + 2.0 * quad_cost * x


def elasticity(p: float, x: float, b: float) -> float | None:
    """Elastisitas harga permintaan pada titik (p, x).

    Rumus (PRD 4.13):
        dx/dp = -1/b
        epsilon = (dx/dp) * (p/x) = -p / (b*x)

    Hanya dihitung jika x > 0 (interior). Mengembalikan None jika x = 0.

    Args:
        p: Harga jual saat ini
        x: Jumlah cangkir terjual (harus > 0)
        b: Kemiringan fungsi harga

    Returns:
        Nilai elastisitas epsilon (negatif untuk permintaan normal), atau None
    """
    if x <= 0.0:
        return None
    return -p / (b * x)


def elasticity_label(eps: float | None) -> str | None:
    """Klasifikasi elastisitas harga.

    |eps| > 1 → elastis (permintaan sensitif terhadap harga)
    |eps| = 1 → uniter
    |eps| < 1 → inelastis

    Args:
        eps: Nilai elastisitas

    Returns:
        Label dalam Bahasa Indonesia, atau None jika eps adalah None
    """
    if eps is None:
        return None
    abs_eps = abs(eps)
    if abs_eps > 1.0:
        return "elastis"
    elif abs_eps < 1.0:
        return "inelastis"
    else:
        return "uniter"


def compute_marginal(
    x_opt: float,
    a: float,
    b: float,
    variable_cost: float,
    quad_cost: float,
    p_opt: float,
) -> MarginalResult:
    """Hitung analisis marginal lengkap pada titik optimal.

    Memeriksa konsistensi MR(x*) ≈ MC(x*) (syarat optimal PRD 4.12).
    Elastisitas hanya dihitung jika x_opt > 0.

    Args:
        x_opt:         Jumlah cangkir optimal (kontinu)
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga
        variable_cost: Biaya variabel per cangkir v
        quad_cost:     Koefisien biaya kuadrat c
        p_opt:         Harga optimal p* (untuk elastisitas)

    Returns:
        MarginalResult
    """
    mr_val = mr(x_opt, a, b)
    mc_val = mc(x_opt, variable_cost, quad_cost)
    eps = elasticity(p_opt, x_opt, b)
    label = elasticity_label(eps)

    return MarginalResult(
        mr_at_opt=mr_val,
        mc_at_opt=mc_val,
        elasticity=eps,
        elasticity_label=label,
    )
