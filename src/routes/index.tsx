import { ClientOnly, createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { ChatStatus, UIMessage } from "ai";
import {
  Activity,
  ArrowRight,
  ArrowUp,
  AudioLines,
  Box,
  CheckCircle2,
  FileCheck2,
  Radio,
  ShieldCheck,
  Waves,
} from "lucide-react";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { EngeniaBrand } from "@/components/engenia/Brand";
import { Button } from "@/components/ui/button";
import { useSampleData } from "@/lib/sample-data";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } =>
    search["edit"] === true ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: "Engenia — From prompt to product" },
      {
        name: "description",
        content:
          "Describe a product and explore Engenia's engineering workflow from requirements and CAD to verification and a digital twin.",
      },
      { property: "og:title", content: "Engenia — From prompt to product" },
      {
        property: "og:description",
        content:
          "An engineering workspace that takes a product brief through specification, design, verification, and simulation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PromptWorkspace,
});

const SAMPLE_PROMPT =
  "Design a low-power harbour monitoring device with continuous acoustic sensing, wireless reporting, and a sealed enclosure for coastal deployment.";

const ASSISTANT_RESPONSE = `Your brief is ready. I’ll use the **harbour-listener sample project** to demonstrate how Engenia works through the problem like an engineer.

The workspace connects the requirement contract, mechanical and electronic design, verification evidence, and a digital twin—so each decision stays visible from first prompt to virtual prototype.`;

const SUGGESTIONS = [
  { text: SAMPLE_PROMPT, label: "Harbour acoustic monitor", icon: Waves },
  {
    text: "Design a compact environmental sensor for cold-chain shipments with temperature logging and wireless alerts.",
    label: "Cold-chain sensor",
    icon: Radio,
  },
  {
    text: "Design a battery-powered predictive maintenance sensor for industrial rotating equipment.",
    label: "Industrial monitor",
    icon: Activity,
  },
];

function PromptWorkspace() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { prompt, setPrompt } = useSampleData();
  const [input, setInput] = useState(() => (search.edit ? prompt : ""));
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);
  useEffect(() => {
    if (status === "ready") textareaRef.current?.focus();
  }, [status]);

  const handleSubmit = ({ text }: PromptInputMessage) => {
    const trimmed = text.trim();
    if (!trimmed || status === "submitted" || status === "streaming") return;

    clearTimers();
    setPrompt(trimmed);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", parts: [{ type: "text", text: trimmed }] },
    ]);
    setStatus("submitted");

    const responseId = `assistant-${Date.now()}`;
    const startTimer = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: responseId, role: "assistant", parts: [{ type: "text", text: "" }] },
      ]);
      setStatus("streaming");
      let cursor = 0;
      const streamTimer = window.setInterval(() => {
        cursor = Math.min(cursor + 7, ASSISTANT_RESPONSE.length);
        const partial = ASSISTANT_RESPONSE.slice(0, cursor);
        setMessages((current) =>
          current.map((message) =>
            message.id === responseId
              ? { ...message, parts: [{ type: "text", text: partial }] }
              : message,
          ),
        );
        if (cursor === ASSISTANT_RESPONSE.length) {
          window.clearInterval(streamTimer);
          setStatus("ready");
        }
      }, 16);
      timers.current.push(streamTimer);
    }, 700);
    timers.current.push(startTimer);
  };

  const stop = () => {
    clearTimers();
    setStatus("ready");
  };

  const hasMessages = messages.length > 0;
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <div className="engineering-grid min-h-svh bg-background">
      <header className="flex h-16 items-center justify-between border-b bg-background/90 px-5 backdrop-blur sm:px-8">
        <EngeniaBrand />
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border bg-card px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground sm:inline-flex">
            Interactive prototype
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link to="/pipeline">
              View sample workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      {!hasMessages ? (
        <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl flex-col items-center justify-center px-5 py-12">
          <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
            <span className="h-px w-8 bg-primary/50" />
            From intent to engineered reality
            <span className="h-px w-8 bg-primary/50" />
          </div>
          <h1 className="max-w-3xl text-center text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
            {search.edit ? "Refine your engineering brief." : "What should we engineer?"}
          </h1>
          <p className="mt-5 max-w-2xl text-center text-base leading-7 text-muted-foreground">
            Describe the product. Engenia will shape the requirements, CAD, verification evidence,
            and digital twin—one connected engineering workflow.
          </p>

          <div className="mt-9 w-full max-w-3xl">
            <ClientOnly fallback={<div className="h-44 rounded-2xl border bg-card shadow-lg" />}>
              <PromptComposer
                input={input}
                setInput={setInput}
                status={status}
                textareaRef={textareaRef}
                onSubmit={handleSubmit}
                onStop={stop}
                large
              />
            </ClientOnly>
            <Suggestions className="mt-4 w-full justify-center">
              {SUGGESTIONS.map(({ text, label, icon: Icon }) => (
                <Suggestion
                  key={label}
                  suggestion={text}
                  onClick={(value) => {
                    setInput(value);
                    textareaRef.current?.focus();
                  }}
                  className="h-auto gap-2 bg-card px-3 py-2 text-xs shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {label}
                </Suggestion>
              ))}
            </Suggestions>
          </div>

          <div className="mt-12 grid w-full max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
            {[
              { label: "Specify", note: "Requirement contract", icon: FileCheck2 },
              { label: "Design", note: "CAD + electronics", icon: Box },
              { label: "Verify", note: "Evidence + issues", icon: ShieldCheck },
              { label: "Simulate", note: "Digital twin", icon: Activity },
            ].map((item, index) => (
              <div key={item.label} className="bg-card/80 p-4">
                <div className="flex items-center justify-between">
                  <item.icon className="h-4 w-4 text-primary" />
                  <span className="font-mono text-[9px] text-muted-foreground">0{index + 1}</span>
                </div>
                <p className="mt-3 text-xs font-semibold">{item.label}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            Scripted demo · prompts are not sent or saved
          </p>
        </main>
      ) : (
        <main className="mx-auto flex h-[calc(100svh-4rem)] w-full max-w-4xl flex-col px-4 py-4 sm:px-6">
          <Conversation className="min-h-0">
            <ConversationContent className="mx-auto w-full max-w-3xl px-2 py-8">
              {messages.map((message) => (
                <Message key={message.id} from={message.role} className="max-w-full">
                  <MessageContent
                    className={
                      message.role === "user"
                        ? "bg-primary text-primary-foreground group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground"
                        : "w-full"
                    }
                  >
                    {message.parts.map((part, index) =>
                      part.type === "text" ? (
                        <MessageResponse
                          key={`${message.id}-${index}`}
                          isAnimating={status === "streaming" && message.id === lastAssistantId}
                        >
                          {part.text}
                        </MessageResponse>
                      ) : null,
                    )}
                  </MessageContent>
                  {message.role === "assistant" &&
                    message.id === lastAssistantId &&
                    status === "ready" && (
                      <div className="mt-2 overflow-hidden rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center gap-2 border-b bg-surface px-4 py-2.5 text-xs font-medium">
                          <CheckCircle2 className="h-4 w-4 text-success" />
                          Sample engineering plan ready
                        </div>
                        <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                            {["Requirements", "3D design", "Verification", "Digital twin"].map(
                              (label, index) => (
                                <div
                                  key={label}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <span className="font-mono text-[9px] text-primary">
                                    0{index + 1}
                                  </span>
                                  {label}
                                </div>
                              ),
                            )}
                          </div>
                          <Button onClick={() => navigate({ to: "/pipeline" })}>
                            Build sample product
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                </Message>
              ))}
              {status === "submitted" && (
                <Message from="assistant" className="max-w-full">
                  <div className="flex items-center gap-3 text-sm">
                    <AudioLines className="h-4 w-4 text-primary" />
                    <Shimmer>Structuring the engineering brief…</Shimmer>
                  </div>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <div className="mx-auto w-full max-w-3xl shrink-0 pb-2">
            <ClientOnly fallback={<div className="h-32 rounded-xl border bg-card" />}>
              <PromptComposer
                input={input}
                setInput={setInput}
                status={status}
                textareaRef={textareaRef}
                onSubmit={handleSubmit}
                onStop={stop}
              />
            </ClientOnly>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Prototype responses are scripted. No prompt or project data is saved.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}

function PromptComposer({
  input,
  setInput,
  status,
  textareaRef,
  onSubmit,
  onStop,
  large = false,
}: {
  input: string;
  setInput: (value: string) => void;
  status: ChatStatus;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onSubmit: (message: PromptInputMessage) => void;
  onStop: () => void;
  large?: boolean;
}) {
  return (
    <PromptInput
      onSubmit={onSubmit}
      className={
        large
          ? "[&_[data-slot=input-group]]:rounded-2xl [&_[data-slot=input-group]]:bg-card [&_[data-slot=input-group]]:shadow-lg"
          : "[&_[data-slot=input-group]]:rounded-xl [&_[data-slot=input-group]]:bg-card"
      }
    >
      <PromptInputTextarea
        ref={textareaRef}
        autoFocus
        value={input}
        onChange={(event) => setInput(event.currentTarget.value)}
        placeholder="Describe the product you want to build…"
        aria-label="Product brief"
        className={large ? "min-h-28 px-4 text-base leading-6" : "min-h-20 px-3"}
      />
      <PromptInputFooter className="px-3 pb-3">
        <PromptInputTools>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
            One product · one continuous workspace
          </span>
        </PromptInputTools>
        <div className="flex items-center gap-3">
          <span className="hidden font-mono text-[9px] text-muted-foreground sm:inline">
            Enter to submit
          </span>
          <PromptInputSubmit
            status={status}
            onStop={onStop}
            disabled={status === "ready" && !input.trim()}
            className="h-9 w-9 rounded-lg"
            aria-label="Submit product brief"
          >
            {status === "streaming" || status === "submitted" ? undefined : (
              <ArrowUp className="h-4 w-4" />
            )}
          </PromptInputSubmit>
        </div>
      </PromptInputFooter>
    </PromptInput>
  );
}
