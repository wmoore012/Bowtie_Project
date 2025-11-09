import type {
  BowtieNodeData,
  BowtieNodeType,
  BuilderNodeFields,
  BuilderNodeStatus,
} from "../../domain/bowtie.types";

const BASE_DEFAULTS: BuilderNodeFields = {
  status: "ok",
  tags: [],
  description: "",
};

const ROLE_DEFAULTS: Record<BowtieNodeType, BuilderNodeFields> = {
  hazard: {
    ...BASE_DEFAULTS,
    owner: "",
    sopLink: "",
  },
  topEvent: {
    ...BASE_DEFAULTS,
    owner: "",
  },
  threat: {
    ...BASE_DEFAULTS,
    owner: "",
    likelihood: "possible",
    initiatingEventCode: "",
  },
  preventionBarrier: {
    ...BASE_DEFAULTS,
    owner: "",
    status: "ok",
    testIntervalDays: 90,
    sopLink: "",
    critical: false,
    kpi: "",
  },
  escalationFactor: {
    ...BASE_DEFAULTS,
    driver: "",
    controlPlan: "",
  },
  escalationBarrier: {
    ...BASE_DEFAULTS,
    owner: "",
    status: "ok",
    sopLink: "",
    critical: false,
  },
  mitigationBarrier: {
    ...BASE_DEFAULTS,
    owner: "",
    status: "ok",
    coverageNote: "",
    sopLink: "",
    testIntervalDays: 180,
  },
  consequence: {
    ...BASE_DEFAULTS,
    severity: "serious",
    coverageNote: "",
  },
};

function normalizeTags(tags?: string[] | null): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim());
}

export function buildBuilderFields(
  type: BowtieNodeType,
  existing?: BuilderNodeFields
): BuilderNodeFields {
  const defaults = ROLE_DEFAULTS[type] ?? BASE_DEFAULTS;
  const merged: BuilderNodeFields = {
    ...BASE_DEFAULTS,
    ...defaults,
    ...(existing || {}),
  };
  merged.tags = normalizeTags(existing?.tags ?? defaults.tags ?? BASE_DEFAULTS.tags);
  if (typeof merged.status === "undefined") {
    merged.status = (defaults.status ?? BASE_DEFAULTS.status) as BuilderNodeStatus;
  }
  return merged;
}

export function ensureBuilderData<T extends BowtieNodeData>(
  nodeData: T
): T {
  if (!nodeData?.bowtieType) return nodeData;
  const builder = buildBuilderFields(nodeData.bowtieType, nodeData.builder);
  return {
    ...nodeData,
    builder,
  };
}

export function mergeBuilderPatch(
  nodeData: BowtieNodeData,
  patch: Partial<BuilderNodeFields>
): BowtieNodeData {
  const ensured = ensureBuilderData(nodeData);
  return {
    ...ensured,
    builder: {
      ...ensured.builder,
      ...patch,
      tags: normalizeTags(patch.tags ?? ensured.builder?.tags),
    },
  };
}
