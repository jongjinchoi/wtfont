import { SITE } from "@/lib/content";

export default function Nav() {
  return (
    <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-[18px]">
      <div className="flex items-center gap-2.5 text-[15px] font-bold text-text-strong">
        <svg
          width={22}
          height={22}
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="16" height="16" fill="#0f0f10" />
          <text
            x="3"
            y="11"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontSize="8"
            fontWeight="400"
            fill="#fafaf7"
            opacity="0.55"
          >
            {"{"}
          </text>
          <text
            x="8"
            y="11"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontSize="7"
            fontWeight="700"
            fill="#fafaf7"
          >
            w
          </text>
          <text
            x="13"
            y="11"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
            fontSize="8"
            fontWeight="400"
            fill="#fafaf7"
            opacity="0.55"
          >
            {"}"}
          </text>
        </svg>
        wtfont
      </div>
      <div className="flex items-center gap-6 text-sm text-dim">
        <a href="#install" className="text-dim hover:text-text hover:no-underline">
          Quick start
        </a>
        <a href="#mcp-setup" className="text-dim hover:text-text hover:no-underline">
          MCP
        </a>
        <a
          href={SITE.repo}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-strong px-3.5 py-2 text-[13px] font-medium text-text hover:bg-surface hover:no-underline"
        >
          ★ GitHub
        </a>
      </div>
    </nav>
  );
}
