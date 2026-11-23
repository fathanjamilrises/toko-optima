"""
conftest.py — Fixture bersama untuk semua test KopiOptima.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import pytest

from app.core.optimizer import OptimizeParams

GOLDEN_PATH = Path(__file__).parent / "golden_cases.json"


@pytest.fixture(scope="session")
def golden() -> dict:
    """Memuat golden_cases.json sekali untuk seluruh sesi test."""
    return json.loads(GOLDEN_PATH.read_text(encoding="utf-8"))


def close(a: float, b: float, rel_tol: float = 1e-9, abs_tol: float = 1e-6) -> bool:
    """Pembungkus math.isclose dengan toleransi sesuai PRD 5.3."""
    return math.isclose(a, b, rel_tol=rel_tol, abs_tol=abs_tol)


@pytest.fixture
def g1_params() -> OptimizeParams:
    return OptimizeParams(
        fixed_cost=300_000,
        variable_cost=8_000,
        quad_cost=0,
        ref_price=22_000,
        ref_demand=80,
        sensitivity=5,
        capacity=None,
    )


@pytest.fixture
def g2_params() -> OptimizeParams:
    return OptimizeParams(
        fixed_cost=300_000,
        variable_cost=8_000,
        quad_cost=20,
        ref_price=22_000,
        ref_demand=80,
        sensitivity=5,
        capacity=None,
    )


@pytest.fixture
def g3_params() -> OptimizeParams:
    return OptimizeParams(
        fixed_cost=300_000,
        variable_cost=8_000,
        quad_cost=0,
        ref_price=22_000,
        ref_demand=80,
        sensitivity=5,
        capacity=60,
    )


@pytest.fixture
def g4_params() -> OptimizeParams:
    return OptimizeParams(
        fixed_cost=1_500_000,
        variable_cost=8_000,
        quad_cost=0,
        ref_price=22_000,
        ref_demand=80,
        sensitivity=5,
        capacity=None,
    )


@pytest.fixture
def g5_params() -> OptimizeParams:
    return OptimizeParams(
        fixed_cost=300_000,
        variable_cost=45_000,
        quad_cost=0,
        ref_price=22_000,
        ref_demand=80,
        sensitivity=5,
        capacity=None,
    )
