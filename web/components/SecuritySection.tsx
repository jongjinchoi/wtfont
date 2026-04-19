import SectionHead from "./SectionHead";
import { SECURITY_BULLETS, SITE } from "@/lib/content";

export default function SecuritySection() {
  return (
    <section className="border-t border-border py-[72px]">
      <SectionHead kicker="Security" title="Everything runs on your machine.">
        wtfont only makes network calls to the website you analyze and to{" "}
        <code className="rounded bg-surface px-2 py-0.5 text-[0.9em]">
          fonts.googleapis.com
        </code>
        . No telemetry, no remote servers.
      </SectionHead>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {SECURITY_BULLETS.map((b) => (
          <div
            key={b.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <div className="mb-3.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent font-mono text-sm font-bold text-[#0d0e12]">
              {b.icon}
            </div>
            <h4 className="m-0 mb-1.5 text-base font-semibold text-text-strong">
              {b.title}
            </h4>
            <p
              className="m-0 text-sm leading-[1.5] text-dim"
              dangerouslySetInnerHTML={{
                __html: b.body.replace(
                  /`([^`]+)`/g,
                  '<code class="rounded bg-bg px-1.5 py-0.5 text-xs">$1</code>',
                ),
              }}
            />
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-dim">
        <a href={SITE.security} className="text-primary">
          Full security details on GitHub →
        </a>
      </p>
    </section>
  );
}
