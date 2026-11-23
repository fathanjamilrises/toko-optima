# Modul 03: Arsitektur & Modul Frontend

Antarmuka pengguna **KopiOptima** dibangun menggunakan **Next.js 15 (App Router)**, **React 19**, dan **TypeScript**. Desain visual mengusung tema **Roastery Taktil** yang hangat, profesional, bebas dari elemen palsu (*zero-slop*), serta memadukan simulasi 3D real-time dengan kartu data Bento 12 kolom.

---

## 1. Struktur Direktori Frontend

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root shell (Font Fraunces/Figtree/Mono, Header, BottomNav)
│   │   ├── globals.css           # Token warna CSS, reset, dan keyframe animasi mikro
│   │   ├── page.tsx              # Halaman Utama Simulasi (Diorama 3D & Bento Hasil)
│   │   ├── tantangan/
│   │   │   ├── page.tsx          # Halaman Peta Karier Barista (/tantangan)
│   │   │   └── [level]/page.tsx  # Halaman Layar Game Misi Level (/tantangan/[level])
│   │   └── lencana/
│   │       └── page.tsx          # Halaman Lemari Medali & Penghargaan (/lencana)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx        # Top Brand Bar ringkas + Mode Toggle [Awam | Akademik]
│   │   │   ├── BottomNav.tsx     # Floating Dock navigasi bawah (Simulasi, Tantangan, Lencana)
│   │   │   ├── Logomark.tsx      # Ikon SVG biji kopi geometris
│   │   │   └── ModeToggle.tsx    # Pengalih dwiarah mode bahasa dan visual
│   │   ├── kedai/                # Modul Diorama 3D Kedai Langsung & Hotspot
│   │   ├── stage/                # Modul Bukit Keuntungan 3D (Profit Hill)
│   │   ├── form/                 # ParameterForm sinkron dwiarah dengan 3D
│   │   ├── result/               # Kartu hasil inti (Headline, Struk, Diagnostik, Komparasi)
│   │   │   └── tabs/             # 6 Panel Tab Hasil Rinci (Cerita, Grafik, Peta, KaTeX, dll.)
│   │   └── game/                 # Komponen gamifikasi (LevelHUD, Slider, HintBox, GuessModal)
│   ├── lib/
│   │   ├── store/
│   │   │   └── simulation-context.tsx # Centralized state provider (React Context)
│   │   ├── game/                 # Engine perhitungan skor game, XP, dan progres lokal
│   │   ├── copy/                 # Kamus leksikon dwibahasa (awam.ts & akademik.ts)
│   │   └── format.ts             # Formatter Rupiah, angka desimal, dan persentase
│   └── types/
│       └── api.ts                # TypeScript interfaces kontrak API backend
├── scripts/
│   └── check-design.mjs          # Pemeriksa statis larangan pola visual anti-slop
└── tailwind.config.ts            # Konfigurasi token Tailwind kustom
```

---

## 2. Manajemen State Terpusat (`SimulationContext`)

Seluruh status simulasi dikelola melalui satu `SimulationProvider` yang membungkus aplikasi:

```tsx
interface SimulationContextValue {
  params: OptimizeParams;                // 7 parameter bisnis aktif
  setParams: (p: Partial<OptimizeParams>) => void;
  result: OptimizeResponse | null;       // Data hasil perhitungan dari FastAPI
  mode: "awam" | "akademik";            // Mode terminologi aktif
  displayMode: "3d" | "form";           // Tampilan kedai (3D Diorama vs Form Parameter)
  activeTab: SimulationTab;             // Tab aktif di panel bawah
  viewState: "current" | "suggested" | "custom"; // Preset tampilan kedai
  selectedCurveIndex: number;           // Titik kurva yang sedang diinspeksi
  isLightMode: boolean;                 // Mode fallback 2D hemat daya
  status: "idle" | "loading" | "success" | "error";
  retry: () => void;
}
```

### Mekanisme Sinkronisasi Dwiarah (Bidirectional Sync):
- Saat slider/input di `ParameterForm` bergeser, `setParams` dipanggil dengan *debounce* 200 ms.
- API `POST /api/v1/optimize` dipanggil di latar belakang.
- Ketika hasil baru tiba, model 3D diorama (`KedaiLangsungScene`), struk kasir (`ReceiptCard`), dan angka headline (`AnswerHeadline`) diperbarui serentak secara reaktif.
- Klik pada objek 3D (misalnya mesin espresso) membuka `HotspotSheet` yang langsung mengupdate nilai parameter yang bersangkutan.

---

## 3. Sistem Desain: Roastery Taktil (Anti-Slop)

Desain antarmuka mematuhi standar desain modern tanpa efek dekoratif artifisial:

### 3.1 Token Warna CSS (`globals.css`)
- **Background Utama:** `--bg-base: #12100E` (hitam biji kopi sangrai gelap).
- **Surface Bento:** `--bg-surface: #1B1815` & `--bg-raised: #25201C`.
- **Garis Pembatas:** `--line: #3A322B` (garis 1px solid tegas).
- **Teks Primer:** `--text-1: #F1E7D6` (krem susu hangat, kontras tinggi).
- **Teks Sekunder:** `--text-2: #D1C4B4` (krem abu bersih, kontras WCAG AA).
- **Aksen Taktil:** `--accent: #FF8A3D` & `--accent-edge: #C25A1B` (oranye tembaga roastery).
- **Indikator Bisnis:** `--profit: #B7E35A` (hijau laba) & `--loss: #FF5C45` (merah rugi).

### 3.2 Tipografi Variabel
- **Display & Judul:** Font *Fraunces* dengan variasi sumbu `opsz 72`, `SOFT 65`, dan `WONK 1` untuk nuansa organik editorial.
- **Teks UI & Label:** Font *Figtree* sans-serif yang bersih dan mudah dibaca pada layar kecil.
- **Angka & Kode:** Font *IBM Plex Mono* dengan angka tabular rata kanan (*monospace*).

### 3.3 Penegakan Aturan Anti-Slop (`check-design.mjs`)
Script otomatis memeriksa berkas `src/` sebelum setiap build:
- ❌ Tidak ada `backdrop-filter` atau *glassmorphism* semu.
- ❌ Tidak ada gradien dekoratif liar (`linear-gradient` / `radial-gradient` pada elemen non-kanvas).
- ❌ Tidak ada bayangan kabur yang melayang tanpa arah (*hard offset shadows*).
- ❌ Tidak ada teks hitam di atas background gelap (pencegahan benturan `text-base`).

---

## 4. Tata Letak Bento 12 Kolom & Navigasi

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Top Brand Bar] KopiOptima                          [Awam | Akademik] │
├───────────────────────────────────┬────────────────────────────────────┤
│           KOLOM 1–7               │             KOLOM 8–12             │
│   (Area Interaktif Visual)        │       (Kartu Keputusan & Hasil)    │
│                                   │                                    │
│   ┌───────────────────────────┐   │   ┌────────────────────────────┐   │
│   │ [KedaiControlsBar]        │   │   │ [AnswerHeadline]           │   │
│   │ Status: Sekarang|Rekomend │   │   │ Untung Terbesar: Rp825.000 │   │
│   ├───────────────────────────┤   │   ├────────────────────────────┤   │
│   │                           │   │   │ [ReceiptCard]              │   │
│   │  Diorama 3D Kedai Langsung│   │   │ Struk Kertas Krem Taktil   │   │
│   │  (atau Fallback 2D)       │   │   ├────────────────────────────┤   │
│   │                           │   │   │ [WarningCards] Diagnostik  │   │
│   ├───────────────────────────┤   │   ├────────────────────────────┤   │
│   │ [HotspotSheet] & Akses    │   │   │ [ComparisonCard] Selisih   │   │
│   └───────────────────────────┘   │   ├────────────────────────────┤   │
│                                   │   │ [ExportBar] Unduh JSON/CSV │   │
│                                   │   └────────────────────────────┘   │
├───────────────────────────────────┴────────────────────────────────────┤
│                       KOLOM PENUH 1–12 (Bawah)                         │
│   Tab: [Cerita] [Grafik 2D] [Peta 3D] [Sensitivitas] [Tabel] [Hitungan]│
│   ──────────────────────────────────────────────────────────────────   │
│   Panel Konten Tab Aktif (StoryTab / ChartsTab / ProfitHill / KaTeX)   │
├────────────────────────────────────────────────────────────────────────┤
│     [Floating Bottom Nav Dock]  (☕ Simulasi) (🧭 Tantangan) (🏆 Lencana)│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Komponen Hasil Keputusan Utama

1. **`AnswerHeadline.tsx`:** Menampilkan angka jawaban terbesar menggunakan *Odometer rolling digit* kinetik dengan perlindungan `whitespace-nowrap flex-nowrap` sehingga angka rupiah tidak akan terbelah ke baris kedua.
2. **`ReceiptCard.tsx`:** Struk belanja kertas krem taktil (`#E9DFCB`) dengan teks espresso gelap (`#1B1815`), garis sobekan putus-putus, stempel miring dinamis (*UNTUNG / RUGI / TUTUP SAJA*), dan potongan tepi bergerigi (*zigzag cut* SVG).
3. **`WarningCards.tsx`:** Panel diagnostik bisnis yang menjabarkan apa yang terjadi, arti bagi kelangsungan usaha, dan saran tindakan konkret berdasarkan kode peringatan API.
4. **`ComparisonCard.tsx`:** Menjajarkan kondisi kedai sekarang dengan rekomendasi optimal KopiOptima, menghitung selisih cangkir, efisiensi modal bahan yang dihemat, serta tambahan laba bersih yang didapat.
5. **`ExportBar.tsx`:** Tombol satu-klik untuk mengunduh laporan komprehensif ke dalam format JSON atau CSV spreadsheet.

---

## 6. Panel Tab Rinci

- **Cerita (`StoryTab.tsx`):** Penjelasan naratif langkah-demi-langkah bagi orang awam & dosen, dilengkapi kartu logika matematika kasir dan simulasi 4 skenario harga (Obral Murah, Kondisi Sekarang, Rekomendasi Puncak, dan Terlalu Mahal).
- **Grafik 2D (`ChartsTab.tsx`):** Grafik interaktif Recharts yang memvisualisasikan kurva Laba $P(x)$, Pendapatan $R(x)$, Biaya $C(x)$, serta perpotongan Marginal Revenue & Marginal Cost ($MR = MC$).
- **Peta Bukit 3D (`ProfitHillScene.tsx`):** Pemandangan 3D bukit keuntungan dengan Cangkir Miring pengukur gradien turunan.
- **Sensitivitas (`SensitivityTab.tsx`):** Visualisasi Teorema Envelope dan tabel uji stres fluktuasi biaya sewa dan bahan baku ($\pm 10\%, \pm 20\%$).
- **Tabel Data (`DataTableTab.tsx`):** Tabel 200 baris data analitis dengan pencarian dan filter status laba.
- **Hitungan Rinci (`MathStepsTab.tsx`):** Langkah penurunan rumus matematis formal yang dirender menggunakan KaTeX murni untuk kebutuhan evaluasi skripsi akademik.
