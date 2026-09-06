import { DEPLOY_GIT, PHASES } from "../data";
import { Badge, Icon, Reveal, SectionTitle } from "../ui";

async function copyText(s: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(s);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = s;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

function CopyBtn({ text, notify }: { text: string; notify: (m: string) => void }) {
  return (
    <button
      onClick={async () => {
        const ok = await copyText(text);
        notify(ok ? "Teks disalin ke clipboard" : "Gagal menyalin");
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1.5 font-mono text-[10.5px] font-semibold text-cobalt-100 transition hover:bg-white/20 active:scale-95"
    >
      <Icon name="copy" className="h-3.5 w-3.5" /> SALIN
    </button>
  );
}

export default function PhasesTab({ notify }: { notify: (m: string) => void }) {
  return (
    <div>
      <SectionTitle
        title="Fase Development"
        sub="Aplikasi ini dibangun bertahap bersama Qwen AI — prompt tiap fase dapat disalin ulang"
      />

      {/* ===== Alur build & deploy ===== */}
      <Reveal>
        <div className="card relative overflow-hidden p-5">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(480px 220px at 100% 0%, rgba(46,107,224,0.1) 0%, transparent 60%)",
            }}
          />
          <div className="relative grid gap-5 lg:grid-cols-[1fr_auto]">
            <div>
              <h3 className="font-display text-lg font-extrabold text-ink">
                Alur Build → Publish
              </h3>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                {[
                  {
                    icon: "sparkle",
                    title: "1 · Prompt ke Qwen AI",
                    desc: "Jalankan prompt tiap fase secara berurutan, validasi hasilnya sebelum lanjut.",
                  },
                  {
                    icon: "github",
                    title: "2 · Push ke GitHub",
                    desc: "Simpan versi code di repository broilerlog sebagai sumber kebenaran.",
                  },
                  {
                    icon: "rocket",
                    title: "3 · Deploy Vercel / Lovable",
                    desc: "Import repo di Vercel (framework Vite) atau tempel prompt di Lovable AI.",
                  },
                ].map((s, i) => (
                  <div key={s.title} className="flex flex-1 items-stretch gap-3">
                    <div className="group flex-1 rounded-lg border border-line bg-white p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-cobalt-300 hover:shadow-md">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy-900 text-cobalt-200 transition group-hover:bg-cobalt-600 group-hover:text-white">
                        <Icon name={s.icon} className="h-4 w-4" />
                      </span>
                      <p className="mt-2 font-display text-[13.5px] font-bold text-ink">
                        {s.title}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-mut">
                        {s.desc}
                      </p>
                    </div>
                    {i < 2 && (
                      <span className="hidden items-center text-cobalt-300 sm:flex">
                        <Icon name="arrowR" className="h-5 w-5" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-[280px] rounded-lg bg-navy-950 p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="font-mono text-[10px] tracking-[0.18em] text-cobalt-200">
                  TERMINAL · PUSH KE GITHUB
                </p>
                <CopyBtn text={DEPLOY_GIT.join("\n")} notify={notify} />
              </div>
              <pre className="scroll-thin overflow-x-auto font-mono text-[11.5px] leading-relaxed text-cobalt-100">
                {DEPLOY_GIT.map((c) => (
                  <div key={c}>
                    <span className="text-[#4ADE80]">$</span> {c}
                  </div>
                ))}
              </pre>
              <p className="mt-3 border-t border-white/10 pt-2.5 font-mono text-[10.5px] leading-relaxed text-cobalt-200/70">
                Vercel: import repo → framework <b className="text-cobalt-100">Vite</b> →
                deploy otomatis tiap push. HTTPS aktif default.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ===== Daftar fase ===== */}
      <div className="mt-4 space-y-4">
        {PHASES.map((p, idx) => (
          <Reveal key={p.id} delay={idx * 60}>
            <article className="card group overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-18px_rgba(11,30,62,0.35)]">
              <div className="grid lg:grid-cols-[1fr_420px]">
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-md bg-navy-900 px-2.5 py-1 font-mono text-[11px] font-bold tracking-[0.14em] text-cobalt-200">
                      PHASE 0{p.id}
                    </span>
                    <h3 className="font-display text-lg font-extrabold text-ink">
                      {p.title}
                    </h3>
                    <Badge tone="good" className="ml-auto">
                      <Icon name="check" className="h-3 w-3" /> SELESAI
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-[13px] font-medium text-mut">{p.goal}</p>

                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-[13px] font-semibold text-ink">
                        <span className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-good/12 text-good">
                          <Icon name="check" className="h-2.5 w-2.5" />
                        </span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative border-t border-line bg-navy-950 p-4 lg:border-l lg:border-t-0">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-cobalt-200">
                      PROMPT QWEN AI
                    </p>
                    <CopyBtn text={p.prompt} notify={notify} />
                  </div>
                  <pre className="scroll-thin max-h-56 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-cobalt-100/90">
                    {p.prompt}
                  </pre>
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
