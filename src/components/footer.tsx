export function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-8 mt-20">
      <div className="mx-auto max-w-5xl px-4 text-center space-y-2">
        <p className="font-pixel text-sm">
          <span className="text-brand">WTFont</span>
          <span className="text-zinc-600">.wtf</span>
        </p>
        <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
          This tool identifies fonts used on websites and suggests free
          alternatives. We do not host or distribute font files. All trademarks
          belong to their respective owners.
        </p>
        <p className="text-xs text-zinc-700">
          Some links may earn us a commission at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
