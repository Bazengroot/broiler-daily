import type {
  Alert,
  DailyRecord,
  DayRow,
  FlockInfo,
} from "./types";

/* ===== Tabel standar bobot badan Cobb 500 (mixed sex), hari 1-42, gram ===== */
export const STD_WEIGHT = [
  45, 56, 70, 87, 108, 134, 166, 203, 245, 291, 341, 395, 452, 513, 577, 644,
  714, 788, 865, 944, 1026, 1111, 1198, 1287, 1378, 1471, 1566, 1662, 1760,
  1859, 1960, 2062, 2165, 2270, 2375, 2481, 2588, 2695, 2803, 2911, 3020, 3128,
];

export function stdWeight(day: number): number {
  if (day <= 0) return 0;
  if (day <= STD_WEIGHT.length) return STD_WEIGHT[day - 1];
  return STD_WEIGHT[STD_WEIGHT.length - 1] + (day - STD_WEIGHT.length) * 108;
}

/* ===== Kurva standar FCR ===== */
const FCR_PTS: [number, number][] = [
  [1, 0.85],
  [7, 0.97],
  [14, 1.22],
  [21, 1.42],
  [28, 1.58],
  [35, 1.72],
  [42, 1.85],
];

export function fcrStd(day: number): number {
  if (day <= FCR_PTS[0][0]) return FCR_PTS[0][1];
  for (let i = 1; i < FCR_PTS.length; i++) {
    const [d1, v1] = FCR_PTS[i - 1];
    const [d2, v2] = FCR_PTS[i];
    if (day <= d2) return v1 + ((v2 - v1) * (day - d1)) / (d2 - d1);
  }
  return FCR_PTS[FCR_PTS.length - 1][1];
}

/* ===== Util acak deterministik (untuk data contoh) ===== */
export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ===== Format angka locale Indonesia ===== */
export const n0 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
export const n1 = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
export const n2 = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const fmtRp = (v: number) => "Rp " + n0.format(Math.round(v));
const compactRp = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});
export const fmtRpC = (v: number) => "Rp " + compactRp.format(v);

/* ===== Tanggal ===== */
export function dateFor(iso: string, day: number): Date {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + day - 1);
  return d;
}
export const dateShort = (iso: string, day: number) =>
  dateFor(iso, day).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
export const dateLong = (iso: string, day: number) =>
  dateFor(iso, day).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export const backDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

/* ===== Data awal ===== */
export const DEFAULT_FLOCK: FlockInfo = {
  farm: "PT Sinar Unggas Sejahtera",
  house: "Closed House A-01",
  breed: "Cobb 500",
  houseType: "Closed House",
  operator: "Budi Hartono",
  chickInDate: backDate(17),
  docCount: 10000,
  initialWeight: 39,
  docPrice: 7500,
  feedPriceStarter: 9200,
  feedPriceFinisher: 8800,
  livePrice: 21500,
  targetDay: 32,
};

export function generateSeedRecords(docCount: number): DailyRecord[] {
  const rnd = mulberry32(20260214);
  const rows: DailyRecord[] = [];
  let birds = docCount;
  const notes: Record<number, string> = {
    1: "Chick-in tiba, kondisi DOC seragam & aktif",
    5: "Mortalitas naik — periksa suhu brooding & liter",
    14: "Transisi pakan starter ke finisher",
    18: "Sampling bobot mingguan, keseragaman baik",
  };
  for (let d = 1; d <= 18; d++) {
    const std = stdWeight(d);
    const avgWeight = Math.round(std * (1.045 + rnd() * 0.035));
    const perBird = 11 + 5.0 * d; // g pakan/ekor/hari
    const intakeKg = Math.round((birds * perBird * (0.97 + rnd() * 0.06)) / 1000);
    const feedLeft = 20 + Math.round(rnd() * 45);
    const water = Math.round(intakeKg * (1.72 + rnd() * 0.3));
    let mortality = Math.round((d <= 7 ? 11 : 5) * rnd());
    if (d === 5) mortality += 26 + Math.round(rnd() * 8);
    const culling = rnd() < 0.22 ? 1 + Math.round(rnd() * 2) : 0;
    birds = Math.max(0, birds - mortality - culling);
    const tempMax = Math.round((33.5 - d * 0.42 + rnd() * 1.4) * 10) / 10;
    const tempMin = Math.round((tempMax - 5.5 - rnd() * 1.5) * 10) / 10;
    const humidity = Math.round(62 + rnd() * 13);
    rows.push({
      day: d,
      mortality,
      culling,
      feedGiven: intakeKg + feedLeft,
      feedLeft,
      water,
      avgWeight,
      tempMin,
      tempMax,
      humidity,
      harvestCount: 0,
      harvestKg: 0,
      note: notes[d] ?? "",
    });
  }
  return rows;
}

/* ===== Mesin kalkulasi performa ===== */
export function computeRows(f: FlockInfo, recs: DailyRecord[]): DayRow[] {
  const sorted = [...recs].sort((a, b) => a.day - b.day);
  let birds = f.docCount;
  let cumFeed = 0;
  let cumWater = 0;
  let cumMort = 0;
  let cumCull = 0;
  let cumHarvKg = 0;
  let cumHarvCt = 0;
  let feedCost = 0;

  return sorted.map((r) => {
    const feedIntake = Math.max(0, r.feedGiven - r.feedLeft);
    const price = r.day <= 14 ? f.feedPriceStarter : f.feedPriceFinisher;
    feedCost += feedIntake * price;
    cumFeed += feedIntake;
    cumWater += r.water;

    const birdsStart = birds;
    const deplesiPct =
      birdsStart > 0 ? ((r.mortality + r.culling) / birdsStart) * 100 : 0;
    cumMort += r.mortality;
    cumCull += r.culling;
    birds = Math.max(0, birds - r.mortality - r.culling - r.harvestCount);
    cumHarvKg += r.harvestKg;
    cumHarvCt += r.harvestCount;

    const liveKg = (birds * r.avgWeight) / 1000;
    const deadKg = ((cumMort + cumCull) * r.avgWeight) / 1000;
    const producedKg = liveKg + cumHarvKg + deadKg;
    const fcr = producedKg > 0 ? cumFeed / producedKg : 0;
    const mortCumPct =
      f.docCount > 0 ? ((cumMort + cumCull) / f.docCount) * 100 : 0;
    const ip =
      fcr > 0 && r.day > 0
        ? (((100 - mortCumPct) * (r.avgWeight / 1000)) / (fcr * r.day)) * 100
        : 0;

    const std = stdWeight(r.day);
    const docCost = f.docCount * f.docPrice;
    const medicineCost = (birds + cumHarvCt) * 700;
    const opCost = (birds + cumHarvCt) * 1600;
    const totalCost = feedCost + docCost + medicineCost + opCost;

    return {
      ...r,
      date: dateShort(f.chickInDate, r.day),
      birdsStart,
      birdsEnd: birds,
      deplesiPct,
      mortCumPct,
      cumMort: cumMort + cumCull,
      feedIntake,
      cumFeed,
      cumWater,
      stdWeight: std,
      pctStd: std > 0 ? (r.avgWeight / std) * 100 : 0,
      adg: r.day > 0 ? r.avgWeight / r.day : 0,
      fcr,
      fcrStd: fcrStd(r.day),
      ip,
      feedCost,
      docCost,
      medicineCost,
      opCost,
      totalCost,
      hpp: producedKg > 0 ? totalCost / producedKg : 0,
      liveKg,
      producedKg,
    };
  });
}

/* ===== Grade Indeks Prestasi ===== */
export function gradeIP(ip: number): {
  label: string;
  tone: "good" | "info" | "warn" | "danger";
  color: string;
} {
  if (ip >= 400) return { label: "Istimewa", tone: "good", color: "#0B9E63" };
  if (ip >= 350) return { label: "Baik", tone: "info", color: "#1A53D0" };
  if (ip >= 300) return { label: "Cukup", tone: "warn", color: "#D97706" };
  return { label: "Kurang", tone: "danger", color: "#D93636" };
}

/* ===== Mesin peringatan ===== */
export function buildAlerts(rows: DayRow[]): Alert[] {
  const out: Alert[] = [];
  const last = rows[rows.length - 1];
  if (!last)
    return [
      {
        level: "watch",
        title: "Belum ada recording",
        detail: "Isi recording harian untuk melihat analisis performa flock.",
      },
    ];

  const worst = rows.reduce((a, b) => (b.deplesiPct > a.deplesiPct ? b : a), rows[0]);
  if (worst.deplesiPct >= 0.3)
    out.push({
      level: worst.deplesiPct >= 0.5 ? "danger" : "watch",
      title: `Deplesi ${n2.format(worst.deplesiPct)}% pada hari ke-${worst.day}`,
      detail:
        "Periksa manajemen brooding, ventilasi, kualitas liter, dan akses air minum.",
    });

  if (last.day > 14 && last.tempMax > 30)
    out.push({
      level: "watch",
      title: `Suhu maksimum ${n1.format(last.tempMax)}°C`,
      detail:
        "Di atas zona nyaman (>30°C). Aktifkan tunnel fan dan periksa cooling pad.",
    });

  if (last.fcr > last.fcrStd + 0.05)
    out.push({
      level: "watch",
      title: `FCR ${n2.format(last.fcr)} di atas standar`,
      detail: `Standar hari ke-${last.day}: ${n2.format(last.fcrStd)}. Audit wastage pakan dan kesehatan usus.`,
    });
  else
    out.push({
      level: "ok",
      title: `FCR ${n2.format(last.fcr)} di bawah standar`,
      detail: `Standar hari ke-${last.day}: ${n2.format(last.fcrStd)}. Efisiensi pakan sangat baik.`,
    });

  if (last.pctStd >= 100)
    out.push({
      level: "ok",
      title: `Bobot ${n0.format(last.pctStd)}% dari standar`,
      detail: `BB ${n0.format(last.avgWeight)} g vs standar ${n0.format(last.stdWeight)} g.`,
    });
  else if (last.pctStd < 95)
    out.push({
      level: "watch",
      title: `Bobot ${n0.format(last.pctStd)}% dari standar`,
      detail: "Di bawah 95% standar — evaluasi densitas, nutrisi, dan kenyamanan.",
    });

  if (last.humidity > 75)
    out.push({
      level: "watch",
      title: `Kelembapan ${last.humidity}%`,
      detail: "RH di atas 75% — perbaiki ventilasi untuk mencegah liter basah.",
    });

  if (out.length === 0)
    out.push({
      level: "ok",
      title: "Semua parameter dalam batas normal",
      detail: "Pertahankan program pakan, vaksin, dan biosekuriti.",
    });

  return out.slice(0, 5);
}

/* ===== Proyeksi panen ===== */
export interface Projection {
  day: number;
  weight: number; // g
  fcr: number;
  ip: number;
  tonnage: number; // ton
  revenue: number; // Rp
  hpp: number; // Rp/kg
}

export function projectHarvest(rows: DayRow[], f: FlockInfo): Projection[] {
  const last = rows[rows.length - 1];
  if (!last) return [];
  return [28, 30, 32, 35]
    .filter((d) => d > last.day)
    .map((d) => {
      const weight = Math.round(stdWeight(d) * (last.pctStd / 100));
      const fcr =
        fcrStd(d) * (last.fcrStd > 0 ? last.fcr / last.fcrStd : 1);
      const ip =
        fcr > 0
          ? (((100 - last.mortCumPct) * (weight / 1000)) / (fcr * d)) * 100
          : 0;
      const tonnage = (last.birdsEnd * weight) / 1000 / 1000;
      const revenue = last.birdsEnd * (weight / 1000) * f.livePrice;
      const hpp =
        fcr * f.feedPriceFinisher +
        f.docPrice / (weight / 1000) +
        1800;
      return { day: d, weight, fcr, ip, tonnage, revenue, hpp };
    });
}

/* ===== Ekspor CSV ===== */
export function rowsToCSV(rows: DayRow[], f: FlockInfo): string {
  const head = [
    "Hari",
    "Tanggal",
    "Populasi",
    "Mortalitas",
    "Culling",
    "Deplesi(%)",
    "PakanDiberikan(kg)",
    "SisaPakan(kg)",
    "KonsumsiPakan(kg)",
    "Air(L)",
    "BB(g)",
    "StandarBB(g)",
    "ADG(g)",
    "FCR",
    "FCRStd",
    "IP",
    "DeplesiKum(%)",
    "SuhuMin",
    "SuhuMax",
    "RH(%)",
    "Panen(ekor)",
    "Panen(kg)",
    "Catatan",
  ];
  const lines = rows.map((r) =>
    [
      r.day,
      r.date,
      r.birdsEnd,
      r.mortality,
      r.culling,
      r.deplesiPct.toFixed(2),
      r.feedGiven,
      r.feedLeft,
      r.feedIntake,
      r.water,
      r.avgWeight,
      r.stdWeight,
      r.adg.toFixed(1),
      r.fcr.toFixed(2),
      r.fcrStd.toFixed(2),
      r.ip.toFixed(0),
      r.mortCumPct.toFixed(2),
      r.tempMin,
      r.tempMax,
      r.humidity,
      r.harvestCount,
      r.harvestKg,
      `"${(r.note ?? "").replace(/"/g, '""')}"`,
    ].join(";")
  );
  return [`Farm;${f.farm}`, `Kandang;${f.house}`, `Strain;${f.breed}`, head.join(";"), ...lines].join("\n");
}
