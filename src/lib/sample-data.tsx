import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface SampleDataContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  prompt: string;
  setPrompt: (value: string) => void;
}

const SampleDataContext = createContext<SampleDataContextValue>({
  enabled: true,
  setEnabled: () => {},
  prompt: "",
  setPrompt: () => {},
});

export function SampleDataProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);
  const [prompt, setPrompt] = useState("");
  const value = useMemo(() => ({ enabled, setEnabled, prompt, setPrompt }), [enabled, prompt]);
  return <SampleDataContext.Provider value={value}>{children}</SampleDataContext.Provider>;
}

export const useSampleData = () => useContext(SampleDataContext);
