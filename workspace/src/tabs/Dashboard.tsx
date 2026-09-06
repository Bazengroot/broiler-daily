import { Fragment, type ReactNode } from "react";
import type { Alert, DayRow, FlockInfo, TabId } from "../types";
import {
  dateLong,
  fmtRp,
  fmtRpC,
  gradeIP,
  n0,
  n1,
  n2,
  projectHarvest,
} from "../lib";
import { Badge, Icon, Reveal, useCountUp } from "../ui";
import { BarChart, Gauge, LineChart, Spark } from "../charts";

function Kpi({
  label,
  value,
  fmt,
  icon,
  sub,
  extra,
  cls = "",
  delay = 0,
}: {
  label: string;
  value: number;
  fmt: (v: number) => string;
  icon: string;
  sub?: ReactNode;
  extra?: ReactNode;
  cls?: string;
  delay?: number;
}) {
  const v = useCountUp(value);
  return (
    <Reveal delay={delay} className={cls}>
      <div className="card group h-full p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-14px_rgba(11,30,62,0.3)] sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="label mb-0">{label}</p>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cobalt-600/8 text-cobalt-700 transition duration-300 group-hover:bg-cobalt-600 group-hover:text-white">
            <Icon name={icon} className="h-[18px] w-[18px]" />
          </span>
        </div>
        <p className="mt-2 font-display text-[26px] font-extrabold leading-none tracking-tight text-ink tabular-nums sm:text-3xl">
          {fmt(v)}
        </p>
        {extra}
        {sub && <div className="mt-2 text-xs font-medium text-mut">{sub}</div>}
      </div>
    </Reveal>
  );
}

function ChartCard({
  title,
  sub,
  legend,
  children,
  cls = "",
  delay = 0,
}: {
  title: string;
  sub?: string;
  legend?: { label: string; color: string; dash?: boolean }[];
  children: ReactNode;
  cls?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={cls}>
      <div className="card h-full p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
            {sub && <p className="text-[11.5px] font-medium text-mut">{sub}</p>}
          </div>
          {legend && (
            <div className="flex gap-3">
              {legend.map((l) => (
                <span
                  key={l.label}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-mut"
                >
                  <span
                    className={`inline-block h-[3px] w-4 rounded-full ${l.dash ? "opacity-60" : ""}`}
                    style={{ background: l.color }}
                  />
                  {l.label}
                </span>
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </Reveal>
  );
}

const ALERT_STYLE: Record<Alert["level"], { icon: string; cls: string; dot: string }> = {
  ok: { icon: "checkCircle", cls: "text-good bg-good/8 border-good/20", dot: "bg-good" },
  watch: { icon: "alert", cls: "text-warn bg-warn/8 border-warn/25", dot: "bg-warn" },
  danger: { icon: "alert", cls: "text-danger bg-danger/8 border-danger/25", dot: "bg-danger" },
};

export default function Dashboard({
  flock,
  rows,
  alerts,
  onGo,
}: {
  flock: FlockInfo;
  rows: DayRow[];
  alerts: Alert[];
  onGo: (t: TabId) => void;
}) {
  const last = rows[rows.length - 1];
  if (!last) {
    return (
      <div className="card p-12 text-center">
        <Icon name="bird" className="mx-auto h-12 w-12 text-cobalt-300" />
        <h2 className="mt-4 font-display text-2xl font-extrabold text-ink">
          Belum ada data recording
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-mut">
          Mulai catat parameter harian flock Anda — performa, FCR, dan IP akan
          terhitung otomatis di halaman ini.
        </p>
        <button onClick={() => onGo("recording")} className="btn-p mt-6">
          <Icon name="plus" className="h-4 w-4" /> Isi Recording Pertama
        </button>
      </div>
    );
  }
  return <DashboardData flock={flock} rows={rows} alerts={alerts} onGo={onGo} />;
}

function DashboardData({
  flock,
  rows,
  alerts,
  onGo,
}: {
  flock: FlockInfo;
  rows: DayRow[];
  alerts: Alert[];
  onGo: (t: TabId) => void;
}) {
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2] ?? last;
  const g = gradeIP(last.ip);
  const dIp = last.ip - prev.ip;
  const proj = projectHarvest(rows, flock);
  const ipAnim = useCountUp(last.ip, 1200);
  const days = rows.map((r) => r.day);

  const tickerItems = [
    `POPULASI ${n0.format(last.birdsEnd)} EKOR`,
    `BB SAMPLING ${n0.format(last.avgWeight)} G`,
    `ADG ${n1.format(last.adg)} G/EKOR/HARI`,
    `FCR ${n2.format(last.fcr)}`,
    `IP ${n0.format(last.ip)} (${g.label.toUpperCase()})`,
    `DEPLESI KUM ${n1.format(last.mortCumPct)}%`,
    `PAKAN KUM ${n0.format(last.cumFeed)} KG`,
    `AIR KUM ${n0.format(last.cumWater)} L`,
    `SUHU ${n1.format(last.tempMin)}–${n1.format(last.tempMax)}°C`,
    `RH ${last.humidity}%`,
  ];

  return (
    <div className="space-y-4">
      {/* ===== Header flock aktif ===== */}
      <Reveal>
        <section className="relative overflow-hidden rounded-xl bg-navy-900 text-white">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(620px 300px at 88% -20%, rgba(46,107,224,0.5) 0%, transparent 60%), radial-gradient(420px 260px at -8% 120%, rgba(91,143,234,0.35) 0%, transparent 55%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(#BCD4F9 1px, transparent 1px), linear-gradient(90deg, #BCD4F9 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />
          <Icon
            name="bird"
            className="float-slow pointer-events-none absolute -right-6 -top-8 h-44 w-44 rotate-12 text-white/[0.06]"
          />
          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="light">
                  <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[#4ADE80]" />
                  FLOCK AKTIF
                </Badge>
                <span className="font-mono text-[11px] tracking-[0.14em] text-cobalt-200">
                  CHICK-IN {last.birdsStart > 0 ? n0.format(flock.docCount) : "-"} DOC
                  {" · "}
                  {flock.breed.toUpperCase()}
                </span>
              </div>
              <h1 className="mt-3 font-display text-[42px] font-extrabold leading-[0.95] tracking-tight sm:text-6xl">
                Hari ke-{last.day}
              </h1>
              <p className="mt-2 text-sm font-medium text-cobalt-100/80">
                {dateLong(flock.chickInDate, last.day)} · {flock.house} · {flock.farm}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip bg-white/10 text-cobalt-100">
                  <Icon name="bird" className="h-3.5 w-3.5" />
                  Populasi {n0.format(last.birdsEnd)} ekor
                </span>
                <span className="chip bg-white/10 text-cobalt-100">
                  <Icon name="scale" className="h-3.5 w-3.5" />
                  BB {n0.format(last.avgWeight)} g ({n0.format(last.pctStd)}% std)
                </span>
                <span className="chip bg-white/10 text-cobalt-100">
                  <Icon name="calendar" className="h-3.5 w-3.5" />
                  Target panen hari ke-{flock.targetDay}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  onClick={() => onGo("recording")}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-navy-900 transition hover:bg-cobalt-100 active:scale-[0.98]"
                >
                  <Icon name="plus" className="h-4 w-4" />
                  Isi Recording Hari {last.day + 1}
                </button>
                <button
                  onClick={() => onGo("health")}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  <Icon name="pill" className="h-4 w-4" />
                  Program Kesehatan
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center rounded-xl border border-white/10 bg-white/[0.06] px-6 pb-4 pt-5">
              <Gauge value={last.ip} max={450} color={g.color}>
                <span className="font-display text-[42px] font-extrabold leading-none tabular-nums">
                  {n0.format(ipAnim)}
                </span>
                <span className="mt-1 block font-mono text-[9.5px] tracking-[0.22em] text-cobalt-100/70">
                  INDEKS PRESTASI
                </span>
              </Gauge>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone={g.tone}>{g.label.toUpperCase()}</Badge>
                <span
                  className={`font-mono text-[11px] font-semibold tabular-nums ${dIp >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}
                >
                  {dIp >= 0 ? "▲" : "▼"} {n1.format(Math.abs(dIp))} vs kemarin
                </span>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ===== Ticker statistik ===== */}
      <Reveal delay={80}>
        <div className="ticker overflow-hidden rounded-lg border border-line bg-paper">
          <div className="ticker-track flex w-max items-center gap-7 py-2 pl-7 font-mono text-[11px] font-semibold tracking-wide text-mut">
            {[0, 1].map((k) => (
              <Fragment key={k}>
                {tickerItems.map((t) => (
                  <span key={`${k}-${t}`} className="flex items-center gap-7">
                    {t}
                    <span className="text-cobalt-300">●</span>
                  </span>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ===== KPI bento ===== */}
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-12">
        <Kpi
          cls="lg:col-span-3"
          delay={0}
          label="FCR Kumulatif"
          icon="feed"
          value={last.fcr}
          fmt={(v) => n2.format(v)}
          extra={
            <div className="mt-2">
              <Spark values={rows.map((r) => r.fcr)} />
            </div>
          }
          sub={
            <span>
              Standar {n2.format(last.fcrStd)} ·{" "}
              <b className={last.fcr <= last.fcrStd ? "text-good" : "text-danger"}>
                {last.fcr <= last.fcrStd ? "lebih efisien" : "di atas standar"}
              </b>
            </span>
          }
        />
        <Kpi
          cls="lg:col-span-3"
          delay={60}
          label="ADG"
          icon="chart"
          value={last.adg}
          fmt={(v) => `${n1.format(v)} g`}
          sub={`Average Daily Gain per ekor · BB awal ${flock.initialWeight} g`}
        />
        <Kpi
          cls="lg:col-span-3"
          delay={120}
          label="BB Rata-rata"
          icon="scale"
          value={last.avgWeight}
          fmt={(v) => `${n0.format(v)} g`}
          extra={
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-cobalt-100">
              <div
                className="h-full rounded-full bg-cobalt-600 transition-[width] duration-1000"
                style={{ width: `${Math.min(120, last.pctStd)}%` }}
              />
            </div>
          }
          sub={`Standar ${n0.format(last.stdWeight)} g · ${n0.format(last.pctStd)}% dari standar`}
        />
        <Kpi
          cls="lg:col-span-3"
          delay={180}
          label="Deplesi Kumulatif"
          icon="alert"
          value={last.mortCumPct}
          fmt={(v) => `${n1.format(v)}%`}
          sub={`${n0.format(last.cumMort)} ekor (mortalitas + culling) dari ${n0.format(flock.docCount)} DOC`}
        />

        <Kpi
          cls="lg:col-span-4"
          delay={0}
          label="Konsumsi Pakan Kumulatif"
          icon="feed"
          value={last.cumFeed}
          fmt={(v) => `${n1.format(v / 1000)} ton`}
          extra={
            <div className="mt-2">
              <Spark values={rows.map((r) => r.feedIntake)} color="#5B8FEA" />
            </div>
          }
          sub={`Hari ini ${n0.format(last.feedIntake)} kg · ${n1.format(last.cumFeed / Math.max(1, last.birdsEnd))} kg/ekor kumulatif`}
        />
        <Kpi
          cls="lg:col-span-2"
          delay={60}
          label="Air Minum"
          icon="drop"
          value={last.cumWater}
          fmt={(v) => `${n0.format(v)} L`}
          sub={`Hari ini ${n0.format(last.water)} L · rasio air:pakan ${n1.format(last.water / Math.max(1, last.feedIntake))}`}
        />
        <Kpi
          cls="lg:col-span-3"
          delay={120}
          label="Biaya Pakan"
          icon="download"
          value={last.feedCost}
          fmt={(v) => fmtRpC(v)}
          sub={`Starter ${fmtRp(flock.feedPriceStarter)}/kg · Finisher ${fmtRp(flock.feedPriceFinisher)}/kg`}
        />
        <Kpi
          cls="lg:col-span-3"
          delay={180}
          label="Proyeksi HPP Panen"
          icon="chart"
          value={proj.length ? proj.find((p) => p.day === flock.targetDay)?.hpp ?? proj[proj.length - 1].hpp : last.hpp}
          fmt={(v) => `${fmtRp(v)}/kg`}
          sub={
            <span>
              Harga jual {fmtRp(flock.livePrice)}/kg ·{" "}
              <b className="text-good">
                margin ±{fmtRp(flock.livePrice - (proj.length ? proj.find((p) => p.day === flock.targetDay)?.hpp ?? proj[proj.length - 1].hpp : last.hpp))}/kg
              </b>
            </span>
          }
        />
      </section>

      {/* ===== Grafik utama + peringatan ===== */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        <ChartCard
          cls="lg:col-span-2"
          title="Pertumbuhan Bobot Badan vs Standar"
          sub={`Sampling harian terhadap standar ${flock.breed}`}
          legend={[
            { label: "BB Aktual", color: "#1A53D0" },
            { label: "Standar", color: "#8FB6F3", dash: true },
          ]}
        >
          <LineChart
            labels={days}
            series={[
              {
                name: "Aktual",
                color: "#1A53D0",
                values: rows.map((r) => r.avgWeight),
                area: true,
              },
              {
                name: "Standar",
                color: "#8FB6F3",
                values: rows.map((r) => r.stdWeight),
                dash: true,
              },
            ]}
          />
        </ChartCard>

        <Reveal delay={120}>
          <div className="card h-full p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[15px] font-bold text-ink">
                Peringatan & Status
              </h3>
              <span className="pulse-dot h-2 w-2 rounded-full bg-cobalt-500" />
            </div>
            <ul className="space-y-2.5">
              {alerts.map((a, i) => {
                const s = ALERT_STYLE[a.level];
                return (
                  <li
                    key={i}
                    className={`flex gap-3 rounded-lg border p-3 ${s.cls} transition duration-200 hover:translate-x-0.5`}
                  >
                    <Icon name={s.icon} className="mt-0.5 h-[18px] w-[18px] shrink-0" />
                    <div>
                      <p className="text-[13px] font-bold leading-snug text-ink">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-xs font-medium leading-snug text-mut">
                        {a.detail}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={() => onGo("recording")}
              className="btn-g mt-4 w-full"
            >
              Lihat Recording Harian <Icon name="arrowR" className="h-4 w-4" />
            </button>
          </div>
        </Reveal>
      </section>

      {/* ===== Mortalitas, FCR, proyeksi ===== */}
      <section className="grid gap-3.5 lg:grid-cols-3">
        <ChartCard
          title="Mortalitas Harian"
          sub="ekor/hari · merah = di atas ambang 25 ekor"
        >
          <BarChart
            labels={days}
            values={rows.map((r) => r.mortality + r.culling)}
            alertWhen={(v) => v > 25}
            unit="ekor"
          />
        </ChartCard>

        <ChartCard
          title="Tren FCR vs Standar"
          sub="Semakin rendah semakin efisien"
          legend={[
            { label: "FCR Aktual", color: "#1A53D0" },
            { label: "Standar", color: "#8FB6F3", dash: true },
          ]}
        >
          <LineChart
            labels={days}
            yFmt={(v) => n2.format(v)}
            series={[
              {
                name: "FCR",
                color: "#1A53D0",
                values: rows.map((r) => Number(r.fcr.toFixed(3))),
                area: true,
              },
              {
                name: "Standar",
                color: "#8FB6F3",
                values: rows.map((r) => Number(r.fcrStd.toFixed(3))),
                dash: true,
              },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Proyeksi Panen"
          sub={`Estimasi pada populasi ${n0.format(last.birdsEnd)} ekor`}
        >
          <ul className="space-y-3">
            {proj.map((p) => (
              <li
                key={p.day}
                className={`rounded-lg border p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${p.day === flock.targetDay ? "border-cobalt-300 bg-cobalt-50" : "border-line bg-white"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-ink">
                    Hari ke-{p.day}
                    {p.day === flock.targetDay && (
                      <Badge tone="info" className="ml-2">TARGET</Badge>
                    )}
                  </span>
                  <span className="font-mono text-xs font-semibold text-cobalt-700 tabular-nums">
                    {fmtRpC(p.revenue)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cobalt-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cobalt-500 to-cobalt-700 transition-[width] duration-1000"
                      style={{ width: `${Math.min(100, (p.weight / 2600) * 100)}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-mut tabular-nums">
                    {n0.format(p.weight)} g
                  </span>
                </div>
                <p className="mt-1.5 font-mono text-[10.5px] text-mut tabular-nums">
                  IP {n0.format(p.ip)} · FCR {n2.format(p.fcr)} · {n1.format(p.tonnage)} ton · HPP {fmtRp(p.hpp)}/kg
                </p>
              </li>
            ))}
          </ul>
        </ChartCard>
      </section>
    </div>
  );
}


