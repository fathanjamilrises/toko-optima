# KopiOptima — Simulator Optimasi Keuntungan UMKM Kedai Kopi
**Proyek Akhir Kalkulus Dasar · Penerapan Turunan dalam Optimasi**

KopiOptima adalah simulator matematis untuk menentukan jumlah produksi dan harga jual optimal kedai kopi berbasis kalkulus diferensial.

---

## 🛠️ Prasyarat
- Python 3.11+
- PIP package manager

---

## 🚀 Instalasi

1. Clone repositori dan masuk ke direktori backend:
```bash
cd backend
```

2. Buat dan aktifkan virtual environment di Windows PowerShell (gunakan Python 3.11 atau lebih baru):
```powershell
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python --version
```

3. Pasang proyek beserta dependency pengembangan (pytest, pytest-cov, httpx, dan hypothesis):
```powershell
python -m pip install -e ".[dev]"
```

---

## 🌐 Hosting dari GitHub

Frontend Next.js di-host di Vercel dan API FastAPI di Render. Keduanya dapat di-deploy otomatis dari repository ini.

1. **Deploy API di Render**: buat Blueprint dari repository GitHub ini (`New` → `Blueprint`), lalu pilih `render.yaml` di root repository. Setelah deploy, salin URL service API Render, misalnya `https://kopioptima-api.onrender.com`.
2. **Deploy frontend di Vercel**: impor repository yang sama, atur **Root Directory** ke `frontend`, lalu tambahkan environment variable `NEXT_PUBLIC_API_URL` dengan URL API Render (tanpa garis miring di akhir). Deploy frontend dan salin URL domain Vercel.
3. **Izinkan frontend di API**: di Render, atur environment variable `CORS_ORIGINS` ke URL frontend Vercel, misalnya `https://kopioptima.vercel.app`, lalu redeploy/restart service API.
4. Buka URL frontend Vercel untuk menggunakan aplikasi. Endpoint kesehatan API tersedia di `/health`.

Render Free dapat membuat service tidak aktif setelah periode tanpa trafik sehingga permintaan pertama berikutnya mungkin perlu menunggu service aktif kembali.

---

## 🖥️ Menjalankan Server API

Jalankan FastAPI development server dengan Uvicorn:
```bash
# Dari direktori backend
uvicorn app.main:app --reload --port 8000
```
- Endpoint Health: [http://localhost:8000/health](http://localhost:8000/health)
- Dokumentasi Interaktif Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Contoh optimasi G1

Dengan server berjalan, kirim parameter baseline G1 berikut:

```bash
curl -X POST http://localhost:8000/api/v1/optimize \
  -H "Content-Type: application/json" \
  -d '{"fixed_cost":300000,"variable_cost":8000,"quad_cost":0,"ref_price":22000,"ref_demand":80,"sensitivity":5,"capacity":null,"options":{"include_steps":true,"include_curves":true,"include_sensitivity":true,"curve_points":200,"verify_symbolic":false}}'
```

Hasil G1 memiliki optimum kontinu dan integer 75 cangkir, harga Rp23.000 per cangkir, serta laba Rp825.000 per hari.

---

## 🧪 Menjalankan Test Suite

Jalankan seluruh test suite (unit test, golden cases G1–G5, edge cases, 200 property test, 200 SymPy symbolic verifications, dan API test):

```bash
# Dari direktori backend
python -m pytest -q
```

Ukur coverage modul inti dan langkah solusi:

```powershell
python -m pytest --cov=app.core --cov=app.steps --cov-report=term-missing
```

Untuk menjalankan kategori test tertentu:
- **Unit Model & Turunan**: `pytest tests/test_model.py -v`
- **Optimizer & Golden Cases**: `pytest tests/test_optimizer.py -v`
- **Break-Even Point (BEP)**: `pytest tests/test_breakeven.py -v`
- **Marginal & Elastisitas**: `pytest tests/test_marginal.py -v`
- **Sensitivitas & Skenario**: `pytest tests/test_sensitivity.py -v`
- **Titik Kurva Grafik**: `pytest tests/test_curves.py -v`
- **Peringatan Semantik**: `pytest tests/test_validation.py -v`
- **Verifikasi Simbolik SymPy**: `pytest tests/test_sympy_verify.py -v`
- **Endpoint API**: `pytest tests/test_api.py -v`

---

## 📁 Struktur Modul Inti (`backend/app/core/`)
- `model.py`: Fungsi harga $p(x)$, pendapatan $R(x)$, biaya $C(x)$, laba $P(x)$, serta turunan pertama $P'(x)$ dan kedua $P''(x)$.
- `optimizer.py`: Titik kritis $x^* = \frac{a-v}{2(b+c)}$, evaluasi batas domain/kapasitas, dan pembulatan bilangan bulat.
- `breakeven.py`: Titik impas (BEP) $P(x) = 0$ via diskriminan kuadratik.
- `marginal.py`: Pendapatan marginal $MR(x)$, biaya marginal $MC(x)$, elastisitas harga $\varepsilon^*$, dan aturan Lerner.
- `sensitivity.py`: Turunan parsial analitis dan kalkulasi ulang skenario $\pm10\%, \pm20\%$.
- `curves.py`: Generator titik kurva untuk visualisasi grafik.
- `validation.py`: Deteksi peringatan semantik bisnis (`W_NEG_PROFIT`, `W_CAPACITY_BINDING`, dll.).
- `sympy_verify.py`: Verifikasi silang rumus tertutup (*closed-form*) dengan diferensiasi simbolik SymPy.
