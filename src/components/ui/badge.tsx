type BadgeVariant = "free" | "paid";

export function Badge({ variant }: { variant: BadgeVariant }) {
  const classes =
    variant === "free"
      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      : "bg-amber-500/20 text-amber-400 border-amber-500/30";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${classes}`}
    >
      {variant === "free" ? "FREE" : "PAID"}
    </span>
  );
}
