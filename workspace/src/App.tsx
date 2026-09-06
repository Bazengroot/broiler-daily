import { useEffect, useMemo, useState } from "react";
import type { DailyRecord, FlockInfo, HealthEntry, TabId } from "./types";
import {
  DEFAULT_FLOCK,
  backDate,
  buildAlerts,
  computeRows,
  generateSeedRecords,
  n0,
} from "./lib";
import { SEED_HEALTH } from "./data";
import { Icon } from "./ui";
import Dashboard from "./tabs/Dashboard";
import DailyLog from "./tabs/DailyLog";
import FlockTab from "./tabs/FlockTab";
import HealthTab from "./tabs/HealthTab";
import PhasesTab from "./tabs/PhasesTab";
import AuditTab from "./tabs/AuditTab";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Performa", icon: "gauge" },
  { id: "recording", label: "Recording Harian", icon: "clipboard" },
  { id: "flock", label: "Flock & Standar", icon: "bird" },
  { id: "health", label: "Kesehatan & Vaksin", icon: "pill" },
  { id: "phases", label: "Fase Development", icon: "rocket" },
  { id: "audit", label: "Audit & Keamanan", icon: "shield" },
];

function load<T>(key: string, fb: T): T {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fb;
  } catch {
    return fb;
  }
}
function persist(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* kuota penuh — abaikan dengan aman */
  }
}

function Bg() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 bg-mist">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 480px at 85% -10%, #D7E7FB 0%, transparent 60%), radial-gradient(760px 420px at -10% 35%, #E3EFFD 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#1A53D0 1px, transparent 1px), linear-gradient(90deg, #1A53D0 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />
    </div>
  );
}

export default function App() {
  const seedRecs = useMemo(() => generateSeedRecords(DEFAULT_FLOCK.docCount), []);
  const [flock, setFlock] = useState<FlockInfo>(() => load("bl.flock.v1", DEFAULT_FLOCK));
  const [records, setRecords] = useState<DailyRecord[]>(() =>
    load("bl.records.v1", seedRecs)
  );
  const [health, setHealth] = useState<HealthEntry[]>(() => load("bl.health.v1", SEED_HEALTH));
  const [tab, setTab] = useState<TabId>("dashboard");
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(null);

  useEffect(() => persist("bl.flock.v1", flock), [flock]);
  useEffect(() => persist("bl.records.v1", records), [records]);
  useEffect(() => persist("bl.health.v1", health), [health]);

  const notify = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    window.setTimeout(() => setToast(null), 3200);
  };

  const rows = useMemo(() => computeRows(flock, records), [flock, records]);
  const alerts = useMemo(() => buildAlerts(rows), [rows]);
  const last = rows[rows.length - 1];
  const nextDay = last ? last.day + 1 : 1;

  const upsertRecord = (r: DailyRecord) =>
    setRecords((rs) => {
      const i = rs.findIndex((x) => x.day === r.day);
      const next = [...rs];
      if (i >= 0) next[i] = r;
      else next.push(r);
      return next;
    });

  const resetAll = () => {
    const f = { ...DEFAULT_FLOCK, chickInDate: backDate(17) };
    setFlock(f);
    setRecords(generateSeedRecords(f.docCount));
    setHealth(SEED_HEALTH);
    notify("Seluruh data dikembalikan ke contoh awal");
  };

  return (
    <div className="min-h-screen font-sans text-ink">
      <Bg />

      {/* ===== Sidebar desktop ===== */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col bg-navy-900 text-white lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cobalt-500 shadow-[0_6px_18px_-6px_rgba(46,107,224,0.8)]">
            <Icon name="bird" className="h-6 w-6 text-white" />
          </span>
          <div>
            <p className="font-display text-lg font-extrabold leading-none tracking-tight">
              BroilerLog
            </p>
            <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-cobalt-200">
              PRODUCTION RECORDING
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className="px-3 pb-1 pt-2 font-mono text-[9.5px] tracking-[0.2em] text-cobalt-200/60">
            MENU
          </p>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-semibold transition duration-200 ${
                  active
                    ? "bg-cobalt-600 text-white shadow-[0_8px_20px_-8px_rgba(26,83,208,0.9)]"
                    : "text-cobalt-100/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-cobalt-300" />
                )}
                <Icon name={t.icon} className="h-[18px] w-[18px] shrink-0" />
                {t.label}
                {t.id === "recording" && (
                  <span
                    className={`ml-auto rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-white/10 text-cobalt-200"}`}
                  >
                    H{nextDay}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 p-3">
          {last && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
              <p className="font-mono text-[9.5px] tracking-[0.2em] text-cobalt-200/70">
                FLOCK AKTIF
              </p>
              <p className="mt-1 font-display text-xl font-extrabold leading-none">
                Hari ke-{last.day}
              </p>
              <div className="mt-2.5 grid grid-cols-2 gap-2 font-mono text-[10.5px] font-semibold tabular-nums text-cobalt-100/80">
                <span>POP {n0.format(last.birdsEnd)}</span>
                <span>IP {n0.format(last.ip)}</span>
                <span>FCR {last.fcr.toFixed(2)}</span>
                <span>BB {n0.format(last.avgWeight)}g</span>
              </div>
              <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cobalt-400"
                  style={{ width: `${Math.min(100, (last.day / flock.targetDay) * 100)}%` }}
                />
              </div>
              <p className="mt-1.5 font-mono text-[9.5px] text-cobalt-200/60">
                {last.day}/{flock.targetDay} hari menuju target panen
              </p>
            </div>
          )}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
            <p className="text-[11px] font-semibold text-cobalt-100/80">
              Dibangun dengan <b className="text-white">Qwen AI</b>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                title="Source code di GitHub"
                className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-cobalt-100 transition hover:bg-cobalt-500 hover:text-white"
              >
                <Icon name="github" className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                title="Deploy di Vercel"
                className="grid h-7 w-7 place-items-center rounded-md bg-white/10 text-cobalt-100 transition hover:bg-cobalt-500 hover:text-white"
              >
                <Icon name="vercel" className="h-3 w-3" />
              </a>
              <span className="ml-auto rounded-md bg-white/10 px-2 py-0.5 font-mono text-[9.5px] font-bold text-cobalt-200">
                v1.4.0
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Header mobile ===== */}
      <header className="sticky top-0 z-40 bg-navy-900 text-white lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cobalt-500">
              <Icon name="bird" className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="font-display text-[15px] font-extrabold leading-none">BroilerLog</p>
              <p className="font-mono text-[8.5px] tracking-[0.2em] text-cobalt-200">
                PRODUCTION RECORDING
              </p>
            </div>
          </div>
          {last && (
            <span className="chip bg-white/10 text-cobalt-100">
              HARI {last.day} · IP {n0.format(last.ip)}
            </span>
          )}
        </div>
        <nav className="scroll-thin flex gap-1 overflow-x-auto px-3 py-2.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                tab === t.id
                  ? "bg-cobalt-600 text-white"
                  : "text-cobalt-100/70 hover:bg-white/5"
              }`}
            >
              <Icon name={t.icon} className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ===== Konten ===== */}
      <div className="lg:pl-[264px]">
        <main className="mx-auto max-w-[1220px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {tab === "dashboard" && (
            <Dashboard flock={flock} rows={rows} alerts={alerts} onGo={setTab} />
          )}
          {tab === "recording" && (
            <DailyLog
              flock={flock}
              rows={rows}
              onSave={upsertRecord}
              onDelete={(day) => setRecords((rs) => rs.filter((x) => x.day !== day))}
              notify={notify}
            />
          )}
          {tab === "flock" && (
            <FlockTab
              flock={flock}
              rows={rows}
              onSave={setFlock}
              onReset={resetAll}
              notify={notify}
            />
          )}
          {tab === "health" && (
            <HealthTab
              health={health}
              curDay={last ? last.day : 0}
              onAdd={(h) => setHealth((hs) => [...hs, h])}
              onDelete={(id) => setHealth((hs) => hs.filter((x) => x.id !== id))}
              notify={notify}
            />
          )}
          {tab === "phases" && <PhasesTab notify={notify} />}
          {tab === "audit" && <AuditTab notify={notify} />}

          <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line py-6 text-[11.5px] font-medium text-mut">
            <p>
              © 2026 <b className="text-ink">BroilerLog</b> — Recording Produksi Broiler
            </p>
            <p className="flex items-center gap-2">
              React · Vite · Tailwind
              <span className="text-cobalt-300">●</span>
              Dibangun dengan Qwen AI
              <span className="text-cobalt-300">●</span>
              Deploy: Vercel / Lovable
            </p>
          </footer>
        </main>
      </div>

      {/* ===== Toast ===== */}
      {toast && (
        <div
          className={`toast-in fixed bottom-5 right-5 z-50 flex max-w-[340px] items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-2xl ${
            toast.kind === "ok" ? "bg-navy-900" : "bg-danger"
          }`}
          role="status"
        >
          <span
            className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${toast.kind === "ok" ? "bg-good" : "bg-white/20"}`}
          >
            <Icon name={toast.kind === "ok" ? "check" : "alert"} className="h-3.5 w-3.5" />
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
