import { describe, it, expect } from "vitest";
import type { BowtieDiagram, BowtieNode } from "../../../domain/bowtie.types";
import { computeSimpleLayout } from "../layout";
import type { Node } from "@xyflow/react";
import type { BowtieNodeData } from "../../../domain/bowtie.types";

function createEscalationFlowDiagram(): BowtieDiagram {
  const now = new Date().toISOString();
  return {
    id: "test-escalation-flow",
    title: "Escalation Layout Test",
    createdAt: now,
    updatedAt: now,
    nodes: [
      { id: "hz", type: "hazard", label: "Hazard" },
      { id: "te", type: "topEvent", label: "Top Event" },
      { id: "th", type: "threat", label: "Threat" },
      { id: "pb", type: "preventionBarrier", label: "Prevention" },
      { id: "mb", type: "mitigationBarrier", label: "Mitigation" },
      { id: "c", type: "consequence", label: "Consequence" },
      { id: "eb-left", type: "escalationBarrier", label: "Esc L", wing: "left" },
      { id: "ef-left", type: "escalationFactor", label: "EF L", wing: "left" },
      { id: "eb-right", type: "escalationBarrier", label: "Esc R", wing: "right" },
      { id: "ef-right", type: "escalationFactor", label: "EF R", wing: "right" },
    ],
    edges: [
      { id: "hz-te", source: "hz", target: "te" },
      { id: "th-pb", source: "th", target: "pb" },
      { id: "pb-te", source: "pb", target: "te" },
      { id: "te-mb", source: "te", target: "mb" },
      { id: "mb-c", source: "mb", target: "c" },
      { id: "pb-eb-left", source: "pb", target: "eb-left" },
      { id: "eb-left-ef", source: "eb-left", target: "ef-left" },
      { id: "mb-eb-right", source: "mb", target: "eb-right" },
      { id: "eb-right-ef", source: "eb-right", target: "ef-right" },
    ],
  };
}

function buildLeftWingSpacingDiagram(withEscalation: boolean): BowtieDiagram {
  const now = new Date().toISOString();
  const nodes: BowtieNode[] = [
    { id: "hz", type: "hazard", label: "Hazard" },
    { id: "te", type: "topEvent", label: "Top" },
    { id: "th-1", type: "threat", label: "Threat 1" },
    { id: "th-2", type: "threat", label: "Threat 2" },
    { id: "pb-1", type: "preventionBarrier", label: "PB 1" },
    { id: "pb-2", type: "preventionBarrier", label: "PB 2" },
  ];
  if (withEscalation) {
    nodes.push(
      { id: "eb-left", type: "escalationBarrier", label: "Esc L", wing: "left" },
      { id: "ef-left", type: "escalationFactor", label: "EF L", wing: "left" },
    );
  }
  const edges = [
    { id: "hz-te", source: "hz", target: "te" },
    { id: "th1-pb1", source: "th-1", target: "pb-1" },
    { id: "th2-pb2", source: "th-2", target: "pb-2" },
    { id: "pb1-te", source: "pb-1", target: "te" },
    { id: "pb2-te", source: "pb-2", target: "te" },
  ];
  if (withEscalation) {
    edges.push(
      { id: "pb1-eb", source: "pb-1", target: "eb-left" },
      { id: "eb-ef", source: "eb-left", target: "ef-left" },
    );
  }
  return { id: "left-spacing", title: "Spacing", createdAt: now, updatedAt: now, nodes, edges };
}

function getNodeY(nodes: Node<BowtieNodeData>[], id: string): number {
  const node = nodes.find((n) => n.id === id);
  if (!node) throw new Error(`Missing node ${id}`);
  return node.position.y;
}

function createPreventionChainDiagram(): BowtieDiagram {
  const now = new Date().toISOString();
  return {
    id: "chain-left",
    title: "Prevention chain",
    createdAt: now,
    updatedAt: now,
    nodes: [
      { id: "hz", type: "hazard", label: "Hazard" },
      { id: "te", type: "topEvent", label: "Top Event" },
      { id: "th", type: "threat", label: "Threat" },
      { id: "pb-a", type: "preventionBarrier", label: "PB A" },
      { id: "pb-b", type: "preventionBarrier", label: "PB B" },
    ],
    edges: [
      { id: "hz-te", source: "hz", target: "te" },
      { id: "th-pb-a", source: "th", target: "pb-a" },
      { id: "pb-a-te", source: "pb-a", target: "te" },
      { id: "th-pb-b", source: "th", target: "pb-b" },
      { id: "pb-b-te", source: "pb-b", target: "te" },
    ],
  };
}

function createMitigationChainDiagram(): BowtieDiagram {
  const now = new Date().toISOString();
  return {
    id: "chain-right",
    title: "Mitigation chain",
    createdAt: now,
    updatedAt: now,
    nodes: [
      { id: "hz", type: "hazard", label: "Hazard" },
      { id: "te", type: "topEvent", label: "Top Event" },
      { id: "mb-a", type: "mitigationBarrier", label: "MB A" },
      { id: "mb-b", type: "mitigationBarrier", label: "MB B" },
      { id: "c", type: "consequence", label: "Consequence" },
    ],
    edges: [
      { id: "hz-te", source: "hz", target: "te" },
      { id: "te-mb-a", source: "te", target: "mb-a" },
      { id: "mb-a-c", source: "mb-a", target: "c" },
      { id: "te-mb-b", source: "te", target: "mb-b" },
      { id: "mb-b-c", source: "mb-b", target: "c" },
    ],
  };
}

function createLeftEscalationSpacingDiagram(): BowtieDiagram {
  const now = new Date().toISOString();
  return {
    id: "left-escalation-spacing",
    title: "Left spacing with collapsed threat",
    createdAt: now,
    updatedAt: now,
    nodes: [
      { id: "hz", type: "hazard", label: "Hazard" },
      { id: "te", type: "topEvent", label: "Top Event" },
      { id: "th-anchor", type: "threat", label: "Threat Anchor" },
      { id: "th-idle", type: "threat", label: "Threat Idle" },
      { id: "pb-anchor", type: "preventionBarrier", label: "PB Anchor" },
      { id: "eb-anchor", type: "escalationBarrier", label: "Esc Anchor", wing: "left" },
      { id: "ef-anchor", type: "escalationFactor", label: "EF Anchor", wing: "left" },
    ],
    edges: [
      { id: "hz-te", source: "hz", target: "te" },
      { id: "th-anchor-pb", source: "th-anchor", target: "pb-anchor" },
      { id: "pb-anchor-te", source: "pb-anchor", target: "te" },
      { id: "pb-anchor-eb", source: "pb-anchor", target: "eb-anchor" },
      { id: "eb-anchor-ef", source: "eb-anchor", target: "ef-anchor" },
    ],
  };
}

function pruneDiagram(diagram: BowtieDiagram, predicate: (node: BowtieNode) => boolean): BowtieDiagram {
  const nodes = diagram.nodes.filter(predicate);
  const allowed = new Set(nodes.map((n) => n.id));
  const edges = diagram.edges.filter((e) => allowed.has(e.source) && allowed.has(e.target));
  return { ...diagram, nodes, edges };
}

describe("computeSimpleLayout escalation flow", () => {
  it("routes left wing escalation chain using bottom/right/left handles", () => {
    const { edges } = computeSimpleLayout(createEscalationFlowDiagram());
    const preventionToEscalation = edges.find((e) => e.id === "pb-eb-left");
    const escalationToFactor = edges.find((e) => e.id === "eb-left-ef");
    expect(preventionToEscalation?.sourceHandle).toBe("bottom");
    expect(preventionToEscalation?.targetHandle).toBe("right");
    expect(escalationToFactor?.sourceHandle).toBe("left");
    expect(escalationToFactor?.targetHandle).toBe("right");
  });

  it("routes right wing escalation chain mirrored from mitigation barrier", () => {
    const { edges } = computeSimpleLayout(createEscalationFlowDiagram());
    const mitigationToEscalation = edges.find((e) => e.id === "mb-eb-right");
    const escalationToFactor = edges.find((e) => e.id === "eb-right-ef");
    expect(mitigationToEscalation?.sourceHandle).toBe("bottom");
    expect(mitigationToEscalation?.targetHandle).toBe("left");
    expect(escalationToFactor?.sourceHandle).toBe("right");
    expect(escalationToFactor?.targetHandle).toBe("left");
  });

  it("positions escalation nodes beside and below their parent barriers", () => {
    const { nodes } = computeSimpleLayout(createEscalationFlowDiagram());
    const prevention = nodes.find((n) => n.id === "pb");
    const leftEscalation = nodes.find((n) => n.id === "eb-left");
    const leftFactor = nodes.find((n) => n.id === "ef-left");
    const mitigation = nodes.find((n) => n.id === "mb");
    const rightEscalation = nodes.find((n) => n.id === "eb-right");
    const rightFactor = nodes.find((n) => n.id === "ef-right");

    expect(prevention && leftEscalation && leftFactor).toBeTruthy();
    expect(mitigation && rightEscalation && rightFactor).toBeTruthy();
    if (!prevention || !leftEscalation || !leftFactor || !mitigation || !rightEscalation || !rightFactor) {
      return;
    }

    // Left wing should extend outward (further left) and slightly downward
    expect(leftEscalation.position.x).toBeLessThan(prevention.position.x);
    expect(leftFactor.position.x).toBeLessThan(leftEscalation.position.x);
    expect(leftEscalation.position.y).toBeGreaterThan(prevention.position.y);

    // Right wing should extend outward (further right) and slightly downward
    expect(rightEscalation.position.x).toBeGreaterThan(mitigation.position.x);
    expect(rightFactor.position.x).toBeGreaterThan(rightEscalation.position.x);
    expect(rightEscalation.position.y).toBeGreaterThan(mitigation.position.y);
  });

  it("keeps horizontal gap between escalation barriers and factors", () => {
    const { nodes } = computeSimpleLayout(createEscalationFlowDiagram());
    const leftEscalation = nodes.find((n) => n.id === "eb-left");
    const leftFactor = nodes.find((n) => n.id === "ef-left");
    const rightEscalation = nodes.find((n) => n.id === "eb-right");
    const rightFactor = nodes.find((n) => n.id === "ef-right");
    expect(leftEscalation && leftFactor && rightEscalation && rightFactor).toBeTruthy();
    if (!leftEscalation || !leftFactor || !rightEscalation || !rightFactor) return;
    expect(leftEscalation.position.x - leftFactor.position.x).toBeGreaterThan(180);
    expect(rightFactor.position.x - rightEscalation.position.x).toBeGreaterThan(180);
  });

  it("shifts downstream left wing nodes when escalation branch is present", () => {
    const { nodes } = computeSimpleLayout(buildLeftWingSpacingDiagram(true));
    const threat1Y = getNodeY(nodes, "th-1");
    const threat2Y = getNodeY(nodes, "th-2");
    expect(threat2Y - threat1Y).toBeGreaterThan(150);
    const prevention2Y = getNodeY(nodes, "pb-2");
    expect(prevention2Y).toBeGreaterThanOrEqual(threat2Y);
  });

  it("keeps baseline spacing when no escalation branch exists", () => {
    const { nodes } = computeSimpleLayout(buildLeftWingSpacingDiagram(false));
    const threat1Y = getNodeY(nodes, "th-1");
    const threat2Y = getNodeY(nodes, "th-2");
    expect(threat2Y - threat1Y).toBeCloseTo(120, 5);
  });

  it("lays out prevention barriers in a horizontal chain per threat", () => {
    const { nodes } = computeSimpleLayout(createPreventionChainDiagram());
    const threat = nodes.find((n) => n.id === "th")!;
    const pbA = nodes.find((n) => n.id === "pb-a")!;
    const pbB = nodes.find((n) => n.id === "pb-b")!;
    expect(pbA.position.x).toBeGreaterThan(threat.position.x);
    expect(pbB.position.x).toBeGreaterThan(pbA.position.x);
    const spacingThreat = pbA.position.x - threat.position.x;
    const spacingBarriers = pbB.position.x - pbA.position.x;
    expect(spacingBarriers).toBeCloseTo(300, 1);
    expect(spacingThreat).toBeCloseTo(455, 1);
  });

  it("keeps threat column when no prevention barriers exist", () => {
    const trimmed = pruneDiagram(createPreventionChainDiagram(), (n) => n.type !== "preventionBarrier");
    const { nodes } = computeSimpleLayout(trimmed);
    const threat = nodes.find((n) => n.id === "th")!;
    const topEvent = nodes.find((n) => n.id === "te")!;
    expect(threat.position.x).toBeCloseTo(57.5, 1);
    const threatData = threat.data as BowtieNodeData;
    const threatWidth = threatData.widthPx ?? 280;
    const gapToTopEvent = topEvent.position.x - (threat.position.x + threatWidth);
    expect(gapToTopEvent).toBeCloseTo(262.5, 1);
  });

  it("connects threats directly to the top event when prevention barriers are hidden", () => {
    const trimmed = pruneDiagram(createPreventionChainDiagram(), (n) => n.type !== "preventionBarrier");
    const { edges } = computeSimpleLayout(trimmed);
    const direct = edges.filter((e) => e.source === "th" && e.target === "te");
    expect(direct).toHaveLength(1);
  });

  it("shifts collapsed threats when neighboring escalation branches expand", () => {
    const { nodes } = computeSimpleLayout(createLeftEscalationSpacingDiagram());
    const anchorY = getNodeY(nodes, "th-anchor");
    const idleY = getNodeY(nodes, "th-idle");
    expect(idleY - anchorY).toBeGreaterThan(200);
  });

  it("lays out mitigation barriers in a horizontal chain per consequence", () => {
    const { nodes } = computeSimpleLayout(createMitigationChainDiagram());
    const consequence = nodes.find((n) => n.id === "c")!;
    const mbA = nodes.find((n) => n.id === "mb-a")!;
    const mbB = nodes.find((n) => n.id === "mb-b")!;
    expect(mbA.position.x).toBeGreaterThan(nodes.find((n) => n.id === "te")!.position.x);
    expect(mbB.position.x).toBeGreaterThan(mbA.position.x);
    const spacingBarriers = mbB.position.x - mbA.position.x;
    const spacingConsequence = consequence.position.x - mbB.position.x;
    expect(spacingBarriers).toBeCloseTo(spacingConsequence, 1);
  });

  it("connects top event directly to consequences when mitigation barriers are hidden", () => {
    const trimmed = pruneDiagram(createMitigationChainDiagram(), (n) => n.type !== "mitigationBarrier");
    const { edges } = computeSimpleLayout(trimmed);
    const direct = edges.filter((e) => e.source === "te" && e.target === "c");
    expect(direct).toHaveLength(1);
  });

  it("connects prevention chains sequentially from threat to top event", () => {
    const { edges } = computeSimpleLayout(createPreventionChainDiagram());
    const threatToFirst = edges.filter((e) => e.source === "th" && e.target === "pb-a");
    expect(threatToFirst).toHaveLength(1);
    const betweenBarriers = edges.filter((e) => e.source === "pb-a" && e.target === "pb-b");
    expect(betweenBarriers).toHaveLength(1);
    const toTop = edges.filter((e) => e.source === "pb-b" && e.target === "te");
    expect(toTop).toHaveLength(1);
    const stray = edges.filter((e) => e.source === "th" && e.target === "pb-b");
    expect(stray).toHaveLength(0);
  });

  it("connects mitigation chains sequentially from top event to consequence", () => {
    const { edges } = computeSimpleLayout(createMitigationChainDiagram());
    const topToFirst = edges.filter((e) => e.source === "te" && e.target === "mb-a");
    expect(topToFirst).toHaveLength(1);
    const betweenBarriers = edges.filter((e) => e.source === "mb-a" && e.target === "mb-b");
    expect(betweenBarriers).toHaveLength(1);
    const toConsequence = edges.filter((e) => e.source === "mb-b" && e.target === "c");
    expect(toConsequence).toHaveLength(1);
    const stray = edges.filter((e) => e.source === "te" && e.target === "mb-b");
    expect(stray).toHaveLength(0);
  });
});
