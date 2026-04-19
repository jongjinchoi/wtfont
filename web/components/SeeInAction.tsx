import SectionHead from "./SectionHead";
import { MCP_EXAMPLES } from "@/lib/content";

export default function SeeInAction() {
  return (
    <section className="border-t border-border py-[72px]">
      <SectionHead kicker="See it in action" title="What asking Claude looks like.">
        Three real conversations with the MCP interface.
      </SectionHead>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {MCP_EXAMPLES.map((ex) => (
          <div
            key={ex.title}
            className="rounded-xl border border-border bg-surface p-7"
          >
            <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
              {ex.title}
            </h4>
            <span className="mb-1 block text-[13px] font-semibold text-accent">
              You
            </span>
            <p className="m-0 mb-3 text-sm text-text">{ex.question}</p>
            <div className="my-2.5 font-mono text-xs text-dim">{ex.trace}</div>
            <p className="text-sm leading-[1.55] text-text">{ex.reply}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-dim">
        All queries run locally. No data leaves your machine.
      </p>
    </section>
  );
}
