import type { BowtieDiagram, BowtieNodeType } from "../../domain/bowtie.types";
import type { Edge, Node } from "@xyflow/react";
import { MarkerType, Position } from "@xyflow/react";
import type { BowtieNodeData } from "../../domain/bowtie.types";


export function computeSimpleLayout(diagram: BowtieDiagram): {
  nodes: Node<BowtieNodeData>[];
  edges: Edge[];
} {
  // Symmetric “bow tie” layout with correct Hazard → Top Event hierarchy
  // Center anchor
  const centerX = 600;
  const centerY = 400;
  const colGap = 350; // horizontal space between columns (~±700px from center)
  const yGap = 120;   // vertical space between rows
  const verticalHazardGap = 180; // distance between Hazard (top) and Top Event (below)

  const nodesByType = (type: BowtieNodeType) => diagram.nodes.filter((n) => n.type === type);
  const threats = nodesByType("threat");
  const prevention = nodesByType("preventionBarrier");
  const hazard = nodesByType("hazard")[0];
  const topEvent = nodesByType("topEvent")[0];
  const mitigation = nodesByType("mitigationBarrier");
  const consequences = nodesByType("consequence");

  const spreadY = (count: number, cY: number, gap: number) =>
    Array.from({ length: count }, (_, i) => cY + (i - (count - 1) / 2) * gap);

  // Compute per-column X positions (left to right): Threat, Prevention, [center: Hazard above Top Event], Mitigation, Consequence
  const xThreat = centerX - 2 * colGap;
  const xPrevention = centerX - 1 * colGap;
  const xTopEvent = centerX;
  const xHazard = centerX;
  const xMitigation = centerX + 1 * colGap;
  const xConsequence = centerX + 2 * colGap;

  // Compute symmetric Y positions around Top Event center
  const yThreats = spreadY(threats.length, centerY, yGap);
  const yPreventions = spreadY(prevention.length, centerY, yGap);
  const yMitigations = spreadY(mitigation.length, centerY, yGap);
  const yConsequences = spreadY(consequences.length, centerY, yGap);

  const pos = new Map<string, { x: number; y: number }>();

  // Place center pair (Hazard above Top Event)
  if (topEvent) pos.set(topEvent.id, { x: xTopEvent, y: centerY });
  if (hazard) pos.set(hazard.id, { x: xHazard, y: centerY - verticalHazardGap });

  // Place wings
  threats.forEach((n, i) => pos.set(n.id, { x: xThreat, y: yThreats[i] ?? centerY }));
  prevention.forEach((n, i) => pos.set(n.id, { x: xPrevention, y: yPreventions[i] ?? centerY }));
  mitigation.forEach((n, i) => pos.set(n.id, { x: xMitigation, y: yMitigations[i] ?? centerY }));
  consequences.forEach((n, i) => pos.set(n.id, { x: xConsequence, y: yConsequences[i] ?? centerY }));

  const asRole = (t: BowtieNodeType | undefined) =>
    t === "preventionBarrier" ? "prevention" : t === "mitigationBarrier" ? "mitigation" : undefined;

  const nodes: Node<BowtieNodeData>[] = diagram.nodes.map((n) => {
    const p = pos.get(n.id) ?? { x: 0, y: 0 };
    const role = asRole(n.type);
    return {
      id: n.id,
      type: n.type,
      data: { label: n.label, bowtieType: n.type, metadata: n.metadata, role },
      position: p,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    } as Node<BowtieNodeData>;
  });

  const edges: Edge[] = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: "var(--edge)", strokeWidth: 2 },
  }));

  return { nodes, edges };
}

export async function computeElkLayout(diagram: BowtieDiagram): Promise<{
  nodes: Node<BowtieNodeData>[];
  edges: Edge[];
}> {
  // For symmetry and correct Hazard  Top Event hierarchy, use the same
  // deterministic symmetric layout as computeSimpleLayout.
  const res = computeSimpleLayout(diagram);
  return Promise.resolve(res);
}
