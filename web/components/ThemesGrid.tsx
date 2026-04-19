import Image from "next/image";
import SectionHead from "./SectionHead";
import { THEMES } from "@/lib/content";

export default function ThemesGrid() {
  return (
    <section id="themes" className="border-t border-border py-[72px]">
      <SectionHead kicker="Themes" title="Pick a look.">
        Default is shown throughout this page. Six alternatives below. Switch with{" "}
        <code className="rounded bg-surface px-2 py-0.5 text-[0.9em]">
          wtfont config theme &lt;name&gt;
        </code>
        .
      </SectionHead>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {THEMES.map((t) => (
          <figure
            key={t.name}
            className="m-0 overflow-hidden rounded-xl border border-border bg-surface"
          >
            <Image
              src={t.img}
              alt={t.name}
              width={1200}
              height={700}
              className="block h-auto w-full"
            />
            <figcaption className="border-t border-border px-3.5 py-2.5 font-mono text-xs text-dim">
              {t.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
