import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, AudioLines, Database, Thermometer, Waves } from "lucide-react";
import { PageHeader } from "@/components/engenia/AppShell";
import { EmptyPanel, ErrorBoundary } from "@/components/engenia/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { useSampleData } from "@/lib/sample-data";

export const Route = createFileRoute("/scenarios")({
  head: () => ({
    meta: [
      { title: "Scenarios — Engenia" },
      {
        name: "description",
        content: "Sample operating scenarios for the harbour-listener digital twin.",
      },
      { property: "og:title", content: "Scenarios — Engenia" },
      {
        property: "og:description",
        content:
          "Prepare harbour ambience, acoustic event, and thermal-soak scenarios for the sample digital twin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScenariosPage,
});

const SCENARIOS = [
  {
    id: "SIM-01",
    name: "Harbour ambience",
    description:
      "Establish a baseline with typical coastal noise, nominal power draw, and continuous sensor reporting.",
    icon: Waves,
    duration: "20 min",
    conditions: "62 dB · 24 °C",
    status: "Ready",
  },
  {
    id: "SIM-02",
    name: "Acoustic event",
    description:
      "Inject a transient sound event and inspect sensing response, telemetry, and processor behavior.",
    icon: AudioLines,
    duration: "5 min",
    conditions: "88 dB · 24 °C",
    status: "Ready",
  },
  {
    id: "SIM-03",
    name: "Thermal soak",
    description:
      "Raise the environment temperature to explore enclosure heat behavior before physical testing.",
    icon: Thermometer,
    duration: "45 min",
    conditions: "62 dB · 55 °C",
    status: "2 issues carried",
  },
];

function ScenariosPage() {
  const { enabled } = useSampleData();
  if (!enabled)
    return (
      <>
        <PageHeader title="Simulation scenarios" subtitle="Sample digital-twin conditions." />
        <EmptyPanel
          icon={Database}
          title="No scenario data"
          body="Turn on Sample Data to load the harbour-listener scenarios."
        />
      </>
    );

  return (
    <>
      <PageHeader
        title="Simulation scenarios"
        subtitle="Prepared sample conditions for exploring the virtual product before physical testing."
        right={
          <Button asChild>
            <Link to="/simulation">
              Open digital twin
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />
      <ErrorBoundary label="Simulation scenarios">
        <div className="grid gap-4 lg:grid-cols-3">
          {SCENARIOS.map((scenario) => (
            <article
              key={scenario.id}
              className="group flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <scenario.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{scenario.id}</span>
              </div>
              <h2 className="mt-5 text-base font-semibold tracking-tight">{scenario.name}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                {scenario.description}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 text-xs">
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="mt-1 font-mono">{scenario.duration}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Conditions</dt>
                  <dd className="mt-1 font-mono">{scenario.conditions}</dd>
                </div>
              </dl>
              <div className="mt-5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                  <Activity className="h-3.5 w-3.5" />
                  {scenario.status}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/simulation">
                    Configure
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      </ErrorBoundary>
      <div className="mt-5 rounded-lg border border-info/20 bg-info/5 p-4 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Prototype note:</span> scenarios use scripted
        sample telemetry, not a physics solver or connected hardware.
      </div>
    </>
  );
}
