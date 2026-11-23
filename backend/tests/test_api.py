"""
test_api.py — Test endpoint API KopiOptima menggunakan httpx TestClient.

Sumber kebenaran: PRD Bagian 7, 9.3
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from tests.conftest import close

client = TestClient(app)


# ---------------------------------------------------------------------------
# GET /health
# ---------------------------------------------------------------------------


class TestHealth:
    def test_status_ok(self):
        r = client.get("/api/v1/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_version(self):
        r = client.get("/api/v1/health")
        assert r.json()["version"] == "1.0.0"

    def test_root_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


def test_cors_allows_frontend_origin():
    r = client.options(
        "/api/v1/optimize",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "http://localhost:3000"


# ---------------------------------------------------------------------------
# GET /presets
# ---------------------------------------------------------------------------


class TestPresets:
    def test_returns_three_presets(self):
        r = client.get("/api/v1/presets")
        assert r.status_code == 200
        assert len(r.json()) == 3

    def test_g1_preset_values(self):
        r = client.get("/api/v1/presets")
        g1 = next(p for p in r.json() if p["id"] == "G1")
        assert g1["fixed_cost"] == 300_000
        assert g1["variable_cost"] == 8_000
        assert g1["sensitivity"] == 5


# ---------------------------------------------------------------------------
# POST /optimize — Golden cases
# ---------------------------------------------------------------------------


G1_BODY = {
    "fixed_cost": 300000, "variable_cost": 8000, "quad_cost": 0,
    "ref_price": 22000, "ref_demand": 80, "sensitivity": 5, "capacity": None,
    "options": {"include_curves": True, "include_sensitivity": True, "curve_points": 200},
}
G2_BODY = {**G1_BODY, "quad_cost": 20}
G3_BODY = {**G1_BODY, "capacity": 60}
G4_BODY = {**G1_BODY, "fixed_cost": 1_500_000}
G5_BODY = {**G1_BODY, "variable_cost": 45_000}


class TestOptimizeG1:
    def test_200(self):
        r = client.post("/api/v1/optimize", json=G1_BODY)
        assert r.status_code == 200

    def test_status(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert r["optimum"]["status"] == "INTERIOR_OPTIMUM"

    def test_x_star(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert close(r["optimum"]["continuous"]["x"], 75.0)

    def test_price(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert close(r["optimum"]["continuous"]["price"], 23_000)

    def test_profit(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert close(r["optimum"]["continuous"]["profit"], 825_000)

    def test_bep_exists(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert r["break_even"]["exists"]

    def test_bep_x_low_int(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert r["break_even"]["x_low_int"] == 11

    def test_bep_x_high_int(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert r["break_even"]["x_high_int"] == 139

    def test_mr_equals_mc(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert close(r["marginal"]["mr_at_opt"], r["marginal"]["mc_at_opt"])

    def test_elasticity(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert close(r["marginal"]["elasticity"], -1.5333, abs_tol=1e-3)

    def test_sensitivity_partials(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        sens = r["sensitivity"]["partials"]
        assert close(sens["dx_dv"], -0.0025)
        assert close(sens["dP_dv"], -75.0)

    def test_curves_present(self):
        r = client.post("/api/v1/optimize", json=G1_BODY).json()
        assert r["curves"] is not None
        assert len(r["curves"]["points"]) > 0

    def test_steps_present_and_ordered(self):
        body = {**G1_BODY, "options": {**G1_BODY["options"], "include_steps": True}}
        r = client.post("/api/v1/optimize", json=body).json()
        assert len(r["steps"]) == 16
        assert [step["id"] for step in r["steps"]] == list(range(1, 17))

    def test_symbolic_verification_is_optional(self):
        body = {**G1_BODY, "options": {**G1_BODY["options"], "verify_symbolic": True}}
        r = client.post("/api/v1/optimize", json=body).json()
        assert r["verification"]["passed"] is True


class TestOptimizeG2:
    def test_x_int(self):
        r = client.post("/api/v1/optimize", json=G2_BODY).json()
        assert r["optimum"]["integer"]["x"] == 68

    def test_profit_int(self):
        r = client.post("/api/v1/optimize", json=G2_BODY).json()
        assert close(r["optimum"]["integer"]["profit"], 722_720)


class TestOptimizeG3:
    def test_status(self):
        r = client.post("/api/v1/optimize", json=G3_BODY).json()
        assert r["optimum"]["status"] == "CAPACITY_BOUND"

    def test_x_opt(self):
        r = client.post("/api/v1/optimize", json=G3_BODY).json()
        assert close(r["optimum"]["continuous"]["x"], 60.0)

    def test_profit(self):
        r = client.post("/api/v1/optimize", json=G3_BODY).json()
        assert close(r["optimum"]["continuous"]["profit"], 780_000)

    def test_warning_capacity(self):
        r = client.post("/api/v1/optimize", json=G3_BODY).json()
        codes = [w["code"] for w in r["warnings"]]
        assert "W_CAPACITY_BINDING" in codes


class TestOptimizeG4:
    def test_bep_not_exists(self):
        r = client.post("/api/v1/optimize", json=G4_BODY).json()
        assert not r["break_even"]["exists"]

    def test_warning_neg_profit(self):
        r = client.post("/api/v1/optimize", json=G4_BODY).json()
        codes = [w["code"] for w in r["warnings"]]
        assert "W_NEG_PROFIT" in codes


class TestOptimizeG5:
    def test_status(self):
        r = client.post("/api/v1/optimize", json=G5_BODY).json()
        assert r["optimum"]["status"] == "NO_PRODUCTION"

    def test_x_zero(self):
        r = client.post("/api/v1/optimize", json=G5_BODY).json()
        assert r["optimum"]["continuous"]["x"] == 0.0

    def test_profit(self):
        r = client.post("/api/v1/optimize", json=G5_BODY).json()
        assert close(r["optimum"]["continuous"]["profit"], -300_000)

    def test_warning_no_production(self):
        r = client.post("/api/v1/optimize", json=G5_BODY).json()
        codes = [w["code"] for w in r["warnings"]]
        assert "W_NO_PRODUCTION" in codes


# ---------------------------------------------------------------------------
# Validasi 422 — input tidak valid
# ---------------------------------------------------------------------------


class TestValidation422:
    def test_sensitivity_zero(self):
        body = {**G1_BODY, "sensitivity": 0}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    def test_ref_price_negative(self):
        body = {**G1_BODY, "ref_price": -1}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    def test_capacity_zero(self):
        body = {**G1_BODY, "capacity": 0}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    def test_fixed_cost_negative(self):
        body = {**G1_BODY, "fixed_cost": -1}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    def test_variable_cost_exceeds_max(self):
        body = {**G1_BODY, "variable_cost": 2e7}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    def test_missing_required_field(self):
        body = {"fixed_cost": 300000, "variable_cost": 8000}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    def test_ref_demand_zero(self):
        body = {**G1_BODY, "ref_demand": 0}
        r = client.post("/api/v1/optimize", json=body)
        assert r.status_code == 422

    @pytest.mark.parametrize("field,value", [("sensitivity", 0), ("ref_price", -1), ("capacity", 0), ("ref_price", "bukan-angka")])
    def test_error_contract_is_indonesian(self, field, value):
        r = client.post("/api/v1/optimize", json={**G1_BODY, field: value})
        assert r.status_code == 422
        detail = r.json()["detail"][0]
        assert detail["field"] == field
        assert isinstance(detail["message"], str)
        assert detail["message"]


# ---------------------------------------------------------------------------
# GET /curves dan /sensitivity (endpoint terpisah)
# ---------------------------------------------------------------------------


class TestCurvesEndpoint:
    def test_200(self):
        r = client.post("/api/v1/curves", json=G1_BODY)
        assert r.status_code == 200

    def test_has_points(self):
        r = client.post("/api/v1/curves", json=G1_BODY).json()
        assert len(r["points"]) > 0

    def test_markers_present(self):
        r = client.post("/api/v1/curves", json=G1_BODY).json()
        assert "optimum" in r["markers"]


class TestSensitivityEndpoint:
    def test_200(self):
        r = client.post("/api/v1/sensitivity", json=G1_BODY)
        assert r.status_code == 200

    def test_has_scenarios(self):
        r = client.post("/api/v1/sensitivity", json=G1_BODY).json()
        assert len(r["scenarios"]) == 8


def test_g1_preset_optimizes_to_expected_values():
    preset = next(item for item in client.get("/api/v1/presets").json() if item["id"] == "G1")
    response = client.post("/api/v1/optimize", json=preset).json()
    integer = response["optimum"]["integer"]
    assert integer["x"] == 75
    assert close(integer["price"], 23_000)
    assert close(integer["profit"], 825_000)
