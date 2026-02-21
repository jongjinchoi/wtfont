// TODO: 에스토니아 법인 등록 → Stripe 계정 생성 후:
//   1. Stripe Payment Link ($3 후원) 푸터에 추가
//   2. 후원자 수 표시 (e.g. "Supported by 23 developers")
export function Footer() {
  return (
    <footer className="border-t border-terminal-border bg-terminal-bg">
      <div className="mx-auto max-w-content flex items-center justify-between px-page-px py-bar-y text-xs text-terminal-subtle">
        <div className="flex items-center gap-4">
          <span>
            <span className="text-brand">*</span> AI matching
          </span>
          <span>
            <span className="text-brand">&lt;/&gt;</span> HTML / Next.js / Nuxt / React
          </span>
          <span>
            <span className="text-success">+</span> 100% free
          </span>
        </div>
        <span>v0.1.0</span>
      </div>
    </footer>
  );
}
