"""
test_marginal.py — Test marginal.py: MR, MC, elastisitas, aturan Lerner.
"""

from __future__ import annotations

import pytest

from app.core.marginal import compute_marginal, elasticity, mc, mr
from app.core.model import demand_params
from app.core.optimizer import OptimizeParams, OptimizationStatus, optimize
from tests.conftest import close


class TestMRMC:
    def test_mr_at_xstar_g1(self):
        """MR(75) = 38000 - 2*200*75 = 8000."""
        a, b = demand_params(22000, 80, 5)
        assert close(mr(75, a, b), 8000)

    def test_mc_at_xstar_g1(self):
        """MC(75) = 8000 (c=0, v=8000)."""
        assert close(mc(75, 8000, 0), 8000)

    def test_mr_equals_mc_at_xstar(self):
        """MR(x*) = MC(x*) — syarat optimal (PRD 4.12)."""
        a, b = demand_params(22000, 80, 5)
        mr_val = mr(75, a, b)
        mc_val = mc(75, 8000, 0)
        assert close(mr_val, mc_val)

    def test_mr_decreasing(self):
        """MR turun seiring x bertambah."""
        a, b = demand_params(22000, 80, 5)
        assert mr(0, a, b) > mr(50, a, b) > mr(100, a, b)

    def test_mc_constant_no_quad(self):
        """MC konstan jika c=0."""
        assert close(mc(0, 8000, 0), mc(100, 8000, 0))

    def test_mc_increasing_with_quad(self):
        """MC meningkat jika c>0."""
        assert mc(10, 8000, 20) > mc(0, 8000, 20)

    def test_g2_mr_mc_at_xstar(self):
        """G2: MR(x*) = MC(x*).

        Verifikasi: MR = a - 2*b*x* = 38000 - 2*200*(30000/440) = 10727.27
                    MC = v + 2*c*x* = 8000 + 2*20*(30000/440)   = 10727.27
        Catatan: PRD 9.1 mencetak 10363.64 yang merupakan kesalahan cetak.
        Nilai eksak terverifikasi dengan SymPy: MR = MC = 10727.27...
        """
        a, b = demand_params(22000, 80, 5)
        x_star = 30000 / 440
        mr_val = mr(x_star, a, b)
        mc_val = mc(x_star, 8000, 20)
        assert close(mr_val, mc_val, abs_tol=1e-3)
        # MR = 38000 - 400*(30000/440) = 38000 - 12000000/440 = 38000 - 27272.727... = 10727.272...
        expected = 38000 - 2 * 200 * (30000 / 440)
        assert close(mr_val, expected, abs_tol=1e-3)


class TestElasticity:
    def test_g1_elasticity(self):
        """ε* = -p*/(b*x*) = -23000/(200*75) ≈ -1.5333."""
        eps = elasticity(23000, 75, 200)
        assert close(eps, -1.5333333333, abs_tol=1e-4)

    def test_elasticity_negative(self):
        """Elastisitas harga selalu negatif (permintaan turun saat harga naik)."""
        eps = elasticity(23000, 75, 200)
        assert eps < 0

    def test_elasticity_zero_x_returns_none(self):
        """x=0 → elastisitas tidak terdefinisi → None."""
        assert elasticity(23000, 0, 200) is None

    def test_elasticity_label_elastis(self):
        from app.core.marginal import elasticity_label
        assert elasticity_label(-1.5) == "elastis"

    def test_elasticity_label_inelastis(self):
        from app.core.marginal import elasticity_label
        assert elasticity_label(-0.5) == "inelastis"

    def test_elasticity_label_uniter(self):
        from app.core.marginal import elasticity_label
        assert elasticity_label(-1.0) == "uniter"


class TestLernerRule:
    """Aturan Lerner: MC = p*(1 + 1/ε*) — hanya untuk c=0 (PRD 4.13)."""

    def test_lerner_g1(self):
        """Verifikasi: 23000 * (1 - 1/1.5333) ≈ 8000."""
        p_star = 23000.0
        eps = -1.5333333333333333
        mc_lerner = p_star * (1 + 1 / eps)
        assert close(mc_lerner, 8000.0, abs_tol=1.0)


class TestComputeMarginal:
    def test_g1_full(self):
        a, b = demand_params(22000, 80, 5)
        result = compute_marginal(75, a, b, 8000, 0, 23000)
        assert close(result.mr_at_opt, 8000)
        assert close(result.mc_at_opt, 8000)
        assert close(result.elasticity, -1.5333333, abs_tol=1e-4)
        assert result.elasticity_label == "elastis"

    def test_no_production_no_elasticity(self, g5_params):
        r = optimize(g5_params)
        result = compute_marginal(
            r.continuous.x, r.a, r.b,
            g5_params.variable_cost, g5_params.quad_cost,
            r.continuous.price,
        )
        assert result.elasticity is None
        assert result.elasticity_label is None
