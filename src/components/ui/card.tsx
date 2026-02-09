export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-terminal-border bg-terminal-surface p-5 ${className}`}
    >
      {children}
    </div>
  );
}
