"""
test_model.py — Test fungsi murni di app/core/model.py
"""

from __future__ import annotations

import math

import pytest

from app.core.model import (
    alpha,
    beta,
    cost,
    d2profit,
    demand_params,
    dprofit,
    price,
    profit,
    revenue,
)
from tests.conftest import close


class TestDemandParams:
    def test_g1_params(self):
        a, b = demand_params(22000, 80, 5)
        assert close(b, 200.0)
        assert close(a, 38000.0)

    def test_price_at_q0_equals_p0(self):
        """Verifikasi: p(q0) = p0 (PRD 4.2)."""
        p0, q0, s = 22000, 80, 5
        a, b = demand_params(p0, q0, s)
        assert close(price(q0, a, b), p0)

    def test_various_params(self):
        a, b = demand_params(10000, 50, 2)
        assert close(b, 500.0)
        assert close(a, 10000 + 500 * 50)

    def test_sensitivity_affects_slope(self):
        """Sensitivitas lebih besar → kemiringan lebih landai (b lebih kecil)."""
        _, b1 = demand_params(20000, 100, 10)
        _, b2 = demand_params(20000, 100, 2)
        assert b2 > b1  # s kecil → b besar


class TestPrice:
    def test_price_decreases_with_x(self):
        a, b = 38000, 200
        assert price(0, a, b) > price(100, a, b)

    def test_price_at_zero(self):
        assert close(price(0, 38000, 200), 38000)

    def test_g1_optimal_price(self):
        a, b = demand_params(22000, 80, 5)
        assert close(price(75, a, b), 23000)


class TestRevenue:
    def test_zero_x(self):
        assert close(revenue(0, 38000, 200), 0)

    def test_g1_at_xstar(self):
        a, b = demand_params(22000, 80, 5)
        assert close(revenue(75, a, b), 1_725_000)

    def test_revenue_quadratic_shape(self):
        """R(x) parabola terbuka ke bawah → R(x*) > R(0) dan R(a/b)=0."""
        a, b = 38000.0, 200.0
        x_max = a / b  # harga = 0
        assert revenue(0, a, b) == 0
        assert close(revenue(x_max, a, b), 0, abs_tol=1e-3)
        assert revenue(75, a, b) > revenue(0, a, b)


class TestCost:
    def test_zero_x_equals_fc(self):
        assert close(cost(0, 300_000, 8000, 0), 300_000)

    def test_linear_cost(self):
        """Tanpa biaya kuadrat, biaya linier terhadap x."""
        c1 = cost(10, 300_000, 8000, 0)
        c2 = cost(20, 300_000, 8000, 0)
        assert close(c2 - c1, 8000 * 10)

    def test_quadratic_cost(self):
        c = cost(10, 300_000, 8000, 20)
        expected = 300_000 + 8000 * 10 + 20 * 100
        assert close(c, expected)

    def test_g1_at_xstar(self):
        assert close(cost(75, 300_000, 8000, 0), 900_000)


class TestProfit:
    def test_g1_at_xstar(self):
        a, b = demand_params(22000, 80, 5)
        p = profit(75, a, b, 300_000, 8000, 0)
        assert close(p, 825_000)

    def test_g1_reference_q0(self):
        """P(80) = 820.000 (PRD 9.1 catatan referensi G1)."""
        a, b = demand_params(22000, 80, 5)
        p = profit(80, a, b, 300_000, 8000, 0)
        assert close(p, 820_000)

    def test_g3_at_capacity(self):
        a, b = demand_params(22000, 80, 5)
        p = profit(60, a, b, 300_000, 8000, 0)
        assert close(p, 780_000)

    def test_g5_no_production(self):
        a, b = demand_params(22000, 80, 5)
        p = profit(0, a, b, 300_000, 45_000, 0)
        assert close(p, -300_000)


class TestAlphaBeta:
    def test_alpha_no_quad(self):
        assert close(alpha(200, 0), 200)

    def test_alpha_with_quad(self):
        assert close(alpha(200, 20), 220)

    def test_beta_g1(self):
        a, b = demand_params(22000, 80, 5)
        assert close(beta(a, 8000), 30_000)

    def test_beta_g5_nonpositive(self):
        """G5: beta <= 0 → NO_PRODUCTION."""
        a, b = demand_params(22000, 80, 5)
        be = beta(a, 45_000)
        assert be <= 0


class TestDprofit:
    def test_zero_at_xstar_g1(self):
        """P'(x*) ≈ 0 (syarat titik kritis, PRD 4.6)."""
        a, b = demand_params(22000, 80, 5)
        dp = dprofit(75, a, b, 8000, 0)
        assert close(dp, 0, abs_tol=1e-6)

    def test_positive_before_xstar(self):
        """P' > 0 untuk x < x* (P masih naik)."""
        a, b = demand_params(22000, 80, 5)
        assert dprofit(74, a, b, 8000, 0) > 0

    def test_negative_after_xstar(self):
        """P' < 0 untuk x > x* (P sudah turun)."""
        a, b = demand_params(22000, 80, 5)
        assert dprofit(76, a, b, 8000, 0) < 0


class TestD2profit:
    def test_g1_negative(self):
        assert close(d2profit(200, 0), -400)

    def test_g2_negative(self):
        assert close(d2profit(200, 20), -440)

    def test_always_negative(self):
        """P'' selalu negatif → titik kritis selalu maksimum."""
        for b in [100, 200, 500]:
            for c in [0, 10, 50]:
                assert d2profit(b, c) < 0
