import SectionHead from "./SectionHead";
import CodeBlock from "./CodeBlock";
import { MCP_CONFIG_JSON, MCP_TOOLS } from "@/lib/content";

const CLAUDE_CODE_CMD = `claude mcp add --scope user \\
    --transport stdio wtfont \\
    -- npx -y wtfont mcp`;

export default function MCPSetupGrid() {
  return (
    <section id="mcp-setup" className="border-t border-border py-[72px]">
      <SectionHead kicker="MCP setup" title="Plug it into your AI assistant.">
        wtfont runs as a local MCP server. Same JSON config across most
        clients.
      </SectionHead>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Claude Code */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
            Claude Code
          </h4>
          <CodeBlock text={CLAUDE_CODE_CMD}>
            <span className="text-primary">$</span>{" "}
            {`claude mcp add --scope user \\\n    --transport stdio wtfont \\\n    -- npx -y wtfont mcp`}
          </CodeBlock>
        </div>

        {/* Claude Desktop */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
            Claude Desktop
          </h4>
          <p className="mb-2.5 text-[13px] text-dim">
            Settings → Developer → Edit Config
          </p>
          <CodeBlock text={MCP_CONFIG_JSON}>{MCP_CONFIG_JSON}</CodeBlock>
        </div>

        {/* Cursor */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
            Cursor
          </h4>
          <p className="mb-2.5 text-[13px] text-dim">
            Settings → Tools & Integrations → New MCP Server (same JSON as
            Desktop)
          </p>
          <CodeBlock text={MCP_CONFIG_JSON}>{MCP_CONFIG_JSON}</CodeBlock>
        </div>

        {/* Windsurf */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
            Windsurf
          </h4>
          <p className="mb-2.5 text-[13px] text-dim">
            Edit{" "}
            <code className="rounded bg-bg px-1.5 py-0.5 text-xs">
              ~/.codeium/windsurf/mcp_config.json
            </code>{" "}
            (same JSON as Desktop)
          </p>
          <CodeBlock text={MCP_CONFIG_JSON}>{MCP_CONFIG_JSON}</CodeBlock>
        </div>

        {/* VS Code (Cline) */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
            VS Code (Cline)
          </h4>
          <p className="text-[13px] leading-[1.5] text-dim">
            Command Palette →{" "}
            <code className="rounded bg-bg px-1.5 py-0.5 text-xs">
              MCP: Add server
            </code>{" "}
            → stdio →{" "}
            <code className="rounded bg-bg px-1.5 py-0.5 text-xs">
              npx -y wtfont mcp
            </code>
          </p>
        </div>

        {/* Tools list */}
        <div className="rounded-xl border border-border bg-surface p-7">
          <h4 className="m-0 mb-3.5 text-[15px] font-semibold text-text-strong">
            8 tools available
          </h4>
          <ul className="m-0 list-disc pl-[18px] text-[13px] leading-[1.9] text-dim">
            {MCP_TOOLS.map((t) => (
              <li key={t.name}>
                <code className="rounded bg-bg px-1.5 py-0.5 text-xs text-text">
                  {t.name}
                </code>{" "}
                — {t.desc}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-dim">
        Hit a config error? Copy the exact message and paste it into Claude —
        it&rsquo;ll walk you through the fix.
      </p>
    </section>
  );
}
