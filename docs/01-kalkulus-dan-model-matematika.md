# Modul 01: Fondasi Kalkulus & Model Matematika

Dokumen ini memuat formulasi matematika lengkap dan pembuktian kalkulus diferensial yang digunakan oleh mesin analitis **KopiOptima**. Seluruh perhitungan diimplementasikan pada modul Python murni di direktori `backend/app/core/`.

---

## 1. Definisi Variabel & Parameter Bisnis

Sistem menerima 7 parameter bisnis dari pengelola kedai kopi:

| Simbol | Nama Parameter | Satuan | Domain Fisik | Penjelasan Bisnis |
|---|---|---|---|---|
| $p_0$ | `ref_price` | Rp/cangkir | $p_0 > 0$ | Harga jual menu saat ini yang dijadikan acuan. |
| $q_0$ | `ref_demand` | cangkir/hari | $q_0 > 0$ | Rata-rata jumlah cangkir yang terjual per hari pada harga $p_0$. |
| $s$ | `sensitivity` | cangkir / Rp1.000 | $s > 0$ | Penurunan penjualan jika harga dinaikkan Rp1.000 (koefisien sensitivitas pasar). |
| $FC$ | `fixed_cost` | Rp/hari | $FC \ge 0$ | Biaya tetap harian (sewa tempat, gaji pokok barista, listrik dasar). |
| $v$ | `variable_cost`| Rp/cangkir | $v > 0$ | Biaya bahan baku langsung per cangkir (biji kopi, susu, cup, sedotan). |
| $c$ | `quad_cost` | Rp/cangkir$^2$ | $c \ge 0$ | Koefisien biaya kuadratik (biaya lembur barista atau keausan mesin saat pesanan melonjak tinggi). Default $= 0$. |
| $x_{\max}$ | `capacity` | cangkir/hari | $x_{\max} > 0$ atau $\text{null}$ | Batas kapasitas maksimal pembuatan kopi per hari (kapasitas mesin / barista). |

---

## 2. Fungsi Permintaan Terbalik (Inverse Demand Function)

Hubungan antara harga jual $p$ dan kuantitas cangkir $x$ diasumsikan linier di sekitar titik acuan $(q_0, p_0)$ dengan laju perubahan $\frac{\Delta x}{\Delta p} = -\frac{s}{1000}$.

Kemiringan fungsi harga terhadap kuantitas didefinisikan sebagai:
$$b = \frac{1000}{s} \quad (b > 0)$$

Intersep harga tertinggi pasar ($a$, titik di mana permintaan nol) dihitung melalui titik acuan $(q_0, p_0)$:
$$p_0 = a - b \cdot q_0 \implies a = p_0 + b \cdot q_0$$

Maka, fungsi harga sebagai fungsi dari kuantitas $x$ dinyatakan dalam **Fungsi Permintaan Terbalik**:
$$p(x) = a - b \cdot x$$

> **Sifat Matematis:**
> - $p(0) = a$ (harga reservasi maksimum pasar).
> - $p(q_0) = a - b \cdot q_0 = p_0$ (konsisten dengan data observasi awal).
> - Turunan pertama $p'(x) = -b < 0$ (memenuhi Hukum Permintaan ekonomi: kuantitas naik menyebabkan harga turun).

---

## 3. Fungsi Pendapatan Total (Total Revenue)

Pendapatan kotor harian $R(x)$ adalah hasil kali antara jumlah cangkir terjual $x$ dengan harga jual per cangkir $p(x)$:
$$R(x) = x \cdot p(x) = x(a - b \cdot x) = a \cdot x - b \cdot x^2$$

### Pendapatan Marginal (Marginal Revenue)
Pendapatan tambahan dari menjual satu cangkir ekstra diperoleh dari turunan pertama fungsi pendapatan:
$$MR(x) = R'(x) = \frac{d}{dx}\left(a \cdot x - b \cdot x^2\right) = a - 2b \cdot x$$

Titik di mana pendapatan mencapai nilai puncak (maksimum pendapatan kotor, tanpa memperhitungkan biaya):
$$R'(x) = 0 \implies a - 2b \cdot x = 0 \implies x_R^* = \frac{a}{2b}$$

---

## 4. Fungsi Biaya Operasional Total (Total Cost)

Biaya total harian $C(x)$ mencakup komponen biaya tetap ($FC$), biaya variabel linier ($v \cdot x$), dan biaya disekonomi skala kuadratik ($c \cdot x^2$):
$$C(x) = FC + v \cdot x + c \cdot x^2$$

### Biaya Marginal (Marginal Cost)
Biaya tambahan untuk memproduksi satu cangkir kopi ekstra:
$$MC(x) = C'(x) = \frac{d}{dx}\left(FC + v \cdot x + c \cdot x^2\right) = v + 2c \cdot x$$

---

## 5. Fungsi Keuntungan Bersih (Profit Function)

Keuntungan bersih harian $P(x)$ adalah selisih antara pendapatan kotor $R(x)$ dan biaya operasional total $C(x)$:
$$P(x) = R(x) - C(x)$$
$$P(x) = \left(a \cdot x - b \cdot x^2\right) - \left(FC + v \cdot x + c \cdot x^2\right)$$
$$P(x) = -(b + c) \cdot x^2 + (a - v) \cdot x - FC$$

Untuk mempermudah notasi kalkulus analitis, definisikan parameter agregat:
$$\alpha = b + c \quad (\alpha > 0 \text{ karena } b > 0 \text{ dan } c \ge 0)$$
$$\beta = a - v \quad (\beta \text{ merepresentasikan margin kotor teoritis pada cangkir pertama})$$

Sehingga fungsi laba berbentuk fungsi kuadratik standar:
$$P(x) = -\alpha \cdot x^2 + \beta \cdot x - FC$$

---

## 6. Kondisi Optimum Kontinu Tanpa Kendala

### 6.1 Kondisi Orde Pertama (First-Order Necessary Condition - FOC)
Titik stasioner $x^*$ yang memaksimalkan fungsi laba dicapai ketika laju perubahan laba (gradien lereng bukit keuntungan) bernilai nol:
$$\frac{dP}{dx} = P'(x) = 0$$
$$-2\alpha \cdot x + \beta = 0$$
$$-2(b + c) \cdot x + (a - v) = 0$$

Maka diperoleh titik kritis analitis:
$$x^* = \frac{\beta}{2\alpha} = \frac{a - v}{2(b + c)}$$

> **Interpretasi Ekonomi Marginal:**
> Pada titik $x^*$, berlaku kondisi kesetimbangan ekonomi klasik:
> $$P'(x) = 0 \iff R'(x) - C'(x) = 0 \iff MR(x) = MC(x)$$
> $$a - 2b \cdot x^* = v + 2c \cdot x^*$$
> Artinya: keuntungan maksimal tercapai saat pendapatan marginal tepat sama dengan biaya marginal.

### 6.2 Uji Turunan Kedua (Second-Order Sufficient Condition - SOC)
Untuk membuktikan bahwa titik stasioner $x^*$ adalah titik **maksimum global** (bukan minimum atau titik belok), lakukan uji turunan kedua:
$$P''(x) = \frac{d^2P}{dx^2} = \frac{d}{dx}\left(-2\alpha \cdot x + \beta\right) = -2\alpha = -2(b + c)$$

Karena $b > 0$ dan $c \ge 0$, maka $\alpha = b + c > 0$, sehingga:
$$P''(x) = -2(b + c) < 0 \quad \forall x \in \mathbb{R}$$

Karena turunan kedua bernilai negatif konstan di seluruh domain, fungsi $P(x)$ bersifat **konkaf murni ke bawah (strictly concave)**. Hal ini menjamin bahwa titik kritis $x^*$ adalah **titik maksimum global mutlak unik**.

---

## 7. Optimasi Terkendala Kapasitas (Kuhn-Tucker Conditions)

Ketika kedai kopi memiliki batas kapasitas fisik mesin espresso atau jam kerja barista $x \le x_{\max}$, masalah optimasi dinyatakan sebagai:
$$\max_{x} P(x) \quad \text{dengan kendala } 0 \le x \le x_{\max}$$

Fungsi Lagrangian:
$$\mathcal{L}(x, \lambda) = P(x) - \lambda (x - x_{\max})$$

Kondisi Karush-Kuhn-Tucker (KKT):
1. $\frac{\partial \mathcal{L}}{\partial x} = P'(x) - \lambda = 0 \implies \lambda = P'(x)$
2. $\lambda \ge 0$
3. $x \le x_{\max}$
4. $\lambda (x - x_{\max}) = 0$ (*Complementary Slackness*)

### Kasus Analitis:
1. **Kasus 1: Interior Optimum ($x^* \le x_{\max}$)**
   - Kendala kapasitas tidak aktif (kendala longgar).
   - $\lambda = 0$.
   - Solusi optimal: $x_{\text{opt}} = x^* = \frac{a - v}{2(b + c)}$.
   - Status sistem: `INTERIOR_OPTIMUM`.

2. **Kasus 2: Kendala Kapasitas Mengikat ($x^* > x_{\max}$)**
   - Pasar menginginkan lebih banyak kopi, namun dapur tidak sanggup memproduksinya.
   - Karena $P(x)$ konkaf dan puncaknya berada di sebelah kanan $x_{\max}$, maka fungsi $P(x)$ monoton naik pada interval $[0, x_{\max}]$.
   - Solusi optimal terikat pada batas: $x_{\text{opt}} = x_{\max}$.
   - Pengali Lagrange: $\lambda = P'(x_{\max}) = \beta - 2\alpha \cdot x_{\max} > 0$ (menunjukkan nilai marginal kapasitas tambahan).
   - Status sistem: `CAPACITY_BOUND`.

3. **Kasus 3: Tidak Layak Beroperasi ($a \le v$)**
   - Harga reservasi tertinggi pasar lebih rendah atau sama dengan biaya variabel bahan baku per cangkir.
   - $\beta = a - v \le 0 \implies P'(x) < 0 \quad \forall x > 0$.
   - Setiap cangkir yang diproduksi menambah kerugian operasional.
   - Solusi optimal: $x_{\text{opt}} = 0$ (tutup sementara).
   - Status sistem: `NO_PRODUCTION`.

---

## 8. Diskretisasi Bilangan Bulat (Integer Optimization)

Dalam dunia nyata, cangkir kopi tidak dapat dijual dalam pecahan desimal ($x \in \mathbb{Z}^+$).

Karena $P(x)$ simetris dan konkaf di sekitar $x^*$, solusi bilangan bulat terbaik dijamin berada pada salah satu dari dua bilangan bulat terdekat:
$$x_{\text{floor}} = \lfloor x_{\text{opt}} \rfloor \quad \text{dan} \quad x_{\text{ceil}} = \lceil x_{\text{opt}} \rceil$$

Kedua kandidat dibatasi oleh domain kapasitas $[0, x_{\max}]$. Evaluasi dilakukan secara deterministik:
$$x_{\text{int}}^* = \arg\max_{x \in \{x_{\text{floor}}, x_{\text{ceil}}\}} P(x)$$

Jika $P(x_{\text{floor}}) = P(x_{\text{ceil}})$, sistem memilih nilai $x$ yang lebih kecil sebagai bentuk prinsip kehati-hatian (*risk aversion*) guna menghemat modal kerja variabel.

---

## 9. Analisis Titik Impas (Break-Even Point - BEP)

Titik impas adalah tingkat penjualan di mana kedai tidak untung dan tidak rugi:
$$P(x) = 0 \iff -\alpha \cdot x^2 + \beta \cdot x - FC = 0$$

Persamaan kuadratik di atas memiliki diskriminan:
$$D = \beta^2 - 4\alpha \cdot FC = (a - v)^2 - 4(b + c)FC$$

### Analisis Solusi BEP:
1. **Jika $D < 0$:**
   Tidak ada akar riil. Fungsi laba selalu bernilai negatif ($P(x) < 0 \quad \forall x$). Biaya tetap harian terlalu tinggi dibanding margin laba kotor, kedai pasti merugi pada skala berapapun.

2. **Jika $D \ge 0$:**
   Terdapat dua akar titik potong impas:
   $$x_{\text{low}} = \frac{-\beta + \sqrt{D}}{-2\alpha} = \frac{\beta - \sqrt{D}}{2\alpha}$$
   $$x_{\text{high}} = \frac{-\beta - \sqrt{D}}{-2\alpha} = \frac{\beta + \sqrt{D}}{2\alpha}$$

   - **$x_{\text{low}}$ (Titik Impas Awal):** Jumlah cangkir minimal yang harus terjual untuk melunasi biaya tetap ($FC$).
   - **$x_{\text{high}}$ (Titik Impas Akhir):** Batas volume atas di mana penurunan harga akibat banjir pasokan membuat kedai kembali ke titik nol keuntungan.
   - **Rentang Laba Positif Bilangan Bulat:**
     $$x \in \left[\lceil x_{\text{low}} \rceil, \lfloor x_{\text{high}} \rfloor\right] \cap [0, x_{\max}]$$

---

## 10. Analisis Sensitivitas & Teorema Envelope

Analisis sensitivitas mengevaluasi seberapa rentan keuntungan maksimal $P^*$ dan target kuantitas $x^*$ terhadap fluktuasi parameter eksternal.

Berdasarkan **Teorema Envelope (Envelope Theorem)** pada titik interior optimum $x^*$:
$$\frac{dP^*}{d\theta} = \left. \frac{\partial P(x, \theta)}{\partial \theta} \right|_{x = x^*}$$

Diperoleh turunan parsial analitis sebagai berikut:

1. **Sensitivitas terhadap Biaya Tetap ($FC$):**
   $$\frac{\partial P^*}{\partial FC} = -1 \quad \text{dan} \quad \frac{\partial x^*}{\partial FC} = 0$$
   *Arti Bisnis:* Kenaikan sewa Rp1.000 memotong untung bersih tepat Rp1.000, tetapi **tidak mengubah** target cangkir optimal $x^*$.

2. **Sensitivitas terhadap Biaya Variabel Bahan Baku ($v$):**
   $$\frac{\partial P^*}{\partial v} = -x^* \quad \text{dan} \quad \frac{\partial x^*}{\partial v} = -\frac{1}{2(b + c)} < 0$$
   *Arti Bisnis:* Setiap kenaikan harga bahan Rp1/cangkir mengurangi laba sebesar $x^*$ Rupiah, dan menggeser puncak target penjualan ke jumlah cangkir yang lebih sedikit.

3. **Sensitivitas terhadap Intersep Permintaan Pasar ($a$):**
   $$\frac{\partial P^*}{\partial a} = +x^* \quad \text{dan} \quad \frac{\partial x^*}{\partial a} = +\frac{1}{2(b + c)} > 0$$
   *Arti Bisnis:* Peningkatan daya tarik produk mempertebal keuntungan proporsional terhadap volume cangkir yang dijual.
