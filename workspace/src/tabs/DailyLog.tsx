import { useState, type FormEvent } from "react";
import type { DailyRecord, DayRow, FlockInfo } from "../types";
import { dateShort, n0, n1, n2, rowsToCSV } from "../lib";
import { Badge, Icon, Reveal, SectionTitle } from "../ui";

type FormState = Record<string, string>;

const NUM_KEYS = [
  "mortality",
  "culling",
  "feedGiven",
  "feedLeft",
  "water",
  "avgWeight",
  "tempMin",
  "tempMax",
  "humidity",
  "harvestCount",
  "harvestKg",
] as const;

const EMPTY: FormState = Object.fromEntries(
  [...NUM_KEYS, "note"].map((k) => [k, ""])
);

function Field({
  label,
  k,
  form,
  errors,
  set,
  placeholder,
  suffix,
}: {
  label: string;
  k: string;
  form: FormState;
  errors: Record<string, string>;
  set: (k: string, v: string) => void;
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={`f-${k}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={`f-${k}`}
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          className={`input pr-10 ${errors[k] ? "input-err" : ""}`}
          value={form[k] ?? ""}
          placeholder={placeholder ?? "0"}
          onChange={(e) => set(k, e.target.value)}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10.5px] font-semibold text-mut">
            {suffix}
          </span>
        )}
      </div>
      {errors[k] && (
        <p className="mt-1 text-[11px] font-semibold text-danger">{errors[k]}</p>
      )}
    </div>
  );
}

export default function DailyLog({
  flock,
  rows,
  onSave,
  onDelete,
  notify,
}: {
  flock: FlockInfo;
  rows: DayRow[];
  onSave: (r: DailyRecord) => void;
  onDelete: (day: number) => void;
  notify: (m: string, k?: "ok" | "err") => void;
}) {
  const nextDay = rows.length ? Math.max(...rows.map((r) => r.day)) + 1 : 1;
  const [form, setForm] = useState<FormState>({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editDay, setEditDay] = useState<number | null>(null);
  const [confirmDel, setConfirmDel] = useState<number | null>(null);
  const day = editDay ?? nextDay;

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      if (!e[k]) return e;
      const nx = { ...e };
      delete nx[k];
      return nx;
    });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    const num: Record<string, number> = {};
    for (const k of NUM_KEYS) {
      const raw = (form[k] ?? "").trim();
      if (raw === "") {
        errs[k] = "Wajib diisi";
        continue;
      }
      const v = Number(raw);
      if (!Number.isFinite(v) || v < 0) {
        errs[k] = "Harus angka ≥ 0";
        continue;
      }
      num[k] = v;
    }
    if (!errs.avgWeight && num.avgWeight <= 0) errs.avgWeight = "BB sampling harus > 0";
    if (!errs.feedGiven && !errs.feedLeft && num.feedGiven < num.feedLeft)
      errs.feedLeft = "Sisa tidak boleh melebihi pakan diberi";
    if (!errs.tempMin && (num.tempMin < 10 || num.tempMin > 45))
      errs.tempMin = "Rentang 10–45°C";
    if (!errs.tempMax && (num.tempMax < 10 || num.tempMax > 45))
      errs.tempMax = "Rentang 10–45°C";
    if (!errs.tempMin && !errs.tempMax && num.tempMax < num.tempMin)
      errs.tempMax = "Suhu maks < suhu min";
    if (!errs.humidity && (num.humidity < 20 || num.humidity > 100))
      errs.humidity = "Rentang 20–100%";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      notify("Periksa kembali isian yang ditandai merah", "err");
      return;
    }

    onSave({
      day,
      mortality: Math.round(num.mortality),
      culling: Math.round(num.culling),
      feedGiven: num.feedGiven,
      feedLeft: num.feedLeft,
      water: num.water,
      avgWeight: Math.round(num.avgWeight),
      tempMin: num.tempMin,
      tempMax: num.tempMax,
      humidity: Math.round(num.humidity),
      harvestCount: Math.round(num.harvestCount),
      harvestKg: num.harvestKg,
      note: (form.note ?? "").trim(),
    });
    const wasEdit = editDay !== null;
    setForm({ ...EMPTY });
    setEditDay(null);
    setErrors({});
    notify(
      wasEdit
        ? `Recording hari ke-${day} diperbarui`
        : `Recording hari ke-${day} tersimpan`
    );
  };

  const startEdit = (r: DayRow) => {
    setEditDay(r.day);
    setErrors({});
    setForm({
      mortality: String(r.mortality),
      culling: String(r.culling),
      feedGiven: String(r.feedGiven),
      feedLeft: String(r.feedLeft),
      water: String(r.water),
      avgWeight: String(r.avgWeight),
      tempMin: String(r.tempMin),
      tempMax: String(r.tempMax),
      humidity: String(r.humidity),
      harvestCount: String(r.harvestCount),
      harvestKg: String(r.harvestKg),
      note: r.note,
    });
    document
      .getElementById("recording-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const askDelete = (d: number) => {
    if (confirmDel === d) {
      onDelete(d);
      setConfirmDel(null);
      if (editDay === d) {
        setEditDay(null);
        setForm({ ...EMPTY });
      }
      notify(`Recording hari ke-${d} dihapus`);
      return;
    }
    setConfirmDel(d);
    window.setTimeout(() => setConfirmDel((c) => (c === d ? null : c)), 2600);
  };

  const exportCSV = () => {
    const csv = rowsToCSV(rows, flock);
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recording-${flock.house.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify("File CSV berhasil diunduh");
  };

  const dotTone = (r: DayRow) =>
    r.deplesiPct >= 0.5 ? "bg-danger" : r.deplesiPct >= 0.25 ? "bg-warn" : "bg-good";

  return (
    <div>
      <SectionTitle
        title="Recording Harian"
        sub="Catat seluruh parameter produksi — performa terhitung otomatis"
        right={
          <button onClick={exportCSV} className="btn-g">
            <Icon name="download" className="h-4 w-4" /> Ekspor CSV
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[400px_1fr]">
        {/* ===== Form ===== */}
        <Reveal>
          <form
            id="recording-form"
            onSubmit={submit}
            className="card sticky top-20 self-start p-5"
            noValidate
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-extrabold text-ink">
                  {editDay !== null ? `Edit Hari ke-${day}` : `Input Hari ke-${day}`}
                </h3>
                <p className="text-xs font-medium text-mut">
                  {dateShort(flock.chickInDate, day)} · {flock.house}
                </p>
              </div>
              {editDay !== null ? (
                <Badge tone="warn">MODE EDIT</Badge>
              ) : (
                <Badge tone="info">BARU</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-3.5">
              <Field label="Mortalitas" k="mortality" suffix="ekor" form={form} errors={errors} set={set} />
              <Field label="Culling/Afkir" k="culling" suffix="ekor" form={form} errors={errors} set={set} />
              <Field label="Pakan Diberikan" k="feedGiven" suffix="kg" form={form} errors={errors} set={set} />
              <Field label="Sisa Pakan" k="feedLeft" suffix="kg" form={form} errors={errors} set={set} />
              <Field label="Air Minum" k="water" suffix="L" form={form} errors={errors} set={set} />
              <Field label="BB Sampling" k="avgWeight" suffix="g" form={form} errors={errors} set={set} />
              <Field label="Suhu Minimum" k="tempMin" suffix="°C" form={form} errors={errors} set={set} />
              <Field label="Suhu Maksimum" k="tempMax" suffix="°C" form={form} errors={errors} set={set} />
              <Field label="Kelembapan (RH)" k="humidity" suffix="%" form={form} errors={errors} set={set} />
              <Field label="Panen/Thinning" k="harvestCount" suffix="ekor" form={form} errors={errors} set={set} />
              <Field label="Bobot Panen" k="harvestKg" suffix="kg" form={form} errors={errors} set={set} />
            </div>

            <div className="mt-3.5">
              <label className="label" htmlFor="f-note">Catatan</label>
              <textarea
                id="f-note"
                rows={2}
                className="input resize-none"
                placeholder="Vaksinasi, perlakuan, kondisi flock…"
                value={form.note ?? ""}
                onChange={(e) => set("note", e.target.value)}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-p flex-1">
                <Icon name={editDay !== null ? "edit" : "plus"} className="h-4 w-4" />
                {editDay !== null ? "Simpan Perubahan" : "Simpan Recording"}
              </button>
              {editDay !== null && (
                <button
                  type="button"
                  className="btn-g"
                  onClick={() => {
                    setEditDay(null);
                    setForm({ ...EMPTY });
                    setErrors({});
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </Reveal>

        {/* ===== Tabel ===== */}
        <Reveal delay={100}>
          <div className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
              <h3 className="font-display text-[15px] font-bold text-ink">
                Log Produksi ({rows.length} hari)
              </h3>
              <div className="flex items-center gap-3 font-mono text-[10.5px] font-semibold text-mut">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-good" /> normal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-warn" /> waspada
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-danger" /> tinggi
                </span>
              </div>
            </div>
            <div className="scroll-thin max-h-[620px] overflow-auto">
              <table className="w-full min-w-[1020px] border-collapse">
                <thead className="sticky top-0 z-10 bg-mist/95 backdrop-blur">
                  <tr className="border-b border-line">
                    <th className="th">Hari</th>
                    <th className="th">Tgl</th>
                    <th className="th text-right">Populasi</th>
                    <th className="th text-right">Mort+Cull</th>
                    <th className="th text-right">Deplesi%</th>
                    <th className="th text-right">Konsumsi (kg)</th>
                    <th className="th text-right">Air (L)</th>
                    <th className="th text-right">BB (g)</th>
                    <th className="th text-right">ADG</th>
                    <th className="th text-right">FCR</th>
                    <th className="th">Suhu</th>
                    <th className="th">RH</th>
                    <th className="th text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rows].reverse().map((r) => (
                    <tr
                      key={r.day}
                      className={`group border-b border-line/70 transition hover:bg-cobalt-50/70 ${editDay === r.day ? "bg-cobalt-50" : r.day % 2 === 0 ? "bg-mist/40" : ""}`}
                      title={r.note || undefined}
                    >
                      <td className="td font-mono font-semibold text-ink">
                        <span
                          className={`mr-2 inline-block h-2 w-2 rounded-full ${dotTone(r)}`}
                        />
                        {r.day}
                      </td>
                      <td className="td font-mono text-xs text-mut">{r.date}</td>
                      <td className="td text-right font-mono tabular-nums">{n0.format(r.birdsEnd)}</td>
                      <td className="td text-right font-mono tabular-nums">
                        {r.mortality + r.culling}
                      </td>
                      <td className="td text-right font-mono tabular-nums">
                        {n2.format(r.deplesiPct)}
                      </td>
                      <td className="td text-right font-mono tabular-nums">{n0.format(r.feedIntake)}</td>
                      <td className="td text-right font-mono tabular-nums">{n0.format(r.water)}</td>
                      <td className="td text-right font-mono font-semibold tabular-nums text-cobalt-700">
                        {n0.format(r.avgWeight)}
                      </td>
                      <td className="td text-right font-mono tabular-nums">{n1.format(r.adg)}</td>
                      <td
                        className={`td text-right font-mono font-semibold tabular-nums ${r.fcr <= r.fcrStd ? "text-good" : "text-danger"}`}
                      >
                        {n2.format(r.fcr)}
                      </td>
                      <td className="td font-mono text-xs tabular-nums text-mut">
                        {n1.format(r.tempMin)}–{n1.format(r.tempMax)}°
                      </td>
                      <td className="td font-mono text-xs tabular-nums text-mut">{r.humidity}%</td>
                      <td className="td text-right">
                        <div className="flex justify-end gap-1 opacity-100 transition focus-within:opacity-100 lg:opacity-0 lg:group-hover:opacity-100">
                          <button
                            onClick={() => startEdit(r)}
                            className="rounded-md p-1.5 text-cobalt-700 transition hover:bg-cobalt-600 hover:text-white"
                            title="Edit"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                          {confirmDel === r.day ? (
                            <button
                              onClick={() => askDelete(r.day)}
                              className="rounded-md bg-danger px-2 py-1 text-[10.5px] font-bold text-white"
                            >
                              Yakin?
                            </button>
                          ) : (
                            <button
                              onClick={() => askDelete(r.day)}
                              className="rounded-md p-1.5 text-mut transition hover:bg-danger hover:text-white"
                              title="Hapus"
                            >
                              <Icon name="trash" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
