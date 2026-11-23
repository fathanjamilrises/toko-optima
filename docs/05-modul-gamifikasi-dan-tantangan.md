# Modul 05: Modul Gamifikasi & Jalur Tantangan

Modul gamifikasi pada **KopiOptima** dirancang untuk mentransformasikan materi kalkulus diferensial yang sering dianggap rumit menjadi serangkaian misi pemecahan krisis bisnis kedai kopi yang menyenangkan, intuitif, dan berbasis perolehan pencapaian (*achievement-driven*).

---

## 1. Desain 5 Skenario Level & Laboratorium Bebas

Setiap level dirancang merepresentasikan satu babak evolusi kedai kopi UMKM dan satu prinsip penting kalkulus diferensial:

| Level | Judul Level | Skenario Bisnis | Konsep Kalkulus Kunci | Preset Backend | Mekanik Khusus |
|---|---|---|---|---|---|
| **Level 1** | **Warung Pertama** | Membuka kedai kecil pertama. Menentukan harga dan target cangkir. | Turunan pertama $P'(x) = 0$ dan titik puncak parabola. | `G1` | Eksplorasi slider titik keuntungan. |
| **Level 2** | **Pesanan Membludak** | Kedai sangat ramai, barista lembur melebihi jam kerja normal ($c = 20$). | Biaya kuadratik $c \cdot x^2$ dan pergeseran puncak optimum ke kiri. | `G2` | **Fase Tebak Dulu:** Pemain harus menebak target cangkir sebelum kurva terlihat. |
| **Level 3** | **Dapur Mungil** | Dapur dan mesin espresso hanya sanggup memproduksi 60 cangkir/hari ($x_{\max} = 60$). | Optimasi terkendala kapasitas Kuhn-Tucker ($x^* > x_{\max}$). | `G3` | Membatasi kapasitas dan menaikkan harga untuk menyaring pembeli. |
| **Level 4** | **Badai Biaya** | Biaya sewa dan bahan baku melonjak tajam sehingga kedai merugi ($P^* < 0$). | Minimasi kerugian (*loss minimization*) saat diskriminan $D < 0$. | `G4` | Menemukan titik dengan kerugian paling minim. |
| **Level 5** | **Kapan Harus Tutup?** | Biaya bahan baku melebihi daya beli tertinggi pasar ($v > a$). | Kondisi batas operasional dan status `NO_PRODUCTION`. | `G5` | **Kartu Keputusan Manajerial:** Memilih antara "Buka Terus" atau "Jeda Operasional". |
| **Bebas** | **Laboratorium Eksplorasi** | Pemain bebas mengubah seluruh parameter biaya, harga, dan kapasitas. | Generalisasi model kalkulus pada berbagai skala kedai kopi. | Kustom | Konfigurasi tak terbatas. |

---

## 2. Mesin Evaluasi Skor & Perolehan Bintang (`lib/game/engine.ts`)

Performa pemain pada Level 1–4 dihitung secara deterministik berdasarkan kedekatan keuntungan dari titik yang dipilih terhadap keuntungan maksimum global:

### 2.1 Formula Perhitungan Skor:
$$\text{skor} = \text{round}\left(100 \cdot \max\left(0, \frac{P_{\text{terpilih}} - P_{\min}}{P^* - P_{\min}}\right)\right)$$

Di mana:
- $P_{\text{terpilih}}$: Keuntungan harian pada posisi slider yang dikunci oleh pemain.
- $P^*$: Keuntungan maksimum global teoritis (hasil $x^*$).
- $P_{\min}$: Nilai keuntungan terendah di sepanjang kurva domain yang dievaluasi.

### 2.2 Ambang Batas Bintang (*Star Thresholds*):
- ⭐⭐⭐ **3 Bintang (Sempurna):** $\text{skor} \ge 95$
- ⭐⭐ **2 Bintang (Bagus):** $85 \le \text{skor} < 95$
- ⭐ **1 Bintang (Cukup):** $70 \le \text{skor} < 85$
- ❌ **0 Bintang (Gagal):** $\text{skor} < 70$

### 2.3 Evaluasi Level 5 (Kartu Keputusan):
Pada Level 5, sistem mengevaluasi rasionalitas keputusan bisnis:
- Jika memilih **"Jeda Operasional (Tutup Sementara)"**: Skor = 100, 3 Bintang (Keputusan Tepat).
- Jika memilih **"Tetap Buka"**: Skor = 30, 0 Bintang (Terus merugi karena $v > a$).

---

## 3. Sistem Poin Pengalaman (XP) & Pangkat Barista

Pemain mengumpulkan XP untuk menaikkan jenjang karier kepemilikan kedai kopi:

### 3.1 Komponen Hadiah XP:
$$\text{XP Diperoleh} = \text{Base XP} + \text{Bonus Bintang} + \text{Bonus Tebakan} - \text{Penalti Petunjuk}$$

- **Base XP:** Setara dengan nilai skor (maksimal 100 XP).
- **Bonus 3 Bintang:** +25 XP.
- **Bonus Tebak Dulu Akurat (Level 2):** +15 XP (jika tebakan awal berada dalam rentang $\pm 10\%$ dari $x^*$).
- **Penalti Petunjuk:** -5 XP untuk setiap tingkat petunjuk yang dibuka.

### 3.2 Jenjang Pangkat Barista (*Ranks*):

```
┌────────────────────────────────────────────────────────┐
│                   JENJANG KARIER BARISTA               │
│                                                        │
│  [0 - 99 XP]     Barista Magang    (Tahap pengenalan)  │
│        │                                               │
│  [100 - 249 XP]  Barista Junior    (Paham titik impas) │
│        │                                               │
│  [250 - 449 XP]  Barista Mahir     (Kuasai margin)     │
│        │                                               │
│  [450 - 699 XP]  Kepala Barista    (Ahli kendala mesin)│
│        │                                               │
│  [700+ XP]       Master Roaster    (Pengelola ulung)   │
└────────────────────────────────────────────────────────┘
```

---

## 4. Sistem Petunjuk Progresif 3 Tingkat (`HintBox.tsx`)

Jika pemain mengalami kesulitan, tersedia kotak petunjuk terstruktur yang mendidik tanpa langsung membocorkan jawaban:
- **Tingkat 1 (Petunjuk Konsep):** Menjelaskan intuisi bisnis di balik kurva (misal: "Perhatikan bahwa menambah cangkir membutuhkan biaya lembur").
- **Tingkat 2 (Petunjuk Angka & Gradien):** Menampilkan nilai turunan saat ini $P'(x)$ dan mengarahkan apakah cangkir harus ditambah ($P'>0$) atau dikurangi ($P'<0$).
- **Tingkat 3 (Zona Emas):** Menyorot rentang $\pm 5$ cangkir di sekitar titik optimum pada slider dengan warna emas hangat.

---

## 5. Ruang Lencana & Lemari Medali (`/lencana`)

Pencapaian permanen pemain dicatat dalam bentuk 6 lencana medali taktil:

| Nama Lencana | Ikon | Syarat Pembukaan | Makna Pencapaian |
|---|---|---|---|
| **Seduhan Pertama** | ☕ `coffee` | Selesaikan Level 1 | Berhasil meluncurkan kedai pertama dan menemukan titik impas operasional. |
| **Puncak Untung** | 🔥 `flame` | Raih 3 Bintang di Level 1 atau 2 | Mampu menemukan target cangkir tepat di puncak bukit laba maksimum. |
| **Penyelamat Biaya** | 🛡️ `shield` | Selesaikan Level 3 | Mampu mengendalikan lonjakan biaya lembur barista saat pesanan membludak. |
| **Dapur Tangguh** | ⚡ `zap` | Selesaikan Level 4 | Beroperasi efisien tepat pada batas kapasitas fisik mesin espresso. |
| **Keputusan Berani**| ⚖️ `scale` | Selesaikan Level 5 | Mengambil keputusan manajerial rasional untuk jeda saat biaya bahan melampaui harga pasar. |
| **Barista Teladan** | 🏆 `award` | Selesaikan semua level & kumpulkan $\ge 500$ XP | Menguasai seluruh aspek optimasi keuntungan kedai kopi UMKM. |

Progres disimpan secara lokal di browser melalui `localStorage` key `kopioptima_game_progress` dan dapat direset kapan saja melalui tombol *Reset Progres*.
