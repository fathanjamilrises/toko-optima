"""
routes.py — Endpoint API KopiOptima.

Sumber kebenaran: PRD Bagian 7
Phase 0: /health
Phase 1 (via routes): /optimize, /curves, /sensitivity, /presets
"""

from __future__ import annotations

from fastapi import APIRouter

from app.core.breakeven import breakeven
from app.core.curves import build_curves
from app.core.marginal import compute_marginal
from app.core.model import demand_params
from app.core.optimizer import OptimizeParams, optimize
from app.core.sensitivity import partials, scenario_table
from app.core.sympy_verify import verify_with_sympy
from app.core.validation import collect_warnings
from app.schemas import (
    BreakEvenOut,
    CurvePointOut,
    CurvesOut,
    HealthResponse,
    IntegerCandidateOut,
    IntegerResultOut,
    MarginalOut,
    ModelFormulas,
    ModelInfo,
    OptimizeRequest,
    OptimizeResponse,
    OptimumOut,
    PointResult,
    ScenarioRowOut,
    SensitivityOut,
    SensitivityPartialsOut,
    StepOut,
    VerifyOut,
    WarningOut,
)
from app.steps.builder import build_steps

router = APIRouter()


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------


@router.get("/health", response_model=HealthResponse, tags=["Sistem"])
def health() -> HealthResponse:
    """Cek status server."""
    return HealthResponse(status="ok", version="1.0.0")


# ---------------------------------------------------------------------------
# GET /presets
# ---------------------------------------------------------------------------


_PRESETS = [
    {
        "id": "G1",
        "label": "Kedai Kopi Kecil (Baseline)",
        "fixed_cost": 300_000,
        "variable_cost": 8_000,
        "quad_cost": 0,
        "ref_price": 22_000,
        "ref_demand": 80,
        "sensitivity": 5,
        "capacity": None,
    },
    {
        "id": "G2",
        "label": "Kedai dengan Biaya Lembur",
        "fixed_cost": 300_000,
        "variable_cost": 8_000,
        "quad_cost": 20,
        "ref_price": 22_000,
        "ref_demand": 80,
        "sensitivity": 5,
        "capacity": None,
    },
    {
        "id": "G3",
        "label": "Kedai Kapasitas Terbatas",
        "fixed_cost": 300_000,
        "variable_cost": 8_000,
        "quad_cost": 0,
        "ref_price": 22_000,
        "ref_demand": 80,
        "sensitivity": 5,
        "capacity": 60,
    },
]


@router.get("/presets", tags=["Preset"])
def get_presets() -> list[dict]:
    """Daftar preset kedai kopi untuk demo (PRD 7.5)."""
    return _PRESETS


# ---------------------------------------------------------------------------
# POST /optimize
# ---------------------------------------------------------------------------


@router.post("/optimize", response_model=OptimizeResponse, tags=["Optimasi"])
def post_optimize(body: OptimizeRequest) -> OptimizeResponse:
    """Hitung titik optimal keuntungan kedai kopi (PRD 7.2)."""
    return _run_optimize(body)


# ---------------------------------------------------------------------------
# POST /curves
# ---------------------------------------------------------------------------


@router.post("/curves", response_model=CurvesOut, tags=["Grafik"])
def post_curves(body: OptimizeRequest) -> CurvesOut:
    """Hitung data titik untuk grafik kurva R, C, P (PRD 7.3)."""
    result = _run_optimize(body)
    return result.curves  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# POST /sensitivity
# ---------------------------------------------------------------------------


@router.post("/sensitivity", response_model=SensitivityOut, tags=["Sensitivitas"])
def post_sensitivity(body: OptimizeRequest) -> SensitivityOut:
    """Hitung analisis sensitivitas (PRD 7.4)."""
    result = _run_optimize(body)
    return result.sensitivity  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Core compute helper (dipakai oleh semua endpoint di atas)
# ---------------------------------------------------------------------------


def _run_optimize(body: OptimizeRequest) -> OptimizeResponse:
    """Orkestrasi seluruh perhitungan dari satu request."""
    params = OptimizeParams(
        fixed_cost=body.fixed_cost,
        variable_cost=body.variable_cost,
        quad_cost=body.quad_cost,
        ref_price=body.ref_price,
        ref_demand=body.ref_demand,
        sensitivity=body.sensitivity,
        capacity=body.capacity,
    )

    # --- Optimasi utama ---
    opt = optimize(params)
    a, b = opt.a, opt.b
    al, be = opt.alpha, opt.beta

    # --- BEP ---
    bep = breakeven(a, b, body.fixed_cost, body.variable_cost, body.quad_cost)

    # --- Marginal ---
    marg = compute_marginal(
        x_opt=opt.continuous.x,
        a=a,
        b=b,
        variable_cost=body.variable_cost,
        quad_cost=body.quad_cost,
        p_opt=opt.continuous.price,
    )

    # --- Warnings ---
    warns = collect_warnings(
        opt=opt,
        bep=bep,
        ref_price=body.ref_price,
        ref_demand=body.ref_demand,
        variable_cost=body.variable_cost,
        capacity=body.capacity,
    )

    # --- Sensitivitas ---
    sensitivity_out: SensitivityOut | None = None
    if body.options.include_sensitivity:
        part = None
        scenarios_out: list[ScenarioRowOut] = []
        if opt.x_star_unconstrained is not None:
            part = partials(b, body.quad_cost, opt.x_star_unconstrained)
        sc_rows = scenario_table(params, opt.continuous.profit, body.steps_pct)
        scenarios_out = [
            ScenarioRowOut(
                label=r.label,
                delta_pct=r.delta_pct,
                param_changed=r.param_changed,
                x=r.x,
                price=r.price,
                profit=r.profit,
                delta_profit=r.delta_profit,
            )
            for r in sc_rows
        ]
        sensitivity_out = SensitivityOut(
            partials=SensitivityPartialsOut(
                dx_dv=part.dx_dv if part else 0.0,
                dx_dFC=part.dx_dFC if part else 0.0,
                dx_da=part.dx_da if part else 0.0,
                dP_dFC=part.dP_dFC if part else 0.0,
                dP_dv=part.dP_dv if part else 0.0,
                dP_da=part.dP_da if part else 0.0,
            ) if part else None,
            scenarios=scenarios_out,
        )

    # --- Kurva ---
    curves_out: CurvesOut | None = None
    if body.options.include_curves:
        curve_data = build_curves(
            a=a,
            b=b,
            fixed_cost=body.fixed_cost,
            variable_cost=body.variable_cost,
            quad_cost=body.quad_cost,
            ref_demand=body.ref_demand,
            x_opt=opt.continuous.x,
            bep=bep,
            capacity=body.capacity,
            n_points=body.options.curve_points,
        )
        curves_out = CurvesOut(
            x_range=list(curve_data.x_range),
            points=[
                CurvePointOut(
                    x=pt.x,
                    price=pt.price,
                    R=pt.R,
                    C=pt.C,
                    P=pt.P,
                    MR=pt.MR,
                    MC=pt.MC,
                    dP=pt.dP,
                )
                for pt in curve_data.points
            ],
            markers={
                "optimum": curve_data.markers.optimum,
                "break_even": curve_data.markers.break_even,
                "capacity": curve_data.markers.capacity,
                "reference": curve_data.markers.reference,
            },
        )

    # --- Verifikasi simbolik (opsional) ---
    verify_out: VerifyOut | None = None
    if body.options.verify_symbolic:
        vr = verify_with_sympy(a, b, body.fixed_cost, body.variable_cost, body.quad_cost)
        verify_out = VerifyOut(
            passed=vr.passed,
            x_star_sympy=vr.x_star_sympy,
            x_star_closed=vr.x_star_closed,
            d2_sympy=vr.d2_sympy,
            d2_closed=vr.d2_closed,
            p_star_sympy=vr.p_star_sympy,
            p_star_closed=vr.p_star_closed,
            max_error=vr.max_error,
        )

    # --- Susun formula string ---
    c_sym = body.quad_cost
    cost_str = (
        f"C(x) = {body.fixed_cost:.0f} + {body.variable_cost:.0f}x"
        if c_sym == 0
        else f"C(x) = {body.fixed_cost:.0f} + {body.variable_cost:.0f}x + {c_sym:.4g}x^2"
    )
    formulas = ModelFormulas(
        price=f"p(x) = {a:.4g} - {b:.4g}x",
        revenue=f"R(x) = {a:.4g}x - {b:.4g}x^2",
        cost=cost_str,
        profit=f"P(x) = -{al:.4g}x^2 + {be:.4g}x - {body.fixed_cost:.0f}",
        dprofit=f"P'(x) = -{2*al:.4g}x + {be:.4g}",
        d2profit=f"P''(x) = {opt.second_derivative:.4g}",
    )

    # --- Susun response ---
    int_res = opt.integer
    cont_res = opt.continuous

    return OptimizeResponse(
        model=ModelInfo(a=a, b=b, alpha=al, beta=be, formulas=formulas),
        optimum=OptimumOut(
            status=opt.status.value,
            continuous=PointResult(
                x=cont_res.x,
                price=cont_res.price,
                revenue=cont_res.revenue,
                cost=cont_res.cost,
                profit=cont_res.profit,
            ),
            integer=IntegerResultOut(
                x=int_res.x,
                price=int_res.price,
                revenue=int_res.revenue,
                cost=int_res.cost,
                profit=int_res.profit,
                candidates=[
                    IntegerCandidateOut(x=c.x, profit=c.profit)
                    for c in int_res.candidates
                ],
            ),
            second_derivative=opt.second_derivative,
            is_maximum=opt.is_maximum,
        ),
        break_even=BreakEvenOut(
            exists=bep.exists,
            discriminant=bep.discriminant,
            x_low=bep.x_low,
            x_high=bep.x_high,
            x_low_int=bep.x_low_int,
            x_high_int=bep.x_high_int,
        ),
        marginal=MarginalOut(
            mr_at_opt=marg.mr_at_opt,
            mc_at_opt=marg.mc_at_opt,
            elasticity=marg.elasticity,
            elasticity_label=marg.elasticity_label,
        ),
        sensitivity=sensitivity_out,
        curves=curves_out,
        steps=[StepOut(**step) for step in build_steps(params, opt)] if body.options.include_steps else None,
        warnings=[WarningOut(code=w.code, level=w.level, message=w.message) for w in warns],
        verification=verify_out,
    )
