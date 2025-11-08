import type { BowtieDiagram, BowtieNodeType } from "../../domain/bowtie.types";
import type { Edge, Node } from "@xyflow/react";
import { MarkerType, Position } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import type { BowtieNodeData } from "../../domain/bowtie.types";

const COLUMN_ORDER: BowtieNodeType[] = [
  "threat",
  "preventionBarrier",
  "hazard",
  "topEvent",
  "mitigationBarrier",
  "consequence",
];

function getNodeRank(type: BowtieNodeType): number {
  const rankMap: Record<BowtieNodeType, number> = {
    threat: 0,
    preventionBarrier: 1,
    hazard: 2,
    topEvent: 3,
    mitigationBarrier: 4,
    consequence: 5,
  };
  return rankMap[type];
}



export function computeSimpleLayout(diagram: BowtieDiagram): {
  nodes: Node<BowtieNodeData>[];
  edges: Edge[];
} {
  const colX = new Map<BowtieNodeType, number>();
  const colWidth = 260;
  const colGap = 48;
  COLUMN_ORDER.forEach((t, i) => colX.set(t, i * (colWidth + colGap)));

  const yTrack = new Map<BowtieNodeType, number>();
  const rowGap = 120;
  const topPad = 40;
  COLUMN_ORDER.forEach((t) => yTrack.set(t, topPad));

  const nodes: Node<BowtieNodeData>[] = diagram.nodes.map((n) => {
    const x = colX.get(n.type) ?? 0;
    const y = yTrack.get(n.type) ?? topPad;
    yTrack.set(n.type, y + rowGap);

    const role = n.type === "preventionBarrier" ? "prevention" : n.type === "mitigationBarrier" ? "mitigation" : undefined;

    return {
      id: n.id,
      type: n.type,
      data: { label: n.label, bowtieType: n.type, metadata: n.metadata, role },
      position: { x, y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    } as Node<BowtieNodeData>;
  });

  const edges: Edge[] = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: {
      stroke: "var(--edge)",
      strokeWidth: 2,
    },
  }));

  return { nodes, edges };
}

export async function computeElkLayout(diagram: BowtieDiagram): Promise<{
  nodes: Node<BowtieNodeData>[];
  edges: Edge[];
}> {
  const elk = new ELK();
  const nodeWidth = 260;
  const nodeHeight = 72;

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.layered.spacing.nodeNodeBetweenLayers": "120",
      "elk.spacing.nodeNode": "48",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    },
    children: diagram.nodes.map((n) => ({
      id: n.id,
      width: nodeWidth,
      height: nodeHeight,
      layoutOptions: { "elk.layered.priority": String(getNodeRank(n.type)) },
    })),
    edges: diagram.edges.map((e) => ({ id: e.id, sources: [e.source], targets: [e.target] })),
  } as const;

  const res = await elk.layout(elkGraph);

  const pos = new Map<string, { x: number; y: number }>();
  for (const c of res.children ?? []) pos.set(c.id, { x: c.x ?? 0, y: c.y ?? 0 });

  const nodes: Node<BowtieNodeData>[] = diagram.nodes.map((n) => {
    const p = pos.get(n.id) ?? { x: 0, y: 0 };
    const role = n.type === "preventionBarrier" ? "prevention" : n.type === "mitigationBarrier" ? "mitigation" : undefined;
    return {
      id: n.id,
      type: n.type,
      data: { label: n.label, bowtieType: n.type, metadata: n.metadata, role },
      position: { x: p.x, y: p.y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    } as Node<BowtieNodeData>;
  });

  const edges: Edge[] = diagram.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: {
      stroke: "var(--edge)",
      strokeWidth: 2,
    },
  }));

  return { nodes, edges };
}
