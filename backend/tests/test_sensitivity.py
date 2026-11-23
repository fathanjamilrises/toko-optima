"""
test_sensitivity.py — Test sensitivity.py: turunan parsial dan tabel skenario.
"""

from __future__ import annotations

import pytest

from app.core.model import demand_params, profit
from app.core.optimizer import OptimizeParams, optimize
from app.core.sensitivity import partials, scenario_table
from tests.conftest import close


class TestPartialsG1:
    def setup_method(self):
        self.params = OptimizeParams(
            fixed_cost=300_000, variable_cost=8000, quad_cost=0,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None,
        )
        self.r = optimize(self.params)
        self.p = partials(self.r.b, self.params.quad_cost, self.r.continuous.x)

    def test_dx_dv(self):
        assert close(self.p.dx_dv, -0.0025)

    def test_dx_dFC(self):
        assert close(self.p.dx_dFC, 0.0)

    def test_dx_da(self):
        assert close(self.p.dx_da, 0.0025)

    def test_dP_dFC(self):
        assert close(self.p.dP_dFC, -1.0)

    def test_dP_dv(self):
        """dP*/dv = -x* = -75 (Teorema Envelope)."""
        assert close(self.p.dP_dv, -75.0)

    def test_dP_da(self):
        assert close(self.p.dP_da, 75.0)


class TestEnvelopeTheorem:
    """Verifikasi teorema envelope: dP*/dv ≈ beda hingga numeris."""

    def test_dP_dv_finite_difference(self):
        params = OptimizeParams(
            fixed_cost=300_000, variable_cost=8000, quad_cost=0,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None,
        )
        r = optimize(params)
        x_star = r.continuous.x
        h = 1.0  # Rp1

        p_plus = optimize(OptimizeParams(
            fixed_cost=params.fixed_cost,
            variable_cost=params.variable_cost + h,
            quad_cost=params.quad_cost,
            ref_price=params.ref_price,
            ref_demand=params.ref_demand,
            sensitivity=params.sensitivity,
        )).continuous.profit

        p_minus = optimize(OptimizeParams(
            fixed_cost=params.fixed_cost,
            variable_cost=params.variable_cost - h,
            quad_cost=params.quad_cost,
            ref_price=params.ref_price,
            ref_demand=params.ref_demand,
            sensitivity=params.sensitivity,
        )).continuous.profit

        fd = (p_plus - p_minus) / (2 * h)
        p = partials(r.b, params.quad_cost, x_star)

        assert close(fd, p.dP_dv, abs_tol=1e-3)


class TestScenarioTable:
    def test_returns_8_rows(self, g1_params):
        """4 skenario v + 4 skenario FC = 8 baris."""
        r = optimize(g1_params)
        rows = scenario_table(g1_params, r.continuous.profit)
        assert len(rows) == 8

    def test_v_plus10_pct(self, g1_params):
        """v +10% → v=8800; x* turun, laba turun (G1 contoh di PRD 7.2)."""
        r = optimize(g1_params)
        rows = scenario_table(g1_params, r.continuous.profit)
        row = next(ro for ro in rows if ro.param_changed == "variable_cost" and ro.delta_pct == 10.0)

        # Verifikasi dengan kalkulasi manual
        params_new = OptimizeParams(
            fixed_cost=300_000, variable_cost=8800, quad_cost=0,
            ref_price=22000, ref_demand=80, sensitivity=5, capacity=None
        )
        r_new = optimize(params_new)
        assert close(row.x, r_new.continuous.x, abs_tol=1e-3)
        assert close(row.profit, r_new.continuous.profit, abs_tol=1e-3)

    def test_fc_increase_shifts_profit_only(self, g1_params):
        """FC naik → x* sama, laba turun sebesar FC naik (dP*/dFC = -1)."""
        r = optimize(g1_params)
        rows = scenario_table(g1_params, r.continuous.profit)
        fc_row = next(ro for ro in rows if ro.param_changed == "fixed_cost" and ro.delta_pct == 10.0)

        delta_fc = g1_params.fixed_cost * 0.10
        # x* tidak berubah, laba turun delta_fc
        assert close(fc_row.delta_profit, -delta_fc, abs_tol=1.0)

    def test_delta_profit_consistent(self, g1_params):
        """delta_profit = profit_skenario - baseline_profit."""
        r = optimize(g1_params)
        rows = scenario_table(g1_params, r.continuous.profit)
        for row in rows:
            assert close(row.delta_profit, row.profit - r.continuous.profit, abs_tol=1e-3)
