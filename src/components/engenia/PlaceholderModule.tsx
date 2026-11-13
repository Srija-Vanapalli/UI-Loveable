import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyPanel, ErrorBoundary } from "./ErrorBoundary";

/** Structured placeholder: no data is invented. Wrapped in an error boundary with retry. */
export function PlaceholderModule({
  name,
  icon,
}: {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const [loading, setLoading] = useState(false);
  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };
  return (
    <ErrorBoundary label={name}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3 rounded-lg border bg-card p-6">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <EmptyPanel
              icon={icon}
              title={`No ${name.toLowerCase()} loaded`}
              body={`The ${name.toLowerCase()} module has no source connected for harbour-listener. Nothing is shown rather than made-up data.`}
              action={
                <Button size="sm" variant="outline" onClick={reload}>
                  <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                  Check again
                </Button>
              }
            />
          )}
        </div>
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Module status
          </p>
          {[
            ["Source", "not connected"],
            ["Last sync", "never"],
            ["Items", "—"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-mono text-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
