"""
test_sympy_verify.py — Verifikasi simbolik SymPy: 200+ kombinasi parameter acak.

Sumber kebenaran: PRD Bagian 5.3 dan 9.2
"""

from __future__ import annotations

import random

import pytest

from app.core.sympy_verify import verify_with_sympy
from tests.conftest import close


class TestSymPyGoldenCases:
    def test_g1(self):
        vr = verify_with_sympy(38000, 200, 300_000, 8000, 0)
        assert vr.passed
        assert close(vr.x_star_sympy, 75.0)
        assert close(vr.d2_sympy, -400.0)
        assert close(vr.p_star_sympy, 825_000)

    def test_g2(self):
        vr = verify_with_sympy(38000, 200, 300_000, 8000, 20)
        assert vr.passed
        assert close(vr.x_star_sympy, 30000 / 440, abs_tol=1e-4)
        assert close(vr.d2_sympy, -440.0)

    def test_g4(self):
        vr = verify_with_sympy(38000, 200, 1_500_000, 8000, 0)
        assert vr.passed
        assert close(vr.p_star_sympy, -375_000, abs_tol=1.0)


class TestSymPyRandomParams:
    """Verifikasi 200 kombinasi parameter acak (PRD 5.3 & 9.2)."""

    @pytest.mark.parametrize("seed", range(200))
    def test_sympy_matches_closed_form(self, seed):
        rng = random.Random(seed + 5000)
        p0 = rng.uniform(5000, 50000)
        q0 = rng.uniform(10, 300)
        s = rng.uniform(0.5, 20)
        v = rng.uniform(0, p0 * 0.9)
        c = rng.uniform(0, 50)
        FC = rng.uniform(0, 500_000)

        # Hitung a, b
        b = 1000.0 / s
        a = p0 + b * q0

        vr = verify_with_sympy(a, b, FC, v, c, tol=1e-5)
        assert vr.passed, (
            f"seed={seed}: x*_sympy={vr.x_star_sympy:.6f} vs closed={vr.x_star_closed:.6f}, "
            f"max_error={vr.max_error:.2e}"
        )
        assert vr.max_error < 1e-5
