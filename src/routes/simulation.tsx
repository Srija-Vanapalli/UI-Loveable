import { ClientOnly, createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  AudioLines,
  Box,
  CheckCircle2,
  Clock3,
  Database,
  Gauge,
  Loader2,
  Pause,
  Play,
  RotateCcw,
  Thermometer,
  Waves,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/engenia/AppShell";
import { EmptyPanel, ErrorBoundary } from "@/components/engenia/ErrorBoundary";
import type { TwinViewerHandle } from "@/components/engenia/DigitalTwinViewer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSampleData } from "@/lib/sample-data";
import { cn } from "@/lib/utils";

const DigitalTwinViewer = lazy(() =>
  import("@/components/engenia/DigitalTwinViewer").then((module) => ({
    default: module.DigitalTwinViewer,
  })),
);

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Digital Twin — Engenia" },
      {
        name: "description",
        content: "Run interactive sample scenarios on the harbour-listener digital twin.",
      },
      { property: "og:title", content: "Digital Twin — Engenia" },
      {
        property: "og:description",
        content:
          "Explore the verified sample design with interactive conditions, telemetry, and a 3D digital twin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SimulationPage,
});

type ScenarioId = "harbour" | "acoustic" | "thermal";

const SCENARIOS: Record<
  ScenarioId,
  {
    name: string;
    shortName: string;
    noise: number;
    temperature: number;
    description: string;
    icon: typeof Waves;
  }
> = {
  harbour: {
    name: "Harbour ambience",
    shortName: "Harbour",
    noise: 62,
    temperature: 24,
    description: "Nominal coastal deployment",
    icon: Waves,
  },
  acoustic: {
    name: "Acoustic event",
    shortName: "Acoustic",
    noise: 88,
    temperature: 24,
    description: "Transient detection response",
    icon: AudioLines,
  },
  thermal: {
    name: "Thermal soak",
    shortName: "Thermal",
    noise: 62,
    temperature: 55,
    description: "Elevated temperature behavior",
    icon: Thermometer,
  },
};

const ViewerLoading = () => (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Initializing digital twin…
  </div>
);

function SimulationPage() {
  const { enabled } = useSampleData();
  const [scenario, setScenario] = useState<ScenarioId>("harbour");
  const [running, setRunning] = useState(false);
  const [ambient, setAmbient] = useState(62);
  const [temperature, setTemperature] = useState(24);
  const [elapsed, setElapsed] = useState(0);
  const viewer = useRef<TwinViewerHandle>(null);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const metrics = useMemo(() => {
    const wave = running ? Math.sin(elapsed * 0.7) : 0;
    const sound = ambient + wave * (scenario === "acoustic" ? 3.4 : 1.2);
    const core = temperature + 8.4 + (running ? Math.sin(elapsed * 0.3) * 0.4 : 0);
    const power =
      412 + (scenario === "acoustic" ? 18 : 0) + (running ? Math.sin(elapsed * 0.5) * 3 : 0);
    const signal =
      -67 + (scenario === "thermal" ? -3 : 0) + (running ? Math.cos(elapsed * 0.4) : 0);
    return { sound, core, power, signal };
  }, [ambient, elapsed, running, scenario, temperature]);

  const chart = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const phase = index + elapsed;
        return (
          ambient +
          Math.sin(phase * 0.52) * (scenario === "acoustic" ? 3.2 : 1.5) +
          Math.cos(phase * 0.19) * 0.7
        );
      }),
    [ambient, elapsed, scenario],
  );

  const selectScenario = (id: ScenarioId) => {
    const preset = SCENARIOS[id];
    setScenario(id);
    setAmbient(preset.noise);
    setTemperature(preset.temperature);
    setElapsed(0);
    setRunning(false);
    viewer.current?.reset();
  };

  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setAmbient(SCENARIOS[scenario].noise);
    setTemperature(SCENARIOS[scenario].temperature);
    viewer.current?.reset();
  };

  if (!enabled)
    return (
      <>
        <PageHeader title="Digital twin" subtitle="Interactive sample simulation." />
        <EmptyPanel
          icon={Database}
          title="No simulation data"
          body="Turn on Sample Data to load the harbour-listener digital twin."
        />
      </>
    );

  return (
    <>
      <PageHeader
        title="Digital twin"
        subtitle="A live sample representation of harbour-listener, synchronized to design revision 03."
        right={
          <Button asChild variant="outline">
            <Link to="/contract">
              <ArrowLeft className="h-4 w-4" />
              Verification
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 px-1">
          <span
            className={cn(
              "h-2 w-2 rounded-full bg-muted-foreground",
              running && "animate-pulse bg-success",
            )}
          />
          <div>
            <p className="text-xs font-semibold">{running ? "Simulation running" : "Twin ready"}</p>
            <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Sample solver · deterministic telemetry
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => {
            const item = SCENARIOS[id];
            return (
              <Button
                key={id}
                variant={scenario === id ? "default" : "outline"}
                size="sm"
                onClick={() => selectScenario(id)}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.shortName}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Box className="h-4 w-4 text-primary" />
                harbour-listener.twin{" "}
                <span className="font-mono text-[9px] text-muted-foreground">REV 03</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3 w-3" />
                  {formatElapsed(elapsed)}
                </span>
                <span>Drag to orbit · scroll to zoom</span>
              </div>
            </div>
            <div className="relative h-[460px] bg-surface">
              <ErrorBoundary label="Digital twin viewer">
                <ClientOnly fallback={<ViewerLoading />}>
                  <Suspense fallback={<ViewerLoading />}>
                    <DigitalTwinViewer
                      ref={viewer}
                      running={running}
                      temperature={temperature}
                      scenario={scenario}
                    />
                  </Suspense>
                </ClientOnly>
              </ErrorBoundary>
              <div className="pointer-events-none absolute left-4 top-4 rounded-lg border bg-card/90 px-3 py-2 shadow-sm backdrop-blur">
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Active scenario
                </p>
                <p className="mt-1 text-xs font-semibold">{SCENARIOS[scenario].name}</p>
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 flex gap-2">
                <span className="rounded-full border bg-card/90 px-2.5 py-1 font-mono text-[9px] text-muted-foreground">
                  3 sensor nodes
                </span>
                <span className="rounded-full border bg-card/90 px-2.5 py-1 font-mono text-[9px] text-muted-foreground">
                  1 acoustic field
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Acoustic input</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Sample sound-pressure telemetry · dB SPL
                </p>
              </div>
              <span className="font-mono text-xl font-semibold text-primary">
                {metrics.sound.toFixed(1)}{" "}
                <span className="text-[10px] font-normal text-muted-foreground">dB</span>
              </span>
            </div>
            <TelemetryChart values={chart} />
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>−36 s</span>
              <span>Live sample window</span>
              <span>Now</span>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setRunning((value) => !value)}
                aria-pressed={running}
              >
                {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {running ? "Pause" : "Run simulation"}
              </Button>
              <Button variant="outline" size="icon" onClick={reset} aria-label="Reset simulation">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <AudioLines className="h-3.5 w-3.5 text-primary" />
                    Ambient noise
                  </span>
                  <span className="font-mono text-muted-foreground">{ambient} dB</span>
                </span>
                <Slider
                  value={[ambient]}
                  onValueChange={([value]) => {
                    if (value !== undefined) setAmbient(value);
                  }}
                  min={35}
                  max={100}
                  step={1}
                  className="mt-3"
                  aria-label="Ambient noise"
                />
              </label>
              <label className="block">
                <span className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Thermometer className="h-3.5 w-3.5 text-primary" />
                    Environment
                  </span>
                  <span className="font-mono text-muted-foreground">{temperature} °C</span>
                </span>
                <Slider
                  value={[temperature]}
                  onValueChange={([value]) => {
                    if (value !== undefined) setTemperature(value);
                  }}
                  min={10}
                  max={65}
                  step={1}
                  className="mt-3"
                  aria-label="Environment temperature"
                />
              </label>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <MetricCard
              icon={Gauge}
              label="Sound level"
              value={metrics.sound.toFixed(1)}
              unit="dB"
            />
            <MetricCard
              icon={Thermometer}
              label="Core temp"
              value={metrics.core.toFixed(1)}
              unit="°C"
              tone={metrics.core > 55 ? "warning" : undefined}
            />
            <MetricCard icon={Zap} label="Power" value={metrics.power.toFixed(0)} unit="mW" />
            <MetricCard
              icon={Activity}
              label="Signal"
              value={metrics.signal.toFixed(0)}
              unit="dBm"
            />
          </section>

          <section className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="text-xs font-semibold">2 design issues carried forward</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Mass is 18.4 g over budget. USB-C clearance interferes by 0.6 mm.
                </p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-2 h-7 px-2 text-xs">
              <Link to="/contract">
                Review verification
                <ArrowLeft className="h-3 w-3 rotate-180" />
              </Link>
            </Button>
          </section>

          <section className="rounded-xl border bg-card p-4 shadow-sm">
            <h2 className="text-xs font-semibold">Twin status</h2>
            <ul className="mt-3 space-y-2.5 text-[11px]">
              {[
                "Design revision synchronized",
                "Requirement contract linked",
                "Sensor model ready",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground">
        Prototype simulation: telemetry is generated locally from sample formulas and does not
        represent physical test results.
      </p>
    </>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  unit: string;
  tone?: "warning" | undefined;
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <Icon className={cn("h-3.5 w-3.5 text-primary", tone === "warning" && "text-warning")} />
      </div>
      <p
        className={cn("mt-2 font-mono text-lg font-semibold", tone === "warning" && "text-warning")}
      >
        {value}
        <span className="ml-1 text-[9px] font-normal text-muted-foreground">{unit}</span>
      </p>
    </div>
  );
}

function TelemetryChart({ values }: { values: number[] }) {
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const points = values
    .map(
      (value, index) =>
        `${(index / (values.length - 1)) * 600},${110 - ((value - min) / (max - min)) * 90}`,
    )
    .join(" ");
  const area = `0,110 ${points} 600,110`;
  return (
    <svg
      viewBox="0 0 600 120"
      className="mt-3 h-32 w-full"
      role="img"
      aria-label="Live sample acoustic telemetry chart"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="telemetry-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[20, 50, 80, 110].map((y) => (
        <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="var(--border)" strokeWidth="1" />
      ))}
      <polygon points={area} fill="url(#telemetry-fill)" />
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}
