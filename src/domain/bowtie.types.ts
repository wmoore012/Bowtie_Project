export type BowtieNodeType =
  | "threat"
  | "escalationFactor"
  | "preventionBarrier"
  | "escalationBarrier"
  | "hazard"
  | "topEvent"
  | "mitigationBarrier"
  | "consequence";

export type BuilderNodeStatus = "ok" | "weak" | "failed";
export type LikelihoodBand = "rare" | "unlikely" | "possible" | "likely" | "frequent";
export type SeverityBand = "minor" | "serious" | "major" | "catastrophic";

export interface BuilderNodeFields {
  description?: string;
  owner?: string;
  status?: BuilderNodeStatus;
  tags?: string[];
  sopLink?: string;
  initiatingEventCode?: string;
  likelihood?: LikelihoodBand;
  severity?: SeverityBand;
  testIntervalDays?: number | null;
  critical?: boolean;
  coverageNote?: string;
  kpi?: string;
  driver?: string;
  controlPlan?: string;
}

export interface NodeMetadata {
  eli5: string; // Plain-language 1–2 sentences
  details: string[]; // 3–5 specific, auditable statements
  chips?: string[]; // Optional role/ownership tags
  sopLink?: string; // Optional link to SOP or policy document
  imagePlaceholder?: string; // Optional image filename
  kpis?: string[]; // Optional metrics (for barriers only)
  failureModes?: string[]; // Optional failure scenarios (for barriers only)
}

export interface BowtieNodeMetadata {
  eli5?: string;
  chips?: string[];
  kpis?: string[];
  details?: string[];
  failureModes?: string[];
  sopLink?: string;
}


export interface BowtieNode {
  id: string;
  type: BowtieNodeType;
  label: string;
  collapsed?: boolean;
  metadata?: NodeMetadata;
  wing?: "left" | "right";
}

export interface BowtieEdge {
  id: string;
  source: string;
  target: string;
  scenarioImpact?: "normal" | "failedPath";
}

export interface BowtieDiagram {
  id: string;
  title: string;
  nodes: BowtieNode[];
  edges: BowtieEdge[];
  createdAt: string;
  updatedAt: string;
}

export type ThreatId = string;
export type BarrierId = string;

export interface ThreatLaneOrder {
  lanes: Record<ThreatId, BarrierId[]>;
}

// React Flow node data payload; centralized to avoid any-casts
export interface BowtieNodeData extends Record<string, unknown> {
  label: string;
  bowtieType: BowtieNodeType;
  metadata?: BowtieNodeMetadata;
  // UI-only extras for styling
  role?: "prevention" | "mitigation" | "escalation-left" | "escalation-right" | "escalation";
  highlighted?: boolean;
  dimmed?: boolean;
  displayLabel?: string;
  badge?: string;
  emoji?: string;
  orientation?: "left" | "right" | "center";
  widthHint?: "narrow" | "medium" | "wide";
  widthPx?: number;
  builder?: BuilderNodeFields;
}

export function isBowtieNodeData(v: unknown): v is BowtieNodeData {
  return !!v && typeof (v as Record<string, unknown>).label === "string" && typeof (v as Record<string, unknown>).bowtieType === "string";
}
