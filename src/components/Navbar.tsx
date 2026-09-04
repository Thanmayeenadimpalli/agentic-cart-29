import { Link } from "@tanstack/react-router";
import { Bot, HelpCircle, ShoppingCart, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAgent } from "@/context/AgentContext";
import { useApp } from "@/context/AppContext";

export function Navbar() {
  const { count, setDrawerOpen } = useCart();
  const { panelOpen, setPanelOpen } = useAgent();
  const { setInfoOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          AgenticCart
        </Link>

        <div className="ml-4 hidden items-center gap-1 text-sm sm:flex">
          <Link
            to="/"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "rounded-lg px-3 py-2 bg-muted font-medium text-foreground" }}
            activeOptions={{ exact: true }}
          >
            Shop
          </Link>
          <Link
            to="/orders"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "rounded-lg px-3 py-2 bg-muted font-medium text-foreground" }}
          >
            Orders
          </Link>
          <Link
            to="/agent"
            className="rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            activeProps={{ className: "rounded-lg px-3 py-2 bg-muted font-medium text-foreground" }}
          >
            Agent Console
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setInfoOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted sm:inline-flex"
          >
            <HelpCircle className="h-3.5 w-3.5" /> How this demo works
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open cart"
            className="relative rounded-lg border border-border p-2 hover:bg-muted"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">AI Shopping Agent</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
