"""
main.py — Entry point aplikasi FastAPI KopiOptima.
"""

import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.schemas import HealthResponse

app = FastAPI(
    title="KopiOptima API",
    description="Simulator Optimasi Keuntungan UMKM Kedai Kopi — Proyek Akhir Kalkulus Dasar",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def request_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Ubah galat validasi Pydantic menjadi kontrak API berbahasa Indonesia."""
    details: list[dict[str, str]] = []
    for error in exc.errors():
        location = [str(part) for part in error["loc"] if part not in {"body", "query", "path"}]
        field = ".".join(location) or "request"
        error_type = error["type"]
        if error_type in {"float_parsing", "int_parsing", "float_type", "int_type"}:
            message = "Harus berupa angka."
        elif error_type == "missing":
            message = "Field wajib diisi."
        elif error_type in {"greater_than", "greater_than_equal"}:
            message = "Nilai harus lebih besar dari 0." if error_type == "greater_than" else "Nilai tidak boleh kurang dari 0."
        elif error_type in {"less_than", "less_than_equal"}:
            message = "Nilai melebihi batas maksimum yang diizinkan."
        else:
            message = str(error["msg"])
        details.append({"field": field, "message": message})
    return JSONResponse(status_code=422, content={"detail": details})

app.include_router(router, prefix="/api/v1")


@app.get("/health", response_model=HealthResponse, tags=["Sistem"])
def health() -> HealthResponse:
    """Cek status server tanpa prefix API (sesuai Phase 0)."""
    return HealthResponse(status="ok", version="1.0.0")
