"""Test Phase 2 untuk penyusun 16 langkah solusi."""

from __future__ import annotations

import pytest

from app.core.optimizer import optimize
from app.steps.builder import build_steps


@pytest.mark.parametrize("fixture_name", ["g1_params", "g2_params", "g3_params", "g4_params", "g5_params"])
def test_always_has_sixteen_steps(request: pytest.FixtureRequest, fixture_name: str) -> None:
    params = request.getfixturevalue(fixture_name)
    steps = build_steps(params, optimize(params))
    assert [step["id"] for step in steps] == list(range(1, 17))
    assert all(set(step) == {"id", "title", "latex", "explanation", "values"} for step in steps)


def test_g1_snapshot(g1_params) -> None:
    steps = build_steps(g1_params, optimize(g1_params))
    assert [(step["id"], step["title"], step["latex"]) for step in steps[:3]] == [
        (1, "Data yang diketahui", "FC=300,000,\\; v=8,000,\\; c=0,\\; p_0=22,000,\\; q_0=80,\\; s=5"),
        (2, "Menyusun fungsi harga-permintaan", "b=\\frac{1000}{5}=200,\\quad a=22,000+200\\cdot80=38,000,\\quad p(x)=38,000-200x"),
        (3, "Fungsi pendapatan", "R(x)=x\\,p(x)=38,000x-200x^2"),
    ]
    assert steps[15]["explanation"] == "Keuntungan maksimum diperoleh saat menjual 75 cangkir per hari dengan harga Rp23.000 per cangkir, menghasilkan laba Rp825.000. Usaha mulai untung pada penjualan ≥ 11 cangkir."


def test_g2_snapshot(g2_params) -> None:
    steps = build_steps(g2_params, optimize(g2_params))
    assert steps[4]["latex"] == "P(x)=-220x^2+30,000x-300,000"
    assert steps[10]["values"]["x_int"] == 68
    assert steps[13]["latex"] == "MR=10,727.27,\\quad MC=10,727.27"


def test_step_values_are_core_results(g1_params) -> None:
    result = optimize(g1_params)
    steps = build_steps(g1_params, result)
    assert steps[1]["values"] == {"a": result.a, "b": result.b}
    assert steps[11]["values"]["profit"] == result.continuous.profit
    assert steps[11]["values"]["price"] == result.continuous.price
    assert steps[10]["values"]["profit_int"] == result.integer.profit


def test_non_applicable_steps_are_explained(g5_params) -> None:
    steps = build_steps(g5_params, optimize(g5_params))
    assert "Tidak berlaku" in steps[6]["explanation"]
    assert "Tidak berlaku" in steps[12]["explanation"]
    assert "tidak menguntungkan" in steps[15]["explanation"]
