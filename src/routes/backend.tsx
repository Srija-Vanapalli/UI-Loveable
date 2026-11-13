import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ChevronRight,
  Circle,
  Database,
  FileCode2,
  FileJson2,
  Folder,
  FolderOpen,
  ShieldCheck,
  SquareTerminal,
} from "lucide-react";
import { PageHeader } from "@/components/engenia/AppShell";
import { EmptyPanel } from "@/components/engenia/ErrorBoundary";
import { useSampleData } from "@/lib/sample-data";

export const Route = createFileRoute("/backend")({
  head: () => ({
    meta: [
      { title: "Open Backend — Engenia" },
      {
        name: "description",
        content:
          "Explore the harbour-listener sample agent workspace in an interactive demo Linux shell.",
      },
      { property: "og:title", content: "Open Backend — Engenia" },
      {
        property: "og:description",
        content:
          "Inspect sample engineering artifacts and run safe demo commands in Engenia's simulated agent environment.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BackendPage,
});

type TerminalEntry = { id: number; command?: string; lines: string[] };

const QUICK_COMMANDS = ["help", "ls", "status", "cat spec/harbour-listener.yaml"];

const INITIAL_ENTRY: TerminalEntry = {
  id: 0,
  lines: [
    "Engenia agent environment · interactive interface demo",
    "Linux harbour-listener 6.8.0-demo x86_64",
    "Type 'help' to see the available simulated commands.",
  ],
};

function commandOutput(command: string): string[] {
  const [name, ...args] = command.split(/\s+/);
  switch (name) {
    case "help":
      return [
        "Available demo commands:",
        "  ls                              list sample workspace artifacts",
        "  pwd                             print the working directory",
        "  status                          summarize the sample pipeline",
        "  cat spec/harbour-listener.yaml  read the sample specification",
        "  whoami                          print the demo agent user",
        "  clear                           clear the terminal",
      ];
    case "ls":
      return ["artifacts/  design/  contract.json  requirements/  spec/  verification/"];
    case "pwd":
      return ["/workspace/harbour-listener"];
    case "whoami":
      return ["engenia-agent"];
    case "status":
      return [
        "PROJECT  harbour-listener  ·  SAMPLE DATA",
        "done     spec, lint, verify_plan, architect, mechanical, electronics",
        "running  firmware — compiling module 6/9",
        "failed   integration — mass rollup and connector clearance",
        "blocked  redteam, simulation, testplan, final",
      ];
    case "cat":
      if (args.join(" ") === "spec/harbour-listener.yaml") {
        return [
          "project: harbour-listener",
          "sample_data: true",
          "product:",
          "  type: acoustic_monitor",
          "  deployment: coastal",
          "interfaces:",
          "  - continuous_acoustic_sensing",
          "  - wireless_reporting",
          "design_inputs: ./contract.json",
        ];
      }
      return [`cat: ${args.join(" ") || "missing file"}: file not available in this demo`];
    default:
      return [`bash: ${name}: command not found in this demo. Type 'help'.`];
  }
}

function BackendPage() {
  const { enabled } = useSampleData();
  const [history, setHistory] = useState<TerminalEntry[]>([INITIAL_ENTRY]);
  const [command, setCommand] = useState("");
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const viewport = scrollRef.current;
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [history]);

  function runCommand(rawCommand: string) {
    const trimmed = rawCommand.trim();
    if (!trimmed) return;
    setCommand("");
    inputRef.current?.focus();
    if (trimmed === "clear") {
      setHistory([]);
      return;
    }
    const entry = { id: nextId.current++, command: trimmed, lines: commandOutput(trimmed) };
    setHistory((current) => [...current, entry]);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    runCommand(command);
  }

  return (
    <>
      <PageHeader
        title="Agent Linux workspace"
        subtitle="Explore the sample project files and terminal output from the environment where the engineering agent works."
        right={
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Simulated read-only shell
          </span>
        }
      />
      {!enabled ? (
        <EmptyPanel
          icon={Database}
          title="No workspace data"
          body="Turn on Sample Data in the header to explore the harbour-listener agent workspace."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="border-b bg-surface p-4 lg:border-b-0 lg:border-r">
              <div className="mb-4 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-mono text-xs font-semibold">harbour-listener</p>
                  <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">/workspace</p>
                </div>
              </div>
              <nav aria-label="Sample workspace files" className="space-y-1 font-mono text-xs">
                <p className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" /> artifacts/
                </p>
                <p className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" /> design/
                </p>
                <p className="flex items-center gap-2 rounded-md bg-card px-2 py-1.5 font-medium shadow-sm">
                  <FileJson2 className="h-3.5 w-3.5 text-primary" /> contract.json
                </p>
                <p className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" /> requirements/
                </p>
                <div>
                  <p className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground">
                    <FolderOpen className="h-3.5 w-3.5" /> spec/
                  </p>
                  <p className="ml-4 flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-muted-foreground">
                    <FileCode2 className="h-3.5 w-3.5" /> harbour-listener.yaml
                  </p>
                </div>
                <p className="flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground">
                  <Folder className="h-3.5 w-3.5" /> verification/
                </p>
              </nav>
              <div className="mt-5 rounded-lg border bg-card p-3">
                <p className="flex items-center gap-2 text-xs font-medium">
                  <Circle className="h-2 w-2 fill-success text-success" /> Agent environment ready
                </p>
                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                  Demo files only. No host commands are executed.
                </p>
              </div>
            </aside>

            <section
              className="flex min-w-0 flex-col bg-foreground text-background"
              aria-label="Linux terminal"
            >
              <div className="flex h-11 shrink-0 items-center gap-2 border-b border-background/15 px-4">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="h-2.5 w-2.5 rounded-full bg-success" />
                <span className="ml-2 flex items-center gap-2 font-mono text-[10px] text-background/60">
                  <SquareTerminal className="h-3.5 w-3.5" />
                  engenia-agent@harbour-listener: ~
                </span>
                <span className="ml-auto rounded border border-background/20 px-1.5 py-0.5 font-mono text-[9px] uppercase text-background/60">
                  Demo
                </span>
              </div>

              <div
                ref={scrollRef}
                role="log"
                aria-live="polite"
                className="h-[460px] overflow-auto px-4 py-4 font-mono text-xs leading-6 sm:px-5"
                onClick={() => inputRef.current?.focus()}
              >
                {history.map((entry) => (
                  <div key={entry.id}>
                    {entry.command && (
                      <p className="mt-3 flex flex-wrap gap-x-2">
                        <span className="shrink-0 text-success">engenia@harbour-listener:~$</span>
                        <span>{entry.command}</span>
                      </p>
                    )}
                    {entry.lines.map((line, index) => (
                      <pre
                        key={`${entry.id}-${index}`}
                        className="whitespace-pre-wrap break-words font-mono text-background/80"
                      >
                        {line}
                      </pre>
                    ))}
                  </div>
                ))}
                <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
                  <label htmlFor="backend-command" className="shrink-0 text-success">
                    engenia@harbour-listener:~$
                  </label>
                  <input
                    ref={inputRef}
                    id="backend-command"
                    value={command}
                    onChange={(event) => setCommand(event.currentTarget.value)}
                    className="min-w-0 flex-1 border-0 bg-transparent font-mono text-xs text-background caret-success outline-none placeholder:text-background/35"
                    placeholder="Type a demo command…"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </form>
              </div>
            </section>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3">
            <span className="mr-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ChevronRight className="h-3.5 w-3.5" /> Try a command
            </span>
            {QUICK_COMMANDS.map((quickCommand) => (
              <button
                key={quickCommand}
                onClick={() => runCommand(quickCommand)}
                className="rounded-md border bg-surface px-2.5 py-1.5 font-mono text-[10px] transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {quickCommand}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Interface prototype: this terminal supports only the listed simulated commands and does
            not connect to a real Linux machine.
          </p>
        </div>
      )}
    </>
  );
}
