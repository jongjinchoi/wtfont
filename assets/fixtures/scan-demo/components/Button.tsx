import type { ReactNode } from "react";

export function Button({ children }: { children: ReactNode }) {
  return (
    <button
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontWeight: 600,
        padding: "0.5rem 1rem",
      }}
    >
      {children}
    </button>
  );
}
