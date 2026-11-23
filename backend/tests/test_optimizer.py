"""
test_optimizer.py — Test optimizer.py: semua golden case G1–G5, edge case, property test.
"""

from __future__ import annotations

import math
import random

import pytest

from app.core.model import demand_params, dprofit, profit
from app.core.optimizer import (
    OptimizationStatus,
    OptimizeParams,
    critical_point,
    optimize,
    round_to_integer,
)
from tests.conftest import close


class TestCriticalPoint:
    def test_g1(self):
        a, b = demand_params(22000, 80, 5)
        x = critical_point(a, b, 8000, 0)
        assert close(x, 75.0)

    def test_g2(self):
        a, b = demand_params(22000, 80, 5)
        x = critical_point(a, b, 8000, 20)
        assert close(x, 30000 / 440)


class TestGoldenCases:
    # ----- G1 -----
    def test_g1_status(self, g1_params):
        r = optimize(g1_params)
        assert r.status == OptimizationStatus.INTERIOR_OPTIMUM

    def test_g1_x_star(self, g1_params):
        r = optimize(g1_params)
        assert close(r.continuous.x, 75.0)

    def test_g1_price(self, g1_params):
        r = optimize(g1_params)
        assert close(r.continuous.price, 23_000)

    def test_g1_revenue(self, g1_params):
        r = optimize(g1_params)
        assert close(r.continuous.revenue, 1_725_000)

    def test_g1_cost(self, g1_params):
        r = optimize(g1_params)
        assert close(r.continuous.cost, 900_000)

    def test_g1_profit(self, g1_params):
        r = optimize(g1_params)
        assert close(r.continuous.profit, 825_000)

    def test_g1_d2(self, g1_params):
        r = optimize(g1_params)
        assert close(r.second_derivative, -400)
        assert r.is_maximum

    def test_g1_integer(self, g1_params):
        """G1: x* = 75 persis bilangan bulat → x_int = 75."""
        r = optimize(g1_params)
        assert r.integer.x == 75
        assert close(r.integer.profit, 825_000)

    def test_g1_dprofit_at_xstar(self, g1_params):
        """P'(x*) ≈ 0."""
        r = optimize(g1_params)
        dp = dprofit(r.continuous.x, r.a, r.b, g1_params.variable_cost, g1_params.quad_cost)
        assert close(dp, 0, abs_tol=1e-6)

    def test_g1_integer_is_local_max(self, g1_params):
        """P(x_int) >= P(x_int ± 1) (PRD 4.10)."""
        r = optimize(g1_params)
        a, b = r.a, r.b
        fc, v, c = g1_params.fixed_cost, g1_params.variable_cost, g1_params.quad_cost
        x_int = r.integer.x
        p_int = r.integer.profit
        assert p_int >= profit(float(x_int - 1), a, b, fc, v, c)
        assert p_int >= profit(float(x_int + 1), a, b, fc, v, c)

    # ----- G2 -----
    def test_g2_status(self, g2_params):
        r = optimize(g2_params)
        assert r.status == OptimizationStatus.INTERIOR_OPTIMUM

    def test_g2_x_int(self, g2_params):
        """G2: x_int = 68 (bukan 69, karena P(68) > P(69))."""
        r = optimize(g2_params)
        assert r.integer.x == 68

    def test_g2_profit_int(self, g2_params):
        r = optimize(g2_params)
        assert close(r.integer.profit, 722_720)

    def test_g2_dprofit_at_xstar(self, g2_params):
        r = optimize(g2_params)
        dp = dprofit(r.continuous.x, r.a, r.b, g2_params.variable_cost, g2_params.quad_cost)
        assert close(dp, 0, abs_tol=1e-6)

    def test_g2_integer_is_local_max(self, g2_params):
        r = optimize(g2_params)
        a, b = r.a, r.b
        fc, v, c = g2_params.fixed_cost, g2_params.variable_cost, g2_params.quad_cost
        x_int = r.integer.x
        p_int = r.integer.profit
        assert p_int >= profit(float(x_int - 1), a, b, fc, v, c)
        assert p_int >= profit(float(x_int + 1), a, b, fc, v, c)

    # ----- G3 -----
    def test_g3_status(self, g3_params):
        r = optimize(g3_params)
        assert r.status == OptimizationStatus.CAPACITY_BOUND

    def test_g3_x_opt(self, g3_params):
        r = optimize(g3_params)
        assert close(r.continuous.x, 60.0)

    def test_g3_profit(self, g3_params):
        r = optimize(g3_params)
        assert close(r.continuous.profit, 780_000)

    def test_g3_integer(self, g3_params):
        r = optimize(g3_params)
        assert r.integer.x == 60
        assert close(r.integer.profit, 780_000)

    # ----- G4 -----
    def test_g4_status(self, g4_params):
        r = optimize(g4_params)
        assert r.status == OptimizationStatus.INTERIOR_OPTIMUM

    def test_g4_x_star(self, g4_params):
        r = optimize(g4_params)
        assert close(r.continuous.x, 75.0)

    def test_g4_profit_negative(self, g4_params):
        r = optimize(g4_params)
        assert close(r.continuous.profit, -375_000)

    # ----- G5 -----
    def test_g5_status(self, g5_params):
        r = optimize(g5_params)
        assert r.status == OptimizationStatus.NO_PRODUCTION

    def test_g5_x_zero(self, g5_params):
        r = optimize(g5_params)
        assert close(r.continuous.x, 0.0)
        assert r.integer.x == 0

    def test_g5_profit(self, g5_params):
        r = optimize(g5_params)
        assert close(r.continuous.profit, -300_000)


class TestEdgeCases:
    def test_d_zero_bep_equals_xstar(self):
        """D=0: BEP satu titik = x* dan P* = 0."""
        from app.core.breakeven import breakeven

        # Pilih FC = beta^2 / (4*alpha) agar D = 0
        a, b = demand_params(22000, 80, 5)
        v, c = 8000, 0
        al = b + c
        be = a - v
        FC = (be ** 2) / (4 * al)  # P* = 0 tepat

        params = OptimizeParams(
            fixed_cost=FC, variable_cost=v, quad_cost=c,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None
        )
        r = optimize(params)
        bep = breakeven(a, b, FC, v, c)

        assert bep.exists
        assert close(bep.discriminant, 0, abs_tol=1e-3)
        assert close(r.continuous.profit, 0, abs_tol=1.0)  # P* ≈ 0

    def test_x_star_exact_integer(self, g1_params):
        """G1: x*=75 tepat integer → hanya satu kandidat."""
        r = optimize(g1_params)
        # floor(75) = ceil(75) = 75
        assert r.integer.x == 75

    def test_x_star_half_choose_smaller(self):
        """x* = 68.5 → pilih 68 jika P(68) = P(69) atau pilih yang lebih besar P."""
        # Rancang agar x* = 68.5
        # beta / (2*alpha) = 68.5  → beta = 68.5 * 2 * alpha
        alpha_val = 100.0
        beta_val = 68.5 * 2 * alpha_val  # = 13700
        # alpha = b + c, beta = a - v
        # Pilih c=0, b=alpha_val=100
        # a - v = 13700, s=10 → b = 100
        # a = p0 + b*q0, pilih p0=5000, q0=137 → a = 5000+13700=18700, v=18700-13700=5000
        params = OptimizeParams(
            fixed_cost=100_000,
            variable_cost=5000,
            quad_cost=0,
            ref_price=5000,
            ref_demand=137,
            sensitivity=10,
            capacity=None,
        )
        r = optimize(params)
        x_int = r.integer.x
        a, b = r.a, r.b
        fc, v, c = params.fixed_cost, params.variable_cost, params.quad_cost
        # Verifikasi: x_int adalah argmax P di kandidat
        p_int = r.integer.profit
        assert p_int >= profit(float(x_int - 1), a, b, fc, v, c)
        assert p_int >= profit(float(x_int + 1), a, b, fc, v, c)

    def test_capacity_fractional(self):
        """Kapasitas pecahan 60.7 → batas integer = 60."""
        params = OptimizeParams(
            fixed_cost=300_000,
            variable_cost=8000,
            quad_cost=0,
            ref_price=22000,
            ref_demand=80,
            sensitivity=5,
            capacity=60.7,
        )
        r = optimize(params)
        # Kapasitas 60.7 → x_end_int = floor(60.7) = 60
        assert r.integer.x <= 60

    def test_fc_zero(self):
        """FC=0: P* = beta^2/(4*alpha) > 0, BEP pertama = 0."""
        from app.core.breakeven import breakeven

        params = OptimizeParams(
            fixed_cost=0,
            variable_cost=8000,
            quad_cost=0,
            ref_price=22000,
            ref_demand=80,
            sensitivity=5,
            capacity=None,
        )
        r = optimize(params)
        assert r.continuous.profit > 0
        a, b = r.a, r.b
        bep = breakeven(a, b, 0, 8000, 0)
        assert bep.exists
        assert close(bep.x_low, 0, abs_tol=1e-6)

    def test_large_fc_no_overflow(self):
        """FC = 1e10 tidak menghasilkan NaN/Inf."""
        params = OptimizeParams(
            fixed_cost=1e10,
            variable_cost=8000,
            quad_cost=0,
            ref_price=22000,
            ref_demand=80,
            sensitivity=5,
            capacity=None,
        )
        r = optimize(params)
        assert math.isfinite(r.continuous.profit)
        assert math.isfinite(r.integer.profit)

    def test_x_star_tiny(self):
        """x* sangat kecil (< 0.5) → integer 0 atau 1."""
        # a - v kecil, alpha besar → x* kecil
        # s=1 → b=1000, a = p0+b*q0
        # pilih p0=10, q0=0.1, s=1 → a=110, v=109.9 → beta=0.1, alpha=1000 → x*=0.00005
        params = OptimizeParams(
            fixed_cost=0,
            variable_cost=109,
            quad_cost=0,
            ref_price=10,
            ref_demand=1,
            sensitivity=1,
            capacity=None,
        )
        r = optimize(params)
        assert r.integer.x in (0, 1)


class TestPropertyTests:
    """Property test: 200 kombinasi parameter acak (PRD 9.2)."""

    @pytest.mark.parametrize("seed", range(200))
    def test_dprofit_zero_at_xstar(self, seed):
        """P'(x*) ≈ 0 untuk parameter acak yang valid."""
        rng = random.Random(seed)
        p0 = rng.uniform(5000, 50000)
        q0 = rng.uniform(10, 300)
        s = rng.uniform(0.5, 20)
        v = rng.uniform(0, p0 * 0.9)  # pastikan beta > 0
        c = rng.uniform(0, 50)
        FC = rng.uniform(0, 500_000)

        a, b = demand_params(p0, q0, s)
        params = OptimizeParams(
            fixed_cost=FC, variable_cost=v, quad_cost=c,
            ref_price=p0, ref_demand=q0, sensitivity=s, capacity=None
        )
        r = optimize(params)

        if r.status == OptimizationStatus.INTERIOR_OPTIMUM:
            dp = dprofit(r.continuous.x, r.a, r.b, v, c)
            assert close(dp, 0, abs_tol=1e-4), f"seed={seed}, P'={dp}"

    @pytest.mark.parametrize("seed", range(200))
    def test_integer_profit_le_continuous(self, seed):
        """Laba integer ≤ laba kontinu (PRD 9.2 iv)."""
        rng = random.Random(seed + 1000)
        p0 = rng.uniform(5000, 50000)
        q0 = rng.uniform(10, 300)
        s = rng.uniform(0.5, 20)
        v = rng.uniform(0, p0 * 0.9)
        c = rng.uniform(0, 50)
        FC = rng.uniform(0, 500_000)

        params = OptimizeParams(
            fixed_cost=FC, variable_cost=v, quad_cost=c,
            ref_price=p0, ref_demand=q0, sensitivity=s, capacity=None
        )
        r = optimize(params)
        assert r.integer.profit <= r.continuous.profit + 1e-3  # toleransi kecil

    @pytest.mark.parametrize("seed", range(200))
    def test_integer_is_local_max(self, seed):
        """P(x_int) >= P(x_int ± 1) (PRD 9.2)."""
        rng = random.Random(seed + 2000)
        p0 = rng.uniform(5000, 50000)
        q0 = rng.uniform(10, 300)
        s = rng.uniform(0.5, 20)
        v = rng.uniform(0, p0 * 0.9)
        c = rng.uniform(0, 50)
        FC = rng.uniform(0, 500_000)

        params = OptimizeParams(
            fixed_cost=FC, variable_cost=v, quad_cost=c,
            ref_price=p0, ref_demand=q0, sensitivity=s, capacity=None
        )
        r = optimize(params)
        x_int = r.integer.x
        a, b = r.a, r.b
        p_int = r.integer.profit

        if x_int > 0:
            p_minus = profit(float(x_int - 1), a, b, FC, v, c)
            assert p_int >= p_minus - 1e-6, f"seed={seed}"

        p_plus = profit(float(x_int + 1), a, b, FC, v, c)
        assert p_int >= p_plus - 1e-6, f"seed={seed}"
