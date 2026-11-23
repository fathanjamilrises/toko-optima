# Modul 04: Modul Visualisasi 3D (React Three Fiber)

Modul visualisasi 3D pada **KopiOptima** memanfaatkan **React Three Fiber (R3F)** dan **@react-three/drei** untuk mengubah konsep abstrak kalkulus menjadi objek fisik yang dapat disentuh dan diinspeksi langsung oleh pengguna.

Terdapat dua scene 3D utama:
1. **Diorama Kedai Langsung (`KedaiLangsungScene`):** Representasi fisik operasional kedai kopi.
2. **Peta Bukit Keuntungan (`ProfitHillScene`):** Representasi geometris kurva fungsi laba $P(x)$ dan gradien turunan pertama $P'(x)$.

---

## 1. Arsitektur Bebas Unduhan Aset Eksternal (*Zero-Asset Architecture*)

Salah satu keunggulan teknis utama visualisasi 3D KopiOptima adalah **ketiadaan berkas model 3D eksternal (`.gltf` / `.glb` / `.obj`)**:
- ❌ **Tanpa Kegagalan Jaringan:** Tidak ada risiko kegagalan unduhan aset 3D akibat jaringan lemot atau error CORS.
- ⚡ **Loading Instan:** Seluruh geometri dibuat secara prosedural (*procedural geometry*) menggunakan primitif Three.js (`boxGeometry`, `cylinderGeometry`, `extrudeGeometry`, `latheGeometry`).
- 🎨 **Tekstur Dinamis:** Menu papan kapur (*chalkboard*) dibuat menggunakan `CanvasTexture` HTML5 2D yang merender tulisan tangan kapur dan harga secara dinamis di memori browser.

---

## 2. Diorama Kedai Langsung (`KedaiLangsungScene.tsx`)

Diorama ruang kedai kopi dirancang dengan atmosfer roastery modern yang taktil dan hangat.

```
┌────────────────────────────────────────────────────────┐
│               Dinding Belakang & Panel Kayu            │
│  ┌───────────────┐                  ┌───────────────┐  │
│  │ Rak Biji Kopi │                  │ Papan Rincian │  │
│  │ (Bahan Baku v)│                  │ Laba Harian   │  │
│  └───────────────┘                  └───────────────┘  │
│           ┌────────────────────────────────┐           │
│           │ Meja Barista & Mesin Espresso  │           │
│           │ (Kapasitas Mesin x_max)        │           │
│           └────────────────────────────────┘           │
│  ┌─────────────┐                        ┌───────────┐  │
│  │ Papan Menu  │                        │ Antrean   │  │
│  │ Kapur (p*)  │                        │ Pembeli   │  │
│  └─────────────┘                        │ (Demand)  │  │
│        Lantai Papan Parket Kayu Roastery (Planks)      │
└────────────────────────────────────────────────────────┘
```

### 2.1 Pemetaan Objek 3D ke Parameter Kalkulus:
Setiap objek di dalam kedai merepresentasikan satu variabel matematis nyata:

| Objek 3D | Variabel Kalkulus | Perilaku Responsif |
|---|---|---|
| **Papan Menu Kapur (`PriceBoard`)** | Harga Optimal $p^*$ | Menampilkan harga menu hasil kalkulus yang ditulis dengan efek kapur tulis. |
| **Papan Survei Jendela (`SurveyBoard`)** | Sensitivitas Pasar $s$ | Papan klip survei pelanggan; mengatur kemiringan kurva permintaan $b = \frac{1000}{s}$. |
| **Rak Biji Kopi & Susu (`ShelvesAndStock`)** | Biaya Variabel $v$ | Tumpukan kardus susu dan toples biji kopi yang merepresentasikan modal per cangkir. |
| **Mesin Espresso 2-Group (`BaristaStation`)** | Batas Kapasitas $x_{\max}$ | Mesin espresso komersial; merepresentasikan kendala Kuhn-Tucker kapasitas dapur. |
| **Antrean Pelanggan (`CustomerQueue`)** | Permintaan $q_0$ / $x^*$ | Barisan siluet karakter 3D bergaya tanah liat yang bertambah/berkurang sesuai volume pesanan. |
| **Meja Kasir & POS (`CashRegisterTable`)** | Titik Impas (BEP) | Terminal kasir dengan cangkir takeaway; merepresentasikan batas balik modal operasional kedai. |

### 2.2 Hotspot 3D Interaktif (`HotspotMesh.tsx`)
Setiap objek kunci dilengkapi titik penanda (*hotspot marker*):
- Menggunakan komponen `<Html center>` dari Drei untuk merender lencana DOM 2D di atas ruang 3D.
- Menampilkan nama parameter dan nilai aktif (contoh: `Kepekaan: 5 cangkir/Rp1rb`).
- **Pemberian Headroom Aman:** Kamera diatur pada `position: [9.2, 9.0, 9.8]`, `fov: 40`, dan `target: [0, 0.4, 0]`, serta offset tag yang disesuaikan sehingga seluruh penanda hotspot duduk dengan nyaman di dalam kanvas tanpa terpotong batas atas.

---

## 3. Peta Bukit Keuntungan 3D (`ProfitHillScene.tsx`)

Scene ini memvisualisasikan fungsi laba $P(x)$ sebagai bukit 3D fisik untuk memberikan intuisi geometri kalkulus kepada pengguna awam dan akademisi.

### 3.1 Geometri Bukit (`HillMesh.tsx`)
- Menggunakan `THREE.Shape` yang dibentuk dari array 200 titik kurva $P(x)$.
- Bentuk 2D diekstrusi ke sumbu z menggunakan `THREE.ExtrudeGeometry` untuk menghasilkan balok bukit pejal yang tebal.
- **Pewarnaan Dua Zona:**
  - Wilayah Laba ($P(x) \ge 0$): Warna hijau sage (`#81b29a`).
  - Wilayah Rugi ($P(x) < 0$): Warna oranye tembaga terbakar (`#d95d39`).

### 3.2 Cangkir Miring Dinamis (`TiltingCup.tsx`)
Cangkir kopi 3D dengan busa *latte art* meluncur di atas punggung bukit mengikuti jumlah cangkir $x$ yang dipilih:
- **Visualisasi Turunan Pertama $P'(x)$:**
  Kemiringan cangkir dihitung secara eksak dari gradien turunan:
  $$\theta = \arctan\left(\frac{P'(x)}{k_{\text{scale}}}\right)$$
- **Tiga Keadaan Lereng:**
  1. **Mendaki ($P'(x) > 0$):** Cangkir miring menanjak ke kanan; menambah cangkir masih meningkatkan keuntungan.
  2. **Puncak Datar ($P'(x) = 0$):** Cangkir berdiri tegak sempurna di puncak bukit; keuntungan maksimal tercapai ($x^*$).
  3. **Menurun ($P'(x) < 0$):** Cangkir miring menukik ke bawah; menambah cangkir justru menggerogoti keuntungan bersih kedai.

### 3.3 Penanda Geometris Penting (`HillMarkers.tsx`)
- **Bendera Puncak:** Berkibar tepat di koordinat $(x^*, P^*)$.
- **Gerbang Titik Impas (BEP Gate):** Pintu gerbang di titik $P(x) = 0$ ($x_{\text{low}}$ dan $x_{\text{high}}$).
- **Pagar Kapasitas (Capacity Fence):** Dinding kawat pembatas di koordinat $x = x_{\max}$.
- **Rumah Kedai Acuan:** Miniatur kedai di posisi volume penjualan awal $(q_0, P(q_0))$.

### 3.4 Pita Pendapatan & Biaya (`RevenueCostRibbons.tsx`)
Dua pipa tabung 3D (`TubeGeometry`) melengkung di belakang bukit keuntungan:
- Pita biru muda untuk Pendapatan Total $R(x)$.
- Pita cokelat krem untuk Biaya Total $C(x)$.
- Jarak vertikal antara kedua pita secara visual tepat sama dengan ketinggian bukit laba $P(x) = R(x) - C(x)$.

---

## 4. Efisiensi Baterai & Aksesibilitas

1. **Rendering Sesuai Permintaan (`frameloop="demand"`):**
   Canvas 3D **tidak merender 60 frame per detik secara terus-menerus**. Frame baru hanya digambar saat pengguna memutar sudut pandang, menggeser slider, atau ketika parameter berubah. Hal ini menghemat baterai laptop dan mencegah kipas pendingin berputar keras.
2. **Device Pixel Ratio Terkendali:**
   `dpr={[1, 1.75]}` mencegah perangkat retina beresolusi tinggi merender jutaan piksel berlebih.
3. **Fallback Mode Ringan 2D (`KedaiLightFallback.tsx`):**
   Sistem secara otomatis mendeteksi ketiadaan dukungan WebGL atau preferensi aksesibilitas pengguna:
   - Jika `window.matchMedia("(prefers-reduced-motion: reduce)").matches` bernilai true, scene 3D dinonaktifkan secara otomatis dan digantikan oleh diagram ilustrasi SVG 2D datar tanpa animasi.
   - Pengguna juga dapat secara manual beralih ke Mode Ringan melalui tombol kontrol di antarmuka.
