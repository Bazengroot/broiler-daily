import type { HealthEntry } from "./types";

/* ===== Data contoh: program kesehatan & vaksinasi ===== */
export const SEED_HEALTH: HealthEntry[] = [
  {
    id: "h1",
    day: 1,
    category: "Vaksin",
    product: "ND-IB (Ma5 + Clone 30)",
    dose: "1 dosis/ekor",
    method: "Spray kasar",
    officer: "Tim Medik Veteriner",
  },
  {
    id: "h2",
    day: 4,
    category: "Vaksin",
    product: "IBD (Gumboro) intermediate",
    dose: "1 dosis/ekor",
    method: "Air minum",
    officer: "Budi Hartono",
  },
  {
    id: "h3",
    day: 7,
    category: "Vitamin",
    product: "Multivitamin + elektrolit",
    dose: "1 g/L air",
    method: "Air minum",
    officer: "Budi Hartono",
  },
  {
    id: "h4",
    day: 10,
    category: "Sanitasi",
    product: "Desinfektan glutaraldehid",
    dose: "5 ml/L",
    method: "Spray kandang",
    officer: "Krew Kandang",
  },
  {
    id: "h5",
    day: 14,
    category: "Vaksin",
    product: "ND booster (LaSota)",
    dose: "1 dosis/ekor",
    method: "Air minum",
    officer: "Budi Hartono",
  },
  {
    id: "h6",
    day: 16,
    category: "Vitamin",
    product: "AD3E + mineral",
    dose: "0,5 ml/L",
    method: "Air minum",
    officer: "Budi Hartono",
  },
];

/* ===== Fase development (prompt bertahap) ===== */
export interface Phase {
  id: number;
  title: string;
  goal: string;
  prompt: string;
  items: string[];
}

export const PHASES: Phase[] = [
  {
    id: 1,
    title: "Fondasi & Model Data",
    goal: "Menyiapkan kerangka aplikasi, tipe data parameter broiler, dan penyimpanan lokal.",
    prompt: `Bangun aplikasi web "BroilerLog" dengan React + Vite + Tailwind CSS (basis warna biru #1A53D0 dan putih) untuk recording produksi ayam broiler. Tahap ini:
1) Buat tipe data FlockInfo (farm, kandang, strain, jumlah DOC, bobot awal, harga DOC & pakan, tanggal chick-in) dan DailyRecord (hari, mortalitas, culling, pakan diberi/sisa, air, BB sampling, suhu min-maks, kelembapan, panen, catatan).
2) Simpan data di localStorage agar tidak hilang saat refresh.
3) Buat layout sidebar + navigasi tab (Performa, Recording, Flock, Kesehatan).
4) Buat form input recording harian lengkap dengan validasi.`,
    items: [
      "Tipe data FlockInfo & DailyRecord (seluruh parameter broiler)",
      "Persistensi localStorage dengan fallback data contoh",
      "Layout sidebar biru–putih responsif",
      "Form recording harian + validasi inline",
    ],
  },
  {
    id: 2,
    title: "Mesin Kalkulasi Performa",
    goal: "Menghitung seluruh indikator kunci produksi dari data harian.",
    prompt: `Lanjutkan BroilerLog: implementasikan mesin kalkulasi performa broiler. Hitung per hari:
1) Konsumsi pakan (diberi − sisa) dan kumulatifnya.
2) Deplesi harian & kumulatif (%).
3) ADG = BB sampling / umur.
4) FCR kumulatif = pakan kumulatif / (bobot hidup + panen + mortalitas).
5) Indeks Prestasi: IP = ((100 − deplesi%) × BB kg) / (FCR × umur) × 100.
6) Biaya pakan (harga starter ≤ hari 14, finisher setelahnya) dan estimasi HPP.
Bandingkan BB dan FCR terhadap tabel standar Cobb 500 hari 1–42.`,
    items: [
      "FCR, IP, ADG, deplesi, % standar BB",
      "Biaya pakan bertingkat starter/finisher",
      "Estimasi HPP & struktur biaya (DOC, obat, operasional)",
      "Tabel standar bobot & FCR Cobb 500",
    ],
  },
  {
    id: 3,
    title: "Dashboard Highlight Performa",
    goal: "Tab pertama menampilkan ringkasan performa produksi secara visual.",
    prompt: `Lanjutkan BroilerLog: bangun tab Dashboard sebagai halaman pembuka berisi highlight performa produksi:
1) Kartu Indeks Prestasi dengan gauge dan grade (Istimewa/Baik/Cukup/Kurang).
2) KPI: FCR, ADG, BB rata-rata vs standar, deplesi kumulatif, pakan & air kumulatif, biaya pakan, proyeksi HPP panen.
3) Grafik SVG: garis BB aktual vs standar, batang mortalitas harian, tren FCR vs standar.
4) Panel peringatan otomatis (deplesi, suhu, RH, FCR, bobot).
5) Tabel proyeksi panen hari 28/30/32/35 dengan estimasi tonase & pendapatan.`,
    items: [
      "Gauge IP + ticker statistik berjalan",
      "8 kartu KPI dengan angka animasi count-up",
      "3 grafik SVG interaktif (hover tooltip)",
      "Alert engine + proyeksi panen & pendapatan",
    ],
  },
  {
    id: 4,
    title: "CRUD Lengkap & Ekspor",
    goal: "Recording harian dapat dikelola penuh dan diekspor untuk laporan.",
    prompt: `Lanjutkan BroilerLog: sempurnakan fitur operasional:
1) CRUD recording harian: tambah, edit per hari, hapus dengan konfirmasi dua langkah.
2) Ekspor CSV seluruh kolom parameter (separator ";" agar ramah Excel Indonesia).
3) Tab Flock: ubah parameter chick-in & ekonomi, tabel standar bobot hari 1–35.
4) Tab Kesehatan & Vaksinasi: timeline program (vaksin/antibiotik/vitamin/sanitasi).
5) Micro-interactions: reveal on scroll, hover state, toast notifikasi, responsif mobile.`,
    items: [
      "Edit & hapus recording (two-step confirm)",
      "Ekspor CSV 23 kolom",
      "Manajemen flock + reset data contoh",
      "Timeline kesehatan flock berwarna",
    ],
  },
  {
    id: 5,
    title: "Hardening, Audit & Deploy",
    goal: "Audit fungsi & keamanan, dokumentasi, lalu publish ke GitHub dan Vercel/Lovable.",
    prompt: `Finalisasi BroilerLog:
1) Jalankan audit fungsi — verifikasi manual rumus FCR, IP, ADG, deplesi, dan HPP terhadap data contoh.
2) Jalankan audit keamanan — validasi & sanitasi input numerik, pencegahan XSS, keamanan penyimpanan localStorage, cek dependensi, HTTPS saat deploy.
3) Tulis README.md (fitur, rumus, cara menjalankan).
4) Push ke GitHub: git init, commit, push ke repo broilerlog.
5) Deploy ke Vercel (import repo, framework Vite) atau Lovable AI, lalu lampirkan halaman fase development & hasil audit di dalam aplikasi.`,
    items: [
      "Audit fungsi: 10 modul diverifikasi",
      "Audit keamanan: 10 kontrol + skor",
      "README + dokumentasi rumus",
      "Deploy Vercel / Lovable via GitHub",
    ],
  },
];

/* ===== Perintah deploy ===== */
export const DEPLOY_GIT = [
  "git add .",
  'git commit -m "feat: BroilerLog v1.4 — recording produksi broiler"',
  "git remote add origin https://github.com/USERNAME/broilerlog.git",
  "git push -u origin main",
];

/* ===== Audit fungsi ===== */
export interface FuncAudit {
  mod: string;
  method: string;
  note: string;
}

export const FUNC_AUDITS: FuncAudit[] = [
  {
    mod: "Input recording harian",
    method: "Uji form: tambah hari ke-19, validasi nilai negatif & kosong",
    note: "Data tersimpan & tabel ter-update instan",
  },
  {
    mod: "Edit & hapus record",
    method: "Ubah nilai hari ke-5, hapus dengan konfirmasi dua langkah",
    note: "Kalkulasi kumulatif terhitung ulang otomatis",
  },
  {
    mod: "Kalkulasi FCR",
    method: "Verifikasi manual: Σpakan / (bobot hidup + panen + mortalitas)",
    note: "Selisih < 0,01 terhadap hitungan spreadsheet",
  },
  {
    mod: "Kalkulasi Indeks Prestasi",
    method: "Verifikasi rumus ((100−deplesi%)×BB kg)/(FCR×umur)×100",
    note: "Grade Istimewa/Baik/Cukup/Kurang sesuai ambang",
  },
  {
    mod: "ADG & % standar bobot",
    method: "Bandingkan BB sampling dengan tabel standar Cobb 500",
    note: "ADG = BB/umur; % standar presisi 1 desimal",
  },
  {
    mod: "Deplesi harian & kumulatif",
    method: "Jumlahkan mortalitas + culling terhadap populasi berjalan",
    note: "Populasi akhir konsisten di semua tampilan",
  },
  {
    mod: "Biaya pakan & HPP",
    method: "Cek harga bertingkat starter (≤14 hari) vs finisher",
    note: "HPP berjalan & proyeksi panen tampil benar",
  },
  {
    mod: "Persistensi localStorage",
    method: "Refresh browser, edit data, refresh ulang",
    note: "Data flock, recording, dan kesehatan tetap utuh",
  },
  {
    mod: "Ekspor CSV",
    method: "Unduh file, buka di Excel & Google Sheets",
    note: "23 kolom utuh, separator ';' dan BOM UTF-8",
  },
  {
    mod: "Mesin peringatan",
    method: "Suntik data suhu 33°C, deplesi 0,6%, RH 80%",
    note: "Alert muncul sesuai ambang & level warna",
  },
];

/* ===== Audit keamanan ===== */
export interface SecAudit {
  item: string;
  sev: "Tinggi" | "Sedang" | "Rendah";
  status: "AMAN" | "CATATAN";
  note: string;
}

export const SEC_AUDITS: SecAudit[] = [
  {
    item: "Validasi & sanitasi input",
    sev: "Tinggi",
    status: "AMAN",
    note: "Seluruh isian dikonversi Number() dan diklamp ≥ 0; rentang suhu 10–45°C dan RH 20–100% dipaksa di lapisan form sebelum masuk state.",
  },
  {
    item: "Cross-Site Scripting (XSS)",
    sev: "Tinggi",
    status: "AMAN",
    note: "React meng-escape semua interpolasi secara default; tidak ada penggunaan dangerouslySetInnerHTML maupun injeksi HTML manual.",
  },
  {
    item: "Eksekusi kode dinamis",
    sev: "Tinggi",
    status: "AMAN",
    note: "Tidak ada eval(), Function(), atau import dinamis dari sumber eksternal di seluruh codebase.",
  },
  {
    item: "Keamanan penyimpanan lokal",
    sev: "Sedang",
    status: "AMAN",
    note: "Data hanya berisi parameter produksi (tanpa kredensial/PII). Parsing localStorage dibungkus try/catch dengan fallback data contoh.",
  },
  {
    item: "Permintaan jaringan eksternal",
    sev: "Sedang",
    status: "AMAN",
    note: "Aplikasi 100% client-side tanpa fetch/API call — tidak ada vektor kebocoran data keluar.",
  },
  {
    item: "Rantai pasok dependensi",
    sev: "Sedang",
    status: "AMAN",
    note: "Hanya dependensi React + Vite + Tailwind; npm audit melaporkan 0 kerentanan saat build produksi.",
  },
  {
    item: "Penanganan error & state korup",
    sev: "Sedang",
    status: "AMAN",
    note: "JSON.parse dibungkus try/catch; data tak valid tidak memutus render dan dikembalikan ke fallback aman.",
  },
  {
    item: "Transport & hosting (HTTPS)",
    sev: "Sedang",
    status: "AMAN",
    note: "Deploy Vercel memaksa HTTPS + HSTS otomatis; tidak ada aset HTTP campuran.",
  },
  {
    item: "Batas volume data (DoS ringan)",
    sev: "Rendah",
    status: "CATATAN",
    note: "Rekomendasi: batasi jumlah baris recording (mis. ≤ 120 hari) sebelum menulis ke localStorage untuk mencegah kuota penuh.",
  },
  {
    item: "Cadangan data",
    sev: "Rendah",
    status: "CATATAN",
    note: "Rekomendasi: ingatkan pengguna melakukan ekspor CSV berkala karena data tersimpan hanya di perangkat.",
  },
];
