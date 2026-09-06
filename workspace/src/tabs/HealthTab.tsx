import { useState, type FormEvent } from "react";
import type { HealthEntry } from "../types";
import { Icon, Reveal, SectionTitle } from "../ui";

const CATS: Record<
  HealthEntry["category"],
  { color: string; icon: string; chip: string }
> = {
  Vaksin: { color: "#1A53D0", icon: "shield", chip: "bg-cobalt-600/10 text-cobalt-700" },
  Antibiotik: { color: "#D93636", icon: "pill", chip: "bg-danger/10 text-danger" },
  Vitamin: { color: "#0B9E63", icon: "drop", chip: "bg-good/10 text-good" },
  Sanitasi: { color: "#D97706", icon: "sparkle", chip: "bg-warn/10 text-warn" },
};

export default function HealthTab({
  health,
  curDay,
  onAdd,
  onDelete,
  notify,
}: {
  health: HealthEntry[];
  curDay: number;
  onAdd: (h: HealthEntry) => void;
  onDelete: (id: string) => void;
  notify: (m: string, k?: "ok" | "err") => void;
}) {
  const [form, setForm] = useState({
    day: String(curDay + 1),
    category: "Vaksin" as HealthEntry["category"],
    product: "",
    dose: "",
    method: "Air minum",
    officer: "",
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const day = Math.round(Number(form.day));
    if (!Number.isFinite(day) || day < 1) {
      notify("Hari harus angka valid", "err");
      return;
    }
    if (!form.product.trim()) {
      notify("Nama produk/program wajib diisi", "err");
      return;
    }
    onAdd({
      id: `h${Date.now()}`,
      day,
      category: form.category,
      product: form.product.trim(),
      dose: form.dose.trim() || "-",
      method: form.method,
      officer: form.officer.trim() || "-",
    });
    setForm((f) => ({ ...f, product: "", dose: "", officer: "" }));
    notify(`Program ${form.category} hari ke-${day} ditambahkan`);
  };

  const sorted = [...health].sort((a, b) => b.day - a.day);

  return (
    <div>
      <SectionTitle
        title="Kesehatan, Vaksinasi & Biosekuriti"
        sub="Timeline program kesehatan flock — kunci deplesi rendah"
      />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        {/* ===== Form ===== */}
        <Reveal>
          <form onSubmit={submit} className="card sticky top-20 self-start p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-cobalt-600/10 text-cobalt-700">
                <Icon name="pill" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-extrabold text-ink">
                  Tambah Program
                </h3>
                <p className="text-xs font-medium text-mut">Vaksin, obat, vitamin, sanitasi</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Hari ke-</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Kategori</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as HealthEntry["category"],
                    }))
                  }
                >
                  {Object.keys(CATS).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Produk / Program</label>
                <input
                  className="input"
                  placeholder="cth. ND-IB (Ma5 + Clone 30)"
                  value={form.product}
                  onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Dosis</label>
                <input
                  className="input"
                  placeholder="1 dosis/ekor"
                  value={form.dose}
                  onChange={(e) => setForm((f) => ({ ...f, dose: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Metode</label>
                <select
                  className="input"
                  value={form.method}
                  onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                >
                  <option>Air minum</option>
                  <option>Spray kasar</option>
                  <option>Spray halus</option>
                  <option>Tetes mata</option>
                  <option>Suntik</option>
                  <option>Spray kandang</option>
                  <option>Campur pakan</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Petugas</label>
                <input
                  className="input"
                  placeholder="Nama pelaksana"
                  value={form.officer}
                  onChange={(e) => setForm((f) => ({ ...f, officer: e.target.value }))}
                />
              </div>
            </div>

            <button type="submit" className="btn-p mt-4 w-full">
              <Icon name="plus" className="h-4 w-4" /> Simpan Program
            </button>
          </form>
        </Reveal>

        {/* ===== Timeline ===== */}
        <Reveal delay={100}>
          <div className="card p-5">
            <h3 className="mb-4 font-display text-[15px] font-bold text-ink">
              Timeline Program ({sorted.length})
            </h3>
            {sorted.length === 0 && (
              <p className="py-8 text-center text-sm text-mut">
                Belum ada program kesehatan tercatat.
              </p>
            )}
            <ol className="relative ml-3 space-y-3 border-l-2 border-line pl-6">
              {sorted.map((h) => {
                const c = CATS[h.category];
                return (
                  <li
                    key={h.id}
                    className="group relative rounded-lg border border-line bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-cobalt-300 hover:shadow-md"
                  >
                    <span
                      className="absolute -left-[31px] top-4 grid h-5 w-5 place-items-center rounded-full border-2 border-paper"
                      style={{ background: c.color }}
                    >
                      <Icon name={c.icon} className="h-3 w-3 text-white" />
                    </span>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`chip ${c.chip}`}>{h.category.toUpperCase()}</span>
                          <span className="font-mono text-[11px] font-semibold text-mut">
                            HARI KE-{h.day}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm font-bold text-ink">{h.product}</p>
                        <p className="mt-0.5 text-xs font-medium text-mut">
                          {h.dose} · {h.method} · {h.officer}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onDelete(h.id);
                          notify(`Program ${h.product} dihapus`);
                        }}
                        className="rounded-md p-1.5 text-mut opacity-100 transition hover:bg-danger hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                        title="Hapus"
                      >
                        <Icon name="trash" className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
            {sorted.length > 0 && (
              <p className="mt-4 flex items-center gap-2 rounded-lg bg-cobalt-50 px-3 py-2.5 text-xs font-semibold text-cobalt-700">
                <Icon name="shield" className="h-4 w-4 shrink-0" />
                Program vaksin mengikuti jadwal standar {`Cobb 500`} — sesuaikan dengan
                rekomendasi dokter hewan mitra.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
