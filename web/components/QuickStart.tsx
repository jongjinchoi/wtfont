import SectionHead from "./SectionHead";
import CodeBlock from "./CodeBlock";
import { MCP_CONFIG_JSON } from "@/lib/content";

export default function QuickStart() {
  return (
    <section id="install" className="border-t border-border py-[72px]">
      <SectionHead kicker="Quick start" title="Two ways to use wtfont.">
        Pick whichever fits what you&rsquo;re doing.
      </SectionHead>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Through Claude (MCP) */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 flex items-center gap-2 text-[15px] font-semibold text-text-strong">
            Through Claude
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
              MCP
            </span>
          </h4>
          <p className="mt-0 mb-3.5 text-[13px] leading-[1.5] text-dim">
            Add to Claude Desktop config (Settings → Developer → Edit Config):
          </p>
          <CodeBlock text={MCP_CONFIG_JSON}>{MCP_CONFIG_JSON}</CodeBlock>
          <p className="mt-3 text-[13px] leading-[1.5] text-dim">
            Restart Claude, then ask:{" "}
            <em className="not-italic text-text">
              &ldquo;What fonts does vercel.com use?&rdquo;
            </em>
          </p>
          <p className="mt-3.5 text-[13px]">
            <a href="#mcp-setup" className="text-primary">
              → Setup for Claude Code, Cursor, Windsurf, VS Code
            </a>
          </p>
        </div>

        {/* In terminal (CLI) */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 flex items-center gap-2 text-[15px] font-semibold text-text-strong">
            In terminal
            <span className="rounded-full bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-medium text-primary">
              CLI
            </span>
          </h4>
          <p className="mt-0 mb-3.5 text-[13px] leading-[1.5] text-dim">
            One global install, then run any command:
          </p>
          <CodeBlock
            text={"npm install -g wtfont\nwtfont analyze vercel.com"}
          >
            <span className="text-primary">$</span> npm install -g wtfont
            {"\n"}
            <span className="text-primary">$</span> wtfont analyze vercel.com
          </CodeBlock>
          <p className="mt-3 text-[13px] leading-[1.5] text-dim">
            Also:{" "}
            <code className="rounded bg-bg px-1.5 py-0.5 text-xs">
              bun install -g wtfont
            </code>{" "}
            ·{" "}
            <code className="rounded bg-bg px-1.5 py-0.5 text-xs">
              pnpm add -g wtfont
            </code>
          </p>
          <p className="mt-3.5 text-[13px]">
            <a href="#features" className="text-primary">
              → Full CLI reference
            </a>
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-dim">
        Both paths require{" "}
        <a href="https://nodejs.org" className="text-primary">
          Node.js
        </a>
        .
      </p>
    </section>
  );
}
