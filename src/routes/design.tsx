import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useRef, useState, type ComponentType } from "react";
import { Box, Cpu, Database, DoorOpen, Loader2, RotateCcw, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/engenia/AppShell";
import { EmptyPanel, ErrorBoundary } from "@/components/engenia/ErrorBoundary";
import { WorkflowNext } from "@/components/engenia/WorkflowStepper";
import type { ViewerHandle } from "@/components/engenia/EnclosureViewer";
import { STAGES } from "@/lib/engenia-data";
import { useSampleData } from "@/lib/sample-data";

const EnclosureViewer = lazy(() =>
  import("@/components/engenia/EnclosureViewer").then((module) => ({
    default: module.EnclosureViewer,
  })),
);

export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [
      { title: "Design — Engenia" },
      {
        name: "description",
        content:
          "Interactive 3D enclosure and component views for the harbour-listener sample product.",
      },
      { property: "og:title", content: "Design — Engenia" },
      {
        property: "og:description",
        content:
          "Orbit the sample enclosure, inspect its electronics, and trace reported mechanical facts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Design,
});

const Loading = () => (
  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    Loading model…
  </div>
);

function Design() {
  const { enabled } = useSampleData();
  const [lidOpen, setLidOpen] = useState(false);
  const viewer = useRef<ViewerHandle>(null);
  if (!enabled)
    return (
      <>
        <PageHeader title="Design" subtitle="Enclosure and component views." />
        <EmptyPanel
          icon={Database}
          title="No design data"
          body="Turn on Sample Data to load the enclosure model."
        />
      </>
    );

  return (
    <>
      <PageHeader
        title="Product design"
        subtitle="The sample mechanical model and electronic facts, generated as one connected design workspace."
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Box className="h-4 w-4 text-primary" />
              enclosure.step{" "}
              <span className="font-mono text-xs text-muted-foreground">142 × 96 × 48 mm</span>
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={lidOpen ? "default" : "outline"}
                onClick={() => setLidOpen((value) => !value)}
              >
                <DoorOpen className="mr-1.5 h-3.5 w-3.5" />
                Lid {lidOpen ? "open" : "closed"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => viewer.current?.reset()}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Reset view
              </Button>
            </div>
          </div>
          <div className="h-[520px] bg-surface">
            <ErrorBoundary label="3D viewer">
              <ClientOnly fallback={<Loading />}>
                <Suspense fallback={<Loading />}>
                  <EnclosureViewer ref={viewer} lidOpen={lidOpen} />
                </Suspense>
              </ClientOnly>
            </ErrorBoundary>
          </div>
        </div>
        <div className="space-y-4">
          <ComponentPanel icon={Wrench} id="mechanical" />
          <ComponentPanel icon={Cpu} id="electronics" />
          <div className="rounded-xl border bg-surface p-4 text-xs leading-5 text-muted-foreground">
            <span className="font-medium text-foreground">Design provenance</span>
            <br />
            Facts shown here come from the sample mechanical and electronics stages, keeping the
            model connected to verification.
          </div>
        </div>
      </div>
      <WorkflowNext
        to="/contract"
        label="Verify the design"
        note="Compare reported design facts with the agreed requirement contract."
      />
    </>
  );
}

function ComponentPanel({
  icon: Icon,
  id,
}: {
  icon: ComponentType<{ className?: string }>;
  id: string;
}) {
  const stage = STAGES.find((item) => item.id === id);
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold capitalize">
        <Icon className="h-4 w-4 text-primary" />
        {id}
      </p>
      <ErrorBoundary label={id}>
        {!stage || !Object.keys(stage.facts).length ? (
          <p className="text-xs text-muted-foreground">No facts reported for this component.</p>
        ) : (
          <dl className="space-y-1.5">
            {Object.entries(stage.facts).map(([key, value]) => {
              const bad = stage.verdicts.some(
                (verdict) => verdict.pass === false && key === "dry_mass_g",
              );
              return (
                <div key={key} className="flex justify-between gap-3 text-xs">
                  <dt className="font-mono text-muted-foreground">{key}</dt>
                  <dd
                    className={`text-right font-mono ${bad ? "font-semibold text-destructive" : ""}`}
                  >
                    {String(value)}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </ErrorBoundary>
    </div>
  );
}
