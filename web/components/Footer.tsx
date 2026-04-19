import { SITE } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-border py-12 text-center text-[13px] text-dim">
      <div className="mb-3.5 flex justify-center gap-5">
        <a href={SITE.repo} className="text-text">
          GitHub
        </a>
        <a href={SITE.npm} className="text-text">
          npm
        </a>
        <a href={SITE.license} className="text-text">
          MIT License
        </a>
      </div>
      <p className="m-0">wtfont — what the font. © 2025</p>
    </footer>
  );
}
