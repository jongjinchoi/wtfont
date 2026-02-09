"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { UrlInput } from "@/components/url-input";
import { normalizeUrl, urlToSlug } from "@/lib/url-utils";

const SPINNER = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

const ASCII_LINES = [
  // WHAT (W10+H8+A8+T9 = 35)
  "██╗    ██╗██╗  ██╗ █████╗ ████████╗",
  "██║    ██║██║  ██║██╔══██╗╚══██╔══╝",
  "██║ █╗ ██║███████║███████║   ██║   ",
  "██║███╗██║██╔══██║██╔══██║   ██║   ",
  "╚███╔███╔╝██║  ██║██║  ██║   ██║   ",
  " ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ",
  " ",
  // THE (T9+H8+E8 = 25)
  "████████╗██╗  ██╗███████╗",
  "╚══██╔══╝██║  ██║██╔════╝",
  "   ██║   ███████║█████╗  ",
  "   ██║   ██╔══██║██╔══╝  ",
  "   ██║   ██║  ██║███████╗",
  "   ╚═╝   ╚═╝  ╚═╝╚══════╝",
  " ",
  // FONT (F8+O9+N10+T9 = 36)
  "███████╗ ██████╗ ███╗   ██╗████████╗",
  "██╔════╝██╔═══██╗████╗  ██║╚══██╔══╝",
  "█████╗  ██║   ██║██╔██╗ ██║   ██║   ",
  "██╔══╝  ██║   ██║██║╚██╗██║   ██║   ",
  "██║     ╚██████╔╝██║ ╚████║   ██║   ",
  "╚═╝      ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ",
];

type LineType =
  | { kind: "cmd"; text: string }
  | { kind: "info"; text: string }
  | { kind: "success"; text: string }
  | { kind: "system"; text: string }
  | { kind: "path"; text: string }
  | { kind: "progress"; percent: number }
  | { kind: "cat"; text: string }
  | { kind: "box"; text: string }
  | { kind: "ascii"; content: string }
  | { kind: "input" };

export default function HomePage() {
  const router = useRouter();
  const [lines, setLines] = useState<LineType[]>([]);
  const [progress, setProgress] = useState(0);
  const [booted, setBooted] = useState(false);
  const [spinnerFrame, setSpinnerFrame] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = mainRef.current.scrollHeight;
    }
  }, [lines, progress]);

  // Spinner animation
  useEffect(() => {
    const hasProgress = lines.some((l) => l.kind === "progress");
    if (!hasProgress) return;
    const interval = setInterval(() => {
      setSpinnerFrame((f) => (f + 1) % SPINNER.length);
    }, 80);
    return () => clearInterval(interval);
  }, [lines]);

  useEffect(() => {
    const add = (line: LineType, delay: number) =>
      setTimeout(() => setLines((prev) => [...prev, line]), delay);

    const timers: ReturnType<typeof setTimeout>[] = [];

    // Boot sequence
    timers.push(add({ kind: "cmd", text: "$ ssh guest@wtfont.wtf" }, 400));
    timers.push(add({ kind: "info", text: "Connecting to wtfont.wtf..." }, 1200));
    timers.push(add({ kind: "success", text: "Connected (2ms)" }, 2800));
    timers.push(add({ kind: "system", text: "[system] next 15.x | react 19.x | ai-powered" }, 3500));
    timers.push(add({ kind: "path", text: "> home" }, 4200));

    // Progress bar (spinner + text + bar in one line)
    timers.push(add({ kind: "progress", percent: 0 }, 5000));

    const progressSteps = [10, 25, 45, 60, 80, 95, 100];
    progressSteps.forEach((p, i) => {
      timers.push(setTimeout(() => setProgress(p), 5500 + i * 300));
    });

    // Clear loading line before content
    timers.push(setTimeout(() => {
      setLines((prev) => prev.filter((l) => l.kind !== "progress"));
    }, 7800));

    // MOTD
    timers.push(add({ kind: "box", text: "Analyze any website's fonts. Find free alternatives. Get copy-paste code." }, 8000));

    // ASCII art line by line
    ASCII_LINES.forEach((line, i) => {
      timers.push(add({ kind: "ascii", content: line }, 9000 + i * 100));
    });

    // Input
    const afterAscii = 9800 + ASCII_LINES.length * 100 + 600;
    timers.push(add({ kind: "input" }, afterAscii));
    timers.push(setTimeout(() => setBooted(true), afterAscii + 800));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSubmit = useCallback(
    (url: string) => {
      const normalized = normalizeUrl(url);
      const slug = urlToSlug(normalized);
      router.push(`/r/${slug}?url=${encodeURIComponent(normalized)}`);
    },
    [router]
  );

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main ref={mainRef} className="flex-1 overflow-y-auto pt-section">
        <div className="mx-auto max-w-content px-page-px font-mono text-sm">
          {(() => {
            const elements: React.ReactNode[] = [];
            let i = 0;
            while (i < lines.length) {
              const line = lines[i];
              switch (line.kind) {
                case "cmd":
                  elements.push(
                    <div key={i} className="py-line">
                      <span className="text-success">$</span>
                      <span className="text-terminal-text ml-2">{line.text.slice(2)}</span>
                    </div>
                  );
                  i++;
                  break;

                case "info":
                  elements.push(
                    <div key={i} className="text-terminal-subtle py-line">
                      {line.text}
                    </div>
                  );
                  i++;
                  break;

                case "success":
                  elements.push(
                    <div key={i} className="text-success py-line">
                      <span className="mr-1.5">+</span>
                      {line.text}
                    </div>
                  );
                  i++;
                  break;

                case "system":
                  elements.push(
                    <div key={i} className="text-terminal-subtle py-line">
                      {line.text}
                    </div>
                  );
                  i++;
                  break;

                case "path":
                  elements.push(
                    <div key={i} className="text-terminal-muted py-line pt-8">
                      {line.text}
                    </div>
                  );
                  i++;
                  break;

                case "progress": {
                  const total = 20;
                  const filled = Math.round((progress / 100) * total);
                  const bar =
                    "█".repeat(filled) + "░".repeat(total - filled);
                  elements.push(
                    <div key={i} className="py-line">
                      <span className="text-brand">
                        {SPINNER[spinnerFrame]}
                      </span>
                      <span className="text-terminal-muted ml-2">
                        Loading assets...
                      </span>
                      <span className="ml-3">
                        <span className="text-brand">
                          {bar.slice(0, filled)}
                        </span>
                        <span className="text-terminal-subtle">
                          {bar.slice(filled)}
                        </span>
                      </span>
                      <span className="text-terminal-subtle ml-2">
                        {progress}%
                      </span>
                    </div>
                  );
                  i++;
                  break;
                }

                case "cat":
                  elements.push(
                    <div key={i} className="pt-section py-line">
                      <span className="text-success">user@wtfont:~$</span>
                      <span className="text-terminal-text ml-2">cat readme.md</span>
                    </div>
                  );
                  i++;
                  break;

                case "box":
                  elements.push(
                    <div key={i} className="my-2 px-4 py-2.5 border border-brand rounded inline-block">
                      <span className="text-brand mr-2">*</span>
                      <span className="text-terminal-text">{line.text}</span>
                    </div>
                  );
                  i++;
                  break;

                case "ascii": {
                  const startIdx = i;
                  const asciiLines: string[] = [];
                  while (i < lines.length && lines[i].kind === "ascii") {
                    asciiLines.push((lines[i] as { kind: "ascii"; content: string }).content);
                    i++;
                  }
                  elements.push(
                    <div
                      key={`ascii-${startIdx}`}
                      className="overflow-x-auto select-none mt-section"
                      style={{
                        fontSize: "clamp(8px, 2vw, 16px)",
                        lineHeight: 1.2,
                      }}
                    >
                      {asciiLines.map((asciiLine, li) => (
                        <div key={li} className="whitespace-nowrap">
                          {[...asciiLine].map((char, ci) => (
                            <span
                              key={ci}
                              className="text-brand"
                              style={{
                                display: "inline-block",
                                width: "1ch",
                                textAlign: "center",
                                fontFamily: "monospace",
                              }}
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                  break;
                }

                case "input":
                  elements.push(
                    <div key={i} className="pt-section">
                      <UrlInput onSubmit={handleSubmit} />
                    </div>
                  );
                  i++;
                  break;

                default:
                  i++;
                  break;
              }
            }
            return elements;
          })()}

          {!booted && (
            <div className="pt-line">
              <span className="inline-block w-2 h-4 bg-brand animate-blink" />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
