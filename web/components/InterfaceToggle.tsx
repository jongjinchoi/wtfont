"use client";
import { useSyncExternalStore } from "react";
import MCPView from "./MCPView";
import CLIView from "./CLIView";

type Interface = "mcp" | "cli";

const STORAGE_KEY = "wtfont-interface:v1";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Interface {
  const hash = window.location.hash.replace("#", "");
  if (hash === "mcp" || hash === "cli") return hash;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "mcp" || stored === "cli") return stored;
  } catch {
    // localStorage unavailable — private mode, quota exceeded, or disabled
  }
  return "mcp";
}

function getServerSnapshot(): Interface {
  return "mcp";
}

export default function InterfaceToggle() {
  const choice = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const pick = (next: Interface) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore — private mode / quota
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.interface = next;
    }
    if (window.history.replaceState) {
      window.history.replaceState(null, "", `#${next}`);
      // replaceState does not fire hashchange; dispatch manually so the store re-reads
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  };

  return (
    <>
      <div className="sticky top-0 z-10 border-t border-border bg-bg/90 py-4 backdrop-blur">
        <div
          role="tablist"
          aria-label="Choose interface"
          className="mx-auto flex max-w-md gap-1 rounded-lg border border-border bg-surface p-1"
        >
          <button
            role="tab"
            aria-selected={choice === "mcp"}
            aria-controls="view-mcp"
            onClick={() => pick("mcp")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              choice === "mcp"
                ? "bg-surface-2 text-text-strong"
                : "text-dim hover:text-text"
            }`}
          >
            Through Claude (MCP)
          </button>
          <button
            role="tab"
            aria-selected={choice === "cli"}
            aria-controls="view-cli"
            onClick={() => pick("cli")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              choice === "cli"
                ? "bg-surface-2 text-text-strong"
                : "text-dim hover:text-text"
            }`}
          >
            In terminal (CLI)
          </button>
        </div>
      </div>

      {/* Both views rendered; CSS (globals.css) hides the inactive one
          based on html[data-interface] — zero hydration flicker. */}
      <div id="view-mcp" role="tabpanel" data-view="mcp">
        <MCPView />
      </div>
      <div id="view-cli" role="tabpanel" data-view="cli">
        <CLIView />
      </div>
    </>
  );
}
