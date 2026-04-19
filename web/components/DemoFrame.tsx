import { IMG } from "@/lib/content";

export default function DemoFrame() {
  return (
    <div className="mx-auto mt-4 max-w-[980px] rounded-2xl bg-gradient-to-b from-border-strong to-transparent to-50% p-2">
      <div className="overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3.5 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2.5 font-mono text-xs text-dim">
            ~/ $ wtfont analyze vercel.com
          </span>
        </div>
        {/* next/image does not animate GIFs; use native <img> */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={IMG.demo}
          alt="wtfont demo"
          loading="lazy"
          width={1200}
          height={700}
          className="block h-auto w-full"
        />
      </div>
    </div>
  );
}
