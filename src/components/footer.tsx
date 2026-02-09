export function Footer() {
  return (
    <footer className="border-t border-terminal-border bg-terminal-bg">
      <div className="mx-auto max-w-content flex items-center justify-between px-page-px py-bar-y text-xs text-terminal-subtle">
        <div className="flex items-center gap-4">
          <span>
            <span className="text-brand">*</span> AI matching
          </span>
          <span>
            <span className="text-brand">&lt;/&gt;</span> HTML / Next.js / React
          </span>
          <span>
            <span className="text-success">+</span> 100% free
          </span>
        </div>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
