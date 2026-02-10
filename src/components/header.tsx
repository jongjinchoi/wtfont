import Link from "next/link";

export function Header({ domain }: { domain?: string }) {
  return (
    <header className="border-b border-terminal-border bg-terminal-bg">
      <div className="mx-auto max-w-content flex items-center px-page-px py-bar-y">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <Link
            href="/"
            className="text-sm text-terminal-muted hover:text-terminal-text transition-colors duration-200"
          >
            {domain ? `${domain} - wtfont.wtf` : "wtfont.wtf"}
          </Link>
        </div>
      </div>
    </header>
  );
}
