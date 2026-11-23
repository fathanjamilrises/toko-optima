# Modul 02: Arsitektur & Modul Backend

Backend **KopiOptima** dibangun menggunakan **Python 3.12+** dan framework berkinerja tinggi **FastAPI**. Seluruh perhitungan analitis didesain dengan prinsip **fungsi murni (*pure functional core*)**, bebas efek samping (*zero side-effects*), tanpa ketergantungan database eksternal, dan terverifikasi secara formal menggunakan aljabar simbolik SymPy.

---

## 1. Struktur Direktori Backend

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # Definisi endpoint FastAPI (/optimize, /presets)
│   ├── core/
│   │   ├── __init__.py
│   │   ├── model.py            # Fungsi matematika dasar (demand, p, R, C, P)
│   │   ├── optimizer.py        # Optimasi FOC/SOC, Kuhn-Tucker, diskretisasi int
│   │   ├── breakeven.py        # Perhitungan diskriminan dan akar titik impas (BEP)
│   │   ├── sensitivity.py      # Turunan parsial Teorema Envelope & tabel skenario
│   │   ├── curves.py           # Penghasil 200 titik kurva untuk visualisasi grafik
│   │   ├── marginal.py         # Analisis pendapatan vs biaya marginal (MR & MC)
│   │   ├── validation.py       # Engine diagnostik peringatan bisnis (warnings)
│   │   └── sympy_verify.py     # Verifikator analitis simbolik berbasis SymPy
│   ├── steps/
│   │   ├── __init__.py
│   │   └── builder.py          # Generator penjelasan matematis langkah demi langkah KaTeX
│   ├── main.py                 # Titik masuk aplikasi FastAPI, CORS, & middleware
│   └── schemas.py              # Skema validasi Pydantic v2 (Request/Response DTO)
└── tests/                      # Suite pengujian unit & integrasi pytest
```

---

## 2. Prinsip Desain: Pure Functional Core

Seluruh logika bisnis di `app/core/` mematuhi aturan ketat:
1. **Deterministik:** Input yang sama selalu menghasilkan output yang identik.
2. **Tanpa I/O:** Tidak melakukan operasi berkas, jaringan, atau basis data di dalam modul inti.
3. **Imutabilitas:** Menggunakan Python standard `@dataclass(frozen=True)` atau tipe primitif untuk mencegah modifikasi state yang tidak disengaja.
4. **Isolasi Penuh:** Lapisan HTTP FastAPI di `app/api/routes.py` bertindak sebagai adaptor (*thin controller*), mendelegasikan seluruh komputasi ke `app/core/`.

---

## 3. Rincian Modul Inti (`app/core/`)

### 3.1 `model.py` (Fungsi Fundamental)
Menyediakan persamaan dasar kalkulus bisnis kedai kopi:
- `demand_params(p0, q0, s) -> (a, b)`: Menghitung kemiringan $b = \frac{1000}{s}$ dan intersep harga tertinggi $a = p_0 + b \cdot q_0$.
- `price(x, a, b) -> float`: Evaluasi harga jual $p(x) = a - b \cdot x$.
- `revenue(x, a, b) -> float`: Evaluasi pendapatan $R(x) = a \cdot x - b \cdot x^2$.
- `cost(x, FC, v, c) -> float`: Evaluasi biaya total $C(x) = FC + v \cdot x + c \cdot x^2$.
- `profit(x, FC, v, c, a, b) -> float`: Evaluasi laba bersih $P(x) = R(x) - C(x)$.
- `dprofit(x, v, c, a, b) -> float`: Evaluasi turunan pertama $P'(x) = (a - v) - 2(b + c)x$.
- `d2profit(b, c) -> float`: Evaluasi turunan kedua $P''(x) = -2(b + c)$.

### 3.2 `optimizer.py` (Mesin Optimasi)
Mengorkestrasi penentuan titik stasioner, pengujian kendala, dan pembulatan:
- `critical_point(a, b, v, c) -> float`: Menghitung $x^* = \frac{a - v}{2(b + c)}$.
- `optimize(params: OptimizeParams) -> OptimizationResult`:
  1. Memeriksa kelayakan operasional: jika $a \le v$, menghasilkan status `NO_PRODUCTION` ($x_{\text{opt}} = 0$).
  2. Jika $a > v$, menghitung titik kritis kontinu $x^*$.
  3. Memeriksa kendala kapasitas: jika kapasitas ada dan $x^* > x_{\max}$, solusi dibatasi menjadi $x_{\text{opt}} = x_{\max}$ dengan status `CAPACITY_BOUND`.
  4. Jika $x^* \le x_{\max}$, status `INTERIOR_OPTIMUM`.
  5. Melakukan diskretisasi bilangan bulat terdekat: mengevaluasi $P(\lfloor x_{\text{opt}} \rfloor)$ dan $P(\lceil x_{\text{opt}} \rceil)$ di dalam batas $[0, x_{\max}]$.

### 3.3 `breakeven.py` (Titik Impas)
Menghitung ambang balik modal kedai:
- `break_even(params: OptimizeParams, a, b) -> BreakEvenResult`:
  - Menghitung diskriminan $D = (a - v)^2 - 4(b + c)FC$.
  - Jika $D < 0$, mengembalikan `exists: false` (operasi mengalami defisit permanen).
  - Jika $D \ge 0$, menghitung $x_{\text{low}}$ dan $x_{\text{high}}$, beserta rentang bilangan bulat aman $\lceil x_{\text{low}} \rceil$ hingga $\lfloor x_{\text{high}} \rfloor$.

### 3.4 `sensitivity.py` (Analisis Sensitivitas & Skenario)
Menerapkan Teorema Envelope:
- `partials(b, quad_cost, x_star) -> SensitivityPartials`:
  - $\frac{\partial P^*}{\partial FC} = -1$, $\frac{\partial P^*}{\partial v} = -x^*$, $\frac{\partial P^*}{\partial a} = +x^*$.
  - $\frac{\partial x^*}{\partial v} = -\frac{1}{2(b+c)}$, $\frac{\partial x^*}{\partial FC} = 0$, $\frac{\partial x^*}{\partial a} = +\frac{1}{2(b+c)}$.
- `scenario_table(params, baseline) -> list[ScenarioRow]`:
  - Menghasilkan simulasi fluktuasi biaya variabel ($v \pm 10\%$, $v \pm 20\%$) dan biaya tetap ($FC \pm 10\%$, $FC \pm 20\%$).

### 3.5 `curves.py` (Array Evaluasi 200 Titik)
Menghasilkan 200 titik sampel seragam dari domain $x = 0$ hingga $x_{\text{end}} = \max(x_{\max}, 2 \cdot q_0, 1.5 \cdot x^*)$:
- Setiap titik kurva memuat: $x$, $p(x)$, $R(x)$, $C(x)$, $P(x)$, $MR(x)$, $MC(x)$, dan $P'(x)$.
- Mengidentifikasi penanda (*markers*) penting: titik optimum, titik balik modal (BEP), titik kapasitas, dan titik acuan observasi awal.

### 3.6 `validation.py` (Diagnostik & Peringatan Bisnis)
Mendeteksi anomali struktural bisnis kedai:
- `W_NEG_PROFIT`: Titik optimal menghasilkan laba negatif ($P^* < 0$).
- `W_NO_PRODUCTION`: Harga tertinggi pasar tidak menutup biaya bahan ($a \le v$).
- `W_CAPACITY_BINDING`: Titik optimal terpotong oleh kapasitas mesin ($x^* > x_{\max}$).
- `W_EXTRAPOLATION`: Titik optimal melampaui dua kali lipat penjualan harian acuan ($x^* > 2 \cdot q_0$).

---

## 4. Spesifikasi Kontrak API (`schemas.py`)

### 4.1 Endpoint `POST /api/v1/optimize`
Menerima parameter operasional kedai dan mengembalikan hasil kalkulasi lengkap dalam hitungan milidetik (< 15 ms).

#### Input Request Body (`OptimizeRequest`):
```json
{
  "fixed_cost": 300000.0,
  "variable_cost": 8000.0,
  "quad_cost": 0.0,
  "ref_price": 22000.0,
  "ref_demand": 80.0,
  "sensitivity": 5.0,
  "capacity": null,
  "options": {
    "include_steps": true,
    "include_curves": true,
    "include_sensitivity": true,
    "curve_points": 200
  }
}
```

#### Output Response Body (`OptimizeResponse`):
```json
{
  "model": {
    "a": 38000.0,
    "b": 200.0,
    "formulas": {
      "price": "p(x) = 38000 - 200*x",
      "revenue": "R(x) = 38000*x - 200*x^2",
      "cost": "C(x) = 300000 + 8000*x",
      "profit": "P(x) = -200*x^2 + 30000*x - 300000",
      "dprofit": "P'(x) = 30000 - 400*x"
    }
  },
  "optimum": {
    "status": "INTERIOR_OPTIMUM",
    "continuous": {
      "x": 75.0,
      "price": 23000.0,
      "revenue": 1725000.0,
      "cost": 900000.0,
      "profit": 825000.0
    },
    "integer": {
      "x": 75,
      "price": 23000.0,
      "revenue": 1725000.0,
      "cost": 900000.0,
      "profit": 825000.0
    },
    "second_derivative": -400.0,
    "is_maximum": true
  },
  "break_even": {
    "exists": true,
    "discriminant": 660000000.0,
    "x_low": 10.77,
    "x_high": 139.23,
    "x_low_int": 11,
    "x_high_int": 139
  },
  "warnings": []
}
```

### 4.2 Endpoint `GET /api/v1/presets`
Mengembalikan 5 konfigurasi kedai kopi siap pakai untuk skenario praktikum dan gamifikasi:
- `G1`: Warung Kopi Sederhana (Standar linier, modal normal).
- `G2`: Kedai Ramai Lembur (Dengan biaya kuadratik $c = 20$).
- `G3`: Dapur Kapasitas Terbatas ($x_{\max} = 60$).
- `G4`: Krisis Biaya Sewa Tinggi ($FC = 600.000$, $v = 15.000$).
- `G5`: Ambang Batas Tutup Kedai ($v = 45.000 > a$, `NO_PRODUCTION`).

---

## 5. Keamanan & Performa Backend

1. **CORS Terbatas:** Hanya mengizinkan origin terdaftar (`http://localhost:3000`, `http://127.0.0.1:3000`).
2. **Tanpa Kebergantungan Berat di Runtime:** Menghindari overhead runtime berat; SymPy hanya dijalankan pada tahapan test suite verifikasi formal.
3. **Latensi Eksekusi Rendah:** Seluruh kalkulasi optimasi, 200 titik kurva, dan tabel skenario selesai di bawah **15 milidetik** pada CPU standar.
