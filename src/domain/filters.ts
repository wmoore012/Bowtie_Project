import type { BowtieDiagram } from "./bowtie.types";

/**
 * Compute a diagram filtered by selected role chips.
 * - When no roles selected, returns input diagram unchanged.
 * - Hazard and Top Event are always kept visible regardless of filters.
 * - Nodes with no chips are hidden when any filter is active (spine nodes excluded).
 */
export function computeRoleFilteredDiagram(full: BowtieDiagram, selectedRoles: Set<string>): BowtieDiagram {
  if (!selectedRoles || selectedRoles.size === 0) return full;

  const keepNodeIds = new Set<string>();
  for (const n of full.nodes) {
    if (n.type === "hazard" || n.type === "topEvent") {
      keepNodeIds.add(n.id);
      continue;
    }
    const chips = n.metadata?.chips;
    const matches = Array.isArray(chips) ? chips.some((c) => selectedRoles.has(c)) : false;
    if (matches) keepNodeIds.add(n.id);
  }

  const nodes = full.nodes.filter((n) => keepNodeIds.has(n.id));
  const idset = new Set(nodes.map((n) => n.id));
  const edges = full.edges.filter((e) => idset.has(e.source) && idset.has(e.target));
  return { ...full, nodes, edges };
}

/** Collect unique role labels available across all nodes' metadata.chips */
export function collectAvailableRoles(full: BowtieDiagram): string[] {
  const set = new Set<string>();
  for (const n of full.nodes) {
    const chips = n.metadata?.chips;
    if (Array.isArray(chips)) for (const c of chips) set.add(c);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

