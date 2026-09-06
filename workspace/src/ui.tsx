import { useEffect, useRef, useState, type ReactNode } from "react";

/* ===== Ikon SVG kustom (stroke konsisten) ===== */
const PATHS: Record<string, ReactNode> = {
  bird: (
    <>
      <path d="M15.5 3.5a3.2 3.2 0 0 1 3.2 3.2l2.8 2-2.8 1.3v1.6a7.6 7.6 0 0 1-7.6 7.6H9.2a5.6 5.6 0 0 1-4.7-8.6l1.3-1.7a8.6 8.6 0 0 1 8.5-5.4Z" />
      <path d="M13.6 3.7c-.5-1-.2-1.9.7-2.3M15.9 3.5c-.3-1 .1-1.8 1.1-2" />
      <circle cx="16.4" cy="6.6" r="0.85" fill="currentColor" stroke="none" />
      <path d="M17.9 9.9c.5.8.3 1.6-.4 2.1" />
      <path d="M9.5 19.2v2.3M12.8 19.2v2.3M8.2 21.5h2.6M11.5 21.5h2.6" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.5 15.5a7.5 7.5 0 1 1 15 0" />
      <path d="M12 15.5 15.8 11" />
      <circle cx="12" cy="15.5" r="1.3" fill="currentColor" stroke="none" />
      <path d="m5.6 10.5 1 .8M12 6.5v1.3M18.4 10.5l-1 .8" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M9 4.5V3.2A1.2 1.2 0 0 1 10.2 2h3.6A1.2 1.2 0 0 1 15 3.2v1.3" />
      <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4.5" />
    </>
  ),
  stack: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  pill: (
    <>
      <path d="M10.5 3.9 3.9 10.5a3.8 3.8 0 0 0 5.4 5.4l6.6-6.6a3.8 3.8 0 1 0-5.4-5.4Z" />
      <path d="m7.2 7.2 5.4 5.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.8 19 5.6v5.2c0 4.9-3 8.3-7 10.4-4-2.1-7-5.5-7-10.4V5.6Z" />
      <path d="m8.8 11.6 2.2 2.2 4.2-4.4" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2.5c4 1.5 6 5.5 6 9.5 0 1.5-.3 3-1 4.5H7c-.7-1.5-1-3-1-4.5 0-4 2-8 6-9.5Z" />
      <circle cx="12" cy="9" r="1.7" />
      <path d="M7 16.5 5 21l4-1M17 16.5 19 21l-4-1M12 17v4" />
    </>
  ),
  thermo: (
    <>
      <path d="M10 3.8a2 2 0 0 1 4 0v9.4a4.2 4.2 0 1 1-4 0Z" />
      <path d="M12 8v7" />
      <circle cx="12" cy="17" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  drop: (
    <>
      <path d="M12 3.2s6 6.6 6 10.8a6 6 0 0 1-12 0C6 9.8 12 3.2 12 3.2Z" />
      <path d="M9.5 14.5a2.5 2.5 0 0 0 2 2.4" />
    </>
  ),
  feed: (
    <>
      <path d="M7 7.5 6 20a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 20L17 7.5" />
      <path d="M8.5 7.5V5.8a2.3 2.3 0 0 1 2.3-2.3h2.4a2.3 2.3 0 0 1 2.3 2.3v1.7" />
      <circle cx="10.4" cy="12.6" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="13.6" cy="12.6" r="0.85" fill="currentColor" stroke="none" />
      <circle cx="12" cy="15.8" r="0.85" fill="currentColor" stroke="none" />
    </>
  ),
  chart: (
    <>
      <path d="M4 4v16h16" />
      <path d="m7 14 3.5-4 3 2.5L18 7" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5 2.8 19.5h18.4Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="16.6" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.3 12.3 2.6 2.6 4.8-5.2" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M9 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v1.5" />
      <path d="M6.5 6.5 7.3 19a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4.5L19.8 8.7a2.1 2.1 0 0 0 0-3l-1.5-1.5a2.1 2.1 0 0 0-3 0L4 15.5Z" />
      <path d="m13.5 6 4.5 4.5" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11M7.5 10 12 14.5 16.5 10" />
      <path d="M4.5 16.5V19a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-2.5" />
    </>
  ),
  copy: (
    <>
      <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
      <path d="M15.5 8.5v-3a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v2.5" />
      <circle cx="12" cy="7" r="1.5" />
      <path d="M5 20.5h14l-1.8-8a5.3 5.3 0 0 0-10.4 0Z" />
      <path d="M12 8.5v3" />
    </>
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 1.9a10.3 10.3 0 0 0-3.3 20.1c.5.1.7-.2.7-.5v-1.9c-2.9.6-3.5-1.2-3.5-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.7.1-.7.1-.7 1 .1 1.6 1.1 1.6 1.1.9 1.6 2.4 1.2 3 .9.1-.7.4-1.2.7-1.4-2.3-.3-4.7-1.1-4.7-5.1 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1a9.8 9.8 0 0 1 5.2 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 4-2.4 4.8-4.7 5.1.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.3 10.3 0 0 0 12 1.9Z"
    />
  ),
  vercel: <path fill="currentColor" stroke="none" d="M12 4.5 21.5 21h-19Z" />,
  sparkle: (
    <>
      <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9Z" />
      <path d="m18.5 15.5.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" />
    </>
  ),
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
};

export function Icon({
  name,
  className = "w-5 h-5",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? PATHS.check}
    </svg>
  );
}

/* ===== Badge ===== */
const TONES: Record<string, string> = {
  good: "bg-good/10 text-good border-good/25",
  warn: "bg-warn/10 text-warn border-warn/30",
  danger: "bg-danger/10 text-danger border-danger/25",
  info: "bg-cobalt-600/10 text-cobalt-700 border-cobalt-600/25",
  light: "bg-white/10 text-cobalt-100 border-white/15",
};

export function Badge({
  tone = "info",
  children,
  className = "",
}: {
  tone?: "good" | "warn" | "danger" | "info" | "light";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* ===== Scroll reveal ===== */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVis(true);
          ob.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${vis ? "reveal-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ===== Animasi angka ===== */
export function useCountUp(target: number, dur = 950): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

/* ===== Section title ===== */
export function SectionTitle({
  title,
  sub,
  right,
}: {
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl sm:text-[22px] font-extrabold tracking-tight text-ink">
          {title}
        </h2>
        {sub && <p className="mt-0.5 text-[13px] font-medium text-mut">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
