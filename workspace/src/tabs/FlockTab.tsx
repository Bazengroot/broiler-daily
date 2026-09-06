import { useState, type FormEvent } from "react";
import type { DayRow, FlockInfo } from "../types";
import { DEFAULT_FLOCK, STD_WEIGHT, backDate, fcrStd, fmtRp, n0, n2 } from "../lib";
import { Badge, Icon, Reveal, SectionTitle } from "../ui";

type Draft = Record<string, string>;

const NUM_FIELDS: { k: keyof FlockInfo; label: string; suffix: string }[] = [
  { k: "docCount", label: "Jumlah DOC", suffix: "ekor" },
  { k: "initialWeight", label: "Bobot Awal DOC", suffix: "g" },
  { k: "docPrice", label: "Harga DOC", suffix: "Rp/ekor" },
  { k: "feedPriceStarter", label: "Harga Pakan Starter", suffix: "Rp/kg" },
  { k: "feedPriceFinisher", label: "Harga Pakan Finisher", suffix: "Rp/kg" },
  { k: "livePrice", label: "Harga Jual Hidup", suffix: "Rp/kg" },
  { k: "targetDay", label: "Target Umur Panen", suffix: "hari" },
];

function toDraft(f: FlockInfo): Draft {
  return {
    farm: f.farm,
    house: f.house,
    breed: f.breed,
    houseType: f.houseType,
    operator: f.operator,
    chickInDate: f.chickInDate,
    docCount: String(f.docCount),
    initialWeight: String(f.initialWeight),
    docPrice: String(f.docPrice),
    feedPriceStarter: String(f.feedPriceStarter),
    feedPriceFinisher: String(f.feedPriceFinisher),
    livePrice: String(f.livePrice),
    targetDay: String(f.targetDay),
  };
}

export default function FlockTab({
  flock,
  rows,
  onSave,
  onReset,
  notify,
}: {
  flock: FlockInfo;
  rows: DayRow[];
  onSave: (f: FlockInfo) => void;
  onReset: () => void;
  notify: (m: string, k?: "ok" | "err") => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(flock));
  const [confirmReset, setConfirmReset] = useState(false);
  const curDay = rows.length ? rows[rows.length - 1].day : 0;

  const set = (k: string, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const docCount = Number(draft.docCount);
    if (!Number.isFinite(docCount) || docCount < 1) {
      notify("Jumlah DOC harus angka valid", "err");
      return;
    }
    onSave({
      farm: draft.farm.trim() || flock.farm,
      house: draft.house.trim() || flock.house,
      breed: draft.breed,
      houseType: draft.houseType,
      operator: draft.operator.trim() || flock.operator,
      chickInDate: draft.chickInDate || flock.chickInDate,
      docCount,
      initialWeight: Math.max(0, Number(draft.initialWeight) || 0),
      docPrice: Math.max(0, Number(draft.docPrice) || 0),
      feedPriceStarter: Math.max(0, Number(draft.feedPriceStarter) || 0),
      feedPriceFinisher: Math.max(0, Number(draft.feedPriceFinisher) || 0),
      livePrice: Math.max(0, Number(draft.livePrice) || 0),
      targetDay: Math.max(1, Math.round(Number(draft.targetDay) || 32)),
    });
    notify("Parameter flock diperbarui — seluruh kalkulasi terhitung ulang");
  };

  const doReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      window.setTimeout(() => setConfirmReset(false), 2800);
      return;
    }
    onReset();
    setDraft(toDraft({ ...DEFAULT_FLOCK, chickInDate: backDate(17) }));
    setConfirmReset(false);
  };

  return (
    <div>
      <SectionTitle
        title="Flock & Standar Produksi"
        sub="Parameter chick-in dan ekonomi — perubahan memicu kalkulasi ulang"
        right={
          <button onClick={doReset} className={confirmReset ? "btn-d" : "btn-g"}>
            <Icon name={confirmReset ? "alert" : "clock"} className="h-4 w-4" />
            {confirmReset ? "Klik lagi untuk konfirmasi" : "Reset Data Contoh"}
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-5">
        {/* ===== Form parameter ===== */}
        <Reveal className="lg:col-span-3">
          <form onSubmit={submit} className="card p-5" noValidate>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-cobalt-600/10 text-cobalt-700">
                <Icon name="bird" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-extrabold text-ink">
                  Parameter Chick-In
                </h3>
                <p className="text-xs font-medium text-mut">
                  Identitas flock, populasi awal, dan asumsi biaya
                </p>
              </div>
            </div>

            <div className="grid gap-x-3 gap-y-3.5 sm:grid-cols-2">
              <div>
                <label className="label">Nama Farm</label>
                <input className="input" value={draft.farm} onChange={(e) => set("farm", e.target.value)} />
              </div>
              <div>
                <label className="label">Kandang</label>
                <input className="input" value={draft.house} onChange={(e) => set("house", e.target.value)} />
              </div>
              <div>
                <label className="label">Strain</label>
                <select className="input" value={draft.breed} onChange={(e) => set("breed", e.target.value)}>
                  <option>Cobb 500</option>
                  <option>Ross 308</option>
                  <option>Hubbard</option>
                  <option>MB 202</option>
                </select>
              </div>
              <div>
                <label className="label">Tipe Kandang</label>
                <select className="input" value={draft.houseType} onChange={(e) => set("houseType", e.target.value)}>
                  <option>Closed House</option>
                  <option>Open House</option>
                  <option>Semi Closed</option>
                </select>
              </div>
              <div>
                <label className="label">Operator / Kepala Kandang</label>
                <input className="input" value={draft.operator} onChange={(e) => set("operator", e.target.value)} />
              </div>
              <div>
                <label className="label">Tanggal Chick-In</label>
                <input
                  type="date"
                  className="input"
                  value={draft.chickInDate}
                  onChange={(e) => set("chickInDate", e.target.value)}
                />
              </div>
            </div>

            <p className="label mt-5 mb-2 border-t border-line pt-4">Parameter Ekonomi & Populasi</p>
            <div className="grid gap-x-3 gap-y-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {NUM_FIELDS.map((f) => (
                <div key={f.k}>
                  <label className="label">{f.label}</label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      className="input pr-20"
                      value={draft[String(f.k)]}
                      onChange={(e) => set(String(f.k), e.target.value)}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold text-mut">
                      {f.suffix}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="font-mono text-[11px] text-mut">
                Umur saat ini: <b className="text-ink">hari ke-{curDay}</b> · sisa{" "}
                <b className="text-ink">{Math.max(0, flock.targetDay - curDay)} hari</b> ke target
              </p>
              <button type="submit" className="btn-p">
                <Icon name="check" className="h-4 w-4" /> Simpan Parameter
              </button>
            </div>
          </form>
        </Reveal>

        {/* ===== Ringkasan + standar ===== */}
        <div className="space-y-4 lg:col-span-2">
          <Reveal delay={80}>
            <div className="card bg-navy-900 p-5 text-white">
              <p className="font-mono text-[10px] tracking-[0.2em] text-cobalt-200">
                RINGKASAN FLOCK
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                {[
                  ["Populasi saat ini", `${n0.format(rows.length ? rows[rows.length - 1].birdsEnd : flock.docCount)} ekor`],
                  ["Nilai DOC terpasang", fmtRp(flock.docCount * flock.docPrice)],
                  ["Target bobot panen", `${n0.format(STD_WEIGHT[Math.min(flock.targetDay, 42) - 1])} g`],
                  ["Operator", flock.operator],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 last:border-0">
                    <dt className="text-cobalt-100/70">{k}</dt>
                    <dd className="font-mono font-semibold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <h3 className="font-display text-[15px] font-bold text-ink">
                  Standar {flock.breed}
                </h3>
                <Badge tone="info">Hari 1–35</Badge>
              </div>
              <div className="scroll-thin max-h-[340px] overflow-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 bg-mist/95 backdrop-blur">
                    <tr className="border-b border-line">
                      <th className="th">Hari</th>
                      <th className="th text-right">BB Std (g)</th>
                      <th className="th text-right">FCR Std</th>
                      <th className="th"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {STD_WEIGHT.slice(0, 35).map((w, i) => {
                      const d = i + 1;
                      const active = d === curDay;
                      return (
                        <tr
                          key={d}
                          className={`border-b border-line/60 transition ${active ? "bg-cobalt-600/10" : d % 2 === 0 ? "bg-mist/40" : "hover:bg-cobalt-50"}`}
                        >
                          <td className="td font-mono font-semibold text-ink">{d}</td>
                          <td className="td text-right font-mono tabular-nums">{n0.format(w)}</td>
                          <td className="td text-right font-mono tabular-nums text-mut">
                            {n2.format(fcrStd(d))}
                          </td>
                          <td className="td text-right">
                            {active && <Badge tone="info">POSISI</Badge>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
