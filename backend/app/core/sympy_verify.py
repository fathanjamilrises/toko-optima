"""
sympy_verify.py — Verifikasi simbolik rumus tertutup dengan SymPy.

Sumber kebenaran: PRD Bagian 5.3, 6 (Phase 1)
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).

Fungsi ini dipakai di test (200+ kombinasi random) dan opsional di API (verify=true).
"""

from __future__ import annotations

from dataclasses import dataclass

import sympy as sp


@dataclass
class VerifyResult:
    """Hasil verifikasi simbolik SymPy."""

    passed: bool
    x_star_sympy: float       # x* dari solve(P'=0)
    x_star_closed: float      # x* dari rumus tertutup beta/(2*alpha)
    d2_sympy: float           # P'' dari diff(P,x,2)
    d2_closed: float          # P'' dari rumus -2*alpha
    p_star_sympy: float       # P(x*) dievaluasi SymPy
    p_star_closed: float      # P* dari rumus beta^2/(4*alpha) - FC
    max_error: float          # galat absolut terbesar antar ketiga pasangan
    details: dict             # ringkasan detail untuk debugging


def verify_with_sympy(
    a: float,
    b: float,
    fixed_cost: float,
    variable_cost: float,
    quad_cost: float,
    tol: float = 1e-6,
) -> VerifyResult:
    """Verifikasi silang rumus tertutup dengan turunan simbolik SymPy.

    Langkah (PRD 5.3):
        1. Definisikan x sebagai simbol
        2. Bangun P(x) = -(b+c)*x^2 + (a-v)*x - FC
        3. Hitung diff(P, x) → P'(x)
        4. solve(P'(x) = 0, x) → x*_sympy
        5. diff(P, x, 2) → P''
        6. P(x*_sympy) → P*_sympy
        7. Assert setiap nilai ≈ rumus tertutup (toleransi tol)

    Args:
        a:             Intersep fungsi harga
        b:             Kemiringan fungsi harga, b > 0
        fixed_cost:    Biaya tetap FC >= 0
        variable_cost: Biaya variabel per cangkir v >= 0
        quad_cost:     Koefisien biaya kuadrat c >= 0
        tol:           Toleransi absolut (default 1e-6)

    Returns:
        VerifyResult; .passed = True jika semua galat < tol
    """
    al = b + quad_cost        # alpha
    be = a - variable_cost    # beta

    # Rumus tertutup
    x_star_closed = be / (2.0 * al)
    d2_closed = -2.0 * al
    p_star_closed = (be * be) / (4.0 * al) - fixed_cost

    # Verifikasi simbolik
    x_sym = sp.Symbol("x", real=True)

    P_sym = -(al) * x_sym**2 + be * x_sym - fixed_cost

    dP_sym = sp.diff(P_sym, x_sym)           # P'(x) simbolik
    d2P_sym = sp.diff(P_sym, x_sym, 2)       # P''(x) simbolik

    # Solve P'(x) = 0
    solutions = sp.solve(dP_sym, x_sym)
    if not solutions:
        # Tidak ada solusi (kasus degenerasi — tidak seharusnya terjadi untuk al > 0)
        return VerifyResult(
            passed=False,
            x_star_sympy=float("nan"),
            x_star_closed=x_star_closed,
            d2_sympy=float(d2P_sym),
            d2_closed=d2_closed,
            p_star_sympy=float("nan"),
            p_star_closed=p_star_closed,
            max_error=float("inf"),
            details={"error": "SymPy tidak menemukan solusi P'(x)=0"},
        )

    x_star_sympy = float(solutions[0])
    d2_sympy = float(d2P_sym)
    p_star_sympy = float(P_sym.subs(x_sym, x_star_sympy))

    # Hitung galat
    err_x = abs(x_star_sympy - x_star_closed)
    err_d2 = abs(d2_sympy - d2_closed)
    err_p = abs(p_star_sympy - p_star_closed)
    max_error = max(err_x, err_d2, err_p)

    passed = max_error < tol

    return VerifyResult(
        passed=passed,
        x_star_sympy=x_star_sympy,
        x_star_closed=x_star_closed,
        d2_sympy=d2_sympy,
        d2_closed=d2_closed,
        p_star_sympy=p_star_sympy,
        p_star_closed=p_star_closed,
        max_error=max_error,
        details={
            "alpha": al,
            "beta": be,
            "err_x_star": err_x,
            "err_d2": err_d2,
            "err_p_star": err_p,
        },
    )
