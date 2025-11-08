import { describe, it, expect } from "vitest";
import { computeRoleFilteredDiagram, collectAvailableRoles } from "../filters";
import { highwayDrivingExample } from "../scenarios/highway_driving.example";

describe("role filters", () => {
  it("collects available roles from example", () => {
    const roles = collectAvailableRoles(highwayDrivingExample);
    expect(roles.length).toBeGreaterThan(0);
    expect(roles).toContain("Human");
  });

  it("returns same diagram when no roles selected", () => {
    const out = computeRoleFilteredDiagram(highwayDrivingExample, new Set());
    expect(out.nodes.length).toBe(highwayDrivingExample.nodes.length);
    expect(out.edges.length).toBe(highwayDrivingExample.edges.length);
  });

  it("filters nodes to selected role and keeps spine", () => {
    const out = computeRoleFilteredDiagram(highwayDrivingExample, new Set(["Human"]));
    // Hazard and Top Event should remain
    const ids = new Set(out.nodes.map((n) => n.id));
    expect(ids.has("hz-highway")).toBe(true);
    expect(ids.has("te-loss-control")).toBe(true);
    // All non-spine nodes should include the selected role
    const nonSpine = out.nodes.filter((n) => n.type !== "hazard" && n.type !== "topEvent");
    expect(nonSpine.length).toBeGreaterThan(0);
    expect(nonSpine.every((n) => (n.metadata?.chips || []).includes("Human"))).toBe(true);
  });
});

