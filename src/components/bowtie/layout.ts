import type { BowtieDiagram, BowtieNodeType, BowtieNodeData } from "../../domain/bowtie.types";
import type { Edge, Node } from "@xyflow/react";
import { MarkerType, Position } from "@xyflow/react";
import { ensureBuilderData } from "./builderFields";

const leftTypes = new Set<BowtieNodeType>(["threat", "preventionBarrier"]);
const rightTypes = new Set<BowtieNodeType>(["mitigationBarrier", "consequence"]);

function isEmoji(char: string | undefined): boolean {
  if (!char) return false;
  const cp = char.codePointAt(0);
  if (!cp) return false;
  return cp >= 0x1f000;
}

function parseVisualLabel(label: string): { badge?: string; emoji?: string; text: string } {
  let remaining = label.trim();
  const parsed: { badge?: string; emoji?: string; text: string } = { text: remaining };
  const badgeMatch = remaining.match(/^([A-Z]{1,3}[-\d\.]+)\s+(.*)$/);
  if (badgeMatch) {
    const [, maybeBadge, rest] = badgeMatch;
    if (maybeBadge) parsed.badge = maybeBadge;
    if (typeof rest === "string" && rest.length) {
      remaining = rest;
    }
  }
  const chars = Array.from(remaining);
  const firstChar = chars.length > 0 ? chars[0] : undefined;
  if (firstChar && isEmoji(firstChar)) {
    parsed.emoji = firstChar;
    const sliceLen = firstChar.length;
    remaining = remaining.slice(sliceLen).trim();
  }
  parsed.text = remaining;
  return parsed;
}


export function computeSimpleLayout(diagram: BowtieDiagram): {
  nodes: Node<BowtieNodeData>[];
  edges: Edge[];
} {
  // Symmetric “bow tie” layout with correct Hazard → Top Event hierarchy
  const centerX = 600;
  const centerY = 400;
  const colGap = 350;
  const yGap = 120;
  const verticalHazardGap = 180;

  const nodesByType = (type: BowtieNodeType) => diagram.nodes.filter((n) => n.type === type);
  const threats = nodesByType("threat");
  const prevention = nodesByType("preventionBarrier");
  const escalationFactors = nodesByType("escalationFactor");
  const escalationBarriers = nodesByType("escalationBarrier");
  const hazard = nodesByType("hazard")[0];
  const topEvent = nodesByType("topEvent")[0];
  const mitigation = nodesByType("mitigationBarrier");
  const consequences = nodesByType("consequence");

  const spreadY = (count: number, cY: number, gap: number) =>
    Array.from({ length: count }, (_, i) => cY + (i - (count - 1) / 2) * gap);

  const xThreat = centerX - 2 * colGap;
  const xPrevention = centerX - 1 * colGap;
  const xTopEvent = centerX;
  const xHazard = centerX;
  const xMitigation = centerX + 1 * colGap;
  const xConsequence = centerX + 2 * colGap;

  const leftEscalationFactors = escalationFactors.filter((n) => n.wing !== "right");
  const rightEscalationFactors = escalationFactors.filter((n) => n.wing === "right");
  const leftEscalationBarriers = escalationBarriers.filter((n) => n.wing !== "right");
  const rightEscalationBarriers = escalationBarriers.filter((n) => n.wing === "right");

  const leftColumnNodes = [...threats, ...leftEscalationFactors];
  const rightColumnNodes = [...consequences, ...rightEscalationFactors];
  const preventionColumnNodes = [...prevention, ...leftEscalationBarriers];
  const mitigationColumnNodes = [...mitigation, ...rightEscalationBarriers];

  const yThreats = spreadY(leftColumnNodes.length, centerY, yGap);
  const yPreventions = spreadY(preventionColumnNodes.length, centerY, yGap);
  const yMitigations = spreadY(mitigationColumnNodes.length, centerY, yGap);
  const yConsequences = spreadY(rightColumnNodes.length, centerY, yGap);

  const pos = new Map<string, { x: number; y: number }>();

  if (topEvent) pos.set(topEvent.id, { x: xTopEvent, y: centerY });
  if (hazard) pos.set(hazard.id, { x: xHazard, y: centerY - verticalHazardGap });

  leftColumnNodes.forEach((n, i) => pos.set(n.id, { x: xThreat, y: yThreats[i] ?? centerY }));
  preventionColumnNodes.forEach((n, i) => pos.set(n.id, { x: xPrevention, y: yPreventions[i] ?? centerY }));
  mitigationColumnNodes.forEach((n, i) => pos.set(n.id, { x: xMitigation, y: yMitigations[i] ?? centerY }));
  rightColumnNodes.forEach((n, i) => pos.set(n.id, { x: xConsequence, y: yConsequences[i] ?? centerY }));

  const asRole = (n: { type: BowtieNodeType; wing?: "left" | "right" }) => {
    if (n.type === "preventionBarrier") return "prevention";
    if (n.type === "mitigationBarrier") return "mitigation";
    if (n.type === "escalationBarrier") {
      if (n.wing === "right") return "escalation-right";
      if (n.wing === "left") return "escalation-left";
      return "escalation";
    }
    return undefined;
  };

  const nodes: Node<BowtieNodeData>[] = diagram.nodes.map((n) => {
    const p = pos.get(n.id) ?? { x: 0, y: 0 };
    const role = asRole(n);
    const { badge, emoji, text } = parseVisualLabel(n.label);

    let orientation: "left" | "right" | "center";

    if (n.type === "escalationFactor" || n.type === "escalationBarrier") {
      orientation = n.wing === "right" ? "right" : "left";
    } else if (leftTypes.has(n.type)) {
      orientation = "left";
    } else if (rightTypes.has(n.type)) {
      orientation = "right";
    } else {
      orientation = "center";
    }

    const widthHint: "narrow" | "medium" | "wide" =
      n.type === "hazard" || n.type === "topEvent"
        ? "wide"
        : n.type === "threat"
        ? "medium"
        : "narrow";

    let sourcePosition = Position.Right;
    let targetPosition = Position.Left;

    if (n.type === "hazard") {
      sourcePosition = Position.Bottom;
      targetPosition = Position.Top;
    }

    const baseData: BowtieNodeData = {
      label: text || n.label,
      bowtieType: n.type,
      ...(n.metadata && { metadata: n.metadata }),
      ...(role && { role }),
      ...(badge && { badge }),
      ...(emoji && { emoji }),
      displayLabel: text || n.label,
      orientation,
      widthHint,
    };

    return {
      id: n.id,
      type: n.type,
      data: ensureBuilderData(baseData),
      position: p,
      sourcePosition,
      targetPosition,
    } as Node<BowtieNodeData>;
  });


  const nodeMap = new Map<string, Node<BowtieNodeData>>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const edges: Edge[] = diagram.edges.map((e) => {
    let source = e.source;
    let target = e.target;
    let sourceHandle = (e as any).sourceHandle as string | undefined;
    let targetHandle = (e as any).targetHandle as string | undefined;

    const src = nodeMap.get(source);
    const tgt = nodeMap.get(target);
    const srcData = src?.data as BowtieNodeData | undefined;
    const tgtData = tgt?.data as BowtieNodeData | undefined;
    const srcType = srcData?.bowtieType;
    const tgtType = tgtData?.bowtieType;
    const srcOrientation = srcData?.orientation;
    const tgtOrientation = tgtData?.orientation;

    if (srcType === "hazard" && tgtType === "topEvent") {
      targetHandle = "top-event-hazard";
    } else if (tgtType === "topEvent" && srcType !== "hazard") {
      if (srcOrientation === "left") {
        targetHandle = "left";
      }
    } else if (srcType === "topEvent") {
      if (tgtOrientation === "right") {
        sourceHandle = "right";
        targetHandle = "left";
      }
    }

    return {
      id: e.id,
      source,
      target,
      ...(sourceHandle && { sourceHandle }),
      ...(targetHandle && { targetHandle }),
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "var(--edge)", strokeWidth: 2 },
    };
  });

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
