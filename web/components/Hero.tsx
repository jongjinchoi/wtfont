import { SITE } from "@/lib/content";

export default function Hero() {
  return (
    <header className="px-0 pt-[60px] pb-10 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong px-3.5 py-1.5 font-mono text-xs text-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-green" />
        MIT · Zero telemetry
      </div>
      <h1 className="m-0 mb-5 text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-text-strong">
        Stop digging through DevTools.
      </h1>
      <p className="mx-auto mb-8 max-w-[620px] text-lg leading-[1.5] text-dim">
        Identify any web font, find free Google Fonts alternatives, and get{" "}
        <span className="whitespace-nowrap">copy-paste</span> code — from your{" "}
        <span className="grad">terminal</span> or through{" "}
        <span className="grad">Claude</span>.
      </p>
      <div className="mb-7 flex flex-wrap justify-center gap-2.5">
        <a
          href="#install"
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-text-strong bg-text-strong px-5 py-2.5 text-sm font-semibold text-[#0d0e12] hover:bg-[#d0d2d6] hover:no-underline"
        >
          Get started →
        </a>
        <a
          href={SITE.repo}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border-strong bg-surface px-5 py-2.5 text-sm font-semibold text-text hover:border-text hover:bg-surface-2 hover:no-underline"
        >
          ★ Star on GitHub
        </a>
      </div>
    </header>
  );
}
