export type BowtieNodeType =
  | "threat"
  | "preventionBarrier"
  | "hazard"
  | "topEvent"
  | "mitigationBarrier"
  | "consequence";

export interface NodeMetadata {
  eli5: string; // Plain-language 1–2 sentences
  details: string[]; // 3–5 specific, auditable statements
  chips?: string[]; // Optional role/ownership tags
  sopLink?: string; // Optional link to SOP or policy document
  imagePlaceholder?: string; // Optional image filename
  kpis?: string[]; // Optional metrics (for barriers only)
  failureModes?: string[]; // Optional failure scenarios (for barriers only)
}

export interface BowtieNode {
  id: string;
  type: BowtieNodeType;
  label: string;
  collapsed?: boolean;
  metadata?: NodeMetadata;
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

// React Flow node data payload; centralized to avoid any-casts
export interface BowtieNodeData extends Record<string, unknown> {
  label: string;
  bowtieType: BowtieNodeType;
  metadata?: NodeMetadata;
  // UI-only extras for styling
  role?: "prevention" | "mitigation";
}

export function isBowtieNodeData(v: unknown): v is BowtieNodeData {
  return !!v && typeof (v as any).label === "string" && typeof (v as any).bowtieType === "string";
}
