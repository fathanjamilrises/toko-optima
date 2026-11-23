"""
test_validation.py — Test validation.py: peringatan semantik bisnis.
"""

from __future__ import annotations

import pytest

from app.core.breakeven import breakeven
from app.core.model import demand_params
from app.core.optimizer import OptimizeParams, optimize
from app.core.validation import collect_warnings


def _run(params: OptimizeParams):
    opt = optimize(params)
    a, b = opt.a, opt.b
    bep = breakeven(a, b, params.fixed_cost, params.variable_cost, params.quad_cost)
    warns = collect_warnings(
        opt=opt,
        bep=bep,
        ref_price=params.ref_price,
        ref_demand=params.ref_demand,
        variable_cost=params.variable_cost,
        capacity=params.capacity,
    )
    return warns


class TestWarningG3:
    def test_capacity_binding_warning(self, g3_params):
        warns = _run(g3_params)
        codes = [w.code for w in warns]
        assert "W_CAPACITY_BINDING" in codes

    def test_level_info(self, g3_params):
        warns = _run(g3_params)
        wb = next(w for w in warns if w.code == "W_CAPACITY_BINDING")
        assert wb.level == "info"


class TestWarningG4:
    def test_neg_profit_warning(self, g4_params):
        warns = _run(g4_params)
        codes = [w.code for w in warns]
        assert "W_NEG_PROFIT" in codes

    def test_level_warning(self, g4_params):
        warns = _run(g4_params)
        wn = next(w for w in warns if w.code == "W_NEG_PROFIT")
        assert wn.level == "warning"


class TestWarningG5:
    def test_no_production_warning(self, g5_params):
        warns = _run(g5_params)
        codes = [w.code for w in warns]
        assert "W_NO_PRODUCTION" in codes

    def test_level_warning_no_production(self, g5_params):
        warns = _run(g5_params)
        wn = next(w for w in warns if w.code == "W_NO_PRODUCTION")
        assert wn.level == "warning"


class TestWarningG1:
    def test_no_warnings_g1(self, g1_params):
        """G1 baseline: tidak ada peringatan."""
        warns = _run(g1_params)
        assert len(warns) == 0


class TestWarningPriceBelowRefCost:
    def test_price_below_vc(self):
        params = OptimizeParams(
            fixed_cost=300_000,
            variable_cost=25_000,  # > p0
            quad_cost=0,
            ref_price=22_000,  # < v
            ref_demand=80,
            sensitivity=5,
            capacity=None,
        )
        warns = _run(params)
        codes = [w.code for w in warns]
        assert "W_PRICE_BELOW_REF_COST" in codes


class TestWarningExtrapolation:
    def test_x_opt_too_high(self):
        """x_opt >> 2*q0 → W_EXTRAPOLATION."""
        # q0=5 (sangat kecil), x* akan jauh lebih besar
        params = OptimizeParams(
            fixed_cost=300_000,
            variable_cost=1000,
            quad_cost=0,
            ref_price=22_000,
            ref_demand=5,
            sensitivity=5,
            capacity=None,
        )
        warns = _run(params)
        codes = [w.code for w in warns]
        assert "W_EXTRAPOLATION" in codes


class TestWarningPriceJump:
    def test_price_jump_warning(self):
        """p_opt berbeda > 50% dari ref_price → W_PRICE_JUMP."""
        # p0 = 10000, a = p0 + b*q0 = 10000 + 200*100 = 30000
        # x* = (a - v)/(2*b) = (30000 - 2000)/400 = 70
        # p* = 30000 - 200*70 = 16000. Selisih (16000 - 10000)/10000 = 60% > 50%
        params = OptimizeParams(
            fixed_cost=100_000,
            variable_cost=2000,
            quad_cost=0,
            ref_price=10_000,
            ref_demand=100,
            sensitivity=5,
            capacity=None,
        )
        warns = _run(params)
        codes = [w.code for w in warns]
        assert "W_PRICE_JUMP" in codes

