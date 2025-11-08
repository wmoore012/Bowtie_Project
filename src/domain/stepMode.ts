import type { BowtieDiagram, BowtieNodeType } from "./bowtie.types";

export type StepIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface StepModeOptions {
  step: StepIndex;
  leftExpanded: boolean;  // if false, hide left wing regardless of step
  rightExpanded: boolean; // if false, hide right wing regardless of step
  preventionGroups: string[][];  // arrays of prevention barrier node ids (by threat)
  mitigationGroups: string[][];  // arrays of mitigation barrier node ids (by consequence)
}

/**
 * Compute a filtered diagram according to the pedagogical step-mode sequence.
 * Always includes Hazard + Top Event. Steps then add context and barrier groups.
 * Expand/collapse toggles override step visibility for entire wings.
 */
export function computeStepDiagram(full: BowtieDiagram, opts: StepModeOptions): BowtieDiagram {
  const { step, leftExpanded, rightExpanded, preventionGroups, mitigationGroups } = opts;

  const includeTypes = new Set<BowtieNodeType>(["hazard", "topEvent"]);
  const allowNodeIds = new Set<string>();

  // Step 1 adds threats + consequences (no barriers yet)
  if (step >= 1) {
    includeTypes.add("threat");
    includeTypes.add("consequence");
  }

  // Steps 2-5 progressively add prevention barrier groups
  if (step >= 2 && step <= 5) {
    const groupsToInclude = Math.min(preventionGroups.length, step - 1); // step 2 -> 1 group, step 5 -> 4 groups
    for (let i = 0; i < groupsToInclude; i++) {
      const g = preventionGroups[i];
      if (g) for (const id of g) allowNodeIds.add(id);
    }
  }

  // Step 6 includes all prevention barriers
  if (step >= 6) {
    for (const group of preventionGroups) for (const id of group) allowNodeIds.add(id);
    includeTypes.add("preventionBarrier");
  } else if (step >= 2) {
    // From steps 2-5 we also need the prevention type, but filtered by allowNodeIds
    includeTypes.add("preventionBarrier");
  }

  // Steps 7-9 progressively add mitigation barrier groups
  if (step >= 7 && step <= 9) {
    const groupsToInclude = Math.min(mitigationGroups.length, step - 6); // step 7 -> 1 group, step 9 -> 3 groups
    for (let i = 0; i < groupsToInclude; i++) {
      const g = mitigationGroups[i];
      if (g) for (const id of g) allowNodeIds.add(id);
    }
  }

  // Step 10 includes all mitigation barriers
  if (step >= 10) {
    for (const group of mitigationGroups) for (const id of group) allowNodeIds.add(id);
    includeTypes.add("mitigationBarrier");
  } else if (step >= 7) {
    includeTypes.add("mitigationBarrier");
  }

  // Wing overrides: if collapsed, remove corresponding types regardless of step
  if (!leftExpanded) {
    includeTypes.delete("threat");
    includeTypes.delete("preventionBarrier");
  }
  if (!rightExpanded) {
    includeTypes.delete("mitigationBarrier");
    includeTypes.delete("consequence");
  }

  // Filter nodes by type and (for barriers during partial group steps) by allowNodeIds
  const visibleNodes = full.nodes.filter((n) => {
    if (!includeTypes.has(n.type)) return n.type === "hazard" || n.type === "topEvent"; // always include spine
    if (n.type === "preventionBarrier" || n.type === "mitigationBarrier") {
      // If the wing is entirely visible (step >= 6 left or step >= 10 right), allowNodeIds already includes all
      // Otherwise require explicit ID allowance
      return allowNodeIds.size === 0 || allowNodeIds.has(n.id);
    }
    return true;
  });

  const ids = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = full.edges.filter((e) => ids.has(e.source) && ids.has(e.target));

  return { ...full, nodes: visibleNodes, edges: visibleEdges };
}

