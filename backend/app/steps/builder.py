"""Penyusun 16 langkah solusi optimasi untuk ditampilkan ke pengguna.

Modul ini tidak menghitung ulang rumus. Semua nilai numerik diambil dari
hasil/fungsi core, lalu hanya diformat untuk teks Bahasa Indonesia dan KaTeX.
"""

from __future__ import annotations

from typing import Any

from app.core.breakeven import breakeven
from app.core.marginal import compute_marginal
from app.core.optimizer import OptimizationResult, OptimizationStatus, OptimizeParams, optimize


Step = dict[str, Any]


def _number(value: float | int, decimals: int = 2) -> str:
    """Format angka KaTeX: pemisah ribuan koma dan desimal titik."""
    value_float = float(value)
    if value_float.is_integer():
        return f"{int(value_float):,}"
    return f"{value_float:,.{decimals}f}".rstrip("0").rstrip(".")


def _rupiah(value: float) -> str:
    """Format mata uang tampilan Indonesia tanpa pembulatan perhitungan core."""
    return f"Rp{round(value):,}".replace(",", ".")


def _step(identifier: int, title: str, latex: str, explanation: str, values: dict[str, Any]) -> Step:
    return {
        "id": identifier,
        "title": title,
        "latex": latex,
        "explanation": explanation,
        "values": values,
    }


def build_steps(params: OptimizeParams, result: OptimizationResult) -> list[Step]:
    """Bangun 16 langkah tetap sesuai PRD Bagian 6 Phase 2.

    Nilai BEP, marginal, elastisitas, dan pembanding kapasitas diperoleh dari
    modul core. Builder hanya menentukan narasi dan representasi KaTeX.
    """
    continuous = result.continuous
    integer = result.integer
    bep = breakeven(result.a, result.b, params.fixed_cost, params.variable_cost, params.quad_cost)
    marginal = compute_marginal(
        continuous.x,
        result.a,
        result.b,
        params.variable_cost,
        params.quad_cost,
        continuous.price,
    )
    status = result.status
    x_star = result.x_star_unconstrained

    quadratic_cost_note = (
        "Komponen biaya kuadrat tidak berlaku karena c = 0."
        if params.quad_cost == 0
        else "Komponen biaya kuadrat digunakan karena c > 0."
    )
    cost_latex = (
        f"C(x) = {_number(params.fixed_cost)} + {_number(params.variable_cost)}x"
        if params.quad_cost == 0
        else f"C(x) = {_number(params.fixed_cost)} + {_number(params.variable_cost)}x + {_number(params.quad_cost)}x^2"
    )

    steps: list[Step] = [
        _step(
            1,
            "Data yang diketahui",
            (
                f"FC={_number(params.fixed_cost)},\\; v={_number(params.variable_cost)},\\; "
                f"c={_number(params.quad_cost)},\\; p_0={_number(params.ref_price)},\\; "
                f"q_0={_number(params.ref_demand)},\\; s={_number(params.sensitivity)}"
            ),
            "Data biaya dan permintaan acuan dimasukkan untuk satu periode harian.",
            {"fixed_cost": params.fixed_cost, "variable_cost": params.variable_cost, "quad_cost": params.quad_cost,
             "ref_price": params.ref_price, "ref_demand": params.ref_demand, "sensitivity": params.sensitivity,
             "capacity": params.capacity},
        ),
        _step(
            2,
            "Menyusun fungsi harga-permintaan",
            (
                f"b=\\frac{{1000}}{{{_number(params.sensitivity)}}}={_number(result.b)},\\quad "
                f"a={_number(params.ref_price)}+{_number(result.b)}\\cdot{_number(params.ref_demand)}={_number(result.a)},\\quad "
                f"p(x)={_number(result.a)}-{_number(result.b)}x"
            ),
            "Kemiringan dan intersep diperoleh dari data harga serta permintaan acuan.",
            {"a": result.a, "b": result.b},
        ),
        _step(
            3,
            "Fungsi pendapatan",
            f"R(x)=x\\,p(x)={_number(result.a)}x-{_number(result.b)}x^2",
            "Pendapatan adalah jumlah cangkir dikalikan harga pada jumlah tersebut.",
            {"a": result.a, "b": result.b},
        ),
        _step(4, "Fungsi biaya", cost_latex, f"Biaya tetap, biaya variabel, dan biaya kuadrat membentuk fungsi biaya. {quadratic_cost_note}",
              {"fixed_cost": params.fixed_cost, "variable_cost": params.variable_cost, "quad_cost": params.quad_cost}),
        _step(
            5,
            "Fungsi keuntungan",
            f"P(x)=-{_number(result.alpha)}x^2+{_number(result.beta)}x-{_number(params.fixed_cost)}",
            "Keuntungan diperoleh dari pendapatan dikurangi biaya.",
            {"alpha": result.alpha, "beta": result.beta, "fixed_cost": params.fixed_cost},
        ),
        _step(
            6,
            "Turunan pertama fungsi keuntungan",
            f"P'(x)=-2({_number(result.alpha)})x+{_number(result.beta)}={_number(result.second_derivative)}x+{_number(result.beta)}",
            "Turunan pertama digunakan untuk mencari titik kritis.",
            {"alpha": result.alpha, "beta": result.beta, "second_derivative": result.second_derivative},
        ),
    ]

    if x_star is None:
        critical_latex = "x^*\\text{ tidak berlaku karena }a-v\\leq0"
        critical_text = "Tidak berlaku: titik kritis positif tidak ada karena harga tertinggi yang diterima pasar tidak menutup biaya variabel."
    else:
        critical_latex = f"P'(x)=0\\Rightarrow x^*=\\frac{{{_number(result.beta)}}}{{2({_number(result.alpha)})}}={_number(x_star)}"
        critical_text = "Titik kritis tanpa kendala diperoleh dengan menyamakan turunan pertama dengan nol."
    steps.append(_step(7, "Titik kritis", critical_latex, critical_text, {"x_star": x_star, "beta": result.beta, "alpha": result.alpha}))

    second_text = (
        "Karena turunan kedua negatif, parabola keuntungan terbuka ke bawah."
        if status is not OptimizationStatus.NO_PRODUCTION
        else "Turunan kedua negatif, tetapi titik kritis berada di luar domain produksi karena a-v ≤ 0."
    )
    steps.append(_step(8, "Uji turunan kedua", f"P''(x)={_number(result.second_derivative)}<0", second_text,
                       {"second_derivative": result.second_derivative, "is_maximum": result.is_maximum}))

    sign_latex = (
        f"x<{_number(x_star)}:P'(x)>0,\\quad x={_number(x_star)}:P'(x)=0,\\quad x>{_number(x_star)}:P'(x)<0"
        if x_star is not None
        else "\\text{Tidak berlaku: }P'(x)\\leq0\\text{ untuk }x\\geq0"
    )
    steps.append(_step(9, "Uji tanda turunan pertama", sign_latex,
                       "Keuntungan naik sebelum titik kritis dan turun sesudahnya." if x_star is not None else "Tidak berlaku karena tidak ada titik kritis positif.",
                       {"x_star": x_star}))

    if status is OptimizationStatus.CAPACITY_BOUND:
        constraint_text = f"Kapasitas {_number(params.capacity or 0)} cangkir lebih kecil dari x*={_number(x_star or 0)}, sehingga batas kapasitas dipilih."
    elif status is OptimizationStatus.NO_PRODUCTION:
        constraint_text = "Produksi nol dipilih karena beta = a-v tidak positif."
    else:
        constraint_text = f"x*={_number(continuous.x)} berada dalam domain [0, {_number(result.x_end)}], sehingga titik interior dipilih."
    steps.append(_step(10, "Pemeriksaan kendala", f"x_{{opt}}={_number(continuous.x)},\\quad \\mathrm{{status}}=\\text{{{status.value}}}",
                       constraint_text, {"x_opt": continuous.x, "x_end": result.x_end, "capacity": params.capacity, "status": status.value}))

    candidate_latex = ",\\; ".join(f"P({_number(candidate.x)})={_number(candidate.profit)}" for candidate in integer.candidates)
    steps.append(_step(11, "Pembulatan", f"\\{{\\lfloor x_{{opt}}\\rfloor,\\lceil x_{{opt}}\\rceil\\}}\\Rightarrow {candidate_latex};\\quad x_{{int}}={_number(integer.x)}",
                       "Kandidat bilangan bulat dibandingkan; jika seri, dipilih jumlah yang lebih kecil.",
                       {"x_int": integer.x, "profit_int": integer.profit,
                        "candidates": [{"x": candidate.x, "profit": candidate.profit} for candidate in integer.candidates]}))

    steps.append(_step(12, "Harga, pendapatan, biaya, laba optimal",
                       f"p^*={_number(continuous.price)},\\quad R^*={_number(continuous.revenue)},\\quad C^*={_number(continuous.cost)},\\quad P^*={_number(continuous.profit)}",
                       f"Pada hasil kontinu, harga optimal {_rupiah(continuous.price)} menghasilkan laba {_rupiah(continuous.profit)}.",
                       {"x": continuous.x, "price": continuous.price, "revenue": continuous.revenue, "cost": continuous.cost, "profit": continuous.profit}))

    if bep.exists:
        bep_latex = f"D={_number(bep.discriminant)},\\quad x_{{BEP,1}}={_number(bep.x_low or 0)},\\quad x_{{BEP,2}}={_number(bep.x_high or 0)}"
        bep_text = f"Usaha berada pada rentang untung di antara {_number(bep.x_low or 0)} dan {_number(bep.x_high or 0)} cangkir."
    else:
        bep_latex = f"D={_number(bep.discriminant)}<0"
        bep_text = "Tidak berlaku: tidak ada titik impas karena laba negatif di seluruh domain."
    steps.append(_step(13, "Titik impas (BEP)", bep_latex, bep_text,
                       {"exists": bep.exists, "discriminant": bep.discriminant, "x_low": bep.x_low, "x_high": bep.x_high,
                        "x_low_int": bep.x_low_int, "x_high_int": bep.x_high_int}))

    marginal_text = (
        "MR dan MC sama pada titik optimum interior."
        if status is OptimizationStatus.INTERIOR_OPTIMUM
        else "Kesetaraan MR dan MC tidak berlaku sebagai keputusan akhir karena optimum dibatasi kendala/domain."
    )
    steps.append(_step(14, "Analisis marginal", f"MR={_number(marginal.mr_at_opt)},\\quad MC={_number(marginal.mc_at_opt)}",
                       marginal_text, {"mr_at_opt": marginal.mr_at_opt, "mc_at_opt": marginal.mc_at_opt}))

    if status is OptimizationStatus.INTERIOR_OPTIMUM and marginal.elasticity is not None:
        elasticity_latex = f"\\varepsilon^*={_number(marginal.elasticity, 4)}"
        elasticity_text = f"Permintaan bersifat {marginal.elasticity_label}."
    else:
        elasticity_latex = "\\text{Tidak berlaku}"
        elasticity_text = "Tidak berlaku karena elastisitas optimal hanya diinterpretasikan untuk optimum interior dengan x*>0."
    steps.append(_step(15, "Elastisitas", elasticity_latex, elasticity_text,
                       {"elasticity": marginal.elasticity, "elasticity_label": marginal.elasticity_label}))

    if status is OptimizationStatus.NO_PRODUCTION:
        conclusion = "Harga tertinggi yang dapat diterima pasar tidak melampaui biaya variabel per cangkir; produksi tidak menguntungkan."
        conclusion_values = {"status": status.value}
    elif status is OptimizationStatus.CAPACITY_BOUND:
        unconstrained = optimize(OptimizeParams(
            fixed_cost=params.fixed_cost, variable_cost=params.variable_cost, quad_cost=params.quad_cost,
            ref_price=params.ref_price, ref_demand=params.ref_demand, sensitivity=params.sensitivity, capacity=None,
        ))
        delta = unconstrained.continuous.profit - continuous.profit
        conclusion = (f"Kapasitas {_number(params.capacity or 0)} cangkir membatasi produksi; titik optimal tanpa batas ada di "
                      f"{_number(unconstrained.continuous.x)} cangkir. Menambah kapasitas berpotensi menambah laba sebesar {_rupiah(delta)}.")
        conclusion_values = {"status": status.value, "capacity": params.capacity, "x_star": unconstrained.continuous.x, "delta_profit": delta}
    elif continuous.profit < 0:
        conclusion = (f"Pada parameter ini laba maksimum bernilai negatif ({_rupiah(continuous.profit)}). "
                      "Pertimbangkan menurunkan biaya tetap/variabel atau meninjau ulang harga acuan.")
        conclusion_values = {"status": status.value, "profit": continuous.profit}
    else:
        bep_low = bep.x_low_int if bep.exists else "tidak tersedia"
        conclusion = (f"Keuntungan maksimum diperoleh saat menjual {_number(integer.x)} cangkir per hari dengan harga "
                      f"{_rupiah(integer.price)} per cangkir, menghasilkan laba {_rupiah(integer.profit)}. "
                      f"Usaha mulai untung pada penjualan ≥ {bep_low} cangkir.")
        conclusion_values = {"status": status.value, "x": integer.x, "price": integer.price, "profit": integer.profit, "bep_low": bep_low}
    steps.append(_step(16, "Kesimpulan & rekomendasi", "\\text{Lihat penjelasan}", conclusion, conclusion_values))

    return steps
