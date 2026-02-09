export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 ${className}`}
    >
      {children}
    </div>
  );
}
