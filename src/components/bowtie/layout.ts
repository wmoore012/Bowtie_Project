import type { BowtieDiagram, BowtieNodeType, BowtieNodeData, BowtieNode, BowtieEdge } from "../../domain/bowtie.types";
import type { Edge, Node } from "@xyflow/react";
import { MarkerType, Position } from "@xyflow/react";
import { ensureBuilderData } from "./builderFields";

const leftTypes = new Set<BowtieNodeType>(["threat", "preventionBarrier"]);
const rightTypes = new Set<BowtieNodeType>(["mitigationBarrier", "consequence"]);
const NODE_WIDTHS: Record<"narrow" | "medium" | "wide", number> = {
  narrow: 220,
  medium: 280,
  wide: 360,
};

const widthHintForType = (type: BowtieNodeType): "narrow" | "medium" | "wide" => {
  if (type === "hazard" || type === "topEvent") return "wide";
  if (type === "threat") return "medium";
  return "narrow";
};

function isEmoji(char: string | undefined): boolean {
  if (!char) return false;
  const cp = char.codePointAt(0);
  if (!cp) return false;
  return cp >= 0x1f000;
}

function parseVisualLabel(label: string): { badge?: string; emoji?: string; text: string } {
  let remaining = label.trim();
  const parsed: { badge?: string; emoji?: string; text: string } = { text: remaining };
  const badgeMatch = remaining.match(/^([A-Z]{1,3}[-\d.]+)\s+(.*)$/);
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
  const barrierChainSpacing = 300;
  const escalationHorizontalOffset = 150;
  const escalationFactorHorizontalOffset = 320;
  const escalationVerticalOffset = 160;
  const escalationSiblingGap = 90;
  const threatDefaultGap = colGap * 0.5;
  const consequenceDefaultGap = colGap * 0.5;
  const threatColWidth = NODE_WIDTHS[widthHintForType("threat")];
  const collapsedThreatGap = (colGap + threatDefaultGap) / 2;

  const nodeIndex = new Map<string, BowtieNode>();
  const nodesByType = (type: BowtieNodeType) => diagram.nodes.filter((n) => n.type === type);
  diagram.nodes.forEach((n) => nodeIndex.set(n.id, n));

  const normalizedEdges = diagram.edges.map((edge) => {
    const src = nodeIndex.get(edge.source);
    const tgt = nodeIndex.get(edge.target);
    if (src?.type === "escalationFactor" && tgt?.type === "escalationBarrier") {
      return { ...edge, source: edge.target, target: edge.source };
    }
    return edge;
  });
  const threats = nodesByType("threat");
  const prevention = nodesByType("preventionBarrier");
  const escalationFactors = nodesByType("escalationFactor");
  const escalationBarriers = nodesByType("escalationBarrier");
  const hazard = nodesByType("hazard")[0];
  const topEvent = nodesByType("topEvent")[0];
  const mitigation = nodesByType("mitigationBarrier");
  const consequences = nodesByType("consequence");
  const preventionIds = new Set(prevention.map((n) => n.id));
  const mitigationIds = new Set(mitigation.map((n) => n.id));
  const spreadY = (count: number, cY: number, gap: number) =>
    Array.from({ length: count }, (_, i) => cY + (i - (count - 1) / 2) * gap);

  const xPrevention = centerX - 1 * colGap;
  const xTopEvent = centerX;
  const xHazard = centerX;
  const xMitigation = centerX + 1 * colGap;
  const xConsequence = xMitigation + consequenceDefaultGap;
  const collapsedThreatRightEdge = xTopEvent - collapsedThreatGap;
  const collapsedThreatColumnX = collapsedThreatRightEdge - threatColWidth;

  const leftEscalationFactors = escalationFactors.filter((n) => n.wing !== "right");
  const rightEscalationFactors = escalationFactors.filter((n) => n.wing === "right");
  const leftEscalationBarriers = escalationBarriers.filter((n) => n.wing !== "right");
  const rightEscalationBarriers = escalationBarriers.filter((n) => n.wing === "right");

  const yThreats = spreadY(threats.length, centerY, yGap);
  const yPreventions = spreadY(prevention.length, centerY, yGap);
  const yMitigations = spreadY(mitigation.length, centerY, yGap);
  const yConsequences = spreadY(consequences.length, centerY, yGap);

  const threatYMap = new Map<string, number>();
  threats.forEach((n, i) => threatYMap.set(n.id, yThreats[i] ?? centerY));
  const consequenceYMap = new Map<string, number>();
  consequences.forEach((n, i) => consequenceYMap.set(n.id, yConsequences[i] ?? centerY));

  const edgesBySource = new Map<string, string[]>();
  const edgesByTarget = new Map<string, string[]>();
  normalizedEdges.forEach((edge) => {
    if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
    edgesBySource.get(edge.source)!.push(edge.target);
    if (!edgesByTarget.has(edge.target)) edgesByTarget.set(edge.target, []);
    edgesByTarget.get(edge.target)!.push(edge.source);
  });

  const leftChains = new Map<string, string[]>();
  const leftChainBarriers = new Set<string>();
  const rightChains = new Map<string, string[]>();
  const rightChainBarriers = new Set<string>();

  const pos = new Map<string, { x: number; y: number }>();

  if (topEvent) pos.set(topEvent.id, { x: xTopEvent, y: centerY });
  if (hazard) pos.set(hazard.id, { x: xHazard, y: centerY - verticalHazardGap });

  const sortByLabel = (ids: string[]) =>
    ids
      .filter((id) => nodeIndex.has(id))
      .sort((a, b) => {
        const labelA = nodeIndex.get(a)?.label ?? a;
        const labelB = nodeIndex.get(b)?.label ?? b;
        return labelA.localeCompare(labelB, undefined, { numeric: true });
      });

  const addRequest = (
    map: Map<string, { xs: number[]; ys: number[] }>,
    id: string,
    x: number,
    y: number
  ) => {
    const current = map.get(id) ?? { xs: [], ys: [] };
    current.xs.push(x);
    current.ys.push(y);
    map.set(id, current);
  };

  const leftBarrierRequests = new Map<string, { xs: number[]; ys: number[] }>();

  threats.forEach((threat) => {
    const y = threatYMap.get(threat.id) ?? centerY;
    const chain = sortByLabel(
      (edgesBySource.get(threat.id) ?? []).filter(
        (target) => nodeIndex.get(target)?.type === "preventionBarrier"
      )
    );
    const visibleChain = chain.filter((id) => preventionIds.has(id));
    leftChains.set(threat.id, visibleChain);
    visibleChain.forEach((id) => leftChainBarriers.add(id));
    const chainLength = visibleChain.length;
    const threatX = chainLength > 0 ? xPrevention - barrierChainSpacing * chainLength : collapsedThreatColumnX;
    pos.set(threat.id, { x: threatX, y });
    visibleChain.forEach((barrierId, idx) => {
      const desiredX = xPrevention - barrierChainSpacing * (chainLength - idx - 1);
      addRequest(leftBarrierRequests, barrierId, desiredX, y);
    });
  });

  prevention.forEach((barrier, i) => {
    const req = leftBarrierRequests.get(barrier.id);
    if (req && req.xs.length) {
      const avgX = req.xs.reduce((sum, value) => sum + value, 0) / req.xs.length;
      const avgY = req.ys.reduce((sum, value) => sum + value, 0) / req.ys.length;
      pos.set(barrier.id, { x: avgX, y: avgY });
    } else {
      pos.set(barrier.id, { x: xPrevention, y: yPreventions[i] ?? centerY });
    }
  });

  const rightBarrierRequests = new Map<string, { xs: number[]; ys: number[] }>();

  consequences.forEach((consequence) => {
    const y = consequenceYMap.get(consequence.id) ?? centerY;
    const chain = sortByLabel(
      (edgesByTarget.get(consequence.id) ?? []).filter(
        (source) => nodeIndex.get(source)?.type === "mitigationBarrier"
      )
    );
    const visibleChain = chain.filter((id) => mitigationIds.has(id));
    rightChains.set(consequence.id, visibleChain);
    visibleChain.forEach((id) => rightChainBarriers.add(id));
    const chainLength = visibleChain.length;
    const consequenceX = chainLength > 0 ? xMitigation + barrierChainSpacing * chainLength : xConsequence;
    pos.set(consequence.id, { x: consequenceX, y });
    visibleChain.forEach((barrierId, idx) => {
      const desiredX = xMitigation + barrierChainSpacing * idx;
      addRequest(rightBarrierRequests, barrierId, desiredX, y);
    });
  });

  mitigation.forEach((barrier, i) => {
    const req = rightBarrierRequests.get(barrier.id);
    if (req && req.xs.length) {
      const avgX = req.xs.reduce((sum, value) => sum + value, 0) / req.xs.length;
      const avgY = req.ys.reduce((sum, value) => sum + value, 0) / req.ys.length;
      pos.set(barrier.id, { x: avgX, y: avgY });
    } else {
      pos.set(barrier.id, { x: xMitigation, y: yMitigations[i] ?? centerY });
    }
  });

  const parentToEscalations = new Map<string, string[]>();
  const factorsByBarrier = new Map<string, string[]>();
  normalizedEdges.forEach((edge) => {
    const src = nodeIndex.get(edge.source);
    const tgt = nodeIndex.get(edge.target);
    if (!src || !tgt) return;
    if (
      (src.type === "preventionBarrier" || src.type === "mitigationBarrier") &&
      tgt.type === "escalationBarrier"
    ) {
      const list = parentToEscalations.get(src.id) ?? [];
      if (!list.includes(tgt.id)) {
        list.push(tgt.id);
        parentToEscalations.set(src.id, list);
      }
    }
    if (src.type === "escalationBarrier" && tgt.type === "escalationFactor") {
      const list = factorsByBarrier.get(src.id) ?? [];
      if (!list.includes(tgt.id)) {
        list.push(tgt.id);
        factorsByBarrier.set(src.id, list);
      }
    }
  });

  const branchClusters = new Map<string, string[]>();

  parentToEscalations.forEach((barrierIds, parentId) => {
    const parentPos = pos.get(parentId);
    const parentNode = nodeIndex.get(parentId);
    if (!parentPos || !parentNode) return;
    const direction = parentNode.type === "mitigationBarrier" ? 1 : -1;
    const baseY = parentPos.y + escalationVerticalOffset;
    const total = barrierIds.length || 1;
    barrierIds.forEach((barrierId, idx) => {
      const barrierNode = nodeIndex.get(barrierId);
      if (!barrierNode) return;
      const yOffset = (idx - (total - 1) / 2) * escalationSiblingGap;
      const barrierY = baseY + yOffset;
      const barrierX = parentPos.x + direction * escalationHorizontalOffset;
      pos.set(barrierId, { x: barrierX, y: barrierY });
      const cluster = branchClusters.get(parentId) ?? [];
      if (!cluster.includes(barrierId)) cluster.push(barrierId);
      branchClusters.set(parentId, cluster);
      const factors = factorsByBarrier.get(barrierId) ?? [];
      const factorTotal = factors.length || 1;
      const factorBaseX = barrierX + direction * escalationFactorHorizontalOffset;
      factors.forEach((factorId, fIdx) => {
        const factorNode = nodeIndex.get(factorId);
        if (!factorNode) return;
        const factorYOffset = (fIdx - (factorTotal - 1) / 2) * escalationSiblingGap;
        pos.set(factorId, { x: factorBaseX, y: barrierY + factorYOffset });
        if (!cluster.includes(factorId)) cluster.push(factorId);
      });
    });
  });

  const assignFallbackPositions = (nodes: BowtieNode[], x: number) => {
    const spread = spreadY(nodes.length, centerY, yGap);
    nodes.forEach((n, i) => {
      if (!pos.has(n.id)) {
        pos.set(n.id, { x, y: spread[i] ?? centerY });
      }
    });
  };

  const unattachedLeftEscBarriers = leftEscalationBarriers.filter((n) => !pos.has(n.id));
  const unattachedRightEscBarriers = rightEscalationBarriers.filter((n) => !pos.has(n.id));
  const unattachedLeftEscFactors = leftEscalationFactors.filter((n) => !pos.has(n.id));
  const unattachedRightEscFactors = rightEscalationFactors.filter((n) => !pos.has(n.id));

  if (unattachedLeftEscBarriers.length) {
    assignFallbackPositions(unattachedLeftEscBarriers, xPrevention - colGap * 0.5);
  }
  if (unattachedRightEscBarriers.length) {
    assignFallbackPositions(unattachedRightEscBarriers, xMitigation + colGap * 0.5);
  }
  if (unattachedLeftEscFactors.length) {
    assignFallbackPositions(unattachedLeftEscFactors, xPrevention - colGap);
  }
  if (unattachedRightEscFactors.length) {
    assignFallbackPositions(unattachedRightEscFactors, xMitigation + colGap);
  }

  const shiftNode = (id: string, delta: number) => {
    if (!delta) return;
    const current = pos.get(id);
    if (!current) return;
    pos.set(id, { x: current.x, y: current.y + delta });
  };

  const applyWingSpacing = (chain: BowtieNode[]) => {
    const sorted = [...chain].sort((a, b) => {
      const ay = pos.get(a.id)?.y ?? 0;
      const by = pos.get(b.id)?.y ?? 0;
      return ay - by;
    });
    let extraShift = 0;
    sorted.forEach((node) => {
      if (extraShift) shiftNode(node.id, extraShift);
      const nodePos = pos.get(node.id);
      if (!nodePos) return;
      const cluster = branchClusters.get(node.id);
      if (cluster?.length) {
        if (extraShift) cluster.forEach((childId) => shiftNode(childId, extraShift));
        const branchMax = cluster.reduce((max, childId) => {
          const childPos = pos.get(childId);
          return childPos ? Math.max(max, childPos.y) : max;
        }, nodePos.y);
        const clearanceNeeded = branchMax - nodePos.y;
        if (clearanceNeeded > 0) {
          extraShift += clearanceNeeded;
        }
      }
    });
  };

  applyWingSpacing([...prevention, ...threats]);
  applyWingSpacing([...mitigation, ...consequences]);

  leftChains.forEach((chain, threatId) => {
    if (!chain.length) return;
    const anchorId = chain[0];
    if (!anchorId) return;
    const anchor = pos.get(anchorId);
    if (!anchor) return;
    const threatType = (nodeIndex.get(threatId)?.type ?? "threat") as BowtieNodeType;
    const threatWidth = NODE_WIDTHS[widthHintForType(threatType)];
    const threatXAligned = anchor.x - threatDefaultGap - threatWidth;
    pos.set(threatId, { x: threatXAligned, y: anchor.y });
    chain.forEach((barrierId) => {
      const barrierPos = pos.get(barrierId);
      if (barrierPos) pos.set(barrierId, { x: barrierPos.x, y: anchor.y });
    });
  });

  threats.forEach((threat) => {
    const chain = leftChains.get(threat.id);
    if (chain && chain.length) return;
    const baseY = threatYMap.get(threat.id) ?? centerY;
    const threatWidth = NODE_WIDTHS[widthHintForType(threat.type)];
    const xAligned = collapsedThreatRightEdge - threatWidth;
    const current = pos.get(threat.id);
    pos.set(threat.id, { x: xAligned, y: current?.y ?? baseY });
  });

  consequenceYMap.forEach((_, consequenceId) => {
    const chain = rightChains.get(consequenceId);
    if (!chain || chain.length === 0) return;
    const anchorId = chain[0];
    if (!anchorId) return;
    const anchor = pos.get(anchorId);
    if (!anchor) return;
    const consequencePos = pos.get(consequenceId);
    if (consequencePos) pos.set(consequenceId, { x: consequencePos.x, y: anchor.y });
    chain.forEach((barrierId) => {
      const barrierPos = pos.get(barrierId);
      if (barrierPos) pos.set(barrierId, { x: barrierPos.x, y: anchor.y });
    });
  });

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

    const widthHint = widthHintForType(n.type);
    const widthPx = n.type === "threat" ? NODE_WIDTHS[widthHint] : undefined;

    let sourcePosition = Position.Right;
    let targetPosition = Position.Left;

    if (n.type === "hazard") {
      sourcePosition = Position.Bottom;
      targetPosition = Position.Top;
    } else if (n.type === "escalationBarrier") {
      if (n.wing === "right") {
        sourcePosition = Position.Right;
        targetPosition = Position.Left;
      } else {
        sourcePosition = Position.Left;
        targetPosition = Position.Right;
      }
    } else if (n.type === "escalationFactor") {
      if (n.wing === "right") {
        sourcePosition = Position.Left;
        targetPosition = Position.Left;
      } else {
        sourcePosition = Position.Right;
        targetPosition = Position.Right;
      }
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
      ...(typeof widthPx === "number" && { widthPx }),
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

  const filteredEdges = normalizedEdges.filter((edge) => {
    const srcNode = nodeIndex.get(edge.source);
    const tgtNode = nodeIndex.get(edge.target);
    if (!srcNode || !tgtNode) return true;
    if (srcNode.type === "threat" && leftChainBarriers.has(edge.target)) return false;
    if (leftChainBarriers.has(edge.source) && tgtNode.type === "topEvent") return false;
    if (srcNode.type === "topEvent" && rightChainBarriers.has(edge.target)) return false;
    if (rightChainBarriers.has(edge.source) && tgtNode.type === "consequence") return false;
    return true;
  });

  const chainEdges: BowtieEdge[] = [];
  let chainEdgeCounter = 0;
  const addChainEdge = (source: string | undefined, target: string | undefined) => {
    if (!source || !target) return;
    chainEdges.push({
      id: `chain-${chainEdgeCounter++}-${source}-${target}`,
      source,
      target,
    });
  };

  leftChains.forEach((chain, threatId) => {
    if (!chain.length) {
      addChainEdge(threatId, topEvent?.id);
      return;
    }
    addChainEdge(threatId, chain[0]);
    for (let i = 0; i < chain.length - 1; i += 1) {
      addChainEdge(chain[i], chain[i + 1]);
    }
    addChainEdge(chain[chain.length - 1], topEvent?.id);
  });

  if (topEvent) {
    rightChains.forEach((chain, consequenceId) => {
      if (!chain.length) {
        addChainEdge(topEvent.id, consequenceId);
        return;
      }
      addChainEdge(topEvent.id, chain[0]);
      for (let i = 0; i < chain.length - 1; i += 1) {
        addChainEdge(chain[i], chain[i + 1]);
      }
      addChainEdge(chain[chain.length - 1], consequenceId);
    });
  }

  const effectiveEdges = [...filteredEdges, ...chainEdges];

  const edges: Edge[] = effectiveEdges.map((e) => {
    const source = e.source;
    const target = e.target;
    let sourceHandle = (e as BowtieEdge & { sourceHandle?: string }).sourceHandle;
    let targetHandle = (e as BowtieEdge & { targetHandle?: string }).targetHandle;

    const src = nodeMap.get(source);
    const tgt = nodeMap.get(target);
    const srcData = src?.data as BowtieNodeData | undefined;
    const tgtData = tgt?.data as BowtieNodeData | undefined;
    const srcType = srcData?.bowtieType;
    const tgtType = tgtData?.bowtieType;
    const srcOrientation = srcData?.orientation;
    const tgtOrientation = tgtData?.orientation;

    if (
      (srcType === "preventionBarrier" || srcType === "mitigationBarrier") &&
      tgtType === "escalationBarrier"
    ) {
      sourceHandle = "bottom";
      targetHandle = tgtOrientation === "right" ? "left" : "right";
    } else if (srcType === "escalationBarrier" && tgtType === "escalationFactor") {
      if (srcOrientation === "right") {
        sourceHandle = "right";
        targetHandle = "left";
      } else {
        sourceHandle = "left";
        targetHandle = "right";
      }
    } else if (srcType === "hazard" && tgtType === "topEvent") {
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
