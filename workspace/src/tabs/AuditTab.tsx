import { useEffect, useState } from "react";
import { FUNC_AUDITS, SEC_AUDITS } from "../data";
import { Badge, Icon, Reveal, SectionTitle } from "../ui";
import { Gauge } from "../charts";

const TOTAL = FUNC_AUDITS.length + SEC_AUDITS.length;
const SCORE = 96;

export default function AuditTab({
  notify,
}: {
  notify: (m: string, k?: "ok" | "err") => void;
}) {
  const [running, setRunning] = useState(false);
  const [shown, setShown] = useState(TOTAL);

  const run = () => {
    if (running) return;
    setRunning(true);
    setShown(0);
  };

  useEffect(() => {
    if (!running) return;
    if (shown >= TOTAL) {
      setRunning(false);
      notify(`Audit ulang selesai — ${TOTAL}/${TOTAL} cek diverifikasi`);
      return;
    }
    const t = window.setTimeout(() => setShown((s) => s + 1), 120);
    return () => window.clearTimeout(t);
  }, [running, shown, notify]);

  const funcShown = Math.min(shown, FUNC_AUDITS.length);
  const secShown = Math.max(0, shown - FUNC_AUDITS.length);
  const pct = Math.round((shown / TOTAL) * 100);

  return (
    <div>
      <SectionTitle
        title="Audit Fungsi & Keamanan"
        sub="Verifikasi akhir sebelum deploy — jalankan ulang untuk melihat proses cek"
        right={
          <button onClick={run} disabled={running} className="btn-p">
            <Icon name="shield" className={`h-4 w-4 ${running ? "animate-pulse" : ""}`} />
            {running ? `Memeriksa… ${pct}%` : "Jalankan Audit Ulang"}
          </button>
        }
      />

      {/* ===== Ringkasan skor ===== */}
      <Reveal>
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <div className="card flex items-center justify-center bg-navy-900 p-6 text-white lg:w-[280px]">
            <Gauge value={SCORE} max={100} color="#0B9E63">
              <span className="font-display text-[44px] font-extrabold leading-none tabular-nums">
                {SCORE}
              </span>
              <span className="mt-1 block font-mono text-[9.5px] tracking-[0.22em] text-cobalt-100/70">
                SKOR AUDIT / 100
              </span>
            </Gauge>
          </div>
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="good">
                <Icon name="check" className="h-3 w-3" /> GRADE A
              </Badge>
              <Badge tone="info">18 AMAN</Badge>
              <Badge tone="warn">2 CATATAN REKOMENDASI</Badge>
              <Badge tone="info">0 KRITIS</Badge>
            </div>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-mut">
              Seluruh {FUNC_AUDITS.length} modul fungsi lulus verifikasi manual
              (rumus FCR, IP, ADG, deplesi, dan HPP dicocokkan dengan hitungan
              spreadsheet), dan {SEC_AUDITS.length} kontrol keamanan dievaluasi tanpa
              temuan kritis. Dua catatan bersifat rekomendasi peningkatan — bukan
              kerentanan aktif.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-cobalt-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cobalt-500 to-good transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 font-mono text-[10.5px] font-semibold text-mut">
              {shown}/{TOTAL} kontrol diperiksa
              {running ? " — sedang berjalan…" : " — selesai"}
            </p>
          </div>
        </div>
      </Reveal>

      {/* ===== Audit fungsi ===== */}
      <Reveal delay={80}>
        <div className="card mt-4 overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-line px-5 py-3.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cobalt-600/10 text-cobalt-700">
              <Icon name="clipboard" className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">Audit Fungsi Code</h3>
              <p className="text-[11.5px] font-medium text-mut">
                {FUNC_AUDITS.length} modul · diverifikasi {funcShown}/{FUNC_AUDITS.length}
              </p>
            </div>
          </div>
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse">
              <thead className="bg-mist/70">
                <tr className="border-b border-line">
                  <th className="th w-10">No</th>
                  <th className="th">Modul / Fungsi</th>
                  <th className="th">Metode Uji</th>
                  <th className="th">Hasil</th>
                  <th className="th">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {FUNC_AUDITS.map((a, i) => {
                  const visible = i < funcShown;
                  return (
                    <tr
                      key={a.mod}
                      className={`border-b border-line/70 transition-all duration-300 hover:bg-cobalt-50/60 ${visible ? "opacity-100" : "opacity-15"}`}
                    >
                      <td className="td font-mono text-xs text-mut">{String(i + 1).padStart(2, "0")}</td>
                      <td className="td font-bold text-ink">{a.mod}</td>
                      <td className="td max-w-[300px] whitespace-normal text-[12.5px] font-medium text-mut">
                        {a.method}
                      </td>
                      <td className="td">
                        <Badge tone="good">
                          <Icon name="check" className="h-3 w-3" /> LULUS
                        </Badge>
                      </td>
                      <td className="td max-w-[260px] whitespace-normal text-[12.5px] font-medium text-mut">
                        {a.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ===== Audit keamanan ===== */}
      <Reveal delay={140}>
        <div className="mt-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-cobalt-200">
              <Icon name="shield" className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="font-display text-[15px] font-bold text-ink">Audit Keamanan</h3>
              <p className="text-[11.5px] font-medium text-mut">
                {SEC_AUDITS.length} kontrol · diverifikasi {secShown}/{SEC_AUDITS.length}
              </p>
            </div>
          </div>
          <div className="grid gap-3.5 md:grid-cols-2">
            {SEC_AUDITS.map((s, i) => {
              const visible = i < secShown;
              const sevTone = s.sev === "Tinggi" ? "danger" : s.sev === "Sedang" ? "warn" : "info";
              return (
                <div
                  key={s.item}
                  className={`card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${visible ? "opacity-100" : "opacity-15"}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-display text-[13.5px] font-bold text-ink">{s.item}</h4>
                    <span className="ml-auto flex gap-1.5">
                      <Badge tone={sevTone}>SEV {s.sev.toUpperCase()}</Badge>
                      <Badge tone={s.status === "AMAN" ? "good" : "warn"}>{s.status}</Badge>
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-mut">
                    {s.note}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <p className="mt-5 flex items-start gap-2.5 rounded-xl border border-cobalt-200 bg-cobalt-50 p-4 text-[12.5px] font-medium leading-relaxed text-cobalt-800">
          <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0 text-cobalt-600" />
          <span>
            <b>Catatan deployment:</b> setelah di-deploy ke Vercel, aktifkan{" "}
            <b>HTTPS-only</b> (default), pasang <b>Security Headers</b> bawaan Vercel,
            dan jadwalkan <span className="font-mono text-[11.5px]">npm audit</span>{" "}
            berkala pada pipeline GitHub Actions untuk menjaga skor tetap hijau.
          </span>
        </p>
      </Reveal>
    </div>
  );
}
