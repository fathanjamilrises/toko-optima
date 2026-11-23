"""
test_breakeven.py — Test breakeven.py: golden case G1, G4, G5, edge case D=0, FC=0.
"""

from __future__ import annotations

import math

import pytest

from app.core.breakeven import breakeven
from app.core.model import demand_params
from tests.conftest import close


class TestBreakevenG1:
    def test_exists(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        assert bep.exists

    def test_discriminant(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        # D = 30000^2 - 4*200*300000 = 900_000_000 - 240_000_000 = 660_000_000
        assert close(bep.discriminant, 660_000_000)

    def test_x_low(self):
        """x_low = (beta - sqrt(D)) / (2*alpha) = (30000 - sqrt(660_000_000)) / 400 ≈ 10.7738.

        Catatan: PRD 9.1 mencetak 10.770 yang merupakan aproksimasi berbeda.
        Nilai eksak yang benar adalah 10.7738... (diverifikasi dengan SymPy dan Python).
        """
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        import math
        expected = (30000 - math.sqrt(660_000_000)) / 400
        assert close(bep.x_low, expected, abs_tol=1e-6)
        # Integer BEP tetap 11 (ceil(10.7738) = 11) ✓
        assert bep.x_low_int == 11

    def test_x_high(self):
        """x_high = (beta + sqrt(D)) / (2*alpha) ≈ 139.2262.

        Catatan: PRD 9.1 mencetak 139.230 yang merupakan aproksimasi berbeda.
        Nilai eksak yang benar adalah 139.226... (diverifikasi dengan SymPy dan Python).
        """
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        import math
        expected = (30000 + math.sqrt(660_000_000)) / 400
        assert close(bep.x_high, expected, abs_tol=1e-6)
        # Integer BEP tetap 139 (floor(139.226) = 139) ✓
        assert bep.x_high_int == 139

    def test_x_low_int(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        assert bep.x_low_int == 11

    def test_x_high_int(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        assert bep.x_high_int == 139

    def test_xstar_in_profitable_range(self):
        """x* = 75 harus berada di dalam (x_low, x_high)."""
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        assert bep.x_low < 75 < bep.x_high

    def test_profit_at_bep_approx_zero(self):
        """P(x_bep) ≈ 0."""
        from app.core.model import profit
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 0)
        p_low = profit(bep.x_low, a, b, 300_000, 8000, 0)
        p_high = profit(bep.x_high, a, b, 300_000, 8000, 0)
        assert close(p_low, 0, abs_tol=1e-3)
        assert close(p_high, 0, abs_tol=1e-3)


class TestBreakevenG4:
    """G4: FC = 1.500.000 → D < 0 → tidak ada BEP."""

    def test_no_bep(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 1_500_000, 8000, 0)
        assert not bep.exists

    def test_discriminant_negative(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 1_500_000, 8000, 0)
        assert bep.discriminant < 0

    def test_x_low_none(self):
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 1_500_000, 8000, 0)
        assert bep.x_low is None
        assert bep.x_high is None


class TestBreakevenG5:
    """G5: NO_PRODUCTION — beta <= 0, breakeven tidak berlaku."""

    def test_no_bep(self):
        """beta < 0 → D = beta^2 - 4*alpha*FC bisa positif, tapi x* < 0 (tidak valid secara bisnis)."""
        a, b = demand_params(22000, 80, 5)
        # v = 45000 → beta = a - v = 38000 - 45000 = -7000
        bep = breakeven(a, b, 300_000, 45_000, 0)
        # D = (-7000)^2 - 4*200*300000 = 49_000_000 - 240_000_000 < 0
        assert not bep.exists


class TestBreakevenEdgeCases:
    def test_d_exactly_zero(self):
        """D=0: satu BEP tepat = x*, P* = 0."""
        a, b = demand_params(22000, 80, 5)
        v, c = 8000, 0
        al = b + c  # 200
        be = a - v  # 30000
        FC = (be ** 2) / (4 * al)  # 300000/(4*200) = ... = 1125000

        bep = breakeven(a, b, FC, v, c)
        assert bep.exists
        assert close(bep.discriminant, 0, abs_tol=1e-3)
        assert close(bep.x_low, bep.x_high, abs_tol=1e-6)
        assert close(bep.x_low, be / (2 * al), abs_tol=1e-6)  # = x*

    def test_fc_zero_bep_at_zero(self):
        """FC=0: P(0) = 0, jadi BEP pertama di x=0."""
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 0, 8000, 0)
        assert bep.exists
        assert close(bep.x_low, 0, abs_tol=1e-6)

    def test_g2_bep_exists(self):
        """G2 (c=20): BEP masih ada (P* > 0)."""
        a, b = demand_params(22000, 80, 5)
        bep = breakeven(a, b, 300_000, 8000, 20)
        assert bep.exists
        assert bep.x_low < 68 < bep.x_high
