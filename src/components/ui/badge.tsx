type BadgeVariant = "free" | "custom";

export function Badge({ variant }: { variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center text-xs font-mono uppercase tracking-wider ${
        variant === "free" ? "text-success" : "text-warning"
      }`}
    >
      {variant === "free" ? "FREE" : "CUSTOM"}
    </span>
  );
}
