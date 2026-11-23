"""
schemas.py — Model Pydantic v2 untuk request dan response API KopiOptima.

Sumber kebenaran: PRD Bagian 7
Validasi field dan pesan error dalam Bahasa Indonesia.
Pembulatan uang HANYA dilakukan di lapisan ini (bukan di core/).
"""

from __future__ import annotations

import math
from typing import Any

from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------


class OptimizeOptions(BaseModel):
    """Opsi tambahan untuk endpoint /optimize."""

    include_steps: bool = True
    include_curves: bool = True
    include_sensitivity: bool = True
    curve_points: int = Field(default=200, ge=50, le=1000)
    verify_symbolic: bool = False


class OptimizeRequest(BaseModel):
    """Body request POST /optimize dan endpoint turunannya.

    Validasi (PRD 7.2):
        fixed_cost:    >= 0, maks 1e10
        variable_cost: >= 0, maks 1e7
        quad_cost:     >= 0
        ref_price:     > 0
        ref_demand:    > 0
        sensitivity:   > 0
        capacity:      null atau > 0
    """

    fixed_cost: float = Field(
        ...,
        ge=0,
        le=1e10,
        description="Biaya tetap per periode (Rp)",
    )
    variable_cost: float = Field(
        ...,
        ge=0,
        le=1e7,
        description="Biaya variabel per cangkir (Rp/cangkir)",
    )
    quad_cost: float = Field(
        default=0.0,
        ge=0,
        description="Koefisien biaya kuadrat (Rp/cangkir^2), opsional",
    )
    ref_price: float = Field(
        ...,
        gt=0,
        description="Harga acuan saat ini (Rp/cangkir)",
    )
    ref_demand: float = Field(
        ...,
        gt=0,
        description="Permintaan pada harga acuan (cangkir/periode)",
    )
    sensitivity: float = Field(
        ...,
        gt=0,
        description="Penurunan permintaan per kenaikan harga Rp1.000 (cangkir per Rp1.000)",
    )
    capacity: float | None = Field(
        default=None,
        gt=0,
        description="Kapasitas maksimum produksi harian (cangkir), opsional",
    )
    options: OptimizeOptions = Field(default_factory=OptimizeOptions)
    steps_pct: list[float] | None = Field(
        default=None,
        description="Persentase perubahan untuk tabel sensitivitas, misalnya [-20, -10, 10, 20]",
    )

    @field_validator("fixed_cost", "variable_cost", "quad_cost", "ref_price", "ref_demand", "sensitivity", "capacity", mode="before")
    @classmethod
    def validate_finite(cls, v: Any) -> Any:
        """Tolak NaN dan Inf."""
        if isinstance(v, (int, float)) and not math.isfinite(float(v)):
            raise ValueError("Nilai harus berupa angka yang terhingga (bukan NaN atau Inf)")
        return v

    model_config = {"json_schema_extra": {
        "example": {
            "fixed_cost": 300000,
            "variable_cost": 8000,
            "quad_cost": 0,
            "ref_price": 22000,
            "ref_demand": 80,
            "sensitivity": 5,
            "capacity": None,
            "options": {
                "include_steps": False,
                "include_curves": True,
                "include_sensitivity": True,
                "curve_points": 200,
                "verify_symbolic": False,
            },
        }
    }}


# ---------------------------------------------------------------------------
# Response sub-models
# ---------------------------------------------------------------------------


class ModelFormulas(BaseModel):
    price: str
    revenue: str
    cost: str
    profit: str
    dprofit: str
    d2profit: str


class ModelInfo(BaseModel):
    a: float
    b: float
    alpha: float
    beta: float
    formulas: ModelFormulas


class PointResult(BaseModel):
    x: float
    price: float
    revenue: float
    cost: float
    profit: float


class IntegerCandidateOut(BaseModel):
    x: int
    profit: float


class IntegerResultOut(BaseModel):
    x: int
    price: float
    revenue: float
    cost: float
    profit: float
    candidates: list[IntegerCandidateOut]


class OptimumOut(BaseModel):
    status: str
    continuous: PointResult
    integer: IntegerResultOut
    second_derivative: float
    is_maximum: bool


class BreakEvenOut(BaseModel):
    exists: bool
    discriminant: float
    x_low: float | None = None
    x_high: float | None = None
    x_low_int: int | None = None
    x_high_int: int | None = None


class MarginalOut(BaseModel):
    mr_at_opt: float
    mc_at_opt: float
    elasticity: float | None = None
    elasticity_label: str | None = None


class SensitivityPartialsOut(BaseModel):
    dx_dv: float
    dx_dFC: float
    dx_da: float
    dP_dFC: float
    dP_dv: float
    dP_da: float


class ScenarioRowOut(BaseModel):
    label: str
    delta_pct: float
    param_changed: str
    x: float
    price: float
    profit: float
    delta_profit: float


class SensitivityOut(BaseModel):
    partials: SensitivityPartialsOut | None = None
    scenarios: list[ScenarioRowOut] = []


class CurvePointOut(BaseModel):
    x: float
    price: float
    R: float
    C: float
    P: float
    MR: float
    MC: float
    dP: float


class CurvesOut(BaseModel):
    x_range: list[float]
    points: list[CurvePointOut]
    markers: dict


class WarningOut(BaseModel):
    code: str
    level: str
    message: str


class StepOut(BaseModel):
    """Satu langkah solusi yang siap dirender oleh KaTeX dan UI."""

    id: int
    title: str
    latex: str
    explanation: str
    values: dict[str, Any]


class VerifyOut(BaseModel):
    passed: bool
    x_star_sympy: float
    x_star_closed: float
    d2_sympy: float
    d2_closed: float
    p_star_sympy: float
    p_star_closed: float
    max_error: float


class OptimizeResponse(BaseModel):
    model: ModelInfo
    optimum: OptimumOut
    break_even: BreakEvenOut
    marginal: MarginalOut
    sensitivity: SensitivityOut | None = None
    curves: CurvesOut | None = None
    steps: list[StepOut] | None = None
    warnings: list[WarningOut] = []
    verification: VerifyOut | None = None


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: str
    version: str
