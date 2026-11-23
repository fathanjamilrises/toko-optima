# KopiOptima Frontend

Simulator optimasi keuntungan kedai kopi UMKM berbasis kalkulus diferensial. Mengimplementasikan tema **Roastery Taktil** dengan Next.js App Router, TypeScript, Tailwind CSS, Three.js (`@react-three/fiber` & `@react-three/drei`), Recharts, KaTeX, dan antarmuka bento.

## Status Sub-Fase 4E (Peta Untung 3D & Polesan Akhir)

- **Adegan 3D Bukit Untung (`ProfitHillScene` — Tab "Peta Untung (3D)")**:
  - `HillMesh`: Geometri profil bukit plastisin membulat dari `ExtrudeGeometry` titik $(x, P)$. Segmen di atas nol berwarna solid `--profit` (`#81b29a`), segmen di bawah nol berwarna solid `--loss` (`#d95d39`). Terpotong tegas di garis BEP tanpa interpolasi gradien warna.
  - `TiltingCup`: Model cangkir kopi low-poly yang miring mengikuti kemiringan turunan $dP$ (maksimal $\pm 25^\circ$), tegak di puncak keuntungan, mengeluarkan uap tipis di puncak, dan menampilkan garis singgung serta vektor turunan di Mode Akademik.
  - `RevenueCostRibbons`: Pita kurva 3D tabung Pemasukan $R(x)$ ($z=-1.2$, emas) dan Pengeluaran $C(x)$ ($z=-2.4$, terracotta) di belakang bukit, memperjelas hubungan fundamental $\Pi(x) = R(x) - C(x)$.
  - `HillMarkers`: Bendera puncak karamel di $x^*$, gerbang kayu impas di titik BEP, pagar kapasitas tembus pandang, dan rumah acuan kondisi sekarang.
  - `HillControlsBar`: Pemilih sudut pandang kamera (*Tampak Miring* vs *Tampak Depan 2D* untuk tangkapan layar laporan), slider penelusuran kurva, dan tombol reset kamera.
- **Simulasi "Jalankan 1 Hari" (`RunDaySimulationModal`)**:
  - Modal taktil berisi visualisasi kedai beroperasi 1 hari penuh (jam 07:00 hingga 21:00).
  - Penghitungan dinamis cangkir terhidang, akumulasi pemasukan $R$, pengeluaran $C$, dan laba bersih harian $\Pi$, dilengkapi stempel status penutup.
  - Tombol pemicu "Jalankan 1 Hari" tersemat langsung di `KedaiControlsBar`.
- **Efek Perayaan & Haptic**:
  - `CoffeeBeansBurst`: Partikel ledakan $\pm 60$ biji kopi saat meraih 3 bintang di layar tantangan (1.2 detik lalu otomatis dibersihkan dari memori; dinonaktifkan saat `prefers-reduced-motion` aktif).
  - Haptic feedback `navigator.vibrate(8)` saat takik `ChallengeSlider` digeser.
- **Ruang Lencana & Pencapaian (`/lencana`)**:
  - Halaman bento taktil menampilkan 6 lencana pencapaian (*Seduhan Pertama, Puncak Untung, Penyelamat Biaya, Dapur Tangguh, Keputusan Berani, Barista Teladan*).
  - Status terbuka/terkunci dibaca secara reaktif dari `progress.ts`, dilengkapi akumulasi XP dan pangkat pengelola kedai.
  - Navigasi lencana terintegrasi di `Header` dan `LevelHUD`.

## Status Sub-Fase 4D (Layar Tantangan & Gamifikasi)

- **Peta Level Vertikal (`/tantangan`)**:
  - Jalur stasiun level 1–5 + Level Bebas (seluruh level terbuka sejak awal agar penguji/dosen dapat langsung mencoba).
  - Kartu stasiun menampilkan perolehan bintang terbaik (★★★), XP, status penyelesaian, dan indikator navigasi.
  - Header memuat `RankBadge` (Magang → Barista → Kepala Barista → Pemilik Kedai → Juragan Kopi) dan tombol reset progres.

- **Layar Tantangan Level Interaktif (`/tantangan/[level]`)**:
  - `LevelHUD`: Header informasi level, XP terkumpul, dan indikator 3 petunjuk.
  - `ChallengeStage`: Stage visual kedai (bendera puncak tersembunyi di papan tulis hingga jawaban dikunci).
  - `ChallengeSlider`: Kontrol slider yang menempel presisi ke indeks array `curves.points` (dukungan keyboard: `←` `→` step 1, `Shift`+`←` `→` step 10, `Home`/`End`).
  - **Mekanik Khusus Tiap Level**:
    - **Level 1 (G1)**: *Warung Pertama* — Geser bebas, memahami untung punya puncak.
    - **Level 2 (G2)**: *Pesanan Membludak* — `GuessModal` ("Tebak Dulu" target cangkir sebelum menggeser, bonus +15 XP jika tebakan akurat $\pm10\%$).
    - **Level 3 (G3)**: *Dapur Mungil* — Puncak terikat pagar kapasitas dapur 60 cangkir.
    - **Level 4 (G4)**: *Badai Biaya* — Kondisi selalu rugi; skor dihitung dengan rumus rentang DESIGN.md 7.5 tanpa pembagian negatif.
    - **Level 5 (G5)**: *Kapan Harus Tutup?* — `DecisionCard` manajerial (pilihan buka vs tutup sementara sesuai status `NO_PRODUCTION`).
    - **Level Bebas**: Eksplorasi parameter kustom.
  - `HintBox`: 3 tingkat petunjuk cerdas:
    1. Arah kemiringan ($dP > 0 \to$ naik ↗, $dP < 0 \to$ turun ↘, $\approx 0 \to$ rata). Mode Akademik menyebut $P'(x)$.
    2. Deteksi suhu (Dingin <50%, Hangat <90%, Panas $\ge 90\%$).
    3. Rentang sasaran harga puncak ($\pm 5$ titik dari optimum).
  - `ResultPanel`: Bintang ★★★, stempel stiker taktil miring (`UNTUNG BESAR!`, `HAMPIR!`, `COBA LAGI`, `KEPUTUSAN TEPAT!`), perolehan skor persentase, rincian bonus XP, satu kalimat pelajaran bisnis, dan tombol navigasi.
  - `progress.ts`: Penyimpanan progres aman di `localStorage` (kunci `kopioptima_game_progress`).

- **Fondasi Sub-Fase Sebelumnya (Tetap Lengkap & Sinkron)**:
  - 4A: Fondasi token, layout, Header, ModeToggle, API client, KaTeX.
  - 4B: Mode Form (`ParameterForm`), Bento results, ReceiptCard, WarningCards, ComparisonCard, 5 Tab.
  - 4C: Diorama 3D Kedai Langsung (`KedaiLangsungScene`), 6 Hotspot ⇄ parameter, 3 tampilan (Sekarang, Disarankan, Atur Sendiri), fallback Mode Ringan 2D.

## Menjalankan Bersama Backend

Jalankan dalam dua terminal terpisah:

### Terminal 1: Backend (Port 8000)
```powershell
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Server backend berjalan di `http://127.0.0.1:8000` dengan dokumentasi Swagger di `http://127.0.0.1:8000/docs`.

### Terminal 2: Frontend (Port 3000)
```powershell
cd frontend
pnpm dev
# atau npm run dev / npm start
```
Buka peramban:
- **Simulasi Utama**: `http://localhost:3000` (Mode Awam) atau `http://localhost:3000/?mode=akademik` (Mode Akademik).
- **Peta Tantangan**: `http://localhost:3000/tantangan`.
- **Level Tantangan**: `http://localhost:3000/tantangan/1`, `/tantangan/2`, dst.

## Pemeriksaan Kualitas & Pengujian

Semua pemeriksaan wajib lulus:

```powershell
cd frontend
npm run check:design # Bebas gradien dekoratif, glassmorphism, atau bayangan keras
npm run lint         # ESLint 9 Flat Config (0 error, 0 warning)
npm run typecheck    # TypeScript compiler check (tsc --noEmit)
npm test             # Vitest test suite (7 test files, 39 tests passed)
npm run build        # Next.js production build & static generation
```
