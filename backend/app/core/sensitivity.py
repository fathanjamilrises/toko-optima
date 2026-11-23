"""
sensitivity.py — Analisis Sensitivitas: turunan parsial dan tabel skenario.

Sumber kebenaran: PRD Bagian 4.14
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations

from dataclasses import dataclass

from app.core.model import demand_params
from app.core.optimizer import OptimizationStatus, OptimizeParams, optimize


@dataclass
class SensitivityPartials:
    """Turunan parsial analitis P* dan x* terhadap parameter.

    Rumus (PRD 4.14) pada kondisi INTERIOR_OPTIMUM:
        dx*/dv  = -1 / (2*(b+c))
        dx*/dFC = 0
        dx*/da  = +1 / (2*(b+c))
        dP*/dFC = -1
        dP*/dv  = -x*         (Teorema Envelope)
        dP*/da  = +x*
    """

    dx_dv: float
    dx_dFC: float
    dx_da: float
    dP_dFC: float
    dP_dv: float
    dP_da: float


@dataclass
class ScenarioRow:
    """Satu baris tabel skenario."""

    label: str
    delta_pct: float   # persentase perubahan, mis. +10.0
    param_changed: str  # "variable_cost" atau "fixed_cost"
    x: float
    price: float
    profit: float
    delta_profit: float  # selisih terhadap baseline


def partials(
    b: float,
    quad_cost: float,
    x_star: float,
) -> SensitivityPartials:
    """Hitung turunan parsial P* dan x* terhadap parameter.

    Hanya valid untuk kondisi INTERIOR_OPTIMUM (PRD 4.14).
    Untuk CAPACITY_BOUND/NO_PRODUCTION, semantik berbeda (tidak dihitung di sini).

    Args:
        b:          Kemiringan fungsi harga, b > 0
        quad_cost:  Koefisien biaya kuadrat c >= 0
        x_star:     Nilai x* kontinu (titik kritis interior)

    Returns:
        SensitivityPartials
    """
    al = b + quad_cost  # alpha
    two_alpha = 2.0 * al

    return SensitivityPartials(
        dx_dv=-1.0 / two_alpha,
        dx_dFC=0.0,
        dx_da=1.0 / two_alpha,
        dP_dFC=-1.0,
        dP_dv=-x_star,
        dP_da=x_star,
    )


def scenario_table(
    params: OptimizeParams,
    baseline_profit: float,
    steps_pct: list[float] | None = None,
) -> list[ScenarioRow]:
    """Buat tabel skenario ±10%/±20% pada v dan FC.

    Setiap skenario dihitung ulang secara penuh (bukan aproksimasi turunan).
    Kolom delta_profit = profit_skenario - baseline_profit.

    PRD 4.14: ubah v dan FC sebesar ±10%, ±20% dan hitung ulang x*, p*, P*.

    Args:
        params:          Parameter baseline
        baseline_profit: Laba kontinu baseline P*
        steps_pct:       Daftar persentase (default [-20, -10, 10, 20])

    Returns:
        Daftar ScenarioRow (urut: v lalu FC, dari negatif ke positif)
    """
    if steps_pct is None:
        steps_pct = [-20.0, -10.0, 10.0, 20.0]

    rows: list[ScenarioRow] = []

    # Variasi biaya variabel (v)
    for pct in steps_pct:
        new_v = params.variable_cost * (1.0 + pct / 100.0)
        # Biaya variabel tidak boleh negatif
        new_v = max(0.0, new_v)

        new_params = OptimizeParams(
            fixed_cost=params.fixed_cost,
            variable_cost=new_v,
            quad_cost=params.quad_cost,
            ref_price=params.ref_price,
            ref_demand=params.ref_demand,
            sensitivity=params.sensitivity,
            capacity=params.capacity,
        )
        result = optimize(new_params)
        cont = result.continuous

        sign = "+" if pct > 0 else ""
        rows.append(
            ScenarioRow(
                label=f"Biaya variabel {sign}{pct:.0f}%",
                delta_pct=pct,
                param_changed="variable_cost",
                x=cont.x,
                price=cont.price,
                profit=cont.profit,
                delta_profit=cont.profit - baseline_profit,
            )
        )

    # Variasi biaya tetap (FC)
    for pct in steps_pct:
        new_fc = params.fixed_cost * (1.0 + pct / 100.0)
        new_fc = max(0.0, new_fc)

        new_params = OptimizeParams(
            fixed_cost=new_fc,
            variable_cost=params.variable_cost,
            quad_cost=params.quad_cost,
            ref_price=params.ref_price,
            ref_demand=params.ref_demand,
            sensitivity=params.sensitivity,
            capacity=params.capacity,
        )
        result = optimize(new_params)
        cont = result.continuous

        sign = "+" if pct > 0 else ""
        rows.append(
            ScenarioRow(
                label=f"Biaya tetap {sign}{pct:.0f}%",
                delta_pct=pct,
                param_changed="fixed_cost",
                x=cont.x,
                price=cont.price,
                profit=cont.profit,
                delta_profit=cont.profit - baseline_profit,
            )
        )

    return rows
