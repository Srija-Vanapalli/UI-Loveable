import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  label: string;
  onRetry?: () => void;
}
interface State {
  error: Error | null;
  key: number;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, key: 0 };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  retry = () => {
    this.props.onRetry?.();
    this.setState((s) => ({ error: null, key: s.key + 1 }));
  };
  override render() {
    if (this.state.error)
      return (
        <ErrorPanel
          label={this.props.label}
          message={this.state.error.message}
          onRetry={this.retry}
        />
      );
    return (
      <div key={this.state.key} className="contents">
        {this.props.children}
      </div>
    );
  }
}

export function ErrorPanel({
  label,
  message,
  onRetry,
}: {
  label: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive" />
      <div>
        <p className="text-sm font-medium">{label} failed to load</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RotateCw className="mr-1.5 h-3.5 w-3.5" />
        Retry
      </Button>
    </div>
  );
}

export function EmptyPanel({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card p-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-xs text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
