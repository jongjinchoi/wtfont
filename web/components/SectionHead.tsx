import type { ReactNode } from "react";

export default function SectionHead({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-12 text-center">
      <span className="mb-3 inline-block font-mono text-xs uppercase tracking-[0.14em] text-primary">
        {kicker}
      </span>
      <h2 className="m-0 mb-2.5 text-[clamp(28px,4vw,40px)] font-bold tracking-[-0.02em] text-text-strong">
        {title}
      </h2>
      {children ? (
        <p className="mx-auto max-w-[560px] text-dim">{children}</p>
      ) : null}
    </div>
  );
}
