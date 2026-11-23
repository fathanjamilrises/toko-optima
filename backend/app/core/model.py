"""
model.py — Fungsi matematis murni untuk model UMKM kedai kopi.

Sumber kebenaran: PRD Bagian 4.2–4.7
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations


def demand_params(p0: float, q0: float, s: float) -> tuple[float, float]:
    """Hitung parameter fungsi permintaan-harga.

    Rumus (PRD 4.2):
        b = 1000 / s
        a = p0 + b * q0

    sehingga p(x) = a - b*x dan p(q0) = p0 ✓

    Args:
        p0: Harga acuan (Rp/cangkir), > 0
        q0: Permintaan pada harga acuan (cangkir/periode), > 0
        s:  Penurunan permintaan per kenaikan harga Rp1.000, > 0

    Returns:
        (a, b) — intersep dan kemiringan fungsi harga-permintaan
    """
    b = 1000.0 / s
    a = p0 + b * q0
    return a, b


def price(x: float, a: float, b: float) -> float:
    """Harga jual sebagai fungsi jumlah cangkir.

    Rumus (PRD 4.2): p(x) = a - b*x

    Args:
        x: Jumlah cangkir terjual, x >= 0
        a: Intersep fungsi harga
        b: Kemiringan fungsi harga, b > 0

    Returns:
        Harga jual p(x) dalam Rupiah
    """
    return a - b * x


def revenue(x: float, a: float, b: float) -> float:
    """Fungsi pendapatan.

    Rumus (PRD 4.3): R(x) = x * p(x) = a*x - b*x^2

    Args:
        x: Jumlah cangkir terjual
        a: Intersep fungsi harga
        b: Kemiringan fungsi harga

    Returns:
        Pendapatan R(x) dalam Rupiah
    """
    return a * x - b * x * x


def cost(x: float, fixed_cost: float, variable_cost: float, quad_cost: float) -> float:
    """Fungsi biaya total.

    Rumus (PRD 4.4): C(x) = FC + v*x + c*x^2

    Args:
        x:             Jumlah cangkir terjual
        fixed_cost:    Biaya tetap FC (Rp)
        variable_cost: Biaya variabel per cangkir v (Rp/cangkir)
        quad_cost:     Koefisien biaya kuadrat c (Rp/cangkir^2), default 0

    Returns:
        Biaya total C(x) dalam Rupiah
    """
    return fixed_cost + variable_cost * x + quad_cost * x * x


def profit(
    x: float,
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
) -> float:
    """Fungsi keuntungan.

    Rumus (PRD 4.5):
        P(x) = R(x) - C(x)
              = -(b+c)*x^2 + (a-v)*x - FC
              = -alpha*x^2 + beta*x - FC

    Args:
        x:             Jumlah cangkir terjual
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga
        fixed_cost:    Biaya tetap FC
        variable_cost: Biaya variabel per cangkir v
        quad_cost:     Koefisien biaya kuadrat c

    Returns:
        Keuntungan P(x) dalam Rupiah
    """
    return revenue(x, a, b) - cost(x, fixed_cost, variable_cost, quad_cost)


def alpha(b: float, c: float) -> float:
    """Koefisien kuadrat fungsi keuntungan (selalu positif).

    Rumus (PRD 4.5): alpha = b + c
    """
    return b + c


def beta(a: float, v: float) -> float:
    """Koefisien linier fungsi keuntungan.

    Rumus (PRD 4.5): beta = a - v
    """
    return a - v


def dprofit(
    x: float,
    a: float,
    b: float,
    variable_cost: float,
    quad_cost: float,
) -> float:
    """Turunan pertama fungsi keuntungan P'(x).

    Rumus (PRD 4.6): P'(x) = -2*alpha*x + beta
                             = -2*(b+c)*x + (a-v)

    Args:
        x:             Titik evaluasi
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga
        variable_cost: Biaya variabel per cangkir v
        quad_cost:     Koefisien biaya kuadrat c

    Returns:
        P'(x)
    """
    al = alpha(b, quad_cost)
    be = beta(a, variable_cost)
    return -2.0 * al * x + be


def d2profit(b: float, quad_cost: float) -> float:
    """Turunan kedua fungsi keuntungan P''(x) — konstan.

    Rumus (PRD 4.7): P''(x) = -2*alpha = -2*(b+c)

    Karena b>0 dan c>=0, P''<0 selalu → parabola terbuka ke bawah → titik kritis adalah maksimum global.

    Args:
        b:          Kemiringan fungsi harga, b > 0
        quad_cost:  Koefisien biaya kuadrat c >= 0

    Returns:
        P''(x) — nilai negatif
    """
    return -2.0 * alpha(b, quad_cost)
