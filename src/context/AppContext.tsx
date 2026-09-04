import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { CartProvider } from "./CartContext";
import { AgentProvider } from "./AgentContext";

interface AppContextValue {
  infoOpen: boolean;
  setInfoOpen: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const value = useMemo(() => ({ infoOpen, setInfoOpen }), [infoOpen]);
  return (
    <AppContext.Provider value={value}>
      <CartProvider>
        <AgentProvider>{children}</AgentProvider>
      </CartProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
