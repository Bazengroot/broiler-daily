import {
  useId,
  useRef,
  useState,
  type MouseEvent as RMouseEvent,
  type ReactNode,
} from "react";
import { n0 } from "./lib";

/* ===== Grafik garis multi-seri dengan tooltip hover ===== */
export interface LSeries {
  name: string;
  color: string;
  values: number[];
  dash?: boolean;
  area?: boolean;
}

export function LineChart({
  series,
  labels,
  h = 230,
  yFmt = (v: number) => n0.format(v),
}: {
  series: LSeries[];
  labels: number[];
  h?: number;
  yFmt?: (v: number) => string;
}) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState<number | null>(null);

  const W = 620;
  const H = h;
  const L = 46;
  const R = 14;
  const T = 14;
  const B = 26;
  const n = labels.length;
  const all = series.flatMap((s) => s.values);
  const lo = Math.min(...all);
  const hi = Math.max(...all);
  const span = hi - lo || 1;
  const y0 = Math.max(0, lo - span * 0.16);
  const y1 = hi + span * 0.1;
  const X = (i: number) =>
    L + (n > 1 ? (i * (W - L - R)) / (n - 1) : (W - L - R) / 2);
  const Y = (v: number) => T + (H - T - B) * (1 - (v - y0) / (y1 - y0));
  const path = (s: LSeries) =>
    s.values
      .map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`)
      .join(" ");
  const area = (s: LSeries) =>
    `${path(s)} L${X(s.values.length - 1).toFixed(1)},${H - B} L${X(0).toFixed(1)},${H - B} Z`;
  const ticks = [0, 1, 2, 3].map((k) => y0 + ((y1 - y0) * k) / 3);
  const step = Math.max(1, Math.ceil(n / 9));

  const onMove = (e: RMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || n === 0) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - L) / (W - L - R)) * (n - 1));
    setHov(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseMove={onMove}
      onMouseLeave={() => setHov(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
        <defs>
          {series.map(
            (s, si) =>
              s.area && (
                <linearGradient
                  key={si}
                  id={`g${gid}${si}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
                </linearGradient>
              )
          )}
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={L}
              x2={W - R}
              y1={Y(t)}
              y2={Y(t)}
              stroke="#DAE6F5"
              strokeWidth="1"
              strokeDasharray={i === 0 ? "" : "3 5"}
            />
            <text
              x={L - 8}
              y={Y(t) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#5C7299"
              fontFamily="IBM Plex Mono, monospace"
            >
              {yFmt(t)}
            </text>
          </g>
        ))}
        {labels.map((d, i) =>
          i % step === 0 || i === n - 1 ? (
            <text
              key={i}
              x={X(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#5C7299"
              fontFamily="IBM Plex Mono, monospace"
            >
              {d}
            </text>
          ) : null
        )}
        {series.map((s, si) => (
          <g key={si}>
            {s.area && <path d={area(s)} fill={`url(#g${gid}${si})`} />}
            <path
              d={path(s)}
              fill="none"
              stroke={s.color}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={s.dash ? "5 6" : ""}
            />
          </g>
        ))}
        {hov !== null && (
          <g>
            <line
              x1={X(hov)}
              x2={X(hov)}
              y1={T}
              y2={H - B}
              stroke="#1A53D0"
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.55"
            />
            {series.map((s, si) => (
              <circle
                key={si}
                cx={X(hov)}
                cy={Y(s.values[hov])}
                r="4.2"
                fill={s.color}
                stroke="#FCFDFF"
                strokeWidth="2"
              />
            ))}
          </g>
        )}
      </svg>
      {hov !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 rounded-lg bg-navy-900 px-3 py-2 text-[11px] font-semibold text-white shadow-xl"
          style={{
            left: `${(X(hov) / W) * 100}%`,
            transform: `translateX(${hov > n / 2 ? "-108%" : "8%"})`,
          }}
        >
          <p className="mb-1 font-mono text-[10px] tracking-widest text-cobalt-200">
            HARI {labels[hov]}
          </p>
          {series.map((s, si) => (
            <p key={si} className="flex items-center gap-1.5 whitespace-nowrap">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: s.color }}
              />
              {s.name}:{" "}
              <span className="font-mono tabular-nums">{yFmt(s.values[hov])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Grafik batang ===== */
export function BarChart({
  values,
  labels,
  color = "#1A53D0",
  h = 200,
  alertWhen,
  unit = "",
}: {
  values: number[];
  labels: number[];
  color?: string;
  h?: number;
  alertWhen?: (v: number) => boolean;
  unit?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [hov, setHov] = useState<number | null>(null);
  const W = 620;
  const H = h;
  const L = 36;
  const R = 10;
  const T = 12;
  const B = 26;
  const n = values.length;
  const hi = Math.max(...values, 1);
  const Y = (v: number) => T + (H - T - B) * (1 - v / (hi * 1.15));
  const slot = (W - L - R) / Math.max(1, n);
  const bw = Math.min(26, slot * 0.58);
  const step = Math.max(1, Math.ceil(n / 9));

  const onMove = (e: RMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || n === 0) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.floor((px - L) / slot);
    setHov(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <div
      ref={ref}
      className="relative"
      onMouseMove={onMove}
      onMouseLeave={() => setHov(null)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full h-auto">
        {[0, 0.5, 1].map((k) => (
          <g key={k}>
            <line
              x1={L}
              x2={W - R}
              y1={Y(hi * 1.15 * k)}
              y2={Y(hi * 1.15 * k)}
              stroke="#DAE6F5"
              strokeDasharray={k === 0 ? "" : "3 5"}
            />
            <text
              x={L - 7}
              y={Y(hi * 1.15 * k) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#5C7299"
              fontFamily="IBM Plex Mono, monospace"
            >
              {n0.format(hi * 1.15 * k)}
            </text>
          </g>
        ))}
        {values.map((v, i) => {
          const danger = alertWhen ? alertWhen(v) : false;
          return (
            <g key={i}>
              <rect
                x={L + i * slot + (slot - bw) / 2}
                y={Y(v)}
                width={bw}
                height={Math.max(2, H - B - Y(v))}
                rx="3"
                fill={danger ? "#D93636" : color}
                opacity={hov === null || hov === i ? (danger ? 0.9 : 0.85) : 0.35}
                style={{ transition: "opacity .2s" }}
              />
              {(i % step === 0 || i === n - 1) && (
                <text
                  x={L + i * slot + slot / 2}
                  y={H - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#5C7299"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {labels[i]}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hov !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg bg-navy-900 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xl"
          style={{
            left: `${((L + hov * slot + slot / 2) / W) * 100}%`,
            transform: `translateX(${hov > n / 2 ? "-108%" : "8%"})`,
          }}
        >
          <span className="font-mono text-cobalt-200">Hari {labels[hov]}</span>
          {"  ·  "}
          <span className="font-mono tabular-nums">
            {n0.format(values[hov])} {unit}
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== Gauge setengah lingkaran ===== */
export function Gauge({
  value,
  max = 450,
  color = "#1A53D0",
  children,
}: {
  value: number;
  max?: number;
  color?: string;
  children?: ReactNode;
}) {
  const frac = Math.max(0, Math.min(1, value / max));
  const C = Math.PI * 62;
  return (
    <div className="relative inline-block">
      <svg viewBox="0 0 160 96" className="w-44 sm:w-48">
        <path
          d="M18 88 A 62 62 0 0 1 142 88"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d="M18 88 A 62 62 0 0 1 142 88"
          fill="none"
          stroke={color}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C + 12}`}
          style={{ transition: "stroke-dasharray 1.1s cubic-bezier(.22,.7,.25,1)" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">{children}</div>
    </div>
  );
}

/* ===== Sparkline mini ===== */
export function Spark({
  values,
  color = "#1A53D0",
}: {
  values: number[];
  color?: string;
}) {
  const w = 140;
  const h = 40;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  const X = (i: number) => (i / Math.max(1, values.length - 1)) * (w - 4) + 2;
  const Y = (v: number) => h - 4 - ((v - lo) / span) * (h - 8);
  const pts = values.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="block h-10 w-full">
      <polygon
        points={`2,${h - 2} ${pts} ${w - 2},${h - 2}`}
        fill={color}
        opacity="0.1"
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={X(values.length - 1)}
        cy={Y(values[values.length - 1])}
        r="2.6"
        fill={color}
      />
    </svg>
  );
}
