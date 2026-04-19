import SectionHead from "./SectionHead";
import FeatureRow from "./FeatureRow";
import { FEATURE_ROWS, KEYBOARD_SHORTCUTS } from "@/lib/content";

export default function WhatItDoes() {
  return (
    <section id="features" className="border-t border-border py-[72px]">
      <SectionHead kicker="What it does" title="Four commands that cover the flow.">
        From detection to copy-paste code.
      </SectionHead>

      <div>
        {FEATURE_ROWS.map((row) => (
          <FeatureRow key={row.tag} row={row} />
        ))}
      </div>

      <div className="mt-16 rounded-xl border border-border bg-surface p-7">
        <h3 className="m-0 mb-4 text-lg font-semibold text-text-strong">
          Keyboard shortcuts
        </h3>
        <p className="mt-0 mb-4 text-sm text-dim">
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs">
            wtfont analyze
          </code>{" "}
          acts as a hub — navigate results and take action without leaving:
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-dim">Key</th>
              <th className="px-3 py-2 text-left font-medium text-dim">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {KEYBOARD_SHORTCUTS.map((k) => (
              <tr key={k.key} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-mono text-[13px] text-text">
                  {k.key}
                </td>
                <td className="px-3 py-2 text-text">{k.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 mb-0 text-sm text-dim">
          The same{" "}
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs">j/k</code>{" "}
          navigation works in{" "}
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs">browse</code>,{" "}
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs">history</code>,
          and{" "}
          <code className="rounded bg-bg px-1.5 py-0.5 text-xs">favorites</code>
          .
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-7">
        <h3 className="m-0 mb-3 text-lg font-semibold text-text-strong">
          JSON output
        </h3>
        <p className="mt-0 mb-3 text-sm text-dim">
          Pipe into any tool. Great for scripts and CI.
        </p>
        <pre className="m-0 overflow-x-auto rounded-md border border-border bg-bg p-4 text-[12.5px] text-text">
          wtfont analyze vercel.com --format json | jq{" "}
          {"'.fonts[] | select(.isFree == false) | .name'"}
        </pre>
      </div>
    </section>
  );
}
