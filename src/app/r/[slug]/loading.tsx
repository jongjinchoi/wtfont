import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ResultLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-content px-page-px">
          <div className="space-y-1 font-mono text-sm">
            <div className="animate-fade-in-line">
              <span className="text-brand">$</span>
              <span className="text-terminal-text"> wtfont analyze ...</span>
            </div>
            <div
              className="animate-fade-in-line"
              style={{ animationDelay: "0.3s" }}
            >
              <span className="text-terminal-link">Connecting...</span>
            </div>
            <span className="inline-block w-2 h-4 bg-terminal-text animate-blink mt-1" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
