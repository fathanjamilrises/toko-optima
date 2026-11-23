# PRD — Simulator Optimasi Keuntungan UMKM Kedai Kopi
**Proyek Akhir Kalkulus Dasar · Penerapan Turunan dalam Optimasi**

| Item | Isi |
|---|---|
| Nama produk | **KopiOptima** — Profit Maximizer Simulator |
| Mata kuliah | Kalkulus Dasar (UAS berbasis Team Project) |
| Topik | Penerapan Turunan dalam Optimasi (keuntungan maksimum UMKM) |
| Studi kasus | Operasional kedai kopi |
| Batas proyek | 1 Desember 2026 |
| Versi dokumen | 1.0 |

---

## 0. INSTRUKSI UNTUK AI AGENT (BACA PERTAMA)

1. Dokumen ini dikerjakan **berurutan per Phase**. **Dilarang** memulai Phase berikutnya sebelum semua *acceptance criteria* dan test pada Phase sebelumnya **hijau**.
2. **Phase 1–3 = Backend + rumus (prioritas utama).** Phase 4 = Frontend (dikerjakan paling akhir).
3. Semua rumus di Bagian 4 adalah **sumber kebenaran tunggal**. Jangan mengubah rumus tanpa menurunkannya ulang dan memperbarui golden test (Bagian 9).
4. Setiap hasil numerik dari rumus tertutup (*closed-form*) **wajib diverifikasi silang** dengan turunan simbolik SymPy (Bagian 5.3).
5. Semua teks yang tampil ke pengguna memakai **Bahasa Indonesia**. Nama variabel/kode memakai bahasa Inggris.
6. Mata uang: Rupiah (IDR). Satuan produk: **cangkir (cup)**. Periode dasar: **per hari** (bisa diubah ke bulan, lihat 4.12).
7. Jangan menambah fitur di luar cakupan (Bagian 2.2).

---

## 1. LATAR BELAKANG & TUJUAN

### 1.1 Masalah
Pemilik kedai kopi sering kesulitan menentukan **jumlah produksi (penjualan)** dan **harga jual** yang tepat. Harga terlalu tinggi menurunkan permintaan, harga terlalu rendah membuat margin tipis dan biaya operasional tidak tertutup.

### 1.2 Solusi
Memodelkan keuntungan sebagai fungsi jumlah cangkir terjual $x$:

$$P(x) = R(x) - C(x)$$

lalu mencari $x$ yang memaksimalkan $P(x)$ dengan **turunan pertama** ($P'(x)=0$) dan **uji turunan kedua / uji tanda** untuk memastikan titik tersebut maksimum.

### 1.3 Tujuan Produk
- Menghitung otomatis jumlah produksi, harga jual, dan laba yang optimal.
- Menampilkan **langkah penyelesaian matematis secara sistematis** (untuk dipelajari, dilaporkan, dan dipresentasikan).
- Memvisualisasikan kurva $R(x)$, $C(x)$, $P(x)$ (dan turunannya).
- Menjadi **produk pendukung** laporan ilmiah dan video presentasi UAS.

### 1.4 Pemetaan ke Persyaratan Dosen
| Persyaratan UAS | Dipenuhi oleh |
|---|---|
| Identifikasi masalah, model matematika, proses hitung, analisis, kesimpulan | Modul `calculus_engine` + `steps` |
| Produk pendukung: simulasi / visualisasi grafik / demonstrasi hitung | Simulator web + grafik |
| Konsep: turunan pertama, titik kritis, maks/min | Bagian 4 |
| Penjelasan aplikasi pendukung (Python, dll.) harus ada di laporan | Bagian 11 (catatan untuk laporan) |
| Presentasi via video (30 menit) | Mode demo / preset + export hasil |

---

## 2. CAKUPAN

### 2.1 In Scope
1. Model permintaan **linier** (harga turun → permintaan naik).
2. Model biaya: **biaya tetap + biaya variabel per cangkir + (opsional) biaya kuadrat** (biaya lembur/beban kapasitas).
3. Pencarian titik optimal, uji maksimum, titik impas (BEP), analisis marginal, elastisitas, analisis sensitivitas (turunan parsial sederhana).
4. Batasan kapasitas produksi harian (opsional).
5. Pembulatan ke bilangan bulat (cangkir tidak bisa pecahan).
6. API REST + langkah solusi (LaTeX) + data grafik.
7. Frontend interaktif (Phase 4).

### 2.2 Out of Scope
Autentikasi/login, database persisten, multi-produk/menu, prediksi permintaan machine learning, integrasi kasir/POS, pembayaran.

---

## 3. PERSONA & USER STORY

**Persona A — Pemilik kedai kopi:** tidak paham kalkulus, ingin tahu "jual berapa cangkir dan harga berapa supaya untung paling besar".
**Persona B — Dosen/Penguji:** ingin melihat kebenaran konsep dan langkah matematis.
**Persona C — Mahasiswa (tim):** butuh langkah, grafik, dan angka untuk laporan & video.

| ID | User story | Prioritas |
|---|---|---|
| US-1 | Sebagai pemilik, saya memasukkan biaya tetap, biaya variabel, harga & permintaan acuan, lalu mendapat jumlah cangkir dan harga optimal | P0 |
| US-2 | Saya melihat langkah perhitungan turunan yang runtut | P0 |
| US-3 | Saya melihat grafik pendapatan, biaya, dan laba dengan titik optimal & BEP ditandai | P0 |
| US-4 | Saya mendapat peringatan jika input tidak masuk akal atau usaha rugi di titik terbaik | P0 |
| US-5 | Saya melihat seberapa sensitif laba terhadap perubahan biaya | P1 |
| US-6 | Saya bisa membatasi kapasitas produksi harian | P1 |
| US-7 | Saya bisa memakai preset kedai kopi dan mengunduh hasil (JSON/CSV) | P2 |

---

## 4. SPESIFIKASI MATEMATIKA (SUMBER KEBENARAN)

### 4.1 Variabel & Parameter

| Simbol | Nama field (kode) | Arti | Satuan | Syarat |
|---|---|---|---|---|
| $x$ | `x` | Jumlah cangkir terjual per periode (variabel keputusan) | cangkir | $x \ge 0$ |
| $p$ | `p` | Harga jual per cangkir | Rp/cangkir | $p>0$ |
| $FC$ | `fixed_cost` | Biaya tetap (sewa, gaji, listrik, dll.) per periode | Rp | $FC \ge 0$ |
| $v$ | `variable_cost` | Biaya variabel per cangkir (biji kopi, susu, gelas, dll.) | Rp/cangkir | $v \ge 0$ |
| $c$ | `quad_cost` | Koefisien biaya kuadrat (opsional; default 0) | Rp/cangkir² | $c \ge 0$ |
| $p_0$ | `ref_price` | Harga acuan saat ini | Rp/cangkir | $p_0>0$ |
| $q_0$ | `ref_demand` | Permintaan pada harga acuan | cangkir/periode | $q_0>0$ |
| $s$ | `sensitivity` | Penurunan permintaan tiap kenaikan harga **Rp1.000** | cangkir per Rp1.000 | $s>0$ |
| $x_{max}$ | `capacity` | Kapasitas maksimum produksi (opsional) | cangkir/periode | $x_{max}>0$ atau `null` |
| $a$ | (turunan) | Intersep fungsi harga-permintaan | Rp/cangkir | dihitung |
| $b$ | (turunan) | Kemiringan fungsi harga-permintaan | Rp/cangkir² | dihitung, $b>0$ |

> **Catatan penting:** jika harga dianggap konstan, maka $R(x)=px$ dan $P(x)$ linier sehingga **tidak punya titik maksimum** (turunan konstan). Karena itu model memakai **fungsi harga-permintaan** ($p$ bergantung pada $x$), sehingga $P(x)$ berbentuk parabola terbuka ke bawah dan konsep $P'(x)=0$ bermakna.

### 4.2 Fungsi Permintaan (Harga sebagai fungsi Jumlah)

Permintaan linier terhadap harga:
$$x(p) = q_0 - \frac{s}{1000}\,(p - p_0)$$

Inversnya (harga sebagai fungsi jumlah):
$$\boxed{p(x) = a - b\,x}$$

dengan
$$b = \frac{1000}{s}, \qquad a = p_0 + b\,q_0 .$$

**Verifikasi:** $p(q_0) = a - b q_0 = p_0$ ✔.

### 4.3 Fungsi Pendapatan
$$R(x) = x \cdot p(x) = a x - b x^2$$

### 4.4 Fungsi Biaya
$$C(x) = FC + v\,x + c\,x^2$$

(Jika $c=0$ → biaya linier klasik.)

### 4.5 Fungsi Keuntungan
$$P(x) = R(x) - C(x) = -(b+c)\,x^2 + (a - v)\,x - FC$$

Definisikan agar ringkas:
$$\alpha = b + c \;(>0), \qquad \beta = a - v, \qquad P(x) = -\alpha x^2 + \beta x - FC$$

### 4.6 Turunan Pertama & Titik Kritis
$$P'(x) = -2\alpha x + \beta$$
$$P'(x)=0 \;\Rightarrow\; \boxed{x^* = \frac{\beta}{2\alpha} = \frac{a - v}{2(b+c)}}$$

### 4.7 Uji Nilai Maksimum
**Uji turunan kedua:**
$$P''(x) = -2\alpha = -2(b+c) < 0 \quad \text{(selalu, karena } b>0,\; c\ge0\text{)}$$
Karena $P''(x^*)<0$ maka $x^*$ adalah **titik maksimum lokal sekaligus global** (parabola terbuka ke bawah).

**Uji tanda turunan pertama (untuk tabel di langkah solusi):**

| Interval | $x < x^*$ | $x = x^*$ | $x > x^*$ |
|---|---|---|---|
| Tanda $P'(x)$ | $+$ | $0$ | $-$ |
| Perilaku $P(x)$ | naik | maksimum | turun |

### 4.8 Nilai Optimal (tanpa kendala)
$$p^* = a - b\,x^*$$
$$R^* = x^* p^*, \qquad C^* = FC + v x^* + c (x^*)^2$$
$$P^* = R^* - C^* = \frac{\beta^2}{4\alpha} - FC = \frac{(a-v)^2}{4(b+c)} - FC$$

### 4.9 Kendala & Aturan Keputusan (Closed Interval Method)
Domain praktis: $x \in [0, x_{end}]$ dengan
- $x_{end} = x_{max}$ jika kapasitas diberikan,
- $x_{end} = x_{demand}$ jika tidak, dengan $x_{demand} = a/b$ (di atas itu harga $\le 0$).

**Algoritma penentuan $x_{opt}$ (kontinu):**
1. Jika $\beta \le 0$ (yaitu $a \le v$): harga tertinggi yang bisa dicapai pun tidak menutup biaya variabel → $x_{opt}=0$, $P = -FC$. Status: `NO_PRODUCTION`.
2. Selain itu hitung $x^*$.
3. Jika $x^* \le x_{end}$ → $x_{opt}=x^*$. Status: `INTERIOR_OPTIMUM`.
4. Jika $x^* > x_{end}$ → karena $P$ naik di $[0,x^*]$, maksimum di batas: $x_{opt}=x_{end}$. Status: `CAPACITY_BOUND`.

> Catatan: dengan $\beta>0$ dan $c\ge0$ selalu berlaku $x^* < a/(2b) < a/b$, sehingga batas permintaan tidak pernah aktif; hanya `capacity` yang bisa aktif.

### 4.10 Pembulatan ke Bilangan Bulat
Karena cangkir bilangan bulat:
1. Kandidat: $\lfloor x_{opt}\rfloor$ dan $\lceil x_{opt}\rceil$, dibatasi ke $[0, \lfloor x_{end}\rfloor]$.
2. Hitung $P$ pada tiap kandidat, pilih yang terbesar (jika sama, pilih $x$ lebih kecil).
3. Parabola simetris di sekitar $x^*$, jadi pemenang adalah bilangan bulat terdekat ke $x^*$ (verifikasi tetap dilakukan lewat perbandingan nilai $P$).
4. Harga dihitung ulang: $p_{int} = a - b\,x_{int}$.
5. Output memuat **kedua** hasil: `continuous` dan `integer`.

### 4.11 Titik Impas (Break-Even Point, BEP)
Selesaikan $P(x)=0$:
$$-\alpha x^2 + \beta x - FC = 0 \;\Rightarrow\; \alpha x^2 - \beta x + FC = 0$$
$$D = \beta^2 - 4\alpha\,FC$$
- $D<0$ → **tidak ada BEP** (rugi di semua $x$).
- $D\ge0$:
$$x_{BEP,1} = \frac{\beta - \sqrt{D}}{2\alpha}, \qquad x_{BEP,2} = \frac{\beta + \sqrt{D}}{2\alpha}$$
- Rentang untung: $x_{BEP,1} < x < x_{BEP,2}$.
- BEP pembulatan: $\lceil x_{BEP,1}\rceil$ dan $\lfloor x_{BEP,2}\rfloor$ (jika $D=0$, satu titik saja = $x^*$ dan laba maks = 0).
- Catatan: $D \ge 0 \iff P^* \ge 0$ (karena $P^*=D/(4\alpha)$).

### 4.12 Analisis Marginal
$$MR(x) = R'(x) = a - 2bx, \qquad MC(x) = C'(x) = v + 2cx$$
$$P'(x) = MR(x) - MC(x)$$
Syarat optimal: $MR(x^*) = MC(x^*)$. Cek: $a-2bx^* = v+2cx^* \Rightarrow x^*=\frac{a-v}{2(b+c)}$ ✔ (harus konsisten dengan 4.6).

**Interpretasi:** selama pendapatan tambahan dari cangkir berikutnya ($MR$) lebih besar dari biaya tambahannya ($MC$), menambah penjualan menaikkan laba. Berhenti di titik $MR=MC$.

### 4.13 Elastisitas Harga pada Titik Optimal
$$\varepsilon(p) = \frac{dx}{dp}\cdot\frac{p}{x}, \qquad \frac{dx}{dp} = -\frac{1}{b}$$
$$\boxed{\varepsilon^* = -\frac{p^*}{b\,x^*}}$$
Interpretasi: $|\varepsilon^*|>1$ → permintaan elastis (naik harga 1% menurunkan jumlah > 1%). Untuk $c=0$ berlaku **aturan Lerner**: $MC = p^*\left(1 + \frac{1}{\varepsilon^*}\right)$ (dipakai sebagai cek konsistensi di test). Hanya dihitung jika $x^*>0$ (interior).

### 4.14 Analisis Sensitivitas (Turunan sebagai Laju Perubahan)
Pada kondisi `INTERIOR_OPTIMUM` (kontinu), dengan $P^* = \frac{(a-v)^2}{4(b+c)} - FC$:

| Turunan | Rumus | Arti |
|---|---|---|
| $\dfrac{\partial x^*}{\partial v}$ | $-\dfrac{1}{2(b+c)}$ | Jika biaya variabel naik Rp1, jumlah optimal turun segini |
| $\dfrac{\partial x^*}{\partial FC}$ | $0$ | Biaya tetap tidak mengubah jumlah optimal |
| $\dfrac{\partial x^*}{\partial a}$ | $\dfrac{1}{2(b+c)}$ | Daya tarik pasar naik → jumlah optimal naik |
| $\dfrac{\partial P^*}{\partial FC}$ | $-1$ | Biaya tetap naik Rp1 → laba maks turun Rp1 |
| $\dfrac{\partial P^*}{\partial v}$ | $-x^*$ | Biaya variabel naik Rp1 → laba maks turun Rp$x^*$ (teorema envelope) |
| $\dfrac{\partial P^*}{\partial a}$ | $x^*$ | Intersep harga naik Rp1 → laba maks naik Rp$x^*$ |

Selain itu backend menghasilkan **tabel skenario**: ubah $v$ dan $FC$ sebesar $\pm10\%, \pm20\%$ dan hitung ulang $x^*, p^*, P^*$ (kalkulasi penuh, bukan hanya aproksimasi turunan), lalu tampilkan selisih terhadap baseline.

### 4.15 Konversi Periode
Backend bekerja dalam **satuan periode yang sama untuk semua input**. Parameter `period` ∈ {`day`, `month`} hanya label tampilan. Jika pengguna memasukkan biaya tetap bulanan dan permintaan harian, UI (Phase 4) wajib mengonversi: $FC_{harian} = FC_{bulanan} / hari\_buka$. Backend tidak melakukan konversi otomatis.

### 4.16 Validasi Semantik & Peringatan (Warning)
| Kode | Kondisi | Level |
|---|---|---|
| `W_NEG_PROFIT` | $P_{int} < 0$ (rugi bahkan di titik terbaik) | warning |
| `W_PRICE_BELOW_VC` | $p_{opt} \le v + 2c\,x_{opt}$ tidak mungkin pada interior (cek keamanan) | error internal |
| `W_EXTRAPOLATION` | $x_{opt} > 2\,q_0$ atau $x_{opt} < 0{,}25\,q_0$ (model linier jauh dari data acuan) | warning |
| `W_PRICE_JUMP` | $p_{opt}$ berbeda > 50% dari $p_0$ | warning |
| `W_CAPACITY_BINDING` | status `CAPACITY_BOUND` | info |
| `W_NO_PRODUCTION` | status `NO_PRODUCTION` | warning |
| `W_PRICE_BELOW_REF_COST` | $p_0 < v$ (harga acuan di bawah biaya variabel) | warning |

---

## 5. ARSITEKTUR & TEKNOLOGI

### 5.1 Stack
| Lapisan | Teknologi | Alasan |
|---|---|---|
| Mesin kalkulus | **Python 3.11+**, `sympy`, `numpy` | Rumus + verifikasi simbolik |
| API | **FastAPI** + `pydantic v2` + `uvicorn` | Validasi otomatis, dokumentasi OpenAPI |
| Test | `pytest`, `hypothesis` (opsional) | Golden test & property test |
| Frontend (Phase 4) | **Next.js (React) + TypeScript + Tailwind CSS** | Stack tim |
| Render rumus | **KaTeX** (`react-katex` / `katex`) | Menampilkan LaTeX dari backend |
| Grafik | **Recharts** | Kurva R, C, P, MR, MC |

### 5.2 Struktur Direktori
```
kopioptima/
├─ PRD.md
├─ backend/
│  ├─ pyproject.toml
│  ├─ app/
│  │  ├─ main.py                 # FastAPI app, CORS, router
│  │  ├─ api/routes.py           # endpoint
│  │  ├─ schemas.py              # pydantic request/response
│  │  ├─ core/
│  │  │  ├─ model.py             # a, b, R, C, P, turunan (fungsi murni)
│  │  │  ├─ optimizer.py         # x*, kendala, pembulatan, status
│  │  │  ├─ breakeven.py         # BEP
│  │  │  ├─ marginal.py          # MR, MC, elastisitas
│  │  │  ├─ sensitivity.py       # turunan sensitivitas + tabel skenario
│  │  │  ├─ curves.py            # generator titik grafik
│  │  │  ├─ validation.py        # peringatan semantik
│  │  │  └─ sympy_verify.py      # verifikasi simbolik
│  │  └─ steps/
│  │     └─ builder.py           # langkah solusi (LaTeX + teks Indonesia)
│  └─ tests/
│     ├─ test_model.py
│     ├─ test_optimizer.py
│     ├─ test_breakeven.py
│     ├─ test_sensitivity.py
│     ├─ test_steps.py
│     ├─ test_api.py
│     └─ golden_cases.json
└─ frontend/                     # Phase 4 (jangan dibuat sebelum Phase 3 selesai)
```

### 5.3 Prinsip Implementasi `core/`
- **Fungsi murni** (tanpa I/O, tanpa state global), tipe `float`; gunakan `math.isclose(rel_tol=1e-9, abs_tol=1e-6)` untuk perbandingan.
- `sympy_verify.py`: definisikan `x` sebagai simbol, bangun $P(x)$ dari parameter, hitung `diff(P, x)`, `solve(diff(P,x), x)`, `diff(P, x, 2)`, lalu **assert** hasil sama dengan rumus tertutup (toleransi $10^{-6}$). Fungsi ini dipanggil di test dan opsional (flag `verify=true`) pada API.
- Semua angka uang pada output di-*round* hanya di lapisan presentasi (`schemas`), bukan di dalam perhitungan.

---

## 6. FASE PENGERJAAN

### PHASE 0 — Setup (backend)
- Inisialisasi proyek Python, dependensi: `fastapi uvicorn pydantic sympy numpy pytest httpx`.
- Siapkan struktur Bagian 5.2.
- **Selesai jika:** `pytest` berjalan (boleh 0 test) dan `uvicorn app.main:app` hidup dengan endpoint `/health`.

### PHASE 1 — Mesin Kalkulus (rumus inti) ⭐ PRIORITAS TERTINGGI
Implementasikan di `core/` sesuai Bagian 4:

| Modul | Fungsi minimum |
|---|---|
| `model.py` | `demand_params(p0,q0,s) -> (a,b)`, `price(x,a,b)`, `revenue(x,a,b)`, `cost(x,FC,v,c)`, `profit(x,a,b,FC,v,c)`, `dprofit(x,...)`, `d2profit(...)` |
| `optimizer.py` | `critical_point(a,b,v,c)`, `optimize(params) -> OptimizationResult` (kontinu + integer + status), `round_to_integer(...)` |
| `breakeven.py` | `breakeven(a,b,FC,v,c) -> BEP \| None` |
| `marginal.py` | `mr(x,a,b)`, `mc(x,v,c)`, `elasticity(p,x,b)` |
| `sensitivity.py` | `partials(...)`, `scenario_table(...)` |
| `curves.py` | `build_curves(...)` (lihat 7.3) |
| `validation.py` | `collect_warnings(...)` (Bagian 4.16) |
| `sympy_verify.py` | `verify_with_sympy(...)` |

**Acceptance criteria Phase 1:**
- [ ] Semua golden case (Bagian 9) lulus dengan toleransi.
- [ ] Verifikasi SymPy cocok dengan rumus tertutup untuk ≥ 200 kombinasi parameter acak yang valid (property test).
- [ ] Untuk setiap kasus: $P'(x^*)\approx0$, $P''<0$, $MR(x^*)\approx MC(x^*)$.
- [ ] Untuk kasus integer: $P(x_{int}) \ge P(x_{int}\pm1)$.
- [ ] Edge case (Bagian 9.2) ditangani tanpa exception.

### PHASE 2 — Penyusun Langkah Solusi (Step Builder)
`steps/builder.py` menghasilkan daftar langkah terurut. Tiap langkah:
```json
{
  "id": 6,
  "title": "Turunan pertama fungsi keuntungan",
  "latex": "P'(x) = -2(b+c)x + (a-v)",
  "explanation": "Fungsi keuntungan diturunkan terhadap x menggunakan aturan pangkat dan aturan konstanta.",
  "values": {"alpha": 220.0, "beta": 30000.0}
}
```
**Daftar langkah wajib (urutan tetap):**

| # | Judul | Isi LaTeX utama |
|---|---|---|
| 1 | Data yang diketahui | $FC, v, c, p_0, q_0, s$ beserta nilainya |
| 2 | Menyusun fungsi harga-permintaan | $b=\frac{1000}{s}$, $a=p_0+bq_0$, $p(x)=a-bx$ (substitusi angka) |
| 3 | Fungsi pendapatan | $R(x)=x\,p(x)=ax-bx^2$ (angka) |
| 4 | Fungsi biaya | $C(x)=FC+vx+cx^2$ (angka) |
| 5 | Fungsi keuntungan | $P(x)=R(x)-C(x)=-\alpha x^2+\beta x-FC$ (angka) |
| 6 | Turunan pertama | $P'(x)=-2\alpha x+\beta$ |
| 7 | Titik kritis | $P'(x)=0\Rightarrow x^*=\frac{\beta}{2\alpha}$ (substitusi angka) |
| 8 | Uji turunan kedua | $P''(x)=-2\alpha<0$ ⇒ maksimum |
| 9 | Uji tanda turunan pertama | tabel interval (4.7) |
| 10 | Pemeriksaan kendala | kapasitas, domain, status (4.9) |
| 11 | Pembulatan | tabel kandidat $\lfloor x\rfloor,\lceil x\rceil$ dengan nilai $P$ |
| 12 | Harga, pendapatan, biaya, laba optimal | $p^*,R^*,C^*,P^*$ |
| 13 | Titik impas (BEP) | diskriminan $D$ dan akar |
| 14 | Analisis marginal | $MR=MC$ di $x^*$ |
| 15 | Elastisitas | $\varepsilon^*$ dan interpretasi |
| 16 | Kesimpulan & rekomendasi | kalimat Bahasa Indonesia (template 7.5) |

Aturan: LaTeX valid KaTeX; angka diformat pemisah ribuan titik pada teks (`Rp1.125.000`), tetapi pada LaTeX gunakan format `\text{Rp}\,1.125.000` atau `1{,}125{,}000` secara konsisten (pilih satu dan seragam di seluruh langkah). Langkah 10 dan 13 boleh berbeda isi bergantung status.

**Acceptance criteria Phase 2:**
- [ ] 16 langkah selalu ada; langkah yang tidak berlaku diberi catatan "tidak berlaku" (bukan dihapus).
- [ ] Angka pada langkah = angka pada hasil optimasi (test konsistensi).
- [ ] Snapshot test untuk golden case G1 dan G2.

### PHASE 3 — REST API
Endpoint di Bagian 7. Dokumentasi OpenAPI otomatis aktif di `/docs`.

**Acceptance criteria Phase 3:**
- [ ] Test `httpx`/`TestClient` untuk semua endpoint (sukses & error 422).
- [ ] Respons sesuai skema Bagian 7 (divalidasi pydantic response model).
- [ ] CORS mengizinkan `http://localhost:3000`.
- [ ] Waktu respons `/optimize` < 200 ms untuk 400 titik grafik.

> ⛔ **GATE:** Frontend hanya boleh dikerjakan jika Phase 1–3 lulus seluruh test.

### PHASE 4 — Frontend (dikerjakan PALING AKHIR)
Lihat Bagian 8.

### PHASE 5 — Poles & Dukungan Laporan
Preset, ekspor, README, skrip demo untuk video presentasi (Bagian 10–11).

---

## 7. SPESIFIKASI API

Base URL: `/api/v1`. Format JSON. Semua angka uang dalam Rupiah (float).

### 7.1 `GET /health`
`200 → {"status":"ok","version":"1.0.0"}`

### 7.2 `POST /optimize`  (endpoint utama)

**Request**
```json
{
  "fixed_cost": 300000,
  "variable_cost": 8000,
  "quad_cost": 0,
  "ref_price": 22000,
  "ref_demand": 80,
  "sensitivity": 5,
  "capacity": null,
  "options": {
    "include_steps": true,
    "include_curves": true,
    "include_sensitivity": true,
    "curve_points": 200,
    "verify_symbolic": false
  }
}
```

**Validasi (pydantic, error 422 berbahasa Indonesia):**
| Field | Aturan |
|---|---|
| `fixed_cost` | $\ge 0$, maks $10^{10}$ |
| `variable_cost` | $\ge 0$, maks $10^{7}$ |
| `quad_cost` | $\ge 0$, default 0 |
| `ref_price` | $> 0$ |
| `ref_demand` | $> 0$ |
| `sensitivity` | $> 0$ |
| `capacity` | `null` atau $> 0$ |
| `curve_points` | 50–1000 (default 200) |
| Semua angka | harus finite (bukan NaN/Inf) |

**Response (`200`)**
```json
{
  "model": {
    "a": 38000.0,
    "b": 200.0,
    "alpha": 200.0,
    "beta": 30000.0,
    "formulas": {
      "price": "p(x) = 38000 - 200x",
      "revenue": "R(x) = 38000x - 200x^2",
      "cost": "C(x) = 300000 + 8000x",
      "profit": "P(x) = -200x^2 + 30000x - 300000",
      "dprofit": "P'(x) = -400x + 30000",
      "d2profit": "P''(x) = -400"
    }
  },
  "optimum": {
    "status": "INTERIOR_OPTIMUM",
    "continuous": {
      "x": 75.0, "price": 23000.0,
      "revenue": 1725000.0, "cost": 900000.0, "profit": 825000.0
    },
    "integer": {
      "x": 75, "price": 23000.0,
      "revenue": 1725000.0, "cost": 900000.0, "profit": 825000.0,
      "candidates": [
        {"x": 75, "profit": 825000.0}
      ]
    },
    "second_derivative": -400.0,
    "is_maximum": true
  },
  "break_even": {
    "exists": true,
    "discriminant": 660000000.0,
    "x_low": 10.77, "x_high": 139.23,
    "x_low_int": 11, "x_high_int": 139
  },
  "marginal": {
    "mr_at_opt": 8000.0,
    "mc_at_opt": 8000.0,
    "elasticity": -1.5333,
    "elasticity_label": "elastis"
  },
  "sensitivity": {
    "partials": {
      "dx_dv": -0.0025,
      "dx_dFC": 0.0,
      "dx_da": 0.0025,
      "dP_dFC": -1.0,
      "dP_dv": -75.0,
      "dP_da": 75.0
    },
    "scenarios": [
      {"label": "Biaya variabel +10%", "x": 73.0, "price": 23400.0, "profit": 765800.0, "delta_profit": -59200.0}
    ]
  },
  "curves": { "...": "lihat 7.3" },
  "steps": [ "...16 langkah, lihat Phase 2" ],
  "warnings": [
    {"code": "W_EXTRAPOLATION", "level": "info", "message": "..."}
  ],
  "verification": null
}
```
> Contoh di atas sesuai kasus G1 (skenario biaya variabel +10% → $v=8.800$, $x=73$, $P=765.800$). Nilai nyata selalu dihitung ulang dari model.

**Respons error:** `422` (validasi) berformat `{"detail":[{"field":"...","message":"..."}]}`.
Kondisi bisnis (mis. `NO_PRODUCTION`) **bukan error**; dikembalikan `200` dengan `status` dan `warnings`.

### 7.3 `POST /curves`
Request sama dengan `/optimize` tanpa `options` kecuali `curve_points`. Response:
```json
{
  "x_range": [0, 160],
  "points": [
    {"x": 0, "price": 38000, "R": 0, "C": 300000, "P": -300000, "MR": 38000, "MC": 8000, "dP": 30000}
  ],
  "markers": {
    "optimum": {"x": 75, "P": 825000},
    "break_even": [{"x": 10.77}, {"x": 139.23}],
    "capacity": null,
    "reference": {"x": 80, "P": 800000}
  }
}
```
**Aturan rentang $x$:**
$$x_{plot,max} = \max\big(1{,}5\,x_{opt},\; 1{,}1\,x_{BEP,2}\;(\text{jika ada}),\; 1{,}2\,q_0\big)$$
lalu dipotong ke $\min(x_{plot,max},\, a/b)$ agar harga tidak negatif. Titik di-*sample* merata dari 0 sampai $x_{plot,max}$ (`curve_points` titik, selalu menyertakan $x_{opt}$ dan titik BEP secara eksplisit).
`reference` = laba jika kedai tetap pada $(p_0, q_0)$, untuk perbandingan "sebelum vs sesudah optimasi" (dihitung dengan $P(q_0)$).

### 7.4 `POST /sensitivity`
Request sama; response hanya blok `sensitivity` (Bagian 4.14) dengan parameter tambahan opsional `steps_pct: [-20,-10,10,20]`.

### 7.5 `GET /presets`
Mengembalikan 3 preset kedai kopi (nilai awal untuk demo):

| Preset | FC | v | c | p₀ | q₀ | s | cap |
|---|---|---|---|---|---|---|---|
| Kedai Kopi Kecil (baseline, G1) | 300000 | 8000 | 0 | 22000 | 80 | 5 | null |
| Kedai dengan Biaya Lembur (G2) | 300000 | 8000 | 20 | 22000 | 80 | 5 | null |
| Kedai Kapasitas Terbatas (G3) | 300000 | 8000 | 0 | 22000 | 80 | 5 | 60 |

### 7.6 Template Kesimpulan (Langkah 16)
- Interior & untung: *"Keuntungan maksimum diperoleh saat menjual **{x} cangkir** per {period} dengan harga **Rp{p}** per cangkir, menghasilkan laba **Rp{P}**. Usaha mulai untung pada penjualan ≥ {bep_low} cangkir."*
- Rugi: *"Pada parameter ini laba maksimum bernilai negatif (Rp{P}). Pertimbangkan menurunkan biaya tetap/variabel atau meninjau ulang harga acuan."*
- Capacity bound: *"Kapasitas {cap} cangkir membatasi produksi; titik optimal tanpa batas ada di {x*} cangkir. Menambah kapasitas berpotensi menambah laba sebesar Rp{delta}."*
- No production: *"Harga tertinggi yang dapat diterima pasar tidak melampaui biaya variabel per cangkir; produksi tidak menguntungkan."*

---

## 8. SPESIFIKASI FRONTEND (PHASE 4 — KERJAKAN TERAKHIR)

> Prasyarat: Phase 1–3 selesai & test hijau. Frontend **hanya** menampilkan data dari API; **tidak boleh** menghitung ulang rumus inti (kecuali pemformatan dan konversi periode 4.15).

### 8.1 Halaman & Layout
Satu halaman (`/`), responsif mobile-first.
- **Kiri / atas:** Form input (preset dropdown, field parameter, toggle kapasitas, tombol *Hitung*).
- **Kanan / bawah:** Hasil dengan 5 tab.

### 8.2 Komponen

| Komponen | Isi |
|---|---|
| `ParameterForm` | Input terformat Rupiah, helper teks tiap field, validasi realtime, tombol reset & preset |
| `SummaryCards` | Kartu: Jumlah optimal, Harga optimal, Pendapatan, Biaya, **Laba maksimum**, BEP; badge status |
| `WarningList` | Peringatan berwarna (info/warning) dari API |
| `StepsPanel` | Accordion 16 langkah; rumus dirender KaTeX; tombol "Salin LaTeX" |
| `ProfitChart` | Recharts `LineChart`: $R(x)$, $C(x)$, $P(x)$; penanda titik optimal, BEP, referensi, area untung |
| `MarginalChart` | $MR(x)$ vs $MC(x)$ dengan perpotongan di $x^*$ |
| `DerivativeChart` | $P'(x)$ memotong sumbu-x di $x^*$ (ilustrasi titik kritis) |
| `SensitivityPanel` | Tabel turunan parsial + tabel skenario ±10/20% + bar chart selisih laba |
| `DataTable` | Tabel $x, p, R, C, P$ per interval (mis. tiap 10 cangkir) + unduh CSV |

### 8.3 Tab Hasil
1. **Ringkasan** — SummaryCards + peringatan + kesimpulan.
2. **Langkah Solusi** — StepsPanel.
3. **Grafik** — ProfitChart, MarginalChart, DerivativeChart.
4. **Sensitivitas** — SensitivityPanel.
5. **Tabel Data** — DataTable.

### 8.4 Perilaku UX
- Debounce 400 ms jika mode *live update* aktif; default tombol *Hitung*.
- *Loading skeleton*, state error ramah (Bahasa Indonesia).
- Format angka: `Rp1.125.000`, desimal koma.
- Dark/light mode (opsional).
- Slider "geser harga" (opsional P2) yang menampilkan $x(p)$ dan $P$ pada harga pilihan, untuk menunjukkan bahwa laba memuncak pada $p^*$.
- Ekspor: unduh JSON hasil, CSV tabel, dan PNG grafik (untuk laporan).

### 8.5 Aksesibilitas & Kualitas
Kontras warna memadai, label form tertaut, grafik punya ringkasan teks (`aria-label`), `lint` & `tsc` bersih.

**Acceptance criteria Phase 4:**
- [ ] Preset G1 menampilkan 75 cangkir, Rp23.000, laba Rp825.000.
- [ ] Semua 16 langkah tampil dengan rumus KaTeX tanpa error.
- [ ] Grafik menandai titik optimal dan BEP yang benar.
- [ ] Error validasi dari API tampil di bawah field terkait.
- [ ] Berfungsi di layar 360 px sampai desktop.

---

## 9. TEST: GOLDEN CASES (WAJIB LULUS)

Toleransi: relatif $10^{-6}$ (uang), mutlak $10^{-6}$.

### 9.1 Kasus Acuan

**G1 — Baseline (biaya linier, tanpa kapasitas)**
Input: $FC=300.000,\; v=8.000,\; c=0,\; p_0=22.000,\; q_0=80,\; s=5$

| Besaran | Nilai |
|---|---|
| $b$ | $1000/5=200$ |
| $a$ | $22.000+200\cdot80=38.000$ |
| $P(x)$ | $-200x^2+30.000x-300.000$ |
| $P'(x)$ | $-400x+30.000$ |
| $x^*$ | $30.000/400=75$ |
| $P''$ | $-400$ |
| $p^*$ | $38.000-200\cdot75=23.000$ |
| $R^*$ | $75\cdot23.000=1.725.000$ |
| $C^*$ | $300.000+8.000\cdot75=900.000$ |
| $P^*$ | $825.000$ |
| $D$ | $30.000^2-4\cdot200\cdot300.000=660.000.000$ |
| BEP | $x=\dfrac{30.000\mp\sqrt{660.000.000}}{400}\approx 10{,}77 \text{ dan } 139{,}23$ → 11 dan 139 |
| $MR(75)$ | $38.000-2\cdot200\cdot75=8.000$ |
| $MC(75)$ | $8.000$ |
| $\varepsilon^*$ | $-\dfrac{23.000}{200\cdot75}\approx-1{,}5333$ |
| Cek Lerner | $23.000(1-1/1{,}5333)=8.000$ ✔ |
| Referensi $P(q_0)=P(80)$ | $820.000$ (lihat catatan di bawah) |

> **Catatan referensi G1:** $P(q_0)=P(80)$: $R=22.000\cdot80=1.760.000$; $C=300.000+640.000=940.000$; $P=820.000$. Maka optimasi menaikkan laba dari Rp820.000 → Rp825.000 (+Rp5.000). Gunakan nilai ini (820.000) pada test `reference`.

Sensitivitas G1 (dengan $\alpha=200$): $\partial P^*/\partial v=-75$, $\partial P^*/\partial FC=-1$, $\partial x^*/\partial v=-\dfrac{1}{2\cdot200}=-0{,}0025$, $\partial x^*/\partial a=+0{,}0025$.

**G2 — Biaya kuadrat (lembur)**
Input: sama dengan G1 tetapi $c=20$.

| Besaran | Nilai |
|---|---|
| $\alpha=b+c$ | $220$ |
| $\beta=a-v$ | $30.000$ |
| $x^*$ | $30.000/440\approx68{,}1818$ |
| $p^*$ | $38.000-200\cdot68{,}1818\approx24.363{,}64$ |
| $P^*$ | $\dfrac{30.000^2}{4\cdot220}-300.000\approx722.727{,}27$ |
| Integer | $x=68$: $P=722.720$; $x=69$: $P=722.580$ → **pilih 68** |
| $p_{int}$ | $38.000-200\cdot68=24.400$ |
| $MR=MC$ di $x^*$ | $a-2bx^* = 38.000 - 400\cdot68{,}1818 \approx 10.727{,}27$; $v+2cx^* = 8.000 + 40\cdot68{,}1818 \approx 10.727{,}27$ |

**G3 — Kapasitas membatasi**
Input: sama dengan G1 dengan $x_{max}=60$.

| Besaran | Nilai |
|---|---|
| $x^*$ (tanpa batas) | $75>60$ → status `CAPACITY_BOUND` |
| $x_{opt}$ | $60$ |
| $p$ | $38.000-200\cdot60=26.000$ |
| $P$ | $-200\cdot3600+30.000\cdot60-300.000=780.000$ |
| Warning | `W_CAPACITY_BINDING` |

**G4 — Selalu rugi (tidak ada BEP)**
Input: $FC=1.500.000$, lainnya seperti G1.
$x^*=75,\; P^*=1.125.000-1.500.000=-375.000$, $D=9\times10^8-1{,}2\times10^9<0$ → `break_even.exists=false`, warning `W_NEG_PROFIT`.

**G5 — Tidak layak produksi**
Input: $v=45.000$, lainnya seperti G1 → $a-v=-7.000\le0$ → status `NO_PRODUCTION`, $x_{opt}=0$, $P=-FC=-300.000$, warning `W_NO_PRODUCTION`.

### 9.2 Edge Case & Property Test
- $D=0$ tepat (mis. pilih $FC=\beta^2/(4\alpha)$): satu BEP = $x^*$, $P^*=0$.
- $x^*$ tepat bilangan bulat dan $x^*$ tepat setengah (mis. 68,5): pilih $x$ lebih kecil bila $P$ sama.
- $x^*$ pecahan sangat kecil ($<0{,}5$): hasil integer 0 atau 1 sesuai perbandingan $P$.
- Kapasitas pecahan (mis. 60,7): batas integer = 60.
- $FC=0$: $P^*=\beta^2/(4\alpha)>0$, BEP pertama $=0$.
- Nilai besar ($FC=10^{10}$) tidak overflow, tanpa NaN.
- **Property test (random valid input):** (i) $P'(x^*)\approx0$; (ii) $P(x^*)\ge P(x)$ untuk $x$ acak di domain; (iii) $\partial P^*/\partial v\approx$ beda hingga $(P^*(v+h)-P^*(v-h))/2h$ (cek teorema envelope); (iv) integer-profit $\le$ continuous-profit.

### 9.3 Test Lain
- `test_steps`: angka pada setiap langkah sama dengan hasil `optimize`.
- `test_api`: 200 untuk G1–G5, 422 untuk `sensitivity=0`, `ref_price=-1`, `capacity=0`, nilai non-numerik.
- Cakupan kode (coverage) `core/` ≥ 90%.

---

## 10. NON-FUNCTIONAL REQUIREMENTS
| Aspek | Target |
|---|---|
| Akurasi | Konsisten dengan SymPy (toleransi $10^{-6}$) |
| Performa | `/optimize` < 200 ms (400 titik) |
| Keamanan | Validasi input ketat, batas nilai maksimum, tanpa `eval`, rate-limit sederhana (opsional) |
| Keterbacaan kode | Type hints, docstring Bahasa Indonesia singkat berisi rumus yang dipakai |
| Reproduksibilitas | `README` dengan perintah instalasi, menjalankan, dan menjalankan test |
| Lisensi sumber | Setiap sumber/referensi pustaka dicatat untuk laporan |

---

## 11. DUKUNGAN LAPORAN & PRESENTASI

### 11.1 Produk yang Dihasilkan untuk Laporan (Bab IV)
- Tabel perhitungan (tab Tabel Data) dan grafik PNG (4.3 Visualisasi).
- Langkah perhitungan (tab Langkah) → disalin ke 4.1 Proses Perhitungan.
- Tabel sensitivitas → 4.4 Analisis & Interpretasi.

### 11.2 Catatan yang Wajib Ditulis di Laporan
- Aplikasi pendukung: Python (FastAPI, SymPy, NumPy), Next.js, Recharts — jelaskan fungsi masing-masing.
- Asumsi model: permintaan linier terhadap harga, biaya variabel konstan (atau kuadrat ringan), periode tunggal, satu produk representatif.
- Keterbatasan: model linier valid di sekitar data acuan; parameter ($q_0$, $s$) idealnya dari **survei/observasi** kedai nyata.
- Format laporan sesuai ketentuan dosen: A4, Times New Roman 12, spasi 1,15, margin kiri & atas 3,5 cm, kanan & bawah 2,54 cm, minimal 8 halaman, bahasa ilmiah tanpa kata ganti personal.

### 11.3 Skenario Demo Video (±30 menit)
1. Masalah UMKM kedai kopi (3 mnt).
2. Penurunan model $p(x), R(x), C(x), P(x)$ (6 mnt).
3. Turunan, titik kritis, uji maksimum — **dilakukan manual di papan** lalu dicocokkan dengan simulator (8 mnt).
4. Demo preset G1, G2, G3 dan perubahan parameter (7 mnt).
5. Sensitivitas & interpretasi bisnis (4 mnt).
6. Kesimpulan & pembagian peran (2 mnt).

---

## 12. LINIMASA SARAN (23 Nov – 1 Des 2026)
| Tanggal | Target |
|---|---|
| 23 Nov | Phase 0 + mulai Phase 1 |
| 24–25 Nov | Phase 1 selesai (semua golden test hijau) + Phase 2 |
| 26 Nov | Phase 3 (API) |
| 27–28 Nov | Phase 4 (Frontend) |
| 29 Nov | Phase 5 poles; ambil grafik/tabel untuk laporan |
| 30 Nov | Rekam video presentasi, finalisasi laporan |
| 1 Des | Pengumpulan laporan PDF + presentasi |

---

## 13. RISIKO & MITIGASI
| Risiko | Mitigasi |
|---|---|
| Model laba linier tidak punya maksimum | Gunakan fungsi harga-permintaan (4.2) |
| Parameter permintaan ($s$) tidak realistis | Beri helper teks + warning ekstrapolasi, anjurkan survei |
| Selisih hasil manual vs program | Verifikasi SymPy + golden test |
| Frontend menghitung ulang rumus (inkonsisten) | Larangan di Bagian 8; satu sumber kebenaran di backend |
| Waktu mepet | Ikuti gate Phase; P2 boleh dibuang |

---

## 14. DEFINITION OF DONE (SELURUH PRODUK)
- [ ] Phase 1–3 lulus semua test (golden, property, API).
- [ ] Phase 4: UI menampilkan hasil G1–G5 benar.
- [ ] Langkah solusi runtut dan konsisten dengan angka hasil.
- [ ] README lengkap dan dapat dijalankan dari nol.
- [ ] Grafik/tabel siap dipakai untuk laporan dan video.

---

## LAMPIRAN A — Ringkasan Rumus (Cheat Sheet untuk Agent)

$$
\begin{aligned}
b &= \frac{1000}{s}, \qquad a = p_0 + b\,q_0, \qquad p(x)=a-bx\\
R(x) &= ax - bx^2, \qquad C(x)=FC+vx+cx^2\\
\alpha &= b+c, \qquad \beta = a-v\\
P(x) &= -\alpha x^2+\beta x - FC\\
P'(x) &= -2\alpha x+\beta, \qquad P''(x)=-2\alpha\\
x^* &= \frac{\beta}{2\alpha}, \qquad p^*=a-bx^*, \qquad P^*=\frac{\beta^2}{4\alpha}-FC\\
D &= \beta^2-4\alpha FC, \qquad x_{BEP}=\frac{\beta\mp\sqrt{D}}{2\alpha}\\
MR &= a-2bx, \qquad MC = v+2cx, \qquad MR(x^*)=MC(x^*)\\
\varepsilon^* &= -\frac{p^*}{b\,x^*}
\end{aligned}
$$

## LAMPIRAN B — Pseudocode `optimize()`

```text
function optimize(params):
    (a, b) = demand_params(p0, q0, s)
    alpha = b + c ; beta = a - v
    x_end = capacity if capacity else a / b

    if beta <= 0:
        return status NO_PRODUCTION, x = 0, P = -FC

    x_star = beta / (2 * alpha)

    if x_star <= x_end:
        x_opt = x_star ; status = INTERIOR_OPTIMUM
    else:
        x_opt = x_end ; status = CAPACITY_BOUND

    # pembulatan
    cand = unique({ floor(x_opt), ceil(x_opt) } clipped to [0, floor(x_end)])
    x_int = argmax_{x in cand} P(x)   # tie -> x terkecil
    p_int = a - b * x_int

    return continuous(x_opt), integer(x_int, p_int, P(x_int)), status
```
