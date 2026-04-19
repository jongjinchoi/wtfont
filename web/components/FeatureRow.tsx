import Image from "next/image";
import type { FeatureRow as FeatureRowType } from "@/lib/content";

export default function FeatureRow({ row }: { row: FeatureRowType }) {
  const colsClass = row.reverse
    ? "md:grid-cols-[1.2fr_1fr]"
    : "md:grid-cols-[1fr_1.2fr]";
  return (
    <div
      className={`grid items-center gap-6 border-t border-border py-12 first:border-t-0 first:pt-0 md:gap-12 ${colsClass}`}
    >
      <div className={row.reverse ? "md:order-2" : ""}>
        <div className="mb-2.5 font-mono text-xs uppercase tracking-[0.1em] text-accent">
          {row.tag}
        </div>
        <h3 className="m-0 mb-3 text-[28px] font-bold tracking-[-0.02em] text-text-strong">
          {row.title}
        </h3>
        <p className="mt-0 mb-4 text-dim">{row.body}</p>
        <code className="inline-block rounded-md border border-border bg-surface px-2.5 py-1 text-[13px] text-text">
          {row.code}
        </code>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-border bg-surface">
        <Image
          src={row.img}
          alt={row.tag}
          width={1200}
          height={700}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
