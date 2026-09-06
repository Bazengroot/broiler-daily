/* ===== Model data produksi broiler ===== */

export interface FlockInfo {
  farm: string;
  house: string;
  breed: string;
  houseType: string;
  operator: string;
  chickInDate: string; // ISO yyyy-mm-dd
  docCount: number;
  initialWeight: number; // gram
  docPrice: number; // Rp / ekor DOC
  feedPriceStarter: number; // Rp / kg (hari 1-14)
  feedPriceFinisher: number; // Rp / kg (hari 15+)
  livePrice: number; // Rp / kg bobot hidup saat panen
  targetDay: number; // target umur panen
}

export interface DailyRecord {
  day: number;
  mortality: number; // ekor mati
  culling: number; // ekor afkir
  feedGiven: number; // kg pakan diberikan
  feedLeft: number; // kg sisa pakan
  water: number; // liter air minum
  avgWeight: number; // gram (sampling)
  tempMin: number; // °C
  tempMax: number; // °C
  humidity: number; // %
  harvestCount: number; // ekor panen/thinning
  harvestKg: number; // kg total panen
  note: string;
}

/** Baris harian yang sudah diperkaya kalkulasi performa */
export interface DayRow extends DailyRecord {
  date: string;
  birdsStart: number;
  birdsEnd: number;
  deplesiPct: number; // deplesi harian %
  mortCumPct: number; // deplesi kumulatif %
  cumMort: number; // akumulasi mortalitas + culling (ekor)
  feedIntake: number; // kg
  cumFeed: number; // kg
  cumWater: number; // L
  stdWeight: number; // g standar strain
  pctStd: number; // % terhadap standar
  adg: number; // g/ekor/hari
  fcr: number;
  fcrStd: number;
  ip: number; // indeks prestasi
  feedCost: number; // Rp kumulatif
  docCost: number;
  medicineCost: number;
  opCost: number;
  totalCost: number;
  hpp: number; // Rp / kg hidup (berjalan)
  liveKg: number;
  producedKg: number;
}

export interface HealthEntry {
  id: string;
  day: number;
  category: "Vaksin" | "Antibiotik" | "Vitamin" | "Sanitasi";
  product: string;
  dose: string;
  method: string;
  officer: string;
}

export interface Alert {
  level: "ok" | "watch" | "danger";
  title: string;
  detail: string;
}

export type TabId =
  | "dashboard"
  | "recording"
  | "flock"
  | "health"
  | "phases"
  | "audit";
