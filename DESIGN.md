# DESIGN — KopiOptima Frontend (Simulasi + Gamifikasi + 3D)
**Pendamping PRD.md · menggantikan PRD Bagian 8 (Frontend) untuk urusan tampilan dan interaksi**

> **Changelog v1.2:** simulasi kini berlangsung **langsung di dalam kedai 3D**: parameter diubah dengan menyentuh objek kedai (meja kasir, rak bahan, mesin espresso, papan harga, antrean, papan survei), hasil tampil di kedai dan papan tulis kapur. Form tetap ada sebagai **Mode Form** (aksesibilitas, mobile lemah, fallback). Bukit Untung dipindah menjadi tab "Peta Untung" (P1).
>
> **Changelog v1.1:** palet lebih berani (aksen jenuh solid), tipografi besar & kinetik (Fraunces variabel), layout **bento**, permukaan **taktil** (skeuomorfisme ringan), 3D bergaya **tanah liat lembut** (bukan low-poly kaku), mikro-interaksi terdaftar, sentuhan tulisan tangan, logomark, 404/empty state kreatif. Tetap menolak glassmorphism, neo-brutalism, dan gradien dekoratif.

| Item | Isi |
|---|---|
| Produk | KopiOptima — simulator untung terbesar kedai kopi |
| Konsep utama | **"Kedai Langsung"**: simulasi berlangsung di dalam kedai kopi 3D (sentuh objek untuk mengubah angka, lihat kedai berubah); **"Bukit Untung"** menjelaskan kalkulusnya |
| Stack tampilan | Next.js (App Router) + TypeScript + Tailwind CSS + **three.js** (via `@react-three/fiber` + `@react-three/drei`) + KaTeX + Recharts (fallback 2D) |
| Tema | **Roastery Taktil** — dark premium hangat, tipografi besar-kinetik, bento, 3D bertekstur tanah liat |
| Versi dokumen | **1.2** (simulasi langsung di kedai) |

---

## 0. INSTRUKSI UNTUK AI AGENT (BACA PERTAMA)

1. **PRD.md tetap sumber kebenaran untuk rumus dan API.** Dokumen ini hanya mengatur tampilan, 3D, gamifikasi, dan alur pakai. Jika ada konflik soal UI, **design.md menang**. Jika konflik soal matematika atau kontrak API, **PRD.md menang**.
2. **Frontend DILARANG menghitung ulang rumus inti** (x*, p*, laba, BEP, MR, MC, elastisitas, titik kurva). Semua angka berasal dari API. Satu-satunya perhitungan yang boleh ada di frontend adalah yang tercantum di **Bagian 9 (Daftar Hitungan UI yang Diizinkan)**.
3. **Simulasi adalah inti produk. Game dan 3D adalah lapisan di atasnya.** Aplikasi harus tetap bisa dipakai penuh jika 3D dimatikan atau WebGL tidak tersedia (Bagian 6.8).
4. **Jangan mengubah `backend/`.** Jika butuh data tambahan, catat di Bagian 12 (Permintaan Backend) dan laporkan ke saya.
5. **Anti-pola desain (WAJIB dihindari):** neo-brutalism / "anti-design" (border tebal hitam, bayangan keras bergeser ke samping), glassmorphism termasuk gaya "liquid glass" (blur latar, tembus pandang berlapis, `backdrop-filter`), dan palet gradien ala "AI slop" (ungu-biru, mesh/neon). Gunakan **permukaan opak dan warna solid datar**. Kesan taktil dicapai lewat highlight 1px, tepi tombol sewarna lebih gelap, dan bayangan lembut gelap, **bukan** gradien atau kaca. Desain harus terasa khas dan buatan tangan, bukan template.
6. Semua teks UI mengikuti **lapisan copy** (`lib/copy/`) dengan **Mode Awam** (default) dan **Mode Akademik** (`?mode=akademik`). Teks game ditulis dalam bahasa awam (tanpa jargon).
7. Kerjakan **per sub-fase** (Bagian 13). Jangan lompat sub-fase sebelum Definition of Done sub-fase sebelumnya terpenuhi.
8. Mulai dengan **Langkah 0**: jalankan backend, panggil `/api/v1/optimize`, `/api/v1/curves`, `/api/v1/presets` untuk preset G1–G5, **simpan respons mentahnya sebagai fixture** (`frontend/tests/fixtures/g1.json` … `g5.json`). Bentuk tipe TypeScript harus berasal dari respons nyata, bukan dari contoh di PRD.
9. **Simulasi utama berlangsung langsung di dalam Kedai 3D** (Bagian 3.2 dan 6.3). Semua parameter bisa diubah dengan menyentuh objek di kedai; **Mode Form** (ParameterForm) tetap wajib ada dan **selalu sinkron** dengan kedai (satu state). Kerjakan Mode Form lebih dulu (sub-fase 4B) sebagai fondasi aman, baru lapisan kedai (4C).

---

## 1. KONSEP & PILAR

### 1.1 Satu kalimat
> Geser jumlah cangkir, lihat untung naik-turun seperti mendaki bukit, dan temukan puncaknya.

### 1.2 Pilar
| Pilar | Arti |
|---|---|
| **Paham dalam 5 detik** | Pemilik kedai awam langsung tahu "jual berapa, harga berapa". Jawaban di bagian paling atas. |
| **Bukit = kalkulus** | Kemiringan bukit adalah turunan; puncak adalah titik kritis. Pengguna *merasakan* konsepnya, dosen melihat rumus aslinya di Mode Akademik. |
| **Main sambil belajar** | Tantangan bertahap memakai kasus G1–G5 yang sudah teruji. |
| **Jujur secara matematis** | Game tidak boleh menyajikan angka yang tidak berasal dari API. |
| **Langsung di kedai** | Pengguna mengubah angka dengan menyentuh benda nyata di kedai (kasir, rak, mesin, papan harga), bukan mengisi formulir. |

### 1.3 Tiga area
| Area | Rute | Fungsi |
|---|---|---|
| **Simulasi** (inti) | `/` | **Kedai Langsung**: sentuh objek di kedai 3D → hasil seketika (jawaban, struk, papan tulis, peta untung, langkah, sensitivitas, tabel). Ada **Mode Form** sebagai alternatif |
| **Tantangan** (game) | `/tantangan`, `/tantangan/[level]` | 5 level + bebas, bintang, XP, pangkat |
| **Lencana** | `/lencana` (P2) | Pangkat, XP, lencana |

Dua sumbu yang berbeda, jangan tertukar:
- **Area** (Simulasi / Tantangan) = *apa yang dilakukan*.
- **Mode bahasa** (Awam / Akademik) = *seberapa teknis kata-katanya*. Toggle ada di header semua halaman, tersimpan di URL (`?mode=akademik`).

---

## 2. IDENTITAS VISUAL: "ROASTERY TAKTIL"

Tema: label karung biji kopi, buku kas, dan struk, dibuat terasa **bisa disentuh**. Gelap, hangat, premium, dengan satu momen warna jenuh per layar.

### 2.0 Arah tren 2026: yang diadopsi vs ditolak

| Diadopsi | Diterapkan sebagai |
|---|---|
| 3D interaktif dengan kesan taktil | Bukit Untung bergaya tanah liat lembut (6.2) |
| Tipografi besar, ekspresif, kinetik | Angka jawaban raksasa, odometer, sumbu variabel Fraunces (2.2) |
| Layout bento | Hasil disusun dalam ubin bento (3.2) |
| Skeuomorfisme ringan | Tombol/kertas struk/stempel taktil (2.3) |
| Sentuhan buatan manusia | Catatan tulisan tangan, stempel miring, logomark (2.2, 2.5) |
| Mikro-interaksi bermakna | Daftar di 2.4 |
| Warna lebih berani | Aksen jenuh solid, bukan gradien (2.1) |
| Aksesibilitas & performa sebagai fondasi | Bagian 6.6, 10 |
| 404/empty state yang menghibur | 2.6 |

| Ditolak | Alasan |
|---|---|
| Glassmorphism / liquid glass | Preferensi proyek; menurunkan keterbacaan |
| Neo-brutalism / anti-design | Preferensi proyek |
| Gradien dekoratif, mesh, neon ungu-biru | Terlihat generik |
| Scroll-jacking, parallax berat | Merusak kegunaan dan performa |
| Efek yang tidak membawa makna | Setiap gerak harus menjelaskan data atau memberi umpan balik |

### 2.1 Warna (solid, tanpa gradien)

| Token | Hex | Pemakaian |
|---|---|---|
| `--bg-base` | `#12100E` | Latar halaman (hitam espresso) |
| `--bg-surface` | `#1B1815` | Ubin bento, panel |
| `--bg-raised` | `#25201C` | Input, elemen terangkat |
| `--line` | `#3A322B` | Garis pembatas 1px |
| `--text-1` | `#F1E7D6` | Teks utama (krem) |
| `--text-2` | `#B9AC98` | Teks sekunder |
| `--text-3` | `#9A8F7F` | Teks tersier (≥14px) |
| `--accent` | `#FF8A3D` | **Jingga Sangrai**: aksi utama, angka kunci, penanda puncak |
| `--accent-edge` | `#C25A1B` | Tepi bawah tombol utama (efek tombol fisik) |
| `--crema` | `#E9C98B` | Sorotan hangat sekunder, bendera puncak |
| `--profit` | `#B7E35A` | Untung (hijau pucuk) |
| `--loss` | `#FF5C45` | Rugi, peringatan keras (merah ceri) |
| `--revenue` | `#5FB4D6` | Garis Pemasukan (biru teh) |
| `--cost` | `#D49A6A` | Garis Pengeluaran (tembaga) |
| `--warn` | `#F2C14E` | Peringatan sedang |

Aturan pemakaian:
- **90% netral hangat, 10% jenuh.** Satu "momen warna" dominan per layar (mis. angka jawaban berwarna `--accent`). Jangan menaburkan semua aksen sekaligus.
- Teks di atas `--accent` memakai `--bg-base` (gelap).
- Verifikasi kontras ≥ 4.5:1 (teks) dan ≥ 3:1 (komponen UI/teks besar). Hex boleh disetel sedikit jika gagal, **dengan mempertahankan hue**.
- **Jangan mengandalkan warna saja**: untung ▲ + label, rugi ▼ + label, di 3D area rugi memakai pola hatch.
- Dilarang: `linear-gradient`/`radial-gradient` dekoratif, `backdrop-filter`, bayangan bergeser keras, border tebal hitam. (Cek dengan pencarian kode saat QA.)

### 2.2 Tipografi: besar, kinetik, editorial

| Peran | Font | Catatan |
|---|---|---|
| Display / angka jawaban | **Fraunces** (variabel; sumbu `opsz`, `SOFT`, `WONK`) | Muat sumbu lewat opsi `axes` pada `next/font/google` |
| UI / isi | **Figtree** | Ramah dan terbaca |
| Angka, struk, tabel, label kecil | **IBM Plex Mono** | `font-variant-numeric: tabular-nums` |
| Catatan tulisan tangan | **Caveat** | Maks 3 pemakaian per layar (petunjuk, anotasi grafik, "tip") |

Komposisi:
- **Angka jawaban raksasa**: `font-size: clamp(3.5rem, 9vw, 7.5rem)`, tracking −0.02em, warna `--accent`; satuan dan konteks kecil di bawahnya (mono). Ini titik fokus layar.
- **Eyebrow** (label kecil di atas judul): mono kapital, tracking 0.08em, `--text-2`.
- **Kinetik bermakna**: sumbu `SOFT` naik 0 → 100 dan bobot 500 → 650 saat angka selesai menghitung (sinyal "selesai"); angka berganti dengan **odometer** (digit menggulung), bukan sekadar berubah.
- Skala fluida: 12 · 14 · 16 · 20 · `clamp(1.5rem,3vw,2rem)` · `clamp(2.25rem,5vw,3.5rem)` · hero di atas. Isi minimal 16px di mobile, tinggi baris 1,5.
- Ada fallback font sistem yang sesuai agar tidak ada lompatan tata letak (`size-adjust` otomatis dari `next/font`).

### 2.3 Permukaan & komponen taktil (skeuomorfisme ringan)

- **Ubin bento**: radius 20px, `--bg-surface`, garis 1px `--line`, highlight tepi atas `inset 0 1px 0 rgba(255,255,255,.06)`. Isi dalam ubin memakai radius 12px.
- **Butiran halus (grain)**: lapisan noise SVG statis opasitas ~4% pada ubin (pseudo-element, `pointer-events:none`), memberi kesan kertas/linen. Tanpa animasi.
- **Bayangan**: lembut dan gelap saja (mis. `0 10px 24px -12px rgba(0,0,0,.65)`). Tidak ada bayangan keras bergeser.
- **Tombol utama (kunci fisik)**: isi `--accent`, tepi bawah 3px `--accent-edge` (sewarna, lebih gelap), highlight atas 1px. *Hover* naik 1px; *active* turun 2px dengan tepi bawah menyusut (pegas 120ms). Jika tampilannya terkesan neo-brutalism, kurangi tepi bawah jadi 2px.
- **Tombol sekunder**: garis 1px `--line`, isi `--bg-raised`, tanpa tepi bawah.
- **Input**: `--bg-raised`, bayangan dalam tipis (`inset 0 1px 2px rgba(0,0,0,.5)`), fokus berupa cincin 2px `--accent` + offset 2px.
- **Slider game**: pegangan berbentuk **biji kopi** dengan celah tengah; jalur ber-takik (detent) tiap 10 titik; terasa seperti kenop mesin espresso.
- **Struk**: satu-satunya permukaan terang di layar gelap (kertas krem `#E9DFCB`, teks espresso, kontras tinggi sehingga jadi titik fokus kedua), **tepi bawah bergerigi** (CSS mask zigzag), butiran kertas, **stempel miring −4°** dengan garis 1px dan sedikit "tinta pudar" (opasitas 0,9 + pola noise).
- **Ikon**: set garis lucide-react (stroke 1.75). Tanpa emoji di UI utama.
- Radius pil 999px untuk badge/status.

### 2.4 Mikro-interaksi (daftar resmi)

| # | Interaksi | Perilaku | Reduced-motion |
|---|---|---|---|
| 1 | Odometer hasil | Digit menggulung ≤ 700ms saat hasil baru | Ganti angka langsung |
| 2 | "Struk dicetak" | Struk keluar dari atas (clip-path reveal 500ms) | Muncul langsung |
| 3 | Stempel | Jatuh + memantul sekali, lalu diam | Muncul statis |
| 4 | Slider detent | Setiap takik: tick visual; `navigator.vibrate(8)` bila ada (fitur dicek); bunyi opsional | Hanya tick visual |
| 5 | Cangkir miring | Cangkir 3D miring mengikuti kemiringan (`dP`), tegak di puncak, uap tipis di puncak | Tanpa uap, miring instan |
| 6 | Ledakan biji | 3 bintang → ±60 biji kopi 1,2 dtk | Stempel statis |
| 7 | Hover ubin bento | Naik 2px dan miring ≤ 2° (hanya `pointer: fine`) | Nonaktif |
| 8 | Transisi halaman | View Transitions API (jika tersedia) untuk perpindahan Simulasi ↔ Tantangan | Tanpa transisi |
| 9 | Reveal tab "Cerita" | Tiap langkah muncul saat digulir (CSS `animation-timeline: view()` dengan `@supports`, fallback IntersectionObserver) | Muncul langsung |
| 10 | Fokus field | Cincin `--accent` berdenyut sekali | Cincin statis |

Aturan: durasi 150–250ms (kecuali yang disebut), easing `ease-out`/pegas ringan, **tidak ada gerak dekoratif tanpa makna**, `prefers-reduced-motion` dihormati penuh. Suara **mati secara default** (toggle di header, P2).

### 2.5 Logomark & merek
Logomark: **biji kopi yang celah tengahnya membentuk garis bukit** (kurva naik lalu turun dengan puncak). Dua warna (`--text-1` dan `--accent` pada puncak), versi 24px dan 64px, dibuat sebagai SVG inline. Wordmark "KopiOptima" dalam Fraunces, tracking rapat. Favicon memakai logomark.

### 2.6 Empty state, 404, dan loading
- **404:** ilustrasi SVG cangkir kosong + teks "Kopinya habis di halaman ini." dan tombol "Kembali ke kedai". Boleh ada satu interaksi kecil (cangkir bisa diklik dan "diisi").
- **Belum ada hasil:** cangkir kosong 2D + ajakan "Coba contoh kedai" (bukan 3D, agar ringan).
- **Loading:** kerangka bento (skeleton) berbentuk ubin; angka hero berputar odometer ke nilai akhir. Teks "Sedang menghitung…".
- **Error:** kartu dengan ikon peringatan dan saran tindakan (sesuai prompt UX writing).

### 2.7 Tema terang "Kertas Struk" (P2, opsional)
Token terang (latar krem, teks espresso, aksen jingga yang lebih gelap) mengikuti `prefers-color-scheme`. Default tetap gelap. Kerjakan hanya jika semua P0/P1 selesai.

---

## 3. ARSITEKTUR INFORMASI & LAYAR

### 3.1 Header (semua halaman)
`Logo KopiOptima` · tab **Simulasi | Tantangan** · toggle **Awam | Akademik** · (P2) pangkat + XP kecil.

### 3.2 Layar Simulasi (`/`) — "Kedai Langsung"

**Konsep:** layar utama adalah diorama kedai kopi 3D (sudut tiga-perempat). Setiap parameter diwakili **benda di kedai**. Sentuh benda → ubah angkanya → kedai berubah seketika → hasil dari API muncul. Tidak ada formulir wajib.

**Tata letak desktop (≥1024px)**, bento 12 kolom:
```
┌──────────────────────────────────────────────┬──────────────┐
│ KEDAI 3D (kolom 1–8, tinggi ±70vh)           │ JAWABAN      │
│                                              │ Rp825.000    │
│   Papan Tulis kapur (mini grafik, dinding)   │ untung/hari  │
│   [Rak bahan]  [Mesin espresso]  [Meja kasir]├──────────────┤
│   [Antrean pelanggan]   [Papan harga]        │ STRUK HASIL  │
│                         [Papan survei]       │ (bergerigi)  │
│                                              ├──────────────┤
│ ( Sekarang | Disarankan | Atur sendiri )     │ PERLU        │
│ [Cari yang terbaik]  [Jalankan 1 hari ▸P1]   │ DIPERHATIKAN │
│ [Mode Form ⇄]                                │              │
├──────────────────────────────────────────────┴──────────────┤
│ Tab: Cerita | Grafik | Peta Untung (3D) | Sensitivitas | Tabel | Hitungan Lengkap │
└─────────────────────────────────────────────────────────────┘
```
Tablet: kedai penuh lebar di atas, kolom hasil di bawahnya. Mobile (<768px): Kedai (tinggi 380px) → Jawaban → Struk → Peringatan → Tab; sentuh benda membuka **bottom sheet**.
Saat halaman dibuka, preset "Kedai kecil biasa" langsung dihitung, sehingga kedai **hidup sejak detik pertama** (tidak ada empty state kosong).

#### 3.2.1 Peta objek kedai ⇄ parameter (hotspot)

| Objek di kedai | Parameter (field API) | Kontrol di sheet | Umpan balik visual di kedai |
|---|---|---|---|
| Meja kasir + tumpukan tagihan | `fixed_cost` | Stepper + input Rp; bantuan "sewa, gaji, listrik per hari" | Tumpukan tagihan makin tinggi/rendah |
| Rak bahan (biji kopi, susu, gelas) | `variable_cost` | Stepper + input Rp; "modal untuk 1 cangkir" | Rak lebih penuh/kosong, label modal |
| Mesin espresso + barista | `quad_cost` (lembur) dan `capacity` | Chip cepat "Tidak ada / Ringan / Sedang / Berat" (isi nilai awal) + input pasti; sakelar "Ada batas cangkir per hari" + input | Uap dan gerak barista makin sibuk; pagar kapasitas muncul di konter |
| Papan harga di depan kedai | `ref_price` | Stepper + input Rp (di keadaan "Sekarang"); di keadaan "Atur sendiri" papan **ditarik/digeser** (3.2.3) | Angka di papan berubah |
| Pintu masuk + antrean pelanggan | `ref_demand` | Stepper + input (cangkir/hari) | Jumlah sosok antre berubah |
| Papan survei di jendela | `sensitivity` | Slider "Kalau harga naik Rp1.000, berapa cangkir yang berkurang?" | Ilustrasi: sosok yang "berbalik pergi" |

Batas lunak slider/stepper (default UI; input ketik tetap mengikuti batas validasi PRD 7.2): `fixed_cost` 0–5.000.000 (langkah 50.000) · `variable_cost` 0–50.000 (500) · `quad_cost` 0–100 (5) · `ref_price` 1.000–100.000 (500) · `ref_demand` 1–500 (5) · `sensitivity` 0,5–50 (0,5) · `capacity` 10–500 (5). Konfigurasi di `lib/kedai/hotspots.ts` (label awam/akademik, bantuan, contoh, batas, langkah, chip cepat). Chip cepat hanya **mengisi nilai input**, bukan menghitung hasil.

#### 3.2.2 Interaksi
1. **Sentuh/klik benda** → sorotan kontur `--accent` + kamera bergeser halus (≤ 400ms) → panel (desktop: popover di samping benda; mobile: bottom sheet) berisi judul awam, ikon, stepper `− / +`, input angka, contoh isi, dan tooltip "Dari mana angka ini?".
2. **Hitung ulang langsung:** setiap perubahan → *debounce* 350ms → `/optimize` + `/curves` (batalkan permintaan lama dengan `AbortController`). Selama menunggu, papan tulis menampilkan "Sedang menghitung…" dan angka hero memutar odometer. Galat 422 muncul **di sheet benda terkait**.
3. **Isyarat:** hotspot berdenyut lembut sekali saat pertama kali dibuka ("Sentuh benda untuk mengubah"); denyut berhenti setelah interaksi pertama.
4. **Papan tulis kapur** (dinding belakang): mini grafik untung (dari titik `curves`), tulisan "Untung terbesar: Rp…" dan bendera puncak. Dibuat sebagai `CanvasTexture` yang digambar dari titik API (hanya merender data; bukan menghitung).

#### 3.2.3 Tiga keadaan tampilan kedai
Pemilih segmen di bawah kedai:

| Keadaan | Isi kedai | Sumber data |
|---|---|---|
| **Sekarang** | Harga dan antrean sesuai kondisi saat ini | `curves.markers.reference` (x, P) dan `ref_price` |
| **Disarankan** | Papan harga bergerak (pegas) ke harga terbaik; antrean, cangkir, koin menyesuaikan; bendera muncul di papan tulis | `optimum.integer` dan `curves.markers.optimum` |
| **Atur sendiri** | Pengguna **menarik papan harga** naik-turun (atau memakai slider/panah keyboard) dan melihat kedai berubah; "Untung hari ini" tampil | Titik terdekat pada `curves.points` (pencarian by `price`) |

Tombol **Cari yang terbaik** menggerakkan papan harga ke titik optimum (animasi saja; nilai dari API). Tombol **Jalankan 1 hari (P1)** memutar animasi 20 detik: pelanggan datang sebanyak `x`, cangkir terjual, koin menumpuk sampai `P`; angka akhir selalu nilai API.

**Tarik papan harga:** jarak tarik dipetakan ke **indeks** titik pada `curves.points` (terurut), jadi nilai `price`, `x`, `P` yang tampil adalah isi titik tersebut, bukan hasil hitung sendiri. Kunci/panah keyboard: ↑ ↓ (±1 titik), Shift+↑ ↓ (±10), Home/End. Untuk langkah bulat per cangkir, lihat **B1** (Bagian 12).

#### 3.2.4 Mode Form (alternatif, wajib ada)
Tombol **Mode Form ⇄** menampilkan `ParameterForm` di samping/di atas kedai dengan **state yang sama**: mengubah angka di form menggerakkan kedai, dan sebaliknya. Mode Form otomatis aktif bila: WebGL tidak tersedia, Mode Ringan menyala, atau pengguna memilihnya. Dalam Mode Form, kedai diganti grafik 2D (Bagian 6.8).

**Struk Hasil** (komponen khas):
```
┌ - - - - - - - - - - - - - - - ┐
   STRUK UNTUNG TERBESAR
   Kedai Kopi Kecil
 - - - - - - - - - - - - - - - -
 Jumlah terbaik     75 cangkir
 Harga terbaik     Rp23.000
 Pemasukan      Rp1.725.000
 Pengeluaran      Rp900.000
 - - - - - - - - - - - - - - - -
 UNTUNG         Rp825.000  ▲
 - - - - - - - - - - - - - - - -
 Mulai untung di 11 cangkir
 Sekarang → Disarankan  (nilai dari API)
 [ UNTUNG ] ← stempel miring
└ - - - - - - - - - - - - - - - ┘
```
Mono, rata kanan, pemisah putus-putus, tepi bawah bergerigi, stempel miring (lihat 2.3). Di Mode Akademik, label berubah menjadi istilah teknis (x*, p*, R*, C*, P*) tanpa mengubah susunan.

### 3.3 Layar Tantangan

**Peta level (`/tantangan`)** — daftar vertikal bergaya jalur dengan 5 stasiun + 1 bebas:
```
 ◉ 1  Warung Pertama        ★★★   ← selesai
 │
 ◉ 2  Pesanan Membludak     ★★☆
 │
 ◎ 3  Dapur Mungil          terkunci? tidak → "Belum dicoba"
 │
 ○ 4  Badai Biaya
 │
 ○ 5  Kapan Harus Tutup?
 ○ ∞  Bebas (isi data sendiri)
```
Semua level **terbuka dari awal** (tidak ada kunci), supaya dosen/penguji bisa langsung mencoba. Urutan hanya saran.

**Layar level (`/tantangan/[level]`)**
```
┌─────────────────────────────────────────────────────────────┐
│ ← Peta   Level 1 · Warung Pertama     Petunjuk ●●● │ XP 120 │
├─────────────────────────────────────────────────────────────┤
│ MISI: "Cari jumlah cangkir yang bikin untung paling besar." │
├─────────────────────────────────────────────────────────────┤
│          STAGE 3D "Kedai Langsung"                          │
│    (papan harga digeser; pelanggan, cangkir, koin berubah;  │
│     bendera puncak di papan tulis TERSEMBUNYI sampai kunci) │
├─────────────────────────────────────────────────────────────┤
│  Cangkir: ◄──────────●──────────►   62 cangkir/hari         │
│  Harga:   Rp25.600   Untung hari ini: Rp 784.000  ▲         │
│  [ Kemiringan: ↗ naik terus — tambah cangkir ]  (petunjuk)  │
├─────────────────────────────────────────────────────────────┤
│  [ Kunci Jawaban ]                                          │
└─────────────────────────────────────────────────────────────┘
```
Setelah **Kunci Jawaban** → panel hasil (Bagian 7.6): bintang, persentase, bendera puncak muncul, penjelasan satu kalimat, tombol "Coba lagi", "Level berikutnya", "Lihat hitungan lengkap" (membuka `/` dengan preset yang sama).

---

## 4. MODE BAHASA (AWAM vs AKADEMIK) PADA GAME DAN 3D

| Elemen | Mode Awam | Mode Akademik |
|---|---|---|
| Sumbu & label 3D | "Jumlah cangkir", "Untung (Rp)" | `x` (cangkir), `P(x)` |
| Kemiringan | "Kemiringan bukit" | `P′(x)` |
| Puncak | "Puncak untung" | "Titik kritis `x*`, `P′(x*)=0`" |
| Batas balik modal | "Gerbang mulai untung" | "Titik impas (BEP)" |
| Petunjuk | "Naik terus — tambah cangkir" | "`P′(x) > 0` → tambah x" |
| Hasil level | "Anda dapat 96% dari untung terbesar" | Ditambah nilai `P*` dan selisih |

Semua string berada di `lib/copy/awam.ts` dan `lib/copy/akademik.ts`, dengan test yang memindai kata terlarang di Mode Awam (turunan, titik kritis, diskriminan, elastisitas, marginal, optimal/optimum, dst., sesuai daftar di prompt UX writing).

---

## 5. KONTRAK DATA: ELEMEN VISUAL ⇄ FIELD API

> Nama field di bawah mengikuti PRD Bagian 7. **Verifikasi dengan respons nyata (fixture)** dan sesuaikan nama jika berbeda.

| Elemen visual | Sumber data |
|---|---|
| Kurva Untung (bukit) | `curves.points[].x`, `.P` |
| Pita Pemasukan / Pengeluaran | `curves.points[].R`, `.C` |
| Harga di tiap titik | `curves.points[].price` |
| Kemiringan (petunjuk, kemiringan cangkir) | `curves.points[].dP` (tanda dan besar relatif) |
| Bendera puncak | `curves.markers.optimum` |
| Gerbang mulai/batas untung | `curves.markers.break_even[]` |
| Pagar kapasitas | `curves.markers.capacity` |
| Rumah "kondisi sekarang" (Peta Untung) | `curves.markers.reference` |
| Kedai: papan harga | `curves.points[].price` (titik terpilih), `optimum.integer.price` |
| Kedai: jumlah cangkir di konter | `x` titik terpilih (maks 200 instans) |
| Kedai: antrean pelanggan | `x` titik terpilih, dinormalisasi ke maks 30 sosok |
| Kedai: tumpukan koin / struk merah | `P` titik terpilih, dinormalisasi terhadap rentang `P` kurva |
| Kedai: pagar kapasitas | `curves.markers.capacity` |
| Kedai: papan tulis kapur | `curves.points[].x, .P` + `markers.optimum` |
| Struk, jawaban, status | `optimum.*`, `break_even.*`, `status`, `warnings[]` |
| Cerita 4–6 langkah | `steps[]` + kamus copy |
| MR vs MC, elastisitas, sensitivitas | `marginal.*`, `sensitivity.*` (hanya Mode Akademik/tab terkait) |

**Prinsip:** state aplikasi menyimpan **respons API apa adanya**. Komponen 3D/game hanya *membaca* dan *memetakan ke koordinat/visual*.

---

## 6. SPESIFIKASI 3D (THREE.JS)

### 6.1 Teknologi
- `three`, `@react-three/fiber`, `@react-three/drei`. **Cek versi React/Next di proyek**, pilih versi r3f/drei yang kompatibel (periksa `peerDependencies`), dan **pin versi persis** (tanpa `^`). Hindari versi yang baru dirilis kurang dari 14 hari.
- Muat dengan `next/dynamic` dan `ssr: false`. Chunk 3D dimuat **malas** (lazy), tidak membebani halaman awal.
- **Tanpa aset eksternal wajib**: semua model dibuat prosedural dari geometri dasar (low-poly, `flatShading`). Jika kelak memakai `.glb`, ukurannya ≤ 300 KB dan dikompres Draco, serta punya fallback prosedural.
- Rendering `frameloop="demand"` pada adegan statis (render saat data/kamera berubah) untuk hemat baterai; `"always"` hanya selama animasi aktif.
- DPR dibatasi `[1, 1.75]`. Antialias aktif hanya jika perangkat kuat (lihat 6.8).

### 6.2 Gaya visual 3D: "tanah liat lembut" (taktil)
- **Bentuk membulat dan berisi**: bukit dibangun dari `ExtrudeGeometry` dengan **bevel** kecil (bukan facet kaku); cangkir, bendera, gerbang, dan rumah memakai sudut membulat (`RoundedBox`, `LatheGeometry`). Kesan: mainan tanah liat / plastisin, bukan low-poly tajam.
- **Material**: `MeshPhysicalMaterial` matte (`roughness ≈ 0.55`, `clearcoat ≈ 0.2`, `clearcoatRoughness ≈ 0.6`), warna dari token Bagian 2.1. Variasi kekasaran halus lewat `roughnessMap` yang dibuat **prosedural dari canvas noise** (tanpa aset eksternal).
- **Cahaya**: kunci hangat dari kiri-atas, isi lembut dari kanan, kontur (rim) tipis; lingkungan dibuat dengan `Environment` + `Lightformer` prosedural (tidak mengunduh HDRI). Bayangan lembut hanya pada lantai (`ContactShadows`).
- **Lantai/taplak**: bidang datar `--bg-surface` dengan garis kisi samar 1px sebagai sumbu; bidang Y=0 diberi label "Batas balik modal".
- **Latar scene** transparan terhadap ubin bento (bukan gradien).
- **Gerak halus**: cangkir mengambang ±2px, uap tipis (≤ 24 partikel) di puncak; semuanya mati pada reduced-motion dan Mode Ringan.
- Tampilan harus tetap terbaca meski bayangan dimatikan.

### 6.3 Adegan A — "Kedai Langsung" (PRIORITAS P0, adegan utama)

**Komposisi:** diorama kedai tiga-perempat (sudut ±35° azimut, ±55° polar), gaya tanah liat lembut (6.2), isi:
| Objek | Bentuk | Peran |
|---|---|---|
| Meja kasir + tumpukan tagihan | Meja membulat + tumpukan kertas (instans) | Hotspot `fixed_cost` |
| Rak bahan | Rak 3 tingkat: karung biji, kotak susu, tumpukan gelas | Hotspot `variable_cost` |
| Mesin espresso + barista | Mesin besar + sosok barista kapsul | Hotspot `quad_cost` dan `capacity` |
| Konter + tumpukan cangkir | `InstancedMesh` ≤ 200 cangkir | Menampilkan `x` terpilih |
| Papan harga (di depan pintu) | Papan kayu berdiri, teks `<Html>` | Hotspot `ref_price`; dapat **ditarik** di keadaan "Atur sendiri" |
| Pintu + antrean | Sosok kapsul ≤ 30 | Hotspot `ref_demand`; jumlah = visual dari `x` |
| Papan survei di jendela | Papan kecil + ikon sosok berbalik | Hotspot `sensitivity` |
| Tumpukan koin / struk merah | Koin bertumpuk di mesin kasir; saat rugi berubah jadi struk merah | Menampilkan `P` |
| Papan tulis kapur (dinding) | Bidang dengan `CanvasTexture` | Mini grafik dari `curves.points`, bendera puncak, teks "Untung terbesar" |
| Pagar kapasitas | Pagar rendah di depan konter | Muncul bila `markers.capacity` ada |

**Hotspot:** tiap objek punya (a) mesh yang bisa disorot (`<Outlines>` solid `--accent`, bukan gradien) dan (b) **tombol DOM** via `<Html>` (aksesibel, bisa di-Tab, `aria-label` bahasa awam, mis. "Ubah biaya tetap, sekarang Rp300.000 per hari"). Daftar yang sama juga tersedia sebagai **daftar "Objek di kedai"** (di bawah kedai pada mobile) untuk pengguna yang tidak memakai pointer.

**Kamera:** posisi tetap yang nyaman, `OrbitControls` dibatasi (azimut ±15°, polar terkunci, tanpa pan dan zoom) agar hotspot stabil; gerak dolly halus saat memilih hotspot. Mobile: tanpa rotasi sentuh (halaman tetap bisa digulir). Tombol **Reset kamera**.

**Pemetaan visual (normalisasi saja, lihat Bagian 9):**
- Antrean: `round(30 · x / x_plot_max)` sosok.
- Cangkir di konter: `min(x, 200)` instans.
- Koin: tinggi ∝ `(P − P_min)/(P_maks − P_min)`; `P < 0` → struk merah.
- Uap/kesibukan barista: ∝ `quad_cost` dinormalisasi ke batas lunak UI.
- Papan harga/angka: isi titik terpilih apa adanya.

**Perilaku:** `frameloop="demand"` kecuali selama animasi; DPR `[1, 1.75]`; semua geometri/material/tekstur di-dispose saat unmount; kedai tidak boleh memuat aset eksternal (prosedural).

### 6.4 Adegan B — "Peta Untung" / Bukit Untung (P1, tab kedua di Stage)
Bukit Untung tetap dipertahankan sebagai **peta penjelas kalkulus**: kemiringan bukit = turunan, puncak = titik kritis. Dipakai di tab "Peta Untung" dan untuk tangkapan layar laporan. Spesifikasi di bawah tidak berubah.

**Pemetaan koordinat** (hanya normalisasi visual, lihat Bagian 9):
- Sumbu **X** = jumlah cangkir `x`, dipetakan linear dari `[x_min, x_max]` pada `curves.points` ke `[-W/2, +W/2]`, `W = 10` unit.
- Sumbu **Y** = `P`, dipetakan linear dari `[P_min, P_max]` ke tinggi `[0, H]`, `H ≈ 0,4·W`. **Bidang tanah (Y=0 laba)** digambar sebagai lantai tipis berlabel "Batas balik modal" (Mode Awam) / "P(x) = 0".
- Sumbu **Z** = kedalaman: Bukit Untung di depan (z=0), pita **Pemasukan** (z=−1,2) dan **Pengeluaran** (z=−2,4) berupa pita tipis/tabung di belakang untuk memperlihatkan hubungan "untung = pemasukan − pengeluaran".

**Bukit:** `ExtrudeGeometry` dari `Shape` yang dibangun dari titik `(x, P)`, ketebalan Z = 1. Segmen **di atas** garis nol berwarna `--profit` (solid), segmen **di bawah** garis nol berwarna `--loss` dengan **pola garis (hatch)** pada material (bukan hanya warna). Batas warna dipotong tegas pada titik BEP (dua mesh terpisah, bukan interpolasi gradien).

**Penanda:**
| Penanda | Wujud 3D | Catatan |
|---|---|---|
| Puncak untung | Bendera karamel + label | Di game: **disembunyikan** sampai jawaban dikunci |
| Gerbang untung | Dua gerbang kayu kecil di titik BEP | Label "Mulai untung" / "Untung mulai menurun" |
| Pagar kapasitas | Pagar/dinding tipis tembus pandang | Hanya jika `markers.capacity` ada; label "Batas kapasitas Anda" |
| Kondisi sekarang | Rumah kecil | Dari `markers.reference` |
| **Cangkir penanda** | Model cangkir low-poly di atas bukit pada `x` terpilih | Bergerak dengan pegas; **miring mengikuti kemiringan (`dP`)** |

**Kemiringan = turunan (momen edukasi):** badan cangkir dimiringkan sesuai tanda/besar relatif `dP` (maks ±25°). Di puncak, cangkir tegak. Mode Akademik menampilkan panah garis singgung dan label `P′(x)`.

**Kamera & kontrol:**
- Kamera perspektif, posisi awal tampak miring (azimut ±30°, polar ±65°), `OrbitControls` dengan `enablePan=false`, `enableDamping`, batas polar/azimut, batas zoom.
- Tombol: **Tampak miring** | **Tampak depan** (kamera lurus, hampir 2D, bagus untuk tangkapan layar laporan) | **Putar** (aktifkan rotasi sentuh).
- **Mobile:** secara default rotasi sentuh **nonaktif** agar halaman tetap bisa digulir; tombol "Putar" mengaktifkannya. Geser slider di bawah stage tetap bekerja.
- Label teks memakai `<Html>` dari drei (teks DOM, bisa dibaca screen reader), tidak ditempel sebagai tekstur.

### 6.5 Efek perayaan
Saat 3 bintang: ledakan ±60 "biji kopi" kecil (`InstancedMesh`, 1,2 detik, lalu dibuang dari memori) dan stempel jatuh dengan pantulan. `prefers-reduced-motion` → stempel statis tanpa partikel.

### 6.6 Anggaran performa
| Metrik | Target |
|---|---|
| Chunk 3D (gzip) | ≤ 600 KB, dimuat lazy |
| FPS | ≥ 50 pada HP kelas menengah, ≥ 60 pada laptop |
| Waktu ke interaktif halaman (tanpa 3D) | < 2,5 s pada koneksi cepat |
| Draw call Adegan A | < 60 |
| Instansi cangkir | ≤ 200 |
| Memori | dispose geometri/material/tekstur saat unmount |

### 6.7 Aksesibilitas 3D
- Canvas diberi `role="img"` dan `aria-label` yang merangkum hasil dalam bahasa awam; di bawahnya ada **ringkasan teks** yang bisa dibaca (jawaban + kondisi saat ini).
- Slider (Bagian 7.3) bisa dioperasikan penuh dengan keyboard; setiap perubahan diumumkan lewat `aria-live="polite"`: "Jual 62 cangkir, untung Rp784.000".
- Semua informasi penting di 3D juga ada di Struk, Tabel, dan teks (tidak ada informasi yang hanya hidup di 3D).

### 6.8 Mode Ringan & fallback
Aktifkan **Mode Ringan** otomatis (dengan tombol untuk beralih manual) jika: WebGL tidak tersedia, `prefers-reduced-motion`, `navigator.hardwareConcurrency ≤ 4` bersama layar kecil, atau FPS rata-rata < 30 selama 3 detik.
Mode Ringan: Stage diganti **grafik 2D Recharts** (Untung/Pemasukan/Pengeluaran + penanda) dengan **mekanisme game yang sama persis** (slider, petunjuk, skor). Game **tidak boleh** bergantung pada 3D. **Kedai Langsung** jatuh ke **Mode Form** + grafik 2D: hotspot digantikan `ParameterForm` dengan state yang sama, dan tarik papan harga digantikan slider.

---

## 7. GAMIFIKASI

### 7.1 Prinsip
- Tujuan belajar: *"untung punya puncak; di puncak, kemiringan nol; harga dan jumlah saling tarik"*.
- Hadiah untuk memahami, bukan untuk menekan tombol berulang.
- Tidak ada tekanan waktu, tidak ada nyawa, tidak ada hukuman permanen, tidak ada iklan/loot box.
- Semua angka game berasal dari API (Bagian 5) dan hitungan yang diizinkan (Bagian 9).

### 7.2 Level (dipetakan ke preset yang sudah teruji)

| Level | Nama | Preset | Yang dipelajari | Mekanik khusus |
|---|---|---|---|---|
| 1 | Warung Pertama | G1 | Untung punya puncak | Geser bebas, petunjuk kemiringan |
| 2 | Pesanan Membludak | G2 (biaya lembur) | Biaya tambahan saat ramai menggeser puncak ke kiri | Tebak dulu sebelum geser (7.4) |
| 3 | Dapur Mungil | G3 (kapasitas 60) | Batas kapasitas bisa menahan untung terbesar | Pagar kapasitas; puncak "di balik pagar" |
| 4 | Badai Biaya | G4 (selalu rugi) | Kalau pasti rugi, cari rugi terkecil | Skor memakai rumus rentang (7.5) |
| 5 | Kapan Harus Tutup? | G5 (tidak layak) | Kadang keputusan terbaik adalah tidak jualan | Kartu keputusan, bukan slider (7.7) |
| ∞ | Bebas | input sendiri | Eksplorasi | Pengguna mengisi form, lalu bermain |

Parameter tiap level diambil dari `/api/v1/presets` (bukan ditulis ulang di frontend) lalu dikirim ke `/optimize` dan `/curves`.

### 7.3 Kontrol utama: slider yang menempel ke titik API
- Di Tantangan, kontrol utama adalah **menarik papan harga di Kedai** (3.2.3); slider di bawah kedai tetap tersedia sebagai alternatif dan untuk keyboard.
- Slider bergerak pada **indeks** array `curves.points`, bukan pada nilai yang dihitung sendiri. Nilai `x`, `price`, `P` yang ditampilkan adalah **isi titik tersebut**.
- Untuk level game, butuh titik pada **setiap bilangan bulat** cangkir. Lihat **Permintaan Backend B1** (Bagian 12). Selama B1 belum ada, gunakan `curve_points` terbesar dan tampilkan `x` dengan pembulatan ke bilangan bulat terdekat **hanya untuk label**, serta beri catatan kepada saya.
- Keyboard: ← → (±1 titik), Shift+← → (±10), Home/End. Sentuh: area geser tinggi ≥ 44px.

### 7.4 Tebak dulu (Level 2, P1)
Sebelum slider aktif: "Menurut Anda, jual berapa cangkir agar untung paling besar?" (input angka). Setelah jawaban dikunci, tampil selisih tebakan vs jawaban terbaik. Bonus XP kecil jika tebakan dalam ±10% (konstanta desain). Tujuan: melatih intuisi, bukan menghukum.

### 7.5 Skor (satu rumus untuk semua level slider)
Dengan `P_pilih` (titik yang dipilih), `P_maks` (`optimum.integer.profit` atau titik terbaik pada kurva) dan `P_min` (nilai `P` terkecil pada titik kurva yang ditampilkan), semuanya **dari API**:

$$\text{skor}(\%) = \frac{P_{pilih} - P_{min}}{P_{maks} - P_{min}} \times 100$$

Bila `P_maks = P_min` (kurva datar/degenerat), skor = 100% jika pilihan sah. Rumus rentang ini membuat skor tetap bermakna pada level rugi (Level 4) dan tidak membagi dengan nilai negatif.

**Bintang** (konstanta desain, dapat disetel di `lib/game/config.ts`):
| Skor | Bintang |
|---|---|
| ≥ 99% | ★★★ |
| ≥ 95% | ★★☆ |
| ≥ 80% | ★☆☆ |
| < 80% | ☆☆☆ ("Coba lagi, puncaknya lebih ke kanan/kiri" tanpa membocorkan angka) |

### 7.6 Hasil level
Panel muncul setelah **Kunci Jawaban**:
1. Bintang + stempel ("UNTUNG BESAR!", "HAMPIR!", "COBA LAGI").
2. Persentase skor + "Untung Anda Rp… dari Rp… (terbesar)".
3. Bendera puncak muncul di papan tulis dan di Peta Untung; papan harga "terbaik" ditampilkan sebagai bayangan transparan di kedai.
4. **Satu kalimat pelajaran** (dari kamus copy sesuai level; Level 2: "Biaya lembur membuat puncak bergeser ke kiri: jual sedikit lebih sedikit justru lebih untung.").
5. Tombol: **Coba lagi**, **Level berikutnya**, **Lihat hitungan lengkap** (ke `/` dengan preset sama; di Mode Akademik langsung membuka 16 langkah).

### 7.7 Level 5 — Kartu Keputusan
Karena status `NO_PRODUCTION` tidak punya puncak yang bermakna, level ini berupa kartu: tampilkan kurva (datar menurun), lalu pilihan **[Tetap buka]** / **[Tutup sementara & cari cara kurangi biaya]**. Jawaban benar mengikuti `status` dari API. Penjelasan memakai `warnings[]` dan template kesimpulan. **Periksa respons nyata G5** dan sesuaikan.

### 7.8 Petunjuk (hint)
- 3 petunjuk per level, tidak mengurangi bintang; setiap pemakaian −10 XP (min 0).
- Petunjuk 1: **arah** berdasarkan tanda `dP` pada titik sekarang: "Kemiringan masih naik ↗ — tambah cangkir" / "Mulai menurun ↘ — kurangi cangkir" / "Rata — Anda di dekat puncak".
- Petunjuk 2: **hangat/dingin** berdasarkan skor sementara (Dingin <50%, Hangat <90%, Panas ≥90%).
- Petunjuk 3: menyorot rentang sempit sekitar puncak di slider (±5 titik dari `markers.optimum`).
- Di Mode Akademik, teks petunjuk menyebut `P′(x)` dan tandanya.

### 7.9 XP, pangkat, lencana (P2)
**XP:** selesai level +50; tiap bintang +25; tanpa petunjuk +20; tebakan akurat +15; lihat hitungan lengkap setelah level +10 (sekali per level).
**Pangkat:** Magang (0) → Barista (150) → Kepala Barista (350) → Pemilik Kedai (600) → Juragan Kopi (900).
**Lencana (contoh, maks 6):**
| Lencana | Syarat |
|---|---|
| Pemburu Puncak | 3 bintang di Level 1 |
| Pembaca Kemiringan | Selesaikan Level 1 memakai Petunjuk 1 lalu menang |
| Si Hemat Lembur | 3 bintang di Level 2 |
| Penjaga Kapasitas | 2+ bintang di Level 3 |
| Peredam Badai | 2+ bintang di Level 4 |
| Tahu Kapan Tutup | Jawaban benar di Level 5 |

### 7.10 Penyimpanan progres
- Progres game (bintang per level, XP, lencana) disimpan di `localStorage` dengan kunci berversi `kopioptima:v1:progress`, dibungkus `try/catch`, dan **harus tetap berjalan jika penyimpanan gagal/kosong**.
- **Jangan** menyimpan hasil perhitungan API di storage. Hanya progres game.
- Tombol "Reset progres" di halaman Lencana (P2).
- (Catatan: ini sengaja mengubah aturan "tanpa localStorage" pada prompt Phase 4 sebelumnya, khusus untuk progres game.)

### 7.11 Nada umpan balik (bahasa awam)
Ramah, ringkas, tidak menggurui, tidak mengejek. Contoh: "Hampir! Untung Anda 96% dari yang terbesar." / "Belum pas, coba geser sedikit ke kiri." Hindari seruan berlebihan dan janji bisnis ("pasti untung").

---

## 8. KOMPONEN & STRUKTUR BERKAS

```
frontend/
├─ app/
│  ├─ layout.tsx                  # font, header, provider
│  ├─ page.tsx                    # Simulasi
│  ├─ tantangan/page.tsx          # Peta level
│  ├─ tantangan/[level]/page.tsx  # Layar level
│  └─ lencana/page.tsx            # P2
├─ components/
│  ├─ layout/ Header, ModeToggle, Logomark, NotFoundArt
│  ├─ form/ ParameterForm, FieldHelp, PresetPicker
│  ├─ result/ AnswerHeadline, ReceiptCard, WarningCards, StoryTab, StepsPanel,
│  │          SensitivityPanel, DataTable
│  ├─ charts2d/ ProfitChart, MarginalChart, DerivativeChart  # Recharts, juga fallback
│  ├─ stage/
│  │  ├─ Stage.tsx               # pilih 3D vs Mode Ringan, tab Kedai | Peta Untung
│  │  ├─ KedaiLangsungScene.tsx  # Adegan A (P0, r3f)
│  │  ├─ kedai/ Hotspot, HotspotSheet, PriceBoard, Chalkboard, ViewStateSwitch, ObjectList
│  │  ├─ ProfitHillScene.tsx     # Adegan B "Peta Untung" (P1)
│  │  ├─ models/ Cup, Flag, Gate, Fence, House, Coin   # prosedural
│  │  └─ useLowPowerMode.ts
│  └─ game/
│     ├─ LevelMap, LevelHUD, ChallengeSlider, HintButton,
│     ├─ ResultPanel, DecisionCard, GuessInput, RankBadge
├─ lib/
│  ├─ api.ts                     # klien API tunggal (NEXT_PUBLIC_API_URL)
│  ├─ copy/ awam.ts, akademik.ts, glossary.ts
│  ├─ kedai/ hotspots.ts (konfigurasi), useLiveOptimize.ts (debounce + abort)
│  ├─ format.ts                  # Rupiah, angka, satuan
│  ├─ stage/mapping.ts           # normalisasi data → koordinat 3D (fungsi murni)
│  └─ game/
│     ├─ config.ts               # ambang bintang, XP, pangkat
│     ├─ engine.ts               # skor, bintang, petunjuk (fungsi murni, tanpa React)
│     └─ progress.ts             # localStorage aman
├─ types/api.ts                  # dari respons nyata
└─ tests/
   ├─ fixtures/ g1.json … g5.json
   ├─ engine.test.ts, mapping.test.ts, copy.test.ts, format.test.ts
```

Aturan: `engine.ts` dan `mapping.ts` **fungsi murni** tanpa React/three agar mudah dites. Komponen 3D hanya merender hasil `mapping.ts`.

---

## 9. DAFTAR HITUNGAN UI YANG DIIZINKAN (SELAIN ITU DILARANG)

Frontend **boleh** melakukan hanya ini:
1. **Pemformatan** angka (Rupiah, ribuan, desimal koma, satuan).
2. **Normalisasi visual linear** data API ke koordinat/ukuran 3D (mis. `Y = (P − P_min)/(P_max − P_min)·H`).
3. **Skor game**: rumus rentang di 7.5 dan persentase/rasio antar nilai yang berasal dari API.
4. **Selisih dua nilai API** untuk tampilan "Sekarang vs Disarankan" (jika API tidak menyediakan selisih; bila perlu, catat di Bagian 12).
5. **Konversi periode** (PRD 4.15) sebelum mengirim input.
6. **Pencarian/penempelan** ke titik terdekat pada array `curves.points`.
7. **Klasifikasi tanda** `dP` (positif/negatif/≈0) untuk petunjuk.

Dilarang: menghitung `x*`, `p*`, `P`, `R`, `C`, `MR`, `MC`, BEP, elastisitas, turunan parsial, atau titik kurva baru dengan rumus sendiri.

---

## 10. AKSESIBILITAS & RESPONSIF

- Breakpoint: 360 (target minimum) · 768 · 1024 · 1440.
- Target sentuh ≥ 44×44 px. Fokus keyboard terlihat jelas (outline `--accent` 2px, offset 2px).
- Semua kontrol bisa dioperasikan keyboard; urutan tab logis; slider punya `aria-valuetext` yang menyebut "62 cangkir, untung Rp784.000".
- `aria-live` untuk hasil perhitungan dan umpan balik game.
- Tidak ada kedipan >3 kali/detik. Hormati `prefers-reduced-motion` dan `prefers-contrast`.
- Informasi tidak boleh disampaikan hanya lewat warna (ikon + label + pola).
- Bahasa dokumen `lang="id"`.

---

## 11. STATE & ALUR DATA

```
ParameterForm ──(input murni angka)──► api.optimize + api.curves
                                          │
                              state: respons API apa adanya
                                          │
        ┌──────────────┬──────────────────┼──────────────┐
   AnswerHeadline   ReceiptCard    Stage (3D/2D)     Tabs (Cerita/Grafik/…)
                                          │
                          ChallengeSlider (hanya di /tantangan)
                                          │
                            lib/game/engine.ts (skor, petunjuk)
```
- Satu sumber kebenaran: respons API. Tidak ada salinan hasil hitung di tempat lain.
- Navigasi "Lihat hitungan lengkap" mengirim preset lewat query string (`/?preset=g2&mode=akademik`).
- Error jaringan dan 422 ditangani seperti prompt UX writing (pesan ramah, per field).

---

## 12. PERMINTAAN BACKEND (DIKERJAKAN TERPISAH, BUKAN OLEH AGENT FRONTEND)

Agent frontend **tidak mengubah backend**. Laporkan kebutuhan berikut kepada saya; saya akan menugaskan perubahan backend secara terpisah.

| ID | Kebutuhan | Alasan | Spesifikasi usulan |
|---|---|---|---|
| **B1** | Grid bilangan bulat untuk game | Slider game harus menempel pada setiap cangkir bulat, dan nilai `P` harus tepat pada bilangan bulat | Tambah `curve_mode: "integer"` pada `/curves` yang mengembalikan titik untuk `x = 0 … ⌊x_end⌋` langkah 1 (maks 1000 titik), tetap menyertakan semua field titik dan `markers` |
| B2 | Selisih "sekarang vs disarankan" | Hindari hitungan di frontend | Field `comparison: {reference_profit, optimum_profit, delta}` pada `/optimize` |
| B3 | Perilaku `curves` untuk G5 (`NO_PRODUCTION`) | Level 5 butuh data kurva yang jelas | Pastikan `/curves` tetap mengembalikan titik sah (mis. `P = −FC` datar) dan `markers.optimum.x = 0` |
| B4 | Teks langkah versi awam (opsional) | Cerita awam lebih baik jika backend menyediakan nilai kunci per langkah | `steps[].values` sudah ada; cukup pastikan konsisten |

Selama B1–B3 belum tersedia, agent memakai solusi sementara yang dijelaskan pada bagian terkait dan **melaporkan** setiap penyimpangannya.

---

## 13. SUB-FASE PENGERJAAN FRONTEND (PENGGANTI PHASE 4)

Prioritas: **P0** wajib untuk UAS, **P1** sangat disarankan, **P2** jika sempat. Tenggat proyek: 1 Desember 2026, jadi **kerjakan P0 lebih dulu dan jangan mengorbankannya demi P1/P2**.

| Sub-fase | Isi | Prioritas | Gerbang selesai |
|---|---|---|---|
| **4A Fondasi** | Next.js + Tailwind + font (Fraunces dengan sumbu variabel) + token warna + grain/bayangan taktil + logomark, `lib/api.ts`, `types/api.ts` dari fixture, `lib/copy` (awam/akademik) + test copy, toggle mode (URL), Header | P0 | lint, tsc, build bersih; fixture G1–G5 tersimpan |
| **4B Simulasi (Mode Form)** | `ParameterForm` + preset, hook `useLiveOptimize` (debounce 350ms + abort), AnswerHeadline, ReceiptCard, peringatan, tab Cerita/Grafik 2D/Sensitivitas/Tabel/Hitungan Lengkap (KaTeX), ekspor JSON/CSV | P0 | G1–G5 benar di kedua mode bahasa. **Fondasi aman bila 3D bermasalah** |
| **4C Kedai Langsung (3D)** | `KedaiLangsungScene`, 6 hotspot + `HotspotSheet`, tiga keadaan tampilan (Sekarang/Disarankan/Atur sendiri), tarik papan harga (snap titik API), papan tulis kapur, sinkron dengan Mode Form, Mode Ringan, aksesibilitas | P0 | G1–G5 benar di kedai; hotspot ⇄ form sinkron; keyboard menjangkau semua hotspot; anggaran performa terpenuhi |
| **4D Tantangan** | `engine.ts` + test, LevelMap, layar level (papan harga ditarik di Kedai), petunjuk, hasil, Level 1–5 + Bebas, penyimpanan progres | P0 (Level 1–3) / P1 (Level 4–6) | Skor di titik puncak = 100% untuk G1–G4; Level 5 sesuai `status` |
| **4E Peta Untung & Polesan** | `ProfitHillScene` (tab "Peta Untung"), "Jalankan 1 hari", efek biji kopi, mikro-interaksi tersisa (2.4), 404/empty state, tebak dulu, XP/pangkat/lencana, suara (opsional), tema terang (P2) | P1/P2 | Tidak menurunkan FPS Kedai |
| **4F QA & dokumentasi** | Cek kontras, keyboard, mobile 360px, uji 5 detik, tangkapan layar untuk laporan, README | P0 | Daftar periksa Bagian 14 lulus |

Aturan gerbang: setelah tiap sub-fase, jalankan `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, lalu laporkan. **Jangan lanjut sebelum saya menulis "LANJUT 4X".**
conba 