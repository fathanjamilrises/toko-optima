# Dokumentasi Teknis & Matematis KopiOptima

Selamat datang di repositori dokumentasi resmi **KopiOptima** — Simulator dan Alat Bantu Keputusan Optimasi Keuntungan Kedai Kopi UMKM Berbasis Kalkulus Diferensial.

Aplikasi ini dibangun untuk menjembatani teori kalkulus diferensial perguruan tinggi dengan penerapan praktis manajerial bisnis kedai kopi nyata di Indonesia.

---

## 📚 Struktur Berkas Dokumentasi

Dokumentasi ini dibagi menjadi 6 modul terstruktur yang mencakup matematika murni, arsitektur backend, frontend, grafika 3D, gamifikasi, hingga panduan pengguna:

| No | Modul Dokumentasi | Deskripsi Utama |
|---|---|---|
| **01** | [**01. Kalkulus & Model Matematika**](./01-kalkulus-dan-model-matematika.md) | Rumus matematis lengkap: kurva permintaan terbalik, fungsi pendapatan $R(x)$, fungsi biaya $C(x)$, laba $P(x)$, turunan pertama ($P'=0$), uji turunan kedua ($P'' < 0$), kendala kapasitas Kuhn-Tucker, diskretisasi bilangan bulat, titik impas (BEP), dan analisis sensitivitas (Teorema Envelope). |
| **02** | [**02. Arsitektur & Modul Backend**](./02-arsitektur-dan-modul-backend.md) | Struktur arsitektur FastAPI (Python 3.12+), modul murni `app/core/`, kontrak skema input/output Pydantic v2, endpoint API `/api/v1/optimize` & `/api/v1/presets`, serta sistem peringatan dini (*diagnostic warnings*). |
| **03** | [**03. Arsitektur & Modul Frontend**](./03-arsitektur-dan-modul-frontend.md) | Struktur Next.js 15 App Router, React 19, TypeScript strict mode, state management `SimulationContext`, sistem tata letak Bento 12 kolom, *Floating Bottom Navigation*, serta sistem desain Roastery Taktil anti-slop. |
| **04** | [**04. Modul 3D & Visualisasi**](./04-modul-3d-visualisasi.md) | Diorama 3D Kedai Langsung (`KedaiLangsungScene`), Bukit Keuntungan 3D (`ProfitHillScene`), Cangkir Miring (*Tilting Cup*) pengukur gradien lereng, Hotspot 3D interaktif, pencahayaan prosedural, dan Fallback 2D aksesibel. |
| **05** | [**05. Modul Gamifikasi & Tantangan**](./05-modul-gamifikasi-dan-tantangan.md) | Jalur karier barista (Level 1–5 + Sandbox Bebas), evaluasi skor akurasi, perolehan bintang, mekanik tebak dulu, kartu keputusan manajerial, sistem XP & kenaikan pangkat, serta Ruang Lencana & Lemari Medali. |
| **06** | [**06. Panduan Fitur & Penggunaan**](./06-panduan-fitur-dan-penggunaan.md) | Alur navigasi antarmuka, panduan perbandingan Mode Awam (Pemilik Kedai) vs Mode Akademik (Mahasiswa/Dosen), interpretasi struk kasir, ekspor laporan JSON/CSV, dan mitigasi peringatan bisnis. |

---

## 🛠️ Ringkasan Arsitektur Sistem

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KLIEN (Browser Pengguna)                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      Next.js 15 Frontend                       │   │
│   │  • Top Brand Header & Mode Toggle [Awam | Akademik]            │   │
│   │  • Diorama 3D Kedai Langsung (R3F) & 3D Bukit Keuntungan       │   │
│   │  • Bento Hasil: Headline Untung, Struk Kasir, Diagnostik       │   │
│   │  • Tab Panel: Cerita, Grafik 2D, Peta 3D, Sensitivitas, KaTeX  │   │
│   │  • Jalur Karier Tantangan (Level 1–5) & Lemari Medali Lencana   │   │
│   │  • Floating Bottom Navigation Dock                             │   │
│   └────────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP JSON Request / Response
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVER BACKEND (FastAPI)                        │
│                                                                        │
│   ┌───────────────────┐    ┌──────────────────────────────────────┐    │
│   │   app/api/routes  │───▶│           app/core/solver            │    │
│   │  • POST /optimize │    │  • model.py (fungsi p, R, C, P)      │    │
│   │  • GET  /presets  │    │  • optimizer.py (FOC, SOC, integer)  │    │
│   └───────────────────┘    │  • breakeven.py (akar D, BEP low/high│    │
│                            │  • sensitivity.py (Teorema Envelope) │    │
│                            │  • curves.py (200 titik evaluasi)    │    │
│                            │  • steps/builder.py (Langkah KaTeX)  │    │
│                            └──────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Persyaratan Lingkungan Pengembangan

- **Python**: 3.12+ (disarankan uv atau venv standar)
- **Node.js**: 20.x atau 22.x LTS
- **Package Manager**: npm atau pnpm
- **Port Komunikasi**:
  - Backend: `http://127.0.0.1:8000`
  - Frontend: `http://127.0.0.1:3000`

---

## 📜 Lisensi & Standar Kualitas

Proyek ini dibangun mematuhi standar ketat **Zero-Tolerance Anti-AI Slop**:
- Desain tipografi proporsional menggunakan *variable font* Fraunces & Figtree.
- Tidak menggunakan gradien warna dekoratif liar atau efek kaca semu (*glassmorphism*).
- Seluruh perhitungan matematika dibekukan di backend dan diverifikasi dengan suite pengujian otomatis (*unit tests, lint, typecheck*).
