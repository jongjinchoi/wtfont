import Image from "next/image";
import { IMG, SITE } from "@/lib/content";

export default function Nav() {
  return (
    <nav className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-[18px]">
      <div className="flex items-center gap-2.5 text-[15px] font-bold text-text-strong">
        <Image src={IMG.logo} alt="" width={22} height={22} />
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
