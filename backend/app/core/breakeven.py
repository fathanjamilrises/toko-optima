"""
breakeven.py — Perhitungan Titik Impas (Break-Even Point, BEP).

Sumber kebenaran: PRD Bagian 4.11
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass
class BEPResult:
    """Hasil perhitungan titik impas.

    Attributes:
        exists:        True jika diskriminan D >= 0
        discriminant:  D = beta^2 - 4*alpha*FC
        x_low:         Akar bawah (kontinu) — None jika tidak ada BEP
        x_high:        Akar atas (kontinu) — None jika tidak ada BEP
        x_low_int:     ceil(x_low) — None jika tidak ada BEP
        x_high_int:    floor(x_high) — None jika tidak ada BEP
    """

    exists: bool
    discriminant: float
    x_low: float | None = None
    x_high: float | None = None
    x_low_int: int | None = None
    x_high_int: int | None = None


def breakeven(
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
) -> BEPResult:
    """Hitung titik impas P(x) = 0.

    Rumus (PRD 4.11):
        alpha = b + c,  beta = a - v
        D = beta^2 - 4*alpha*FC
        x_BEP = (beta ± sqrt(D)) / (2*alpha)

    Catatan:
        - D < 0  → tidak ada BEP (rugi di semua x)
        - D = 0  → satu titik BEP = x* (laba maks = 0)
        - D > 0  → dua titik; rentang untung: x_low < x < x_high
        - BEP integer: ceil(x_low) dan floor(x_high)
        - Hubungan: D >= 0 ⟺ P* >= 0 (karena P* = D/(4*alpha))

    Args:
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga, b > 0
        fixed_cost:    Biaya tetap FC >= 0
        variable_cost: Biaya variabel per cangkir v >= 0
        quad_cost:     Koefisien biaya kuadrat c >= 0

    Returns:
        BEPResult
    """
    al = b + quad_cost  # alpha
    be = a - variable_cost  # beta

    D = be * be - 4.0 * al * fixed_cost

    if D < 0.0:
        return BEPResult(exists=False, discriminant=D)

    sqrt_D = math.sqrt(D)
    x_low = (be - sqrt_D) / (2.0 * al)
    x_high = (be + sqrt_D) / (2.0 * al)

    x_low_int = math.ceil(x_low)
    x_high_int = math.floor(x_high)

    # Ketika D = 0: x_low == x_high == x*; floor == ceil
    return BEPResult(
        exists=True,
        discriminant=D,
        x_low=x_low,
        x_high=x_high,
        x_low_int=int(x_low_int),
        x_high_int=int(x_high_int),
    )
