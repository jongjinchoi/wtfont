"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: Tab[];
  defaultTab?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div
        className="flex gap-1 border-b border-zinc-800 mb-4"
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 cursor-pointer
              ${
                activeTab === tab.id
                  ? "text-brand border-b-2 border-brand bg-brand/10"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
