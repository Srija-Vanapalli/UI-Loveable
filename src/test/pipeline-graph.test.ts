import { describe, expect, it } from "vitest";
import { STAGES } from "@/lib/engenia-data";

const stage = (id: string) => STAGES.find((candidate) => candidate.id === id);

describe("Pipeline dependency graph", () => {
  it("includes the specification and lint stages ahead of verification planning", () => {
    expect(STAGES).toHaveLength(14);
    expect(stage("spec")?.deps).toEqual([]);
    expect(stage("lint")?.deps).toEqual(["spec"]);
    expect(stage("verify_plan")?.deps).toEqual(["lint"]);
  });

  it("branches redteam, simprep, and testplan directly from the specification", () => {
    expect(stage("redteam")?.deps).toEqual(["spec"]);
    expect(stage("simprep")?.deps).toEqual(["spec"]);
    expect(stage("testplan")?.deps).toEqual(["spec"]);
  });

  it("joins integration, redteam, and simprep at simulation", () => {
    expect(stage("simulation")?.deps).toEqual(["integration", "redteam", "simprep"]);
  });

  it("requires simulation and testplan before final and report", () => {
    expect(stage("final")?.deps).toEqual(["simulation", "testplan"]);
    expect(stage("report")?.deps).toEqual(["final"]);
  });
});
