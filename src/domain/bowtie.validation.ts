import type { BowtieDiagram, BowtieNodeType } from "./bowtie.types";

export type ValidationResult = { ok: true } | { ok: false; errors: string[] };

export interface ConnectionValidationResult {
  valid: boolean;
  errorMessage?: string;
}

/**
 * Validate a connection attempt between two nodes in Builder mode.
 * Returns validation result with specific error message if invalid.
 */
export function validateConnection(
  sourceType: BowtieNodeType,
  targetType: BowtieNodeType,
  sourceId: string,
  targetId: string
): ConnectionValidationResult {
  // Self-connection check
  if (sourceId === targetId) {
    return {
      valid: false,
      errorMessage: "A node cannot connect to itself.",
    };
  }

  // Define allowed connections for each node type
  const connectionRules: Record<BowtieNodeType, BowtieNodeType[]> = {
    threat: ["preventionBarrier"],
    escalationFactor: [],
    preventionBarrier: ["topEvent", "escalationBarrier"],
    escalationBarrier: ["escalationFactor"],
    hazard: ["topEvent"],
    topEvent: ["mitigationBarrier"],
    mitigationBarrier: ["consequence", "escalationBarrier"],
    consequence: [], // Terminal node - no outgoing connections
  };

  const allowedTargets = connectionRules[sourceType];

  // Check if target type is allowed
  if (!allowedTargets || !allowedTargets.includes(targetType)) {
    // Generate specific error message based on source type
    const errorMessages: Record<BowtieNodeType, string> = {
      threat: "Threats can only connect to Prevention Barriers.",
      escalationFactor: "Escalation Factors are terminal nodes and cannot start connections.",
      preventionBarrier: "Prevention Barriers connect to the Top Event or their Escalation Barriers.",
      escalationBarrier: "Escalation Barriers can only connect to Escalation Factors.",
      hazard: "The Hazard can only connect to the Top Event.",
      topEvent: "The Top Event can only connect to Mitigation Barriers.",
      mitigationBarrier: "Mitigation Barriers connect to Consequences or their Escalation Barriers.",
      consequence: "Consequences are terminal nodes and cannot have outgoing connections.",
    };

    return {
      valid: false,
      errorMessage: errorMessages[sourceType] || "Invalid connection.",
    };
  }

  // Check for backward flow (right-to-left)
  const typeOrder = (type: BowtieNodeType): number => {
    switch (type) {
      case "threat":
        return 1;
      case "preventionBarrier":
        return 2;
      case "escalationFactor":
        return 1;
      case "escalationBarrier":
        return 2;
      case "hazard":
        return 3;
      case "topEvent":
        return 4;
      case "mitigationBarrier":
        return 5;
      case "consequence":
        return 6;
      default:
        return 999;
    }
  };

  const isEscalationChain =
    ((sourceType === "preventionBarrier" || sourceType === "mitigationBarrier") && targetType === "escalationBarrier") ||
    (sourceType === "escalationBarrier" && targetType === "escalationFactor");

  if (!isEscalationChain && typeOrder(sourceType) > typeOrder(targetType)) {
    return {
      valid: false,
      errorMessage: "Connections must flow left-to-right in the Bowtie structure. Backward connections are not allowed.",
    };
  }

  return { valid: true };
}

export function validateDiagram(diagram: BowtieDiagram): ValidationResult {
  const errors: string[] = [];

  // 1) Basic required fields
  if (!diagram?.id?.trim()) errors.push("Diagram id is required.");
  if (!diagram?.title?.trim()) errors.push("Diagram title is required.");

  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const validTypes: BowtieNodeType[] = [
    "threat",
    "preventionBarrier",
    "hazard",
    "topEvent",
    "mitigationBarrier",
    "consequence",
    "escalationFactor",
    "escalationBarrier",
  ];

  let threats = 0,
    hazards = 0,
    topEvents = 0,
    consequences = 0;

  // 2) Validate nodes
  for (const n of diagram.nodes ?? []) {
    if (!n.id?.trim()) errors.push("Node with missing id.");
    else if (nodeIds.has(n.id)) errors.push(`Duplicate node id: ${n.id}`);
    else nodeIds.add(n.id);

    const rawType = String((n as { type?: string }).type ?? "");
    if (rawType.toLowerCase() === "degradation") {
      errors.push(`Degradation factors are excluded (node id=${n.id}).`);
    }
    if (!validTypes.includes(n.type)) errors.push(`Invalid node type: ${n.type} (id=${n.id})`);

    if (!n.label?.trim()) errors.push(`Node ${n.id} is missing label.`);

    switch (n.type) {
      case "threat":
        threats++;
        break;
      case "hazard":
        hazards++;
        break;
      case "topEvent":
        topEvents++;
        break;
      case "consequence":
        consequences++;
        break;
    }
  }

  // 3) Validate edges
  for (const e of diagram.edges ?? []) {
    if (!e.id?.trim()) errors.push("Edge with missing id.");
    else if (edgeIds.has(e.id)) errors.push(`Duplicate edge id: ${e.id}`);
    else edgeIds.add(e.id);

    if (!e.source?.trim() || !nodeIds.has(e.source)) errors.push(`Edge ${e.id} has invalid source: ${e.source}`);
    if (!e.target?.trim() || !nodeIds.has(e.target)) errors.push(`Edge ${e.id} has invalid target: ${e.target}`);

    // direction check only if both endpoints are valid
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      const srcType = diagram.nodes.find((n) => n.id === e.source)!.type;
      const tgtType = diagram.nodes.find((n) => n.id === e.target)!.type;
      const isEscalationEdge = ((srcType === "preventionBarrier" || srcType === "mitigationBarrier") && tgtType === "escalationBarrier") ||
        (srcType === "escalationBarrier" && tgtType === "escalationFactor");
      if (!isEscalationEdge && typeOrder(srcType) > typeOrder(tgtType)) {
        errors.push(
          `Edge ${e.id} appears to go backward in Bowtie flow (${srcType} ?+' ${tgtType}).`
        );
      }
    }
  }

  // 4) Required structural elements
  if (threats < 1) errors.push("At least one Threat is required.");
  if (hazards < 1) errors.push("At least one Hazard is required.");
  if (topEvents < 1) errors.push("At least one Top Event is required.");
  if (consequences < 1) errors.push("At least one Consequence is required.");

  // Exactly one Hazard and one Top Event in this teaching scenario
  if (hazards !== 1) errors.push("Exactly one Hazard is required.");
  if (topEvents !== 1) errors.push("Exactly one Top Event is required.");

  return errors.length ? { ok: false, errors } : { ok: true };
}

function typeOrder(type: BowtieNodeType): number {
  switch (type) {
    case "threat":
      return 1;
    case "preventionBarrier":
      return 2;
    case "escalationFactor":
      return 1;
    case "escalationBarrier":
      return 2;
    case "hazard":
      return 3;
    case "topEvent":
      return 4;
    case "mitigationBarrier":
      return 5;
    case "consequence":
      return 6;
    default:
      return 999;
  }
}

