"""
test_curves.py — Test curves.py: data titik grafik.
"""

from __future__ import annotations

import pytest

from app.core.breakeven import breakeven
from app.core.curves import build_curves
from app.core.model import demand_params, profit
from app.core.optimizer import OptimizeParams, optimize
from tests.conftest import close


class TestBuildCurvesG1:
    def setup_method(self):
        params = OptimizeParams(
            fixed_cost=300_000, variable_cost=8000, quad_cost=0,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None
        )
        r = optimize(params)
        a, b = r.a, r.b
        bep = breakeven(a, b, 300_000, 8000, 0)
        self.cd = build_curves(
            a=a, b=b,
            fixed_cost=300_000, variable_cost=8000, quad_cost=0,
            ref_demand=80, x_opt=r.continuous.x, bep=bep,
            capacity=None, n_points=200,
        )

    def test_x_range_starts_at_zero(self):
        assert close(self.cd.x_range[0], 0.0)

    def test_x_range_contains_xopt(self):
        x_opt = 75.0
        assert self.cd.x_range[0] <= x_opt <= self.cd.x_range[1]

    def test_points_not_empty(self):
        assert len(self.cd.points) >= 200

    def test_xopt_in_points(self):
        """Titik x=75 selalu ada secara eksplisit."""
        xs = {pt.x for pt in self.cd.points}
        assert 75.0 in xs

    def test_bep_points_in_points(self):
        """Titik BEP selalu ada secara eksplisit."""
        xs = {pt.x for pt in self.cd.points}
        # BEP ≈ 10.77 dan 139.23
        bep_low = min(xs, key=lambda x: abs(x - 10.77))
        bep_high = min(xs, key=lambda x: abs(x - 139.23))
        assert abs(bep_low - 10.77) < 0.01
        assert abs(bep_high - 139.23) < 0.01

    def test_optimum_marker(self):
        assert close(self.cd.markers.optimum["x"], 75.0)
        assert close(self.cd.markers.optimum["P"], 825_000)

    def test_reference_marker(self):
        """Referensi P(q0) = P(80) = 820.000."""
        assert close(self.cd.markers.reference["x"], 80.0)
        assert close(self.cd.markers.reference["P"], 820_000)

    def test_break_even_markers(self):
        assert len(self.cd.markers.break_even) == 2

    def test_no_negative_price_in_range(self):
        """Semua titik dalam rentang memiliki harga >= 0 (dipotong di a/b)."""
        for pt in self.cd.points:
            assert pt.price >= -1e-6  # toleransi kecil


class TestBuildCurvesNoCapacity:
    def test_no_capacity_marker(self):
        params = OptimizeParams(
            fixed_cost=300_000, variable_cost=8000, quad_cost=0,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None
        )
        r = optimize(params)
        a, b = r.a, r.b
        bep = breakeven(a, b, 300_000, 8000, 0)
        cd = build_curves(
            a=a, b=b, fixed_cost=300_000, variable_cost=8000, quad_cost=0,
            ref_demand=80, x_opt=r.continuous.x, bep=bep, capacity=None, n_points=100,
        )
        assert cd.markers.capacity is None


class TestBuildCurvesG4NoBEP:
    def test_no_bep_markers(self):
        params = OptimizeParams(
            fixed_cost=1_500_000, variable_cost=8000, quad_cost=0,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None
        )
        r = optimize(params)
        a, b = r.a, r.b
        bep = breakeven(a, b, 1_500_000, 8000, 0)
        cd = build_curves(
            a=a, b=b, fixed_cost=1_500_000, variable_cost=8000, quad_cost=0,
            ref_demand=80, x_opt=r.continuous.x, bep=bep, capacity=None, n_points=100,
        )
        assert len(cd.markers.break_even) == 0
