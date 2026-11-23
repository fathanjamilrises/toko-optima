"""
validation.py — Validasi semantik bisnis dan pengumpulan peringatan (warning).

Sumber kebenaran: PRD Bagian 4.16
Semua fungsi bersifat murni (tanpa I/O, tanpa state global).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.core.breakeven import BEPResult
from app.core.optimizer import OptimizationResult, OptimizationStatus


@dataclass
class Warning:
    """Satu peringatan semantik bisnis."""

    code: str
    level: str    # "warning" | "error" | "info"
    message: str


# Pesan dalam Bahasa Indonesia
_MESSAGES: dict[str, str] = {
    "W_NEG_PROFIT": (
        "Laba maksimum bernilai negatif (Rp{profit:.0f}). "
        "Pertimbangkan menurunkan biaya tetap/variabel atau meninjau ulang harga acuan."
    ),
    "W_EXTRAPOLATION": (
        "Jumlah optimal ({x_opt:.1f} cangkir) jauh dari data acuan ({q0:.0f} cangkir). "
        "Model linier mungkin kurang akurat di luar rentang survei."
    ),
    "W_PRICE_JUMP": (
        "Harga optimal (Rp{p_opt:.0f}) berbeda lebih dari 50% dari harga acuan (Rp{p0:.0f}). "
        "Verifikasi apakah harga ini realistis untuk pasar Anda."
    ),
    "W_CAPACITY_BINDING": (
        "Kapasitas produksi ({cap:.0f} cangkir) membatasi hasil optimal. "
        "Titik optimal tanpa batas ada di {x_star:.1f} cangkir."
    ),
    "W_NO_PRODUCTION": (
        "Harga tertinggi yang dapat diterima pasar tidak melampaui biaya variabel per cangkir "
        "(a={a:.0f} ≤ v={v:.0f}). Produksi tidak menguntungkan."
    ),
    "W_PRICE_BELOW_REF_COST": (
        "Harga acuan (Rp{p0:.0f}) di bawah biaya variabel per cangkir (Rp{v:.0f}). "
        "Kedai beroperasi merugi pada harga saat ini."
    ),
}


def collect_warnings(
    opt: OptimizationResult,
    bep: BEPResult,
    ref_price: float,
    ref_demand: float,
    variable_cost: float,
    capacity: Optional[float],
) -> list[Warning]:
    """Kumpulkan semua peringatan semantik dari hasil optimasi.

    Daftar kode peringatan (PRD 4.16):
        W_NEG_PROFIT          : laba integer < 0
        W_EXTRAPOLATION       : x_opt > 2*q0 atau x_opt < 0.25*q0
        W_PRICE_JUMP          : |p_opt - p0| / p0 > 0.5
        W_CAPACITY_BINDING    : status CAPACITY_BOUND
        W_NO_PRODUCTION       : status NO_PRODUCTION
        W_PRICE_BELOW_REF_COST: p0 < v

    Args:
        opt:           Hasil optimasi lengkap
        bep:           Hasil BEP
        ref_price:     Harga acuan p0
        ref_demand:    Permintaan acuan q0
        variable_cost: Biaya variabel per cangkir v
        capacity:      Kapasitas (atau None)

    Returns:
        Daftar Warning (bisa kosong)
    """
    warnings: list[Warning] = []

    # W_NO_PRODUCTION
    if opt.status == OptimizationStatus.NO_PRODUCTION:
        warnings.append(Warning(
            code="W_NO_PRODUCTION",
            level="warning",
            message=_MESSAGES["W_NO_PRODUCTION"].format(
                a=opt.a, v=variable_cost
            ),
        ))
        # Jika NO_PRODUCTION, hindari cek lain yang tidak relevan
        # Tetap cek W_PRICE_BELOW_REF_COST
        if ref_price < variable_cost:
            warnings.append(Warning(
                code="W_PRICE_BELOW_REF_COST",
                level="warning",
                message=_MESSAGES["W_PRICE_BELOW_REF_COST"].format(
                    p0=ref_price, v=variable_cost
                ),
            ))
        return warnings

    # W_CAPACITY_BINDING
    if opt.status == OptimizationStatus.CAPACITY_BOUND:
        warnings.append(Warning(
            code="W_CAPACITY_BINDING",
            level="info",
            message=_MESSAGES["W_CAPACITY_BINDING"].format(
                cap=capacity or 0.0,
                x_star=opt.x_star_unconstrained or 0.0,
            ),
        ))

    # W_NEG_PROFIT — gunakan laba integer
    if opt.integer.profit < 0.0:
        warnings.append(Warning(
            code="W_NEG_PROFIT",
            level="warning",
            message=_MESSAGES["W_NEG_PROFIT"].format(profit=opt.integer.profit),
        ))

    # W_EXTRAPOLATION — gunakan x kontinu
    x_opt = opt.continuous.x
    if x_opt > 2.0 * ref_demand or x_opt < 0.25 * ref_demand:
        warnings.append(Warning(
            code="W_EXTRAPOLATION",
            level="warning",
            message=_MESSAGES["W_EXTRAPOLATION"].format(
                x_opt=x_opt, q0=ref_demand
            ),
        ))

    # W_PRICE_JUMP
    p_opt = opt.continuous.price
    if ref_price > 0 and abs(p_opt - ref_price) / ref_price > 0.5:
        warnings.append(Warning(
            code="W_PRICE_JUMP",
            level="warning",
            message=_MESSAGES["W_PRICE_JUMP"].format(p_opt=p_opt, p0=ref_price),
        ))

    # W_PRICE_BELOW_REF_COST
    if ref_price < variable_cost:
        warnings.append(Warning(
            code="W_PRICE_BELOW_REF_COST",
            level="warning",
            message=_MESSAGES["W_PRICE_BELOW_REF_COST"].format(
                p0=ref_price, v=variable_cost
            ),
        ))

    return warnings
