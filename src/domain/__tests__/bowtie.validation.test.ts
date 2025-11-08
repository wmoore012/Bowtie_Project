import { describe, it, expect } from "vitest";
import { validateDiagram } from "../bowtie.validation";
import { highwayDrivingExample } from "../scenarios/highway_driving.example";

describe("validateDiagram (Highway Driving)", () => {
  it("accepts a valid highway driving bowtie", () => {
    const result = validateDiagram(highwayDrivingExample);
    expect(result.ok).toBe(true);
  });

  it("fails when Hazard is missing", () => {
    const broken = {
      ...highwayDrivingExample,
      nodes: highwayDrivingExample.nodes.filter((n) => n.type !== "hazard"),
    } as any;
    const result = validateDiagram(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.toLowerCase().includes("hazard"))).toBe(true);
    }
  });

  it("fails when Top Event is missing", () => {
    const broken = {
      ...highwayDrivingExample,
      nodes: highwayDrivingExample.nodes.filter((n) => n.type !== "topEvent"),
    } as any;
    const result = validateDiagram(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.toLowerCase().includes("top event"))).toBe(true);
    }
  });

  it("fails when there are multiple Hazards (exactly-one rule)", () => {
    const broken = {
      ...highwayDrivingExample,
      nodes: [...highwayDrivingExample.nodes, { id: "hz2", type: "hazard" as any, label: "Extra hazard" }],
    } as any;
    const result = validateDiagram(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.toLowerCase().includes("exactly one hazard"))).toBe(true);
    }
  });

  it("fails when there are multiple Top Events (exactly-one rule)", () => {
    const broken = {
      ...highwayDrivingExample,
      nodes: [...highwayDrivingExample.nodes, { id: "te2", type: "topEvent" as any, label: "Extra top" }],
    } as any;
    const result = validateDiagram(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.toLowerCase().includes("exactly one top event"))).toBe(true);
    }
  });

  it("fails on duplicate node ids", () => {
    // Intentionally duplicate the id of a different node to create a real collision
    const dup = {
      ...highwayDrivingExample,
      nodes: highwayDrivingExample.nodes.map((n, i) => (i === 0 ? { ...n, id: "t-distracted" } : n)),
    } as any;
    const result = validateDiagram(dup);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e: string) => e.toLowerCase().includes("duplicate node id"))).toBe(true);
    }
  });

  it("fails when edge references a non-existent node", () => {
    const bad = {
      ...highwayDrivingExample,
      edges: [...highwayDrivingExample.edges, { id: "bad", source: "nope", target: "hz-highway" }],
    } as any;
    const result = validateDiagram(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e: string) => e.toLowerCase().includes("invalid source"))).toBe(true);
    }
  });

  it("fails when an edge goes backward in Bowtie flow", () => {
    const back = {
      ...highwayDrivingExample,
      edges: [...highwayDrivingExample.edges, { id: "ebad1", source: "te-collision", target: "hz-highway" }],
    } as any;
    const result = validateDiagram(back);
    expect(result.ok).toBe(false);
  });

  it("fails on invalid node type", () => {
    const badType = {
      ...highwayDrivingExample,
      nodes: [...highwayDrivingExample.nodes, { id: "x1", type: "bogus" as any, label: "Bad" }],
    } as any;
    const result = validateDiagram(badType);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e: string) => e.toLowerCase().includes("invalid node type"))).toBe(true);
    }
  });

  it("rejects degradation factors explicitly", () => {
    const badDegradation = {
      ...highwayDrivingExample,
      nodes: [...highwayDrivingExample.nodes, { id: "dg1", type: "degradation" as any, label: "Degradation" }],
    } as any;
    const result = validateDiagram(badDegradation);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e: string) => e.toLowerCase().includes("degradation factors are excluded"))).toBe(true);
    }
  });
});

