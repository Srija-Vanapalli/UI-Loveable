export type StageStatus = "done" | "running" | "failed" | "blocked" | "not_run" | "stub";

export interface Stage {
  id: string;
  title: string;
  status: StageStatus;
  deps: string[];
  duration?: string;
  facts: Record<string, string | number>;
  verdicts: { label: string; pass: boolean | null; note: string }[];
  logs: string[];
}

export const STATUS_LABEL: Record<StageStatus, string> = {
  done: "done",
  running: "running",
  failed: "failed",
  blocked: "blocked",
  not_run: "not run",
  stub: "stub",
};

export const STAGES: Stage[] = [
  {
    id: "spec",
    title: "Specification bundle",
    status: "done",
    deps: [],
    duration: "0:03",
    facts: { bundle: "spec/*.yaml", format: "YAML", source: "product brief" },
    verdicts: [
      { label: "Specification loaded", pass: true, note: "Sample specification bundle ready" },
    ],
    logs: ["[00:00.01] loading spec/*.yaml", "[00:03.00] specification bundle ready ✓"],
  },
  {
    id: "lint",
    title: "Lint specification",
    status: "done",
    deps: ["spec"],
    duration: "0:08",
    facts: { rules_checked: 12, errors: 0, warnings: 0 },
    verdicts: [{ label: "Specification lint", pass: true, note: "No syntax or schema errors" }],
    logs: ["[00:00.01] validating YAML schema", "[00:08.00] lint passed ✓"],
  },
  {
    id: "verify_plan",
    title: "Verification agent writes checks",
    status: "done",
    deps: ["lint"],
    duration: "0:42",
    facts: { requirements_parsed: 38, ambiguous: 2, plan_version: "v3" },
    verdicts: [{ label: "Plan coverage", pass: true, note: "All top-level requirements mapped" }],
    logs: [
      "[00:00.01] loading spec bundle",
      "[00:12.40] parsed 38 requirements",
      "[00:42.11] plan verified ✓",
    ],
  },
  {
    id: "architect",
    title: "Writes contract.json",
    status: "done",
    deps: ["verify_plan"],
    duration: "3:18",
    facts: { subsystems: 3, interfaces: 7, mass_budget_g: 300, power_budget_mw: 450 },
    verdicts: [{ label: "Interface closure", pass: true, note: "7/7 interfaces defined" }],
    logs: [
      "[00:00.02] reading verified plan",
      "[01:40.30] allocated budgets to subsystems",
      "[03:18.00] architecture frozen ✓",
    ],
  },
  {
    id: "mechanical",
    title: "Mechanical",
    status: "done",
    deps: ["architect"],
    duration: "6:02",
    facts: { dry_mass_g: 318.4, envelope_mm: "142 × 96 × 48", wall_mm: 2.4, material: "PC-ABS" },
    verdicts: [
      { label: "Envelope fit", pass: true, note: "Within 150 × 100 × 50 mm" },
      { label: "Mass budget", pass: false, note: "318.4 g exceeds 300 g budget" },
    ],
    logs: [
      "[00:00.04] generating enclosure",
      "[04:10.22] shell + lid meshed",
      "[05:59.80] WARN dry_mass_g=318.4 > budget 300",
      "[06:02.00] stage complete with warnings",
    ],
  },
  {
    id: "electronics",
    title: "Electronics",
    status: "done",
    deps: ["architect"],
    duration: "4:47",
    facts: { board_mm: "88 × 60", layers: 4, est_power_mw: 412, components: 64 },
    verdicts: [
      { label: "Bay fit", pass: true, note: "Board fits 92 × 64 mm bay" },
      { label: "Power budget", pass: true, note: "412 mW ≤ 450 mW" },
    ],
    logs: [
      "[00:00.03] netlist synthesis",
      "[03:20.12] placement done",
      "[04:47.00] electronics complete ✓",
    ],
  },
  {
    id: "firmware",
    title: "Firmware",
    status: "running",
    deps: ["architect"],
    duration: "2:11…",
    facts: { target: "nRF52840", modules: 9, build: "in progress" },
    verdicts: [{ label: "Build", pass: null, note: "Compiling module 6/9" }],
    logs: [
      "[00:00.05] toolchain ready",
      "[01:02.44] module audio_capture built",
      "[02:11.09] compiling dsp_pipeline …",
    ],
  },
  {
    id: "integration",
    title: "Integration",
    status: "failed",
    deps: ["mechanical", "electronics", "firmware"],
    duration: "1:05",
    facts: { checks_run: 14, checks_failed: 2 },
    verdicts: [
      { label: "Mass rollup", pass: false, note: "System mass over contract" },
      {
        label: "Connector clearance",
        pass: false,
        note: "USB-C boss interferes with lid by 0.6 mm",
      },
    ],
    logs: [
      "[00:00.02] merging stage facts",
      "[00:41.30] ERROR mass rollup exceeds contract",
      "[01:05.00] ERROR clearance check failed",
      "[01:05.01] stage failed",
    ],
  },
  {
    id: "redteam",
    title: "Red team",
    status: "blocked",
    deps: ["spec"],
    facts: { waiting_on: "verification gate" },
    verdicts: [],
    logs: ["blocked: design verification gate is not satisfied"],
  },
  {
    id: "simprep",
    title: "Sim prep",
    status: "not_run",
    deps: ["spec"],
    facts: {},
    verdicts: [],
    logs: ["stage has not been scheduled"],
  },
  {
    id: "simulation",
    title: "Simulation",
    status: "blocked",
    deps: ["integration", "redteam", "simprep"],
    facts: { waiting_on: "integration, redteam, simprep" },
    verdicts: [],
    logs: ["blocked: upstream stages incomplete"],
  },
  {
    id: "testplan",
    title: "Test plan",
    status: "blocked",
    deps: ["spec"],
    facts: { waiting_on: "verified design baseline" },
    verdicts: [],
    logs: ["blocked: design verification gate is not satisfied"],
  },
  {
    id: "final",
    title: "All checks, reproduction, audit",
    status: "blocked",
    deps: ["simulation", "testplan"],
    facts: { waiting_on: "simulation, testplan" },
    verdicts: [],
    logs: ["blocked: upstream stages 'simulation, testplan' incomplete"],
  },
  {
    id: "report",
    title: "Trace matrix",
    status: "stub",
    deps: ["final"],
    facts: { implementation: "stub" },
    verdicts: [],
    logs: ["stub stage: no implementation yet"],
  },
];

/** Columns left → right, computed as dependency depth. */
export function stageColumns(stages: Stage[]): Stage[][] {
  const depth = new Map<string, number>();
  const byId = new Map(stages.map((s) => [s.id, s]));
  const d = (id: string): number => {
    if (depth.has(id)) return depth.get(id)!;
    const s = byId.get(id)!;
    const v = s.deps.length ? Math.max(...s.deps.map(d)) + 1 : 0;
    depth.set(id, v);
    return v;
  };
  const cols: Stage[][] = [];
  stages.forEach((s) => (cols[d(s.id)] ??= []).push(s));
  return cols;
}

export interface ContractRow {
  item: string;
  budget: string;
  reported: string;
  source: string;
  breach: boolean;
  note?: string;
}

export const CONTRACT: ContractRow[] = [
  {
    item: "Mechanical mass",
    budget: "300 g",
    reported: "318.4 g",
    source: "mechanical.dry_mass_g",
    breach: true,
    note: "+18.4 g (6.1%) over budget",
  },
  {
    item: "Outer envelope",
    budget: "150 × 100 × 50 mm",
    reported: "142 × 96 × 48 mm",
    source: "mechanical.envelope_mm",
    breach: false,
  },
  {
    item: "Electronics bay",
    budget: "92 × 64 mm",
    reported: "88 × 60 mm",
    source: "electronics.board_mm",
    breach: false,
  },
  {
    item: "Power",
    budget: "450 mW",
    reported: "412 mW",
    source: "electronics.est_power_mw",
    breach: false,
  },
];
