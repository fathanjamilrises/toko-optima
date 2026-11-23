# Modul 06: Panduan Fitur & Penggunaan Aplikasi

Dokumen ini memuat panduan komprehensif penggunaan seluruh fitur **KopiOptima**, dirancang khusus untuk dua kelompok pengguna:
1. **Pengusaha Kedai Kopi UMKM (Mode Awam):** Memerlukan rekomendasi harga menu dan target cangkir praktis tanpa kebingungan rumus matematis.
2. **Mahasiswa, Peneliti, & Dosen (Mode Akademik):** Memerlukan verifikasi kalkulus diferensial formal, pembuktian turunan KaTeX, kondisi Kuhn-Tucker, dan analisis sensitivitas untuk kebutuhan sidang skripsi atau praktikum.

---

## 1. Perbandingan Mode Tampilan: Awam vs Akademik

Pengguna dapat beralih mode kapan saja secara instan melalui tombol toggle di pojok kanan atas:

| Aspek Antarmuka | Mode Awam (Bahasa Bisnis Kedai) | Mode Akademik (Bahasa Matematika Formal) |
|---|---|---|
| **Variabel Kuantitas** | Target Cangkir per Hari | Kuantitas Optimal $x^*$ (unit/hari) |
| **Variabel Harga** | Harga Menu yang Disarankan | Harga Optimal $p^*$ (Rp/unit) |
| **Pemasukan** | Total Uang Masuk Kasir | Fungsi Pendapatan $R(x^*) = a \cdot x^* - b(x^*)^2$ |
| **Pengeluaran** | Modal Harian (Sewa + Bahan) | Fungsi Biaya Total $C(x^*) = FC + v \cdot x^* + c(x^*)^2$ |
| **Untung Bersih** | Uang Bersih Masuk Dompet | Fungsi Laba Maksimum $P^*(x^*) = R(x^*) - C(x^*)$ |
| **Kondisi Puncak** | Puncak Bukit Keuntungan | Kondisi Orde Pertama $P'(x) = 0$ dan $P''(x) < 0$ |
| **Titik Impas** | Batas Balik Modal Kasir | Titik Impas (BEP) Diskriminan Kuadratik $D \ge 0$ |
| **Kendala Dapur** | Batas Kemampuan Barista/Mesin | Kendala Kapasitas Kuhn-Tucker $x \le x_{\max}$, $\lambda \ge 0$ |

---

## 2. Alur Kerja Penggunaan Simulator Utama (`/`)

### Langkah 1: Memasukkan Parameter Kedai Kopi
Pengguna dapat memilih salah satu dari dua metode input:
- **Metode A (Interaktif 3D Diorama):** Klik langsung pada objek kedai kopi (Papan Menu, Meja Kasir, Papan Survei, atau Mesin Espresso). Sebuah jendela popover (*HotspotSheet*) akan muncul untuk mengatur nilai parameter tersebut.
- **Metode B (Formulir Parameter Taktil):** Beralih ke *Mode Form* untuk menggeser slider parameter:
  1. Biaya Tetap Harian ($FC$): Sewa tempat, listrik, internet, gaji pokok.
  2. Modal Bahan Baku per Cangkir ($v$): Biji kopi, susu segar, cup, sedotan.
  3. Koefisien Lembur ($c$): Biaya tambahan per cangkir kuadrat jika kedai ramai.
  4. Harga Menu Acuan ($p_0$): Harga yang saat ini dipasang di kedai.
  5. Penjualan Harian Acuan ($q_0$): Rata-rata cangkir yang laku per hari saat ini.
  6. Kepekaan Pelanggan ($s$): Perkiraan berapa pelanggan yang kabur jika harga dinaikkan Rp1.000.
  7. Batas Kapasitas Mesin ($x_{\max}$): Opsional, kemampuan produksi harian maksimal.

### Langkah 2: Membaca Hasil Keputusan Cepat
Begitu parameter diatur, kolom kanan secara otomatis menampilkan:
1. **Angka Untung Terbesar (`AnswerHeadline`):** Laba harian bersih yang dapat dicapai beserta target cangkir dan harga menu yang direkomendasikan.
2. **Struk Kasir KopiOptima (`ReceiptCard`):** Rincian finansial berpenampilan struk kertas kasir taktil lengkap dengan stempel status (*UNTUNG* atau *RUGI*).
3. **Kartu Komparasi (`ComparisonCard`):** Menunjukkan perbandingan sebelum vs sesudah optimasi, menyorot modal bahan yang berhasil dihemat dan pertambahan uang yang dibawa pulang.

### Langkah 3: Menelaah Panel Tab Rinci (Bawah)
Pengguna dapat mengeksplorasi 6 tab analitis di bagian bawah halaman:
- **Tab Cerita:** Penjelasan narasi logika kasir: mengapa menjual lebih sedikit cangkir dengan harga tepat bisa menghasilkan keuntungan lebih banyak dibanding obral murah. Disertai simulasi 4 skenario harga (Banting Harga, Kondisi Sekarang, Rekomendasi Puncak, dan Terlalu Mahal).
- **Tab Grafik 2D:** Visualisasi interaktif kurva Laba, Pendapatan, dan Biaya. Menampilkan titik potong $MR = MC$.
- **Tab Peta Bukit 3D:** Diorama 3D bukit keuntungan dengan Cangkir Kopi yang miring sesuai turunan pertama $P'(x)$.
- **Tab Sensitivitas:** Tabel uji stres jika harga susu/kopi naik $\pm 10\%$ atau $\pm 20\%$.
- **Tab Tabel Data:** Inspeksi tabel numerik 200 baris kalkulasi.
- **Tab Hitungan Rinci:** Langkah pembuktian matematis lengkap dengan rumus KaTeX untuk dosen penguji.

### Langkah 4: Ekspor Laporan Bisnis
Klik tombol **Ekspor JSON** atau **Ekspor CSV** di bagian bawah kartu keputusan untuk mengunduh berkas laporan resmi yang siap dicetak atau dimasukkan ke dalam lampiran dokumen skripsi.

---

## 3. Alur Penggunaan Peta Tantangan & Gamifikasi (`/tantangan`)

1. Buka menu **Tantangan** melalui Bottom Navigation Dock.
2. Pilih stasiun misi yang ingin dimainkan (Level 1 hingga Level 5):
   - **Level 1 (Warung Pertama):** Geser slider kuantitas untuk menemukan titik puncak bukit keuntungan pertama Anda.
   - **Level 2 (Pesanan Membludak):** Masukkan tebakan cangkir terlebih dahulu sebelum kurva biaya lembur terbuka. Raih bonus +15 XP jika tebakan akurat.
   - **Level 3 (Dapur Mungil):** Temukan strategi harga saat kapasitas mesin dibatasi hanya 60 cangkir per hari.
   - **Level 4 (Badai Biaya):** Ketika sewa tempat sangat mahal dan kedai pasti merugi, temukan kuantitas yang meminimalkan kerugian kedai.
   - **Level 5 (Kapan Harus Tutup?):** Baca kondisi parameter biaya, lalu ambil kartu keputusan bisnis: apakah kedai harus terus beroperasi atau melakukan jeda operasional sementara.
3. Kunci jawaban dan lihat stempel evaluasi bintang (1 hingga 3 bintang), skor akurasi, serta penambahan poin pengalaman (XP).
4. Klik tombol **Petunjuk** jika membutuhkan panduan tanpa kehilangan seluruh hadiah skor.

---

## 4. Alur Ruang Lencana & Lemari Medali (`/lencana`)

1. Buka menu **Lencana** melalui Bottom Navigation Dock.
2. Pantau akumulasi total XP dan pangkat barista Anda:
   - *Barista Magang* $\rightarrow$ *Barista Junior* $\rightarrow$ *Barista Mahir* $\rightarrow$ *Kepala Barista* $\rightarrow$ *Master Roaster*.
3. Periksa status 6 lencana medali:
   - Medali yang berhasil dibuka akan menyala dengan aksen emas-terracotta.
   - Medali yang masih terkunci menampilkan instruksi misi yang harus diselesaikan untuk membukanya.
4. Gunakan tombol **Reset Progres** jika ingin mengulang tantangan dari awal untuk keperluan demonstrasi atau pengujian baru.
