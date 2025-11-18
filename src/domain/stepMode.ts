import type { BowtieDiagram, BowtieNodeType } from "./bowtie.types";

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface StepModeOptions {
  step: StepIndex;
  leftExpanded: boolean;  // if false, hide left wing regardless of step
  rightExpanded: boolean; // if false, hide right wing regardless of step
  preventionGroups: string[][];  // arrays of prevention barrier node ids (by threat)
  mitigationGroups: string[][];  // arrays of mitigation barrier node ids (by consequence)
}

type DiagramNode = BowtieDiagram["nodes"][number];

/**
 * Compute a filtered diagram according to the pedagogical step-mode sequence.
 * Always includes Hazard + Top Event. Steps then add context and barrier groups.
 * Expand/collapse toggles override step visibility for entire wings.
 */
export function computeStepDiagram(full: BowtieDiagram, opts: StepModeOptions): BowtieDiagram {
  const { step, leftExpanded, rightExpanded, preventionGroups, mitigationGroups } = opts;

  const nodeById = new Map(full.nodes.map((n) => [n.id, n]));
  const includeTypes = new Set<BowtieNodeType>(["hazard", "topEvent"]);
  const allowedPrevention = new Set<string>();
  const allowedMitigation = new Set<string>();

  // Step 1 adds threats + consequences (no barriers yet)
  if (step >= 1) {
    includeTypes.add("threat");
    includeTypes.add("consequence");
  }

  const preventionProgressStart = 2;
  const preventionProgressEnd = preventionProgressStart + preventionGroups.length - 1;
  const mitigationProgressStart = preventionProgressEnd + 1;
  const mitigationProgressEnd = mitigationProgressStart + mitigationGroups.length - 1;

  if (step >= preventionProgressStart && step <= preventionProgressEnd) {
    const groupsToInclude = Math.min(preventionGroups.length, step - preventionProgressStart + 1);
    for (let i = 0; i < groupsToInclude; i++) {
      const g = preventionGroups[i];
      if (g) for (const id of g) allowedPrevention.add(id);
    }
    includeTypes.add("preventionBarrier");
  } else if (step > preventionProgressEnd) {
    for (const group of preventionGroups) for (const id of group) allowedPrevention.add(id);
    if (preventionGroups.length) includeTypes.add("preventionBarrier");
  }

  if (step >= mitigationProgressStart && step <= mitigationProgressEnd) {
    const groupsToInclude = Math.min(mitigationGroups.length, step - mitigationProgressStart + 1);
    for (let i = 0; i < groupsToInclude; i++) {
      const g = mitigationGroups[i];
      if (g) for (const id of g) allowedMitigation.add(id);
    }
    includeTypes.add("mitigationBarrier");
  } else if (step > mitigationProgressEnd) {
    for (const group of mitigationGroups) for (const id of group) allowedMitigation.add(id);
    if (mitigationGroups.length) includeTypes.add("mitigationBarrier");
  }

  if (allowedPrevention.size > 0 || includeTypes.has("preventionBarrier")) {
    includeTypes.add("escalationBarrier");
    includeTypes.add("escalationFactor");
  }
  if (allowedMitigation.size > 0 || includeTypes.has("mitigationBarrier")) {
    includeTypes.add("escalationBarrier");
    includeTypes.add("escalationFactor");
  }

  // Wing overrides: if collapsed, remove corresponding types regardless of step
  if (!leftExpanded) {
    includeTypes.delete("preventionBarrier");
    includeTypes.delete("threat");
  }
  if (!rightExpanded) {
    includeTypes.delete("mitigationBarrier");
    includeTypes.delete("consequence");
  }

  const escalationParents = new Map<string, string>();
  const factorParents = new Map<string, string>();
  for (const edge of full.edges ?? []) {
    const src = nodeById.get(edge.source);
    const tgt = nodeById.get(edge.target);
    if (!src || !tgt) continue;
    if (
      (src.type === "preventionBarrier" || src.type === "mitigationBarrier") &&
      tgt.type === "escalationBarrier"
    ) {
      escalationParents.set(tgt.id, src.id);
    }
    if (src.type === "escalationBarrier" && tgt.type === "escalationFactor") {
      factorParents.set(tgt.id, src.id);
    }
  }

  const isLeftWingNode = (node: DiagramNode) =>
    node.type === "threat" ||
    node.type === "preventionBarrier" ||
    ((node.type === "escalationBarrier" || node.type === "escalationFactor") && node.wing !== "right");

  const isRightWingNode = (node: DiagramNode) =>
    node.type === "consequence" ||
    node.type === "mitigationBarrier" ||
    ((node.type === "escalationBarrier" || node.type === "escalationFactor") && node.wing === "right");

  // Filter nodes by type and parent visibility
  const visibleNodes = full.nodes.filter((n) => {
    if (n.type === "hazard" || n.type === "topEvent") return true;
    if (!leftExpanded && isLeftWingNode(n)) return false;
    if (!rightExpanded && isRightWingNode(n)) return false;
    if (!includeTypes.has(n.type)) return false;
    if (n.type === "preventionBarrier") {
      return allowedPrevention.has(n.id);
    }
    if (n.type === "mitigationBarrier") {
      return allowedMitigation.has(n.id);
    }
    if (n.type === "escalationBarrier") {
      const parentId = escalationParents.get(n.id);
      if (!parentId) return false;
      return allowedPrevention.has(parentId) || allowedMitigation.has(parentId);
    }
    if (n.type === "escalationFactor") {
      const barrierId = factorParents.get(n.id);
      if (!barrierId) return false;
      const parentId = escalationParents.get(barrierId);
      if (!parentId) return false;
      return allowedPrevention.has(parentId) || allowedMitigation.has(parentId);
    }
    return true;
  });

  const ids = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = full.edges.filter((e) => ids.has(e.source) && ids.has(e.target));

  return { ...full, nodes: visibleNodes, edges: visibleEdges };
}
