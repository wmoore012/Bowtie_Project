import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  MarkerType,
  Position,
  addEdge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";

import type {
  BowtieDiagram,
  BowtieNodeType,
  BowtieNodeData,
  ThreatLaneOrder,
  BarrierId,
  ThreatId,
} from "../../domain/bowtie.types";
import { computeSimpleLayout, computeElkLayout } from "./layout";
import { Legend } from "./Legend";
import { toPng } from "html-to-image";
import BarrierNode from "./nodes/BarrierNode";
import ThreatNode from "./nodes/ThreatNode";
import ConsequenceNode from "./nodes/ConsequenceNode";
import HazardTagNode from "./nodes/HazardTagNode";
import TopEventKnotNode from "./nodes/TopEventKnotNode";
import { PreAttentiveHelp } from "./PreAttentiveHelp";
import EscalationFactorNode from "./nodes/EscalationFactorNode";
import { BuilderInspector, type BuilderInspectorChange } from "./BuilderInspector";
import { BuilderModeConfirmDialog } from "./BuilderModeConfirmDialog";
import { ensureBuilderData, mergeBuilderPatch } from "./builderFields";


import { computeStepDiagram, type StepIndex } from "../../domain/stepMode";
import { PREVENTION_GROUPS, MITIGATION_GROUPS } from "../../domain/scenarios/highway_driving.groups";
import styles from "./BowtieGraph.module.css";
import "../../styles/theme.css";
import "../../styles/preattentive-tokens.css";
import { computeRoleFilteredDiagram, collectAvailableRoles } from "../../domain/filters";
import { ErrorBoundary } from "../common/ErrorBoundary";
import { Toast } from "../common/Toast";
import { validateConnection } from "../../domain/bowtie.validation";
import {
  exportDiagramToJSON,
  importDiagramFromJSON,
  saveDiagramToLocalStorage,
  loadDiagramFromLocalStorage,
  clearDiagramFromLocalStorage,
} from "../../utils/diagramIO";
import { DropSlotLayer } from "./DropSlotLayer";
import { calculatePreventionSlots, findNearestSlot, type DropSlot } from "./slotUtils";
import {
  deriveThreatLaneOrderFromDiagram,
  moveBarrierToThreat,
  buildThreatLaneEdges,
  replaceThreatLaneEdges
} from "./laneUtils";

import { highwayDrivingNarrative } from "../../domain/scenarios/highwayDrivingNarrative";
import gsap from "gsap";
import { calculateFocusViewport } from "./story/autoZoom";

const pxToPt = (px: number) => (px * 72) / 96;

/**
 * Determine the role/category for a given step index for visual styling.
 * Step 1: Hazard, Step 2: TopEvent, Step 3: Threat,
 * Steps 4-6: Prevention, Steps 7-8: Mitigation, Steps 9-10: Consequence, Steps 11-12: Meta
 */
function getStepRole(stepIdx: number): string {
  if (stepIdx === 1) return "Hazard";
  if (stepIdx === 2) return "TopEvent";
  if (stepIdx === 3) return "Threat";
  if (stepIdx >= 4 && stepIdx <= 6) return "Prevention";
  if (stepIdx >= 7 && stepIdx <= 8) return "Mitigation";
  if (stepIdx === 9) return "Consequence";
  if (stepIdx >= 10) return "Meta";
  return "Meta";
}

const LEFT_WING_TYPES = new Set<BowtieNodeType>([
  "threat",
  "preventionBarrier",
  "escalationFactor",
  "escalationBarrier",
]);
const RIGHT_WING_TYPES = new Set<BowtieNodeType>(["mitigationBarrier", "consequence"]);

const nodeTypes = {
  threat: ThreatNode,
  escalationFactor: EscalationFactorNode,
  preventionBarrier: BarrierNode,
  escalationBarrier: BarrierNode,
  mitigationBarrier: BarrierNode,
  hazard: HazardTagNode,
  topEvent: TopEventKnotNode,
  consequence: ConsequenceNode,
} as const;

const MAX_STEP: StepIndex = 11;
const STORY_LOCK_STEP: StepIndex = 1 as StepIndex;




















function InnerGraph({ diagram, initialMode = "demo" }: { diagram: BowtieDiagram; initialMode?: "demo" | "builder" }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Cache for hover preloading (optional micro-optimization)
  const preloadRef = useRef<Map<string, BowtieNodeData>>(new Map());

  const filtersBtnRef = useRef<HTMLButtonElement | null>(null);

  const paletteBtnRef = useRef<HTMLButtonElement | null>(null);


  // Default to expanded, full-step view
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(true);
  const [step, setStep] = useState<StepIndex>(1 as StepIndex);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const allRoles = useMemo(() => collectAvailableRoles(diagram), [diagram]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [failedMode, setFailedMode] = useState(false);
  const [mode, setMode] = useState<"demo" | "builder">(initialMode);
  // Collapsible UI panels
  const [paletteOpen, setPaletteOpen] = useState(false);
  // First-time builder mode confirmation
  const [showBuilderConfirm, setShowBuilderConfirm] = useState(false);
  const hasSeenBuilderConfirmRef = useRef(false);
  // Toast notification for connection validation errors
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportingSnapshot, setExportingSnapshot] = useState(false);
  const exportingSnapshotRef = useRef(false);
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  useEffect(() => { setPaletteOpen(mode === "builder"); }, [mode]);
  useEffect(() => {
    if (mode !== "demo") {
      setExpandedChainRoots(new Set());
      setHighlightedChainRootId(null);
    }
  }, [mode]);
  useEffect(() => {
    if (mode === "builder") {
      setStep(MAX_STEP);
    } else {
      setStep(lastDemoStepRef.current ?? (1 as StepIndex));
    }
  }, [mode]);
  useEffect(() => {
    if (mode === "builder") {
      setCardNode(null);
    } else {
      setInspectorOpen(false);
      setSelectedInspectorId(null);
    }
  }, [mode]);
  useEffect(() => {
    if (mode === "demo" && storyStepLockRef.current === null) {
      lastDemoStepRef.current = step;
    }
  }, [mode, step]);

  // Optional render override (e.g., Clear Diagram in Builder)
  const [renderOverride, setRenderOverride] = useState<BowtieDiagram | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const [threatLanes, setThreatLanes] = useState<ThreatLaneOrder>(() =>
    deriveThreatLaneOrderFromDiagram(diagram)
  );

  useEffect(() => {
    if (mode !== "builder") return;
    const baseDiagram = renderOverride ?? diagram;
    setThreatLanes(deriveThreatLaneOrderFromDiagram(baseDiagram));
  }, [mode, diagram, renderOverride]);

  useEffect(() => {
    if (mode !== "builder") return;
    // For now we do not need extra side effects when lanes change, but this keeps
    // ThreatLaneOrder wired into React state and ready for future steps.
  }, [mode, threatLanes]);

  // Demo story overlay
  const [storyOpen, setStoryOpen] = useState(false);
  // Narrative step index is 1-based; initialize to last step so UI shows "Step N of N" before starting
  const [storyIdx, setStoryIdx] = useState<number>(highwayDrivingNarrative.length);
  const [manualRevealIds, setManualRevealIds] = useState<Set<string>>(new Set());
  const [manualFocusIds, setManualFocusIds] = useState<Set<string>>(new Set());
  const [expandedChainRoots, setExpandedChainRoots] = useState<Set<string>>(new Set());
  const [highlightedChainRootId, setHighlightedChainRootId] = useState<string | null>(null);
  const [storyRevealIds, setStoryRevealIds] = useState<Set<string>>(new Set());
  const [storyFocusIds, setStoryFocusIds] = useState<Set<string>>(new Set());
  const lastDemoStepRef = useRef<StepIndex>(1 as StepIndex);
  const storyStepLockRef = useRef<StepIndex | null>(null);
  const hazardNodeId = useMemo(() => diagram.nodes.find((n) => n.type === "hazard")?.id ?? null, [diagram]);
  const topEventNodeId = useMemo(() => diagram.nodes.find((n) => n.type === "topEvent")?.id ?? null, [diagram]);


  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string | null>(null);
  // Persist sidebar open/close across sessions


  const [cardNode, setCardNode] = useState<RFNode<BowtieNodeData> | null>(null);
  const [lastFocusedNodeId, setLastFocusedNodeId] = useState<string | null>(null);

  // Slot visualization state
  const [dropSlots, setDropSlots] = useState<DropSlot[]>([]);
  const [activeSlot, setActiveSlot] = useState<DropSlot | null>(null);

  const createClearedDiagram = useCallback((): BowtieDiagram => {
    const timestamp = Date.now();
    return {
      id: `cleared-${timestamp}`,
      title: diagram.title,
      createdAt: diagram.createdAt,
      updatedAt: new Date(timestamp).toISOString(),
      nodes: [
        { id: "hazard", type: "hazard", label: "" },
        { id: "topEvent", type: "topEvent", label: "" },
      ],
      edges: [{ id: "h_to_top", source: "hazard", target: "topEvent" }],
    };
  }, [diagram.createdAt, diagram.title]);

  const clearToBaseDiagram = useCallback(() => {
    const cleared = createClearedDiagram();
    setRenderOverride(cleared);
    setInspectorOpen(false);
    setSelectedInspectorId(null);
    setCardNode(null);
    setDropSlots([]);
    setActiveSlot(null);
    setManualRevealIds(new Set());
    setManualFocusIds(new Set());
    setExpandedChainRoots(new Set());
    setHighlightedChainRootId(null);
    clearDiagramFromLocalStorage("bowtie.diagram.autosave");
    return cleared;
  }, [
    createClearedDiagram,
    setRenderOverride,
    setInspectorOpen,
    setSelectedInspectorId,
    setCardNode,
    setDropSlots,
    setActiveSlot,
    setManualRevealIds,
    setManualFocusIds,
    setExpandedChainRoots,
    setHighlightedChainRootId,
  ]);

  // Story mode state
  const [autoZoomEnabled, setAutoZoomEnabled] = useState(true);

  const nodeById = useMemo(() => new Map(diagram.nodes.map((n) => [n.id, n])), [diagram]);
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of diagram.edges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      map.get(edge.source)!.add(edge.target);
      if (!map.has(edge.target)) map.set(edge.target, new Set());
      map.get(edge.target)!.add(edge.source);
    }
    return map;
  }, [diagram]);
  const { chainNodesByRoot, nodeToRoot } = useMemo(() => {
    const nodeIndex = new Map(diagram.nodes.map((n) => [n.id, n]));
    const nodeToRoot = new Map<string, string>();
    const addToMap = (map: Map<string, Set<string>>, key: string, value: string) => {
      if (!key || !value) return;
      const existing = map.get(key);
      if (existing) existing.add(value);
      else map.set(key, new Set([value]));
    };
    const threatToBarriers = new Map<string, Set<string>>();
    const consequenceToBarriers = new Map<string, Set<string>>();
    const barrierToEscalations = new Map<string, Set<string>>();
    const escalationToFactors = new Map<string, Set<string>>();
    for (const edge of diagram.edges) {
      const source = nodeIndex.get(edge.source);
      const target = nodeIndex.get(edge.target);
      if (!source || !target) continue;
      if (source.type === "threat" && target.type === "preventionBarrier") {
        addToMap(threatToBarriers, source.id, target.id);
      } else if (target.type === "threat" && source.type === "preventionBarrier") {
        addToMap(threatToBarriers, target.id, source.id);
      }
      if (source.type === "mitigationBarrier" && target.type === "consequence") {
        addToMap(consequenceToBarriers, target.id, source.id);
      } else if (target.type === "mitigationBarrier" && source.type === "consequence") {
        addToMap(consequenceToBarriers, source.id, target.id);
      }
      const sourceIsBarrier =
        source.type === "preventionBarrier" || source.type === "mitigationBarrier";
      const targetIsBarrier =
        target.type === "preventionBarrier" || target.type === "mitigationBarrier";
      if (sourceIsBarrier && target.type === "escalationBarrier") {
        addToMap(barrierToEscalations, source.id, target.id);
      } else if (targetIsBarrier && source.type === "escalationBarrier") {
        addToMap(barrierToEscalations, target.id, source.id);
      }
      if (source.type === "escalationBarrier" && target.type === "escalationFactor") {
        addToMap(escalationToFactors, source.id, target.id);
      } else if (target.type === "escalationBarrier" && source.type === "escalationFactor") {
        addToMap(escalationToFactors, target.id, source.id);
      }
    }
    const addNodeToRoot = (rootId: string, nodeId: string, acc: Set<string>) => {
      acc.add(nodeId);
      nodeToRoot.set(nodeId, rootId);
    };
    const expandBarrierCluster = (barrierId: string, rootId: string, acc: Set<string>) => {
      addNodeToRoot(rootId, barrierId, acc);
      const escBarriers = barrierToEscalations.get(barrierId);
      escBarriers?.forEach((escId) => {
        addNodeToRoot(rootId, escId, acc);
        escalationToFactors.get(escId)?.forEach((factorId) => addNodeToRoot(rootId, factorId, acc));
      });
    };
    const combined = new Map<string, Set<string>>();
    threatToBarriers.forEach((barriers, threatId) => {
      if (!barriers.size) return;
      const nodes = new Set<string>();
      barriers.forEach((barrierId) => expandBarrierCluster(barrierId, threatId, nodes));
      if (nodes.size) combined.set(threatId, nodes);
    });
    consequenceToBarriers.forEach((barriers, consequenceId) => {
      if (!barriers.size) return;
      const nodes = new Set<string>();
      barriers.forEach((barrierId) => expandBarrierCluster(barrierId, consequenceId, nodes));
      if (nodes.size) combined.set(consequenceId, nodes);
    });
    return { chainNodesByRoot: combined, nodeToRoot };
  }, [diagram]);
  const barrierTypes = useMemo(
    () => new Set<BowtieNodeType>(["preventionBarrier", "mitigationBarrier", "escalationBarrier"]),
    []
  );
  const chainRevealIds = useMemo(() => {
    const ids = new Set<string>();
    expandedChainRoots.forEach((rootId) => {
      const nodes = chainNodesByRoot.get(rootId);
      nodes?.forEach((nodeId) => ids.add(nodeId));
    });
    return ids;
  }, [expandedChainRoots, chainNodesByRoot]);
  useEffect(() => {
    setExpandedChainRoots((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (chainNodesByRoot.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [chainNodesByRoot]);
  useEffect(() => {
    if (highlightedChainRootId && !expandedChainRoots.has(highlightedChainRootId)) {
      setHighlightedChainRootId(null);
    }
  }, [highlightedChainRootId, expandedChainRoots]);
  const chainFocusIds = useMemo(() => {
    const ids = new Set<string>();
    if (highlightedChainRootId && expandedChainRoots.has(highlightedChainRootId)) {
      ids.add(highlightedChainRootId);
      const nodes = chainNodesByRoot.get(highlightedChainRootId);
      nodes?.forEach((nodeId) => ids.add(nodeId));
    }
    return ids;
  }, [highlightedChainRootId, expandedChainRoots, chainNodesByRoot]);

  const collectRevealForNode = useCallback(
    (nodeId: string) => {
      const reveal = new Set<string>();
      const node = nodeById.get(nodeId);
      if (node && barrierTypes.has(node.type)) {
        reveal.add(nodeId);
      }
      const neighbors = adjacency.get(nodeId);
      if (neighbors) {
        neighbors.forEach((neighborId) => {
          const neighbor = nodeById.get(neighborId);
          if (neighbor && barrierTypes.has(neighbor.type)) {
            reveal.add(neighborId);
          }
        });
      }
      return reveal;
    },
    [adjacency, barrierTypes, nodeById]
  );
  const toggleChainExpansion = useCallback(
    (rootId: string) => {
      const nodes = chainNodesByRoot.get(rootId);
      if (!nodes || nodes.size === 0) return "noop" as const;
      if (expandedChainRoots.has(rootId)) {
        const chainMembers = new Set(nodes);
        setExpandedChainRoots((prev) => {
          const next = new Set(prev);
          next.delete(rootId);
          return next;
        });
        setManualRevealIds((prev) => {
          if (!prev.size) return prev;
          let changed = false;
          const next = new Set(prev);
          chainMembers.forEach((id) => {
            if (next.delete(id)) changed = true;
          });
          return changed ? next : prev;
        });
        setManualFocusIds((prev) => {
          if (!prev.size) return prev;
          let changed = false;
          const next = new Set(prev);
          chainMembers.forEach((id) => {
            if (next.delete(id)) changed = true;
          });
          return changed ? next : prev;
        });
        setHighlightedChainRootId((prev) => (prev === rootId ? null : prev));
        return "collapsed" as const;
      }
      setExpandedChainRoots((prev) => {
        const next = new Set(prev);
        next.add(rootId);
        return next;
      });
      setManualRevealIds((prev) => {
        const next = new Set(prev);
        chainNodesByRoot.get(rootId)?.forEach((nodeId) => next.add(nodeId));
        return next;
      });
      setHighlightedChainRootId(rootId);
      return "expanded" as const;
    },
    [chainNodesByRoot, expandedChainRoots]
  );

  const handleNodeClick = (
    node: RFNode<BowtieNodeData>,
    opts?: { skipReveal?: boolean; revealIds?: Set<string> }
  ) => {
    setLastFocusedNodeId(node.id);
    if (mode === "builder") {
      setSelectedInspectorId(node.id);
      setInspectorOpen(true);
      setCardNode(null);
      return;
    }
    setCardNode(node);
    if (mode === "demo" && !opts?.skipReveal) {
      const reveal = opts?.revealIds ?? collectRevealForNode(node.id);
      const revealArr = Array.from(reveal);
      setManualRevealIds(new Set(revealArr));
      setManualFocusIds(new Set<string>([node.id, ...revealArr]));
    }
  };

  const handleCloseCard = useCallback(() => {
    setCardNode(null);
    setManualRevealIds(new Set());
    setManualFocusIds(new Set());
    if (lastFocusedNodeId) {
      const elem = document.querySelector(`[data-nodeid="${lastFocusedNodeId}"], [data-id="${lastFocusedNodeId}"]`) as HTMLElement | null;
      elem?.focus();
    }
  }, [lastFocusedNodeId]);

  // Escape to close the card
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cardNode) {
        e.preventDefault();
        handleCloseCard();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [cardNode, handleCloseCard]);
  // Escape to close toolbar menus
  // Escape to close popup panels
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      let handled = false;
      if (filtersOpen) { setFiltersOpen(false); handled = true; }
      if (actionsOpen) { setActionsOpen(false); handled = true; }
      if (exportOpen) { setExportOpen(false); handled = true; }
      if (paletteOpen) { setPaletteOpen(false); handled = true; }
      if (helpOpen) { setHelpOpen(false); handled = true; }
      if (inspectorOpen) { setInspectorOpen(false); setSelectedInspectorId(null); handled = true; }
      if (handled) e.stopPropagation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen, actionsOpen, exportOpen, paletteOpen, helpOpen, inspectorOpen]);


  // Focus management for popup panels
  useEffect(() => {
    if (filtersOpen) {
      setTimeout(() => {
        const first = wrapperRef.current?.querySelector('#filters-panel button') as HTMLButtonElement | null;
        first?.focus();
      }, 0);
    } else {
      // restore focus to Filters button if present in this component
      filtersBtnRef.current?.focus();
    }
  }, [filtersOpen]);

  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => {
        const first = wrapperRef.current?.querySelector('#builder-palette-panel button') as HTMLButtonElement | null;
        first?.focus();
      }, 0);
    } else {
      // restore focus to Palette button if present in this component
      paletteBtnRef.current?.focus();
    }
  }, [paletteOpen]);
  useEffect(() => {
    if (!actionsOpen) return;
    const t = setTimeout(() => {
      const first = wrapperRef.current?.querySelector('#actions-panel button') as HTMLButtonElement | null;
      first?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [actionsOpen]);
  useEffect(() => {
    if (!exportOpen) return;
    const t = setTimeout(() => {
      const first = wrapperRef.current?.querySelector('#export-panel button') as HTMLButtonElement | null;
      first?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [exportOpen]);

  // Close panels on outside click
  useEffect(() => {
    if (!filtersOpen && !actionsOpen && !exportOpen && !paletteOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const inFilters = !!(wrapperRef.current?.querySelector('#filters-panel') as HTMLElement | null)?.contains(target);
      const inActions = !!(wrapperRef.current?.querySelector('#actions-panel') as HTMLElement | null)?.contains(target);
      const inExport = !!(wrapperRef.current?.querySelector('#export-panel') as HTMLElement | null)?.contains(target);
      const inPalette = !!(wrapperRef.current?.querySelector('#builder-palette-panel') as HTMLElement | null)?.contains(target);
      const inFiltersBtn = !!(filtersBtnRef.current && filtersBtnRef.current.contains(target as Node));
      const inPaletteBtn = !!(paletteBtnRef.current && paletteBtnRef.current.contains(target as Node));
      if (!inFilters && !inActions && !inExport && !inPalette && !inFiltersBtn && !inPaletteBtn) {
        if (filtersOpen) setFiltersOpen(false);
        if (actionsOpen) setActionsOpen(false);
        if (exportOpen) setExportOpen(false);
        if (paletteOpen) setPaletteOpen(false);
      }
    };
    window.addEventListener('mousedown', onDocMouseDown);
    return () => window.removeEventListener('mousedown', onDocMouseDown);
  }, [filtersOpen, actionsOpen, exportOpen, paletteOpen]);


  // Click outside card to close (non-blocking overlay) with drag threshold
  useEffect(() => {
    if (!cardNode) return;
    let startX = 0;
    let startY = 0;
    let startedOutside = false;

    let touchStartX = 0;
    let touchStartY = 0;

    const onDown = (e: MouseEvent) => {
      const target = e.target as EventTarget | null;
      const el = cardRef.current as unknown as { contains?: (t: Node) => boolean } | null;
      let outside = true;
      try {
        outside = !!(el && el.contains ? !el.contains(target as Node) : true);
      } catch {
        outside = true;
      }
      startedOutside = outside;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onUp = (e: MouseEvent) => {
      if (!startedOutside) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Only treat as a click if the pointer didn’t move more than ~5px
      if ((dx * dx + dy * dy) <= 25) {
        handleCloseCard();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      const target = e.target as EventTarget | null;
      const el = cardRef.current as unknown as { contains?: (t: Node) => boolean } | null;
      const t = e.touches[0];
      let outside = true;
      try {
        outside = !!(el && el.contains ? !el.contains(target as Node) : true);
      } catch {
        outside = true;
      }
      startedOutside = outside;
      if (t) {
        touchStartX = t.clientX;
        touchStartY = t.clientY;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!startedOutside) return;
      const t = e.changedTouches[0];
      if (t) {
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;
        if ((dx * dx + dy * dy) <= 25) {
          handleCloseCard();
        }
      }
    };

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [cardNode, handleCloseCard]);

  // Keyboard step navigation: ArrowLeft/ArrowRight/Home/End (only when no menus or card are open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (filtersOpen || cardNode) return;
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable = !!target?.isContentEditable;
      if (editable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((s) => (s > 0 ? ((s - 1) as StepIndex) : s));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStep((s) => (s < MAX_STEP ? ((s + 1) as StepIndex) : s));
      } else if (e.key === "Home") {
        e.preventDefault();
        setStep(0 as StepIndex);
      } else if (e.key === "End") {
        e.preventDefault();
        setStep(MAX_STEP);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen, cardNode]);



  const visibleDiagram = useMemo(() => {
    if (mode === "builder") return diagram;
    return computeStepDiagram(diagram, {
      step,
      leftExpanded,
      rightExpanded,
      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
  }, [diagram, step, leftExpanded, rightExpanded, mode]);

  const filteredDiagram = useMemo(
    () => computeRoleFilteredDiagram(visibleDiagram, selectedRoles),
    [visibleDiagram, selectedRoles]
  );

  const activeRevealIds = useMemo(() => {
    if (mode === "builder") return new Set<string>();
    const union = new Set<string>();
    manualRevealIds.forEach((id) => union.add(id));
    storyRevealIds.forEach((id) => union.add(id));
    chainRevealIds.forEach((id) => union.add(id));
    return union;
  }, [manualRevealIds, storyRevealIds, chainRevealIds, mode]);

  const revealDiagram = useMemo(() => {
    if (mode === "builder" || activeRevealIds.size === 0) return filteredDiagram;
    const ids = new Set(filteredDiagram.nodes.map((n) => n.id));
    const extraNodes: typeof diagram.nodes = [];
    activeRevealIds.forEach((id) => {
      if (!ids.has(id)) {
        const n = nodeById.get(id);
        if (n) {
          extraNodes.push(n);
          ids.add(id);
        }
      }
    });
    if (!extraNodes.length) return filteredDiagram;
    const existingEdgeIds = new Set(filteredDiagram.edges.map((e) => e.id));
    const mergedEdges = [...filteredDiagram.edges];
    for (const edge of diagram.edges) {
      if (existingEdgeIds.has(edge.id)) continue;
      if (ids.has(edge.source) && ids.has(edge.target)) {
        mergedEdges.push(edge);
        existingEdgeIds.add(edge.id);
      }
    }
    return { ...filteredDiagram, nodes: [...filteredDiagram.nodes, ...extraNodes], edges: mergedEdges };
  }, [activeRevealIds, filteredDiagram, nodeById, diagram, mode]);

  // When opening the card, move focus to its close button for accessibility
  useEffect(() => {
    if (!cardNode) return;
    const btn = cardRef.current?.querySelector('button[aria-label="Close details"]') as HTMLButtonElement | null;
    btn?.focus();
  }, [cardNode]);

  const baseDiagram = renderOverride ?? revealDiagram;
  const storyVisibleNodeIds = useMemo(() => {
    if (mode !== "demo" || !storyOpen) return null;
    if (storyRevealIds.size === 0 && storyFocusIds.size === 0) return null;
    const ids = new Set<string>();
    storyRevealIds.forEach((id) => ids.add(id));
    storyFocusIds.forEach((id) => ids.add(id));
    if (hazardNodeId) ids.add(hazardNodeId);
    if (topEventNodeId) ids.add(topEventNodeId);
    return ids;
  }, [mode, storyOpen, storyRevealIds, storyFocusIds, hazardNodeId, topEventNodeId]);
  const renderDiagram = useMemo(() => {
    let diagramWithChains = baseDiagram;
    if (expandedChainRoots.size !== 0 && expandedChainRoots.size !== chainNodesByRoot.size) {
      const allowedRoots = expandedChainRoots;
      let changed = false;
      const allowedNodeIds = new Set<string>();
      baseDiagram.nodes.forEach((node) => {
        const root = nodeToRoot.get(node.id);
        if (!root || allowedRoots.has(root)) {
          allowedNodeIds.add(node.id);
        } else {
          changed = true;
        }
      });
      if (changed) {
        diagramWithChains = {
          ...baseDiagram,
          nodes: baseDiagram.nodes.filter((n) => allowedNodeIds.has(n.id)),
          edges: baseDiagram.edges.filter(
            (e) => allowedNodeIds.has(e.source) && allowedNodeIds.has(e.target)
          ),
        };
      }
    }
    if (storyVisibleNodeIds && storyVisibleNodeIds.size > 0) {
      const allowedByStory = new Set<string>();
      diagramWithChains.nodes.forEach((node) => {
        if (storyVisibleNodeIds.has(node.id)) {
          allowedByStory.add(node.id);
        }
      });
      if (allowedByStory.size > 0 && allowedByStory.size < diagramWithChains.nodes.length) {
        diagramWithChains = {
          ...diagramWithChains,
          nodes: diagramWithChains.nodes.filter((n) => allowedByStory.has(n.id)),
          edges: diagramWithChains.edges.filter(
            (e) => allowedByStory.has(e.source) && allowedByStory.has(e.target)
          ),
        };
      }
    }
    return diagramWithChains;
  }, [baseDiagram, expandedChainRoots, chainNodesByRoot.size, nodeToRoot, storyVisibleNodeIds]);
  const activeFocusIds = useMemo(() => {
    const ids = new Set<string>();
    manualFocusIds.forEach((id) => ids.add(id));
    storyFocusIds.forEach((id) => ids.add(id));
    chainFocusIds.forEach((id) => ids.add(id));
    return ids;
  }, [manualFocusIds, storyFocusIds, chainFocusIds]);
  const shouldDim = storyOpen && activeFocusIds.size > 0;
  const strictConnections = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of diagram.edges) {
      if (!map.has(edge.source)) map.set(edge.source, new Set());
      map.get(edge.source)!.add(edge.target);
    }
    return map;
  }, [diagram]);
  const base = useMemo(() => computeSimpleLayout(renderDiagram), [renderDiagram]);
  const [nodes, setNodes, onNodesChange] = useNodesState(base.nodes);
  const selectedInspectorNode = useMemo(
    () => (selectedInspectorId ? nodes.find((n) => n.id === selectedInspectorId) ?? null : null),
    [nodes, selectedInspectorId]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(base.edges);
  const rf = useReactFlow();

  const waitForNextFrame = useCallback(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
    []
  );

  const beginExportSnapshot = useCallback(async () => {
    if (exportingSnapshotRef.current) return;
    exportingSnapshotRef.current = true;
    setExportingSnapshot(true);
    await waitForNextFrame();
  }, [waitForNextFrame]);

  const endExportSnapshot = useCallback(() => {
    if (!exportingSnapshotRef.current) return;
    exportingSnapshotRef.current = false;
    setExportingSnapshot(false);
  }, []);

  useEffect(() => {
    if (!selectedInspectorId) return;
    const exists = nodes.some((n) => n.id === selectedInspectorId);
    if (!exists) {
      setSelectedInspectorId(null);
      setInspectorOpen(false);
    }
  }, [nodes, selectedInspectorId]);

  const handleInspectorChange = useCallback(
    (nodeId: string, change: BuilderInspectorChange) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const prevData = ensureBuilderData(n.data as BowtieNodeData);
          let nextData: BowtieNodeData = prevData;
          if (typeof change.label === "string") {
            nextData = {
              ...nextData,
              label: change.label,
              displayLabel: change.label,
            };
          }
          if (change.builder) {
            nextData = mergeBuilderPatch(nextData, change.builder);
          }
          return { ...n, data: nextData };
        })
      );
    },
    [setNodes]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const nodeIndex = new Map(rf.getNodes().map((n) => [n.id, n]));
      const sourceNode = nodeIndex.get(connection.source);
      const targetNode = nodeIndex.get(connection.target);
      if (!sourceNode || !targetNode) return;
      const sourceType = (sourceNode.data as BowtieNodeData)?.bowtieType;
      const targetType = (targetNode.data as BowtieNodeData)?.bowtieType;
      if (!sourceType || !targetType) return;

      // Validate connection using new validation logic
      const validation = validateConnection(
        sourceType,
        targetType,
        connection.source,
        connection.target
      );

      if (!validation.valid) {
        // Show error toast with specific message
        setToastMessage(validation.errorMessage || "Invalid connection.");
        return;
      }

      // Additional strict connection check (for existing diagram structure)
      const strictTargets = strictConnections.get(connection.source);
      if (strictTargets && !strictTargets.has(connection.target)) {
        setToastMessage(
          "This connection is not allowed in the current diagram structure."
        );
        return;
      }

      // Connection is valid - add the edge
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            style: { stroke: "var(--edge)" },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [rf, setEdges, strictConnections]
  );

  const applyBuilderLayout = useCallback(
    (laneOverride?: ThreatLaneOrder) => {
      const baseDiagram = renderOverride ?? revealDiagram;
      const laid = computeSimpleLayout(baseDiagram);

      // Re-apply the designed layout to known nodes while preserving any
      // user-added Builder nodes/edges so Reset Layout can be triggered
      // frequently without "losing" work.
      setNodes((currentNodes) => {
        const laidById = new Map(laid.nodes.map((n) => [n.id, n]));
        const hydrated = laid.nodes.map((n) => ({
          ...n,
          data: { ...(n.data as BowtieNodeData), highlighted: false, dimmed: false },
        }));
        const extraNodes = currentNodes.filter((n) => !laidById.has(n.id));
        return [...hydrated, ...extraNodes];
      });

      const laneEdges = buildThreatLaneEdges(
        laneOverride ?? threatLanes,
        laid.nodes as RFNode<BowtieNodeData>[],
        strictConnections
      );

      setEdges((currentEdges) => {
        const laidWithLanes = replaceThreatLaneEdges(laid.edges as RFEdge[], laneEdges);
        const laidIds = new Set(laidWithLanes.map((e) => e.id));
        const extraEdges = currentEdges.filter((e) => !laidIds.has(e.id));
        return [...laidWithLanes, ...extraEdges];
      });
    },
    [renderOverride, revealDiagram, setNodes, setEdges, threatLanes, strictConnections]
  );


  // Fit view on initial mount
  // Builder palette DnD helpers
  const onPaletteDragStart = (e: React.DragEvent, t: BowtieNodeType) => {
    try {
      e.dataTransfer.setData("application/bowtie-node-type", t);
      e.dataTransfer.setData("text/plain", t);
      e.dataTransfer.effectAllowed = "copy";

      // Pre-calculate slots if dragging a prevention barrier
      if (t === "preventionBarrier") {
        const slots = calculatePreventionSlots(threatLanes, nodes);
        setDropSlots(slots);
      } else {
        setDropSlots([]);
      }

      // Visual drag preview so users immediately recognize what they're dragging
      if (typeof document !== "undefined") {
        const preview = document.createElement("div");
        preview.className = (styles as Record<string, string>).dragPreview || ""; // fallback if CSS module changes
        let bg = "#fff";
        const fg = "#111827";
        let label = "";
        switch (t) {
          case "hazard": bg = "#fff7ed"; label = "Hazard"; break;
          case "topEvent": bg = "#e0f2fe"; label = "Top Event"; break;
          case "threat": bg = "#eef2ff"; label = "Threat"; break;
          case "preventionBarrier": bg = "#f8fafc"; label = "Barrier"; break;
          case "mitigationBarrier": bg = "#f8fafc"; label = "Barrier"; break;
          case "consequence": bg = "#fee2e2"; label = "Consequence"; break;
          default: label = t;
        }
        preview.textContent = label;
        preview.style.background = bg;
        preview.style.color = fg;
        preview.style.position = "fixed";
        preview.style.top = "-9999px";
        preview.style.left = "-9999px";
        document.body.appendChild(preview);
        try {
          e.dataTransfer.setDragImage(preview, Math.ceil(preview.offsetWidth / 2), Math.ceil(preview.offsetHeight / 2));
        } catch {
          // Ignore drag image errors
        }
        const cleanup = () => {
          try {
            preview.remove();
            // Clear slots on drag end
            setDropSlots([]);
            setActiveSlot(null);
          } catch {
            // Ignore cleanup errors
          }
        };
        (e.currentTarget as HTMLElement).addEventListener("dragend", cleanup, { once: true });
      }
    } catch {
      // Ignore drag start errors
    }
  };

  const getSnapXForType = (t: BowtieNodeType, initialX: number) => {
    // Magnetic snap to existing column centers for this type (median X)
    const same = rf
      .getNodes()
      .filter((n) => (n.data as BowtieNodeData)?.bowtieType === t);
    if (!same.length) return initialX;
    const xs = same.map((n) => n.position.x).sort((a, b) => a - b);
    return xs[Math.floor(xs.length / 2)] ?? initialX;
  };

  const onCanvasDragOver = (e: React.DragEvent) => {
    if (mode !== "builder") return;
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "copy";

      // If we have active slots, find the nearest one
      if (dropSlots.length > 0) {
        const client = { x: e.clientX, y: e.clientY };
        const pos = rf.screenToFlowPosition(client, { snapToGrid: false });
        const nearest = findNearestSlot(dropSlots, pos.x, pos.y);
        setActiveSlot(nearest);
      }
    } catch {
      // Ignore dataTransfer errors
    }
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    if (mode !== "builder") return;
    e.preventDefault();
    const tRaw =
      e.dataTransfer.getData("application/bowtie-node-type") ||
      e.dataTransfer.getData("text/plain");
    const t = (tRaw as BowtieNodeType) || undefined;
    if (!t) return;
    const client = { x: e.clientX, y: e.clientY };
    const pos = rf.screenToFlowPosition(client, { snapToGrid: false });
    const snappedX = getSnapXForType(t, pos.x);

    // Prevent duplicate Hazard or Top Event
    if (t === "hazard" || t === "topEvent") {
      const existing = rf.getNodes().find((n) => n.type === t);
      if (existing) {
        // Move existing node instead of creating new one
        setNodes((nds) =>
          nds.map((n) =>
            n.id === existing.id ? { ...n, position: { x: snappedX, y: pos.y } } : n
          )
        );
        return;
      }
    }

    // Default labels for quick scaffolding
    const defaultLabel: Record<BowtieNodeType, string> = {
      threat: "New threat",
      escalationFactor: "New escalation factor",
      preventionBarrier: "New prevention barrier",
      escalationBarrier: "New escalation barrier",
      hazard: "Hazard",
      topEvent: "Top event",
      mitigationBarrier: "New mitigation barrier",
      consequence: "New consequence",
    };

    const id = `${t}-${Math.random().toString(36).slice(2, 9)}`;
    const role =
      t === "preventionBarrier"
        ? "prevention"
        : t === "mitigationBarrier"
          ? "mitigation"
          : t === "escalationBarrier"
            ? "escalation"
            : undefined;

    const nodeData = ensureBuilderData({
      label: defaultLabel[t],
      bowtieType: t,
      role,
      displayLabel: defaultLabel[t],
    } as BowtieNodeData);

    const newNode: RFNode<BowtieNodeData> = {
      id,
      type: t,
      data: nodeData,
      position: { x: snappedX, y: pos.y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    setNodes((nds) => nds.concat(newNode));
    setSelectedInspectorId(id);
    setInspectorOpen(true);

    let appliedLaneLayoutForPrevention = false;

    if (t === "preventionBarrier") {
      const candidateTypes: BowtieNodeType[] = ["threat", "preventionBarrier", "topEvent"];
      const existingNodes = rf.getNodes() as RFNode<BowtieNodeData>[];
      const rowNodes = existingNodes.filter((node) => {
        const nodeDataForType = node.data as BowtieNodeData | undefined;
        const nodeType = nodeDataForType?.bowtieType;
        if (!nodeType || !candidateTypes.includes(nodeType)) return false;
        // Increased threshold for better magnetic feel
        return Math.abs(node.position.y - pos.y) <= 120;
      });

      if (activeSlot) {
        // Use the active slot for precise insertion
        const updatedLanes = moveBarrierToThreat(
          threatLanes,
          id as BarrierId,
          activeSlot.threatId,
          activeSlot.insertIndex
        );
        setThreatLanes(updatedLanes);

        // Snap node to slot position
        setNodes((nds) => nds.map(n => n.id === id ? { ...n, position: { x: activeSlot.x, y: activeSlot.y } } : n));

        applyBuilderLayout(updatedLanes);
        appliedLaneLayoutForPrevention = true;
      } else if (rowNodes.length > 0) {
        const withNew = rowNodes.concat({
          ...newNode,
          position: { x: snappedX, y: pos.y },
        });
        withNew.sort((a, b) => a.position.x - b.position.x);

        const threatNodes = withNew.filter((node) => {
          const data = node.data as BowtieNodeData | undefined;
          return data?.bowtieType === "threat";
        });

        let nearestThreatNode: RFNode<BowtieNodeData> | undefined;
        let minDist = Number.POSITIVE_INFINITY;
        for (const node of threatNodes) {
          const dist = Math.abs(node.position.x - snappedX);
          if (dist < minDist) {
            nearestThreatNode = node;
            minDist = dist;
          }
        }

        if (!nearestThreatNode) {
          setToastMessage(
            "Could not determine a Threat lane for this barrier. Try dropping closer to a Threat.",
          );
        } else {
          const threatId = nearestThreatNode.id as ThreatId;
          const existingLaneIds = threatLanes.lanes[threatId] ?? [];
          const laneBarrierSet = new Set(existingLaneIds);

          const laneNodesOnRow = withNew.filter((node) => {
            if (node.id === id) return true;
            const data = node.data as BowtieNodeData | undefined;
            return data?.bowtieType === "preventionBarrier" && laneBarrierSet.has(node.id);
          });

          laneNodesOnRow.sort((a, b) => a.position.x - b.position.x);
          const insertionIndex = laneNodesOnRow.findIndex((n) => n.id === id);
          const safeIndex = insertionIndex < 0 ? existingLaneIds.length : insertionIndex;

          const updatedLanes = moveBarrierToThreat(
            threatLanes,
            id as BarrierId,
            threatId,
            safeIndex,
          );
          setThreatLanes(updatedLanes);
          applyBuilderLayout(updatedLanes);
          appliedLaneLayoutForPrevention = true;
        }
      } else {
        setToastMessage(
          "Could not find nearby nodes to attach this barrier. It was added without connections.",
        );
      }

      // Clear slots after drop
      setDropSlots([]);
      setActiveSlot(null);
    } else if (t === "mitigationBarrier") {
      const candidateTypes: BowtieNodeType[] = ["topEvent", "mitigationBarrier", "consequence"];
      const rowThreshold = 80; // px distance for considering nodes on the same row
      const existingNodes = rf.getNodes() as RFNode<BowtieNodeData>[];
      const rowNodes = existingNodes.filter((node) => {
        const nodeDataForType = node.data as BowtieNodeData | undefined;
        const nodeType = nodeDataForType?.bowtieType;
        if (!nodeType || !candidateTypes.includes(nodeType)) return false;
        return Math.abs(node.position.y - pos.y) <= rowThreshold;
      });

      if (rowNodes.length > 0) {
        const withNew = rowNodes.concat({
          ...newNode,
          position: { x: snappedX, y: pos.y },
        });
        withNew.sort((a, b) => a.position.x - b.position.x);
        const index = withNew.findIndex((n) => n.id === id);
        const leftNeighbor = index > 0 ? withNew[index - 1] : undefined;
        const rightNeighbor =
          index >= 0 && index < withNew.length - 1 ? withNew[index + 1] : undefined;

        setEdges((eds) => {
          let nextEdges = eds;

          const maybeAddEdge = (
            sourceNode?: RFNode<BowtieNodeData>,
            targetNode?: RFNode<BowtieNodeData>,
          ) => {
            if (!sourceNode || !targetNode) return;
            const sourceData = sourceNode.data as BowtieNodeData | undefined;
            const targetData = targetNode.data as BowtieNodeData | undefined;
            const sourceType = sourceData?.bowtieType;
            const targetType = targetData?.bowtieType;
            if (!sourceType || !targetType) return;

            const { valid } = validateConnection(
              sourceType,
              targetType,
              sourceNode.id,
              targetNode.id,
            );
            if (!valid) return;

            const strictTargets = strictConnections.get(sourceNode.id);
            if (strictTargets && !strictTargets.has(targetNode.id)) {
              return;
            }

            const alreadyExists = nextEdges.some(
              (edge) => edge.source === sourceNode.id && edge.target === targetNode.id,
            );
            if (alreadyExists) return;

            const edgeId = `${sourceNode.id}-${targetNode.id}`;

            nextEdges = addEdge(
              {
                id: edgeId,
                source: sourceNode.id,
                target: targetNode.id,
                style: { stroke: "var(--edge)" },
                markerEnd: { type: MarkerType.ArrowClosed },
              },
              nextEdges,
            );
          };

          maybeAddEdge(leftNeighbor, newNode);
          maybeAddEdge(newNode, rightNeighbor);

          return nextEdges;
        });
      }
    }

    if (!appliedLaneLayoutForPrevention) {
      // Keep layout tidy after structural changes without dropping
      // user-added Builder nodes.
      applyBuilderLayout();
    }
  };
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        rf.fitView({ padding: 0.2 });
      } catch {
        // Ignore fitView errors
      }
    }, 60);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Compute layout + highlight states (demo mode)
  useEffect(() => {
    if (mode === "builder") return; // don't override manual positions in Builder mode
    let alive = true;
    (async () => {
      try {
        const laid = await computeElkLayout(renderDiagram);
        if (!alive) return;
        const hydrated = laid.nodes.map((n) => ({
          ...n,
          data: {
            ...(n.data as BowtieNodeData),
            highlighted: !exportingSnapshot && activeFocusIds.has(n.id),
            dimmed: !exportingSnapshot && shouldDim && !activeFocusIds.has(n.id),
          },
        }));
        setNodes(hydrated);
        setEdges(laid.edges);
      } catch (e) {
        console.warn("ELK layout failed, using simple layout", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [renderDiagram, mode, activeFocusIds, shouldDim, exportingSnapshot, setEdges, setNodes]);

  const filenameSlug = useCallback(() => {
    const titleNode =
      renderDiagram.nodes.find((n) => n.type === "topEvent") ??
      renderDiagram.nodes.find((n) => n.type === "hazard");
    return (
      (titleNode?.label ?? "bowtie")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 60) || "bowtie"
    );
  }, [renderDiagram.nodes]);

  const rasterizeToJpeg = useCallback(async (dataUrl: string) => {
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(img, 0, 0);
    const jpegUrl = canvas.toDataURL("image/jpeg", 0.92);
    return { dataUrl: jpegUrl, width: img.width, height: img.height };
  }, []);

  const buildPdfBlob = useCallback((jpegBase64: string, pxWidth: number, pxHeight: number) => {
    const jpegBytes = Uint8Array.from(atob(jpegBase64), (c) => c.charCodeAt(0));
    const widthPt = pxToPt(pxWidth);
    const heightPt = pxToPt(pxHeight);
    const encoder = new TextEncoder();
    const chunks: BlobPart[] = [];
    let offset = 0;
    const offsets: number[] = [];

    const write = (str: string) => {
      const bytes = encoder.encode(str);
      chunks.push(bytes);
      offset += bytes.length;
    };

    const writeObject = (str: string) => {
      offsets.push(offset);
      write(str);
    };

    const writeBinaryObject = (header: string, bytes: Uint8Array, footer: string) => {
      offsets.push(offset);
      write(header);
      chunks.push(bytes.slice());
      offset += bytes.length;
      write(footer);
    };

    write("%PDF-1.4\n");
    writeObject("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
    writeObject("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n");
    writeObject(
      `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(
        2
      )}] /Resources << /XObject << /I1 4 0 R >> >> /Contents 5 0 R >> endobj\n`
    );
    writeBinaryObject(
      `4 0 obj << /Type /XObject /Subtype /Image /Width ${pxWidth} /Height ${pxHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >> stream\n`,
      jpegBytes,
      "\nendstream\nendobj\n"
    );
    const contentStream = `q\n${widthPt.toFixed(2)} 0 0 ${heightPt.toFixed(2)} 0 0 cm\n/I1 Do\nQ\n`;
    const contentBytes = encoder.encode(contentStream);
    offsets.push(offset);
    write(`5 0 obj << /Length ${contentBytes.length} >> stream\n`);
    chunks.push(contentBytes.slice());
    offset += contentBytes.length;
    write("endstream\nendobj\n");

    const xrefOffset = offset;
    write("xref\n0 6\n0000000000 65535 f \n");
    offsets.forEach((pos) => {
      write(`${pos.toString().padStart(10, "0")} 00000 n \n`);
    });
    write(`trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Blob(chunks, { type: "application/pdf" });
  }, []);

  const exportPng = useCallback(async () => {
    const el = wrapperRef.current;
    if (!el) return;
    await beginExportSnapshot();
    try {
      const dataUrl = await toPng(el, { backgroundColor: "#ffffff" });
      const slug = filenameSlug();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${slug}-${Date.now()}.png`;
      a.click();
    } catch (error) {
      console.error("PNG export failed", error);
      setToastMessage("Unable to generate PNG export.");
    } finally {
      endExportSnapshot();
    }
  }, [beginExportSnapshot, endExportSnapshot, filenameSlug]);

  const exportPdf = useCallback(async () => {
    const el = wrapperRef.current;
    if (!el) return;
    await beginExportSnapshot();
    try {
      const dataUrl = await toPng(el, { backgroundColor: "#ffffff" });
      const { dataUrl: jpegUrl, width, height } = await rasterizeToJpeg(dataUrl);
      const base64 = jpegUrl.split(",")[1];
      if (!base64) throw new Error("Invalid image data");
      const pdfBlob = buildPdfBlob(base64, width, height);
      const slug = filenameSlug();
      const link = document.createElement("a");
      const objectUrl = URL.createObjectURL(pdfBlob);
      link.href = objectUrl;
      link.download = `${slug}-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("PDF export failed", error);
      setToastMessage("Unable to generate PDF export.");
    } finally {
      endExportSnapshot();
    }
  }, [beginExportSnapshot, buildPdfBlob, endExportSnapshot, filenameSlug, rasterizeToJpeg]);

  useEffect(() => {
    if (mode === "builder") {
      applyBuilderLayout();
    }
  }, [mode, applyBuilderLayout, renderDiagram]);

  // Global events from the left Sidebar (export, toggle builder, clear diagram)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onExport = () => { void exportPng(); };
    const onExportPdf = () => { void exportPdf(); };
    const onToggle = () => {
      setMode((m) => {
        if (m === "demo" && !hasSeenBuilderConfirmRef.current) {
          // First time switching to builder mode - show confirmation
          setShowBuilderConfirm(true);
          return m; // Don't change mode yet
        }
        return m === "builder" ? "demo" : "builder";
      });
    };
    const onClear = () => {
      if (mode !== "builder") return;
      try {
        clearToBaseDiagram();
      } catch (error) {
        console.error("Failed to clear diagram", error);
      }
    };
    const onExportJSON = () => {
      try {
        const currentDiagram = renderOverride || diagram;
        exportDiagramToJSON(currentDiagram);
        setToastMessage("Diagram exported successfully!");
      } catch (error) {
        console.error("Export JSON error:", error);
        setToastMessage("Failed to export diagram. Please try again.");
      }
    };
    const onImportJSON = () => {
      try {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;
          try {
            const imported = await importDiagramFromJSON(file);
            setRenderOverride(imported);
            setToastMessage("Diagram imported successfully!");
          } catch (error) {
            console.error("Import JSON error:", error);
            setToastMessage(error instanceof Error ? error.message : "Failed to import diagram.");
          }
        };
        input.click();
      } catch (error) {
        console.error("Import JSON error:", error);
        setToastMessage("Failed to import diagram. Please try again.");
      }
    };
    window.addEventListener("bowtie:exportPng", onExport as EventListener);
    window.addEventListener("bowtie:exportPdf", onExportPdf as EventListener);
    window.addEventListener("bowtie:toggleBuilder", onToggle as EventListener);
    window.addEventListener("bowtie:clearDiagram", onClear as EventListener);
    window.addEventListener("bowtie:exportJSON", onExportJSON as EventListener);
    window.addEventListener("bowtie:importJSON", onImportJSON as EventListener);
    return () => {
      window.removeEventListener("bowtie:exportPng", onExport as EventListener);
      window.removeEventListener("bowtie:exportPdf", onExportPdf as EventListener);
      window.removeEventListener("bowtie:toggleBuilder", onToggle as EventListener);
      window.removeEventListener("bowtie:clearDiagram", onClear as EventListener);
      window.removeEventListener("bowtie:exportJSON", onExportJSON as EventListener);
      window.removeEventListener("bowtie:importJSON", onImportJSON as EventListener);
    };
  }, [setMode, mode, diagram, renderOverride, exportPdf, exportPng]);

  // Handle builder mode confirmation dialog
  const handleBuilderConfirm = useCallback((clearDiagram: boolean) => {
    hasSeenBuilderConfirmRef.current = true;
    setShowBuilderConfirm(false);

    if (clearDiagram) {
      try {
        clearToBaseDiagram();
      } catch (error) {
        console.error("Failed to clear diagram", error);
      }
    }

    // Switch to builder mode
    setMode("builder");

    // Auto-trigger layout reset after confirmation dialog closes
    // This ensures nodes are properly positioned regardless of which button was clicked
    setTimeout(() => {
      applyBuilderLayout();
    }, 50); // Small delay to ensure mode switch completes first
  }, [diagram, applyBuilderLayout]);


  // Broadcast mode changes so Sidebar can reflect state
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bowtie:modeChanged", { detail: { mode } }));
      }
    } catch {
      // Ignore mode change broadcast errors
    }
  }, [mode]);

  const typeById = useMemo(() => {
    const m = new Map<string, BowtieNodeType>();
    for (const n of renderDiagram.nodes) m.set(n.id, n.type);
    return m;
  }, [renderDiagram]);

  const isFailureEdge = useCallback((e: { source: string; target: string }) => {
    const st = typeById.get(e.source);
    const tt = typeById.get(e.target);
    return st === "topEvent" || st === "mitigationBarrier" || tt === "topEvent" || tt === "consequence";
  }, [typeById]);

  // Focus dimming + failed-path highlight + barrier group expansion on card open
  useEffect(() => {
    if (storyOpen) return;
    if (exportingSnapshot) {
      setEdges((eds) => eds.map((e) => ({ ...e, style: { ...(e.style || {}), opacity: 1 } })));
      setNodes((nds) => nds.map((n) => ({ ...n, style: { ...(n.style || {}), opacity: 1, transform: undefined } })));
      return;
    }
    const baseStrokeFor = (e: { id: string; source: string; target: string }) => {
      const failureEdge = failedMode && isFailureEdge(e);
      return failureEdge ? "var(--edge-fail)" : "var(--edge)";
    };
    // Determine if we should enlarge a barrier group based on the opened card
    const cardData = cardNode?.data as BowtieNodeData | undefined;
    const enlargeRole =
      cardNode && (cardNode.type === "preventionBarrier" || cardNode.type === "mitigationBarrier")
        ? (cardData?.role as "prevention" | "mitigation" | undefined)
        : undefined;

    if (!cardNode) {
      setEdges((eds) => eds.map((e) => ({ ...e, style: { ...(e.style || {}), stroke: baseStrokeFor(e), opacity: 1 } })));
      setNodes((nds) => nds.map((n) => ({ ...n, style: { ...(n.style || {}), opacity: 1, transform: undefined } })));
      return;
    }
    const selId = cardNode.id;
    const adjacent = new Set<string>();
    rf.getEdges().forEach((e) => {
      if (e.source === selId || e.target === selId) adjacent.add(e.id);
    });
    const neighborNodeIds = new Set<string>([selId]);
    rf.getEdges().forEach((e) => {
      if (e.source === selId) neighborNodeIds.add(e.target);
      if (e.target === selId) neighborNodeIds.add(e.source);
    });

    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: {
          ...(e.style || {}),
          stroke: baseStrokeFor(e),
          opacity: adjacent.has(e.id) ? 1 : 0.3,
        },
      }))
    );
    setNodes((nds) =>
      nds.map((n) => {
        const isBarrier = n.type === "preventionBarrier" || n.type === "mitigationBarrier";
        const nRole = (n.data as BowtieNodeData | undefined)?.role as "prevention" | "mitigation" | undefined;
        const expand = !!enlargeRole && isBarrier && nRole === enlargeRole;
        return {
          ...n,
          style: { ...(n.style || {}), opacity: neighborNodeIds.has(n.id) ? 1 : 0.3, transform: expand ? "scale(1.08)" : undefined },
        };
      })
    );
  }, [cardNode, failedMode, storyOpen, exportingSnapshot, isFailureEdge, rf, setEdges, setNodes]);


  // Clear any render overrides when leaving Builder mode
  useEffect(() => {
    if (mode !== "builder") setRenderOverride(null);
  }, [mode]);

  // Auto-show/hide story based on mode
  useEffect(() => {
    setStoryOpen(mode === "demo");
  }, [mode]);

  useEffect(() => {
    if (mode !== "demo") {
      storyStepLockRef.current = null;
      return;
    }

    if (!storyOpen) {
      const previousStep = storyStepLockRef.current;
      storyStepLockRef.current = null;
      if (previousStep !== null && previousStep !== step) {
        setStep(previousStep);
      }
      return;
    }

    if (storyStepLockRef.current === null) {
      storyStepLockRef.current = step;
    }

    if (step !== STORY_LOCK_STEP) {
      setStep(STORY_LOCK_STEP);
    }
  }, [storyOpen, step, mode]);


  useEffect(() => {
    if (storyOpen && mode === "demo") {
      const stepData = highwayDrivingNarrative[storyIdx - 1];
      const focusSet = new Set(stepData?.focusIds ?? []);
      const revealSet = new Set(stepData?.revealIds ?? stepData?.focusIds ?? []);
      const autoRevealCandidates = new Set([...focusSet, ...revealSet]);
      const narrativeChainRoots = new Set<string>();
      let hasAnyBarriers = false;

      autoRevealCandidates.forEach((id) => {
        const nodeType = nodeById.get(id)?.type;
        if (nodeType === "threat" || nodeType === "consequence") return;

        // If we get here, this is a barrier node (prevention/mitigation/escalation)
        hasAnyBarriers = true;

        const rootId = nodeToRoot.get(id);
        if (!rootId) return;
        narrativeChainRoots.add(rootId);
        revealSet.add(rootId);
        chainNodesByRoot.get(rootId)?.forEach((nodeId) => revealSet.add(nodeId));
      });

      setStoryFocusIds(focusSet);
      setStoryRevealIds(revealSet);
      setManualFocusIds(new Set());
      setManualRevealIds(new Set());

      // Defensive: if no barriers in focusIds/revealIds, FORCE empty expandedChainRoots
      // This prevents race conditions or state persistence from incorrectly expanding chains
      if (!hasAnyBarriers) {
        setExpandedChainRoots(new Set());
      } else {
        setExpandedChainRoots(new Set(narrativeChainRoots));
      }

      setHighlightedChainRootId(null);
    } else {
      setStoryFocusIds(new Set());
      setStoryRevealIds(new Set());
      setExpandedChainRoots(new Set());
      setHighlightedChainRootId(null);
    }
  }, [storyIdx, storyOpen, mode, chainNodesByRoot, nodeToRoot, nodeById]);

  // Auto-zoom and dimming for story mode
  useEffect(() => {
    if (mode !== "demo") return; // Changed from "story" to "demo" to match existing code

    const step = highwayDrivingNarrative[storyIdx - 1]; // Changed from stepIndex to storyIdx
    if (!step) return;

    // Apply focus/dimming
    setNodes((nds) =>
      nds.map((n) => {
        const isFocused = !step.focusIds || step.focusIds.includes(n.id);
        return {
          ...n,
          data: {
            ...n.data,
            dimmed: !isFocused,
            highlighted: isFocused,
          },
        };
      })
    );

    // Auto-zoom logic - delayed to ensure nodes are measured
    if (autoZoomEnabled && step.focusIds && step.focusIds.length > 0) {
      // Small delay to ensure React Flow has measured the nodes after reveal/highlight
      const timer = setTimeout(() => {
        const currentNodes = rf.getNodes();
        const container = document.querySelector('.react-flow');
        if (container) {
          const { width, height } = container.getBoundingClientRect();
          const target = calculateFocusViewport(step.focusIds, currentNodes, { width, height });

          if (target) {
            rf.setCenter(target.x, target.y, { zoom: target.zoom, duration: 2000 });
          }
        }
      }, 100); // 100ms delay to allow DOM updates and measurements

      return () => clearTimeout(timer);
    }
  }, [mode, storyIdx, setNodes, rf, autoZoomEnabled]);

  // GSAP Animation System - Animate wrapper elements on story step changes
  useEffect(() => {
    if (!storyOpen || mode !== "demo" || activeFocusIds.size === 0) return;
    if (typeof window === "undefined") return; // SSR safety

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // Small delay to ensure DOM is ready after React Flow layout
    const timer = setTimeout(() => {
      activeFocusIds.forEach((nodeId) => {
        // Find the React Flow node element
        const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
        if (!nodeElement) return;

        // Find the animation wrapper inside the node
        const wrapper = nodeElement.querySelector('[data-narrative-role]') as HTMLElement;
        if (!wrapper) return;

        const role = wrapper.getAttribute('data-narrative-role');
        if (!role) return;

        // If reduced motion, apply static emphasis only
        if (prefersReducedMotion) {
          wrapper.style.opacity = "1";
          wrapper.style.fontWeight = "700";
          return;
        }

        // Map narrative roles to GSAP animations (SAFE properties only)
        switch (role) {
          case "threat":
            // Fade-in-left with amber glow
            gsap.fromTo(
              wrapper,
              { opacity: 0, x: -30 },
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "power2.out",
                clearProps: "transform" // Clear transform after animation
              }
            );
            break;

          case "prevention":
            // Fade-in-left + soft pulse (green glow)
            gsap.fromTo(
              wrapper,
              { opacity: 0, x: -30 },
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "power2.out",
                clearProps: "transform",
                onComplete: () => {
                  // Add soft pulse after fade-in
                  gsap.to(wrapper, {
                    scale: 1.03,
                    duration: 0.8,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                    clearProps: "transform"
                  });
                }
              }
            );
            break;

          case "topEvent":
            // Zoom-in with red-orange glow
            gsap.fromTo(
              wrapper,
              { opacity: 0, scale: 0.8 },
              {
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: "back.out(1.7)",
                clearProps: "transform"
              }
            );
            break;

          case "mitigation":
            // Fade-in-right + soft pulse (blue glow)
            gsap.fromTo(
              wrapper,
              { opacity: 0, x: 30 },
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "power2.out",
                clearProps: "transform",
                onComplete: () => {
                  gsap.to(wrapper, {
                    scale: 1.03,
                    duration: 0.8,
                    yoyo: true,
                    repeat: 1,
                    ease: "sine.inOut",
                    clearProps: "transform"
                  });
                }
              }
            );
            break;

          case "consequence":
            // Fade-in-right with purple glow
            gsap.fromTo(
              wrapper,
              { opacity: 0, x: 30 },
              {
                opacity: 1,
                x: 0,
                duration: 0.4,
                ease: "power2.out",
                clearProps: "transform"
              }
            );
            break;

          case "hazard":
            // Simple fade-in (1x only)
            gsap.fromTo(
              wrapper,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
              }
            );
            break;

          case "escalation":
            // Slide-up
            gsap.fromTo(
              wrapper,
              { opacity: 0, y: 20 },
              {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                clearProps: "transform"
              }
            );
            break;

          default:
            // Default fade-in
            gsap.fromTo(
              wrapper,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
              }
            );
        }
      });
    }, 100); // Small delay for DOM readiness

    return () => {
      clearTimeout(timer);
      // Kill all GSAP animations on cleanup
      gsap.killTweensOf('[data-narrative-role]');
    };
  }, [storyIdx, storyOpen, mode, activeFocusIds]);

  // Global events: toggle Filters / Actions / Export panels from Sidebar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onToggleFilters = () => setFiltersOpen((o) => !o);
    const onToggleActions = () => setActionsOpen((o) => !o);
    const onToggleExport = () => setExportOpen((o) => !o);
    window.addEventListener("bowtie:toggleFilters", onToggleFilters as EventListener);
    window.addEventListener("bowtie:toggleActions", onToggleActions as EventListener);
    window.addEventListener("bowtie:toggleExport", onToggleExport as EventListener);
    return () => {
      window.removeEventListener("bowtie:toggleFilters", onToggleFilters as EventListener);
      window.removeEventListener("bowtie:toggleActions", onToggleActions as EventListener);
      window.removeEventListener("bowtie:toggleExport", onToggleExport as EventListener);
    };
  }, []);

  // Listen for filter changes from sidebar
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onFilterChanged = (e: Event) => {
      try {
        const detail = (e as CustomEvent).detail as { roles: string[] } | undefined;
        const roles = detail?.roles || [];

        // Update selectedRoles state to match sidebar
        setSelectedRoles(new Set(roles));
      } catch (err) {
        console.error("Filter change error:", err);
      }
    };

    window.addEventListener("bowtie:filterChanged", onFilterChanged as EventListener);
    return () => window.removeEventListener("bowtie:filterChanged", onFilterChanged as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const toggle = () => setHelpOpen((open) => !open);
    window.addEventListener("bowtie:toggleHelp", toggle as EventListener);
    return () => window.removeEventListener("bowtie:toggleHelp", toggle as EventListener);
  }, []);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mode !== "builder") return; // Only auto-save in builder mode

    const currentDiagram = renderOverride || diagram;
    const timer = setTimeout(() => {
      try {
        saveDiagramToLocalStorage(currentDiagram, "bowtie.diagram.autosave");
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [diagram, renderOverride, mode]);

  // Auto-load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = loadDiagramFromLocalStorage("bowtie.diagram.autosave");
      if (saved) {
        // Ask user if they want to restore
        const shouldRestore = window.confirm(
          "A previously saved diagram was found. Would you like to restore it?"
        );
        if (shouldRestore) {
          setRenderOverride(saved);
          setToastMessage("Diagram restored from auto-save!");
        }
      }
    } catch (error) {
      console.error("Auto-load error:", error);
    }
  }, []); // Only run on mount

  useEffect(() => {
    if (!selectedRoles || selectedRoles.size === 0) return;
    let hasLeft = false;
    let hasRight = false;
    for (const node of diagram.nodes) {
      const chips = node.metadata?.chips;
      if (!chips) continue;
      const matchesRole = chips.some((chip) => selectedRoles.has(chip));
      if (!matchesRole) continue;
      if (LEFT_WING_TYPES.has(node.type)) hasLeft = true;
      if (RIGHT_WING_TYPES.has(node.type)) hasRight = true;
      if (hasLeft && hasRight) break;
    }
    if (hasLeft) setLeftExpanded(true);
    if (hasRight) setRightExpanded(true);
    const reveal = new Set<string>();
    const focus = new Set<string>();
    for (const node of diagram.nodes) {
      const chips = node.metadata?.chips;
      if (!chips) continue;
      const matches = chips.some((chip) => selectedRoles.has(chip));
      if (!matches) continue;
      reveal.add(node.id);
      focus.add(node.id);
    }
    if (reveal.size) setManualRevealIds(reveal);
    if (focus.size) setManualFocusIds(focus);
  }, [selectedRoles, diagram.nodes]);

  // Keyboard navigation for narrative steps (1..N)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (!(mode === "demo" && storyOpen)) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, [contenteditable="true"], [role="dialog"], [aria-expanded="true"]')) return;
      const total = highwayDrivingNarrative.length;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setStoryIdx((i) => (i < total ? i + 1 : i));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStoryIdx((i) => (i > 1 ? i - 1 : i));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, storyOpen]);

  const inspectorActive = mode === "builder" && inspectorOpen;

  return (
    <div ref={wrapperRef} className={styles.graphRoot}>

      <main className={styles.canvasRegion} aria-label="Canvas region">
        <div className={styles.canvasToolbarContainer}>



        </div>




        <div className={styles.srOnly} aria-live="polite">
          Showing {renderDiagram.nodes.length} nodes
        </div>

        <Legend />
        <div className={styles.canvasHost} ref={canvasRef} onDrop={onCanvasDrop} onDragOver={onCanvasDragOver} data-testid="canvas-host" data-mode={mode}>
          <ErrorBoundary fallback={<div role="alert">Unable to render diagram.</div>}>



            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onPaneClick={() => {
                if (cardNode) handleCloseCard();
                if (mode === "builder") {
                  setInspectorOpen(false);
                  setSelectedInspectorId(null);
                }
              }}

              onNodeClick={(_, n) => {
                const dn = diagram.nodes.find((x) => x.id === n.id) || null;
                const bt = dn?.type;
                if (bt === "topEvent") {
                  const totalChainRoots = chainNodesByRoot.size;
                  const allChainsExpanded =
                    totalChainRoots === 0 || expandedChainRoots.size >= totalChainRoots;
                  const atFinalStep = step === MAX_STEP;
                  const isFullyExpanded = leftExpanded && rightExpanded && atFinalStep && allChainsExpanded;
                  if (isFullyExpanded) {
                    setExpandedChainRoots(new Set());
                    setHighlightedChainRootId(null);
                    setManualRevealIds(new Set());
                    setManualFocusIds(new Set());
                    setCardNode(null);
                    setStep(1 as StepIndex);
                    return;
                  }
                  setLeftExpanded(true);
                  setRightExpanded(true);
                  setStep(MAX_STEP);
                  if (totalChainRoots > 0) {
                    const allRoots = new Set<string>();
                    chainNodesByRoot.forEach((_, rootId) => allRoots.add(rootId));
                    setExpandedChainRoots(allRoots);
                  }
                  setHighlightedChainRootId(null);
                  const allIds = new Set(diagram.nodes.map((node) => node.id));
                  setManualFocusIds(allIds);
                  handleNodeClick(n, { skipReveal: true });
                  return;
                } else if (mode === "demo" && (bt === "threat" || bt === "consequence")) {
                  const toggled = toggleChainExpansion(n.id);
                  if (toggled !== "noop") {
                    handleNodeClick(n, { skipReveal: true });
                    return;
                  }
                }
                if (highlightedChainRootId && highlightedChainRootId !== n.id) {
                  setHighlightedChainRootId(null);
                }
                handleNodeClick(n);
              }}
              onNodeMouseEnter={(_, n) => {
                try {
                  const d = n.data as BowtieNodeData;
                  if (d && !preloadRef.current.has(n.id)) {
                    preloadRef.current.set(n.id, d);
                  }
                } catch {
                  // Ignore preload errors
                }
              }}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "var(--edge)" } }}
              fitView
            >

              <Background gap={24} />

              <MiniMap />
              <Controls>
                {mode === "demo" && ( // Changed from "story" to "demo"
                  <div className="react-flow__controls-button" title="Toggle Auto-Zoom">
                    <label style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                      <input
                        type="checkbox"
                        checked={autoZoomEnabled}
                        onChange={(e) => setAutoZoomEnabled(e.target.checked)}
                        style={{ margin: 0, width: "12px", height: "12px" }}
                      />
                    </label>
                  </div>
                )}
              </Controls>
              {mode === "builder" && dropSlots.length > 0 && (
                <DropSlotLayer slots={dropSlots} activeSlot={activeSlot} />
              )}
            </ReactFlow>

          </ErrorBoundary>
          <>
            {mode === "demo" && storyOpen && (
              <div className={styles.storyOverlay} role="dialog" aria-modal="false" aria-label="Demo narrative">
                <div className={styles.storyCard}>
                  <div className={styles.panelTitle}>{highwayDrivingNarrative[storyIdx - 1]?.title}</div>
                  <p
                    className={styles.storyBody}
                    dangerouslySetInnerHTML={{ __html: highwayDrivingNarrative[storyIdx - 1]?.body || "" }}
                  />
                  <div className={styles.storyControls}>
                    <div className={styles.storyControlsLeft}>
                      <button className={styles.bowtieButton} onClick={() => setStoryOpen(false)} type="button">
                        Hide
                      </button>
                    </div>
                    <div className={styles.storyControlsCenter}>
                      {storyIdx !== highwayDrivingNarrative.length && (
                        <span
                          className={`${styles.stepLabel} ${styles[`stepRole${getStepRole(storyIdx)}`] || ""}`}
                          aria-live="polite"
                        >
                          Step {storyIdx} of {highwayDrivingNarrative.length}
                        </span>
                      )}
                    </div>
                    <div className={styles.storyControlsRight}>
                      {storyIdx === highwayDrivingNarrative.length ? (
                        <button className={styles.bowtieButton} onClick={() => setStoryIdx(1)} type="button">
                          START
                        </button>
                      ) : (
                        <>
                          <button
                            className={styles.bowtieButton}
                            onClick={() => setStoryIdx((i) => (i > 1 ? i - 1 : i))}
                            disabled={storyIdx === 1}
                            type="button"
                          >
                            ◀ Prev
                          </button>
                          <button
                            className={styles.bowtieButton}
                            onClick={() => setStoryIdx((i) => (i < highwayDrivingNarrative.length ? i + 1 : i))}
                            disabled={storyIdx === highwayDrivingNarrative.length}
                            type="button"
                          >
                            Next ▶
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.floatingTopRight} style={{ top: storyOpen ? 80 : 12 }}>
              <button
                className={styles.bowtieButton}
                aria-controls="filters-panel"
                aria-expanded={filtersOpen}
                onClick={() => { setFiltersOpen((o) => !o); }}
                type="button"
                ref={filtersBtnRef}
              >
                Filters ▾
              </button>
              {filtersOpen && (
                <div id="filters-panel" className={styles.filtersFloatingPanel} aria-label="Filter by role">
                  <span className={styles.filterLabel}>Filter:</span>
                  {allRoles.map((role) => {
                    const pressed = selectedRoles.has(role);
                    return (
                      <button
                        key={role}
                        className={styles.bowtieChip}
                        aria-label={`Toggle role filter ${role}`}
                        aria-pressed={pressed}
                        data-pressed={pressed}
                        onClick={() => {
                          setSelectedRoles((prev) => {
                            const next = new Set(prev);
                            if (pressed) next.delete(role);
                            else next.add(role);
                            return next;
                          });
                        }}
                        type="button"
                      >
                        {role}
                      </button>
                    );
                  })}
                  <button
                    className={styles.bowtieButton}
                    onClick={() => setSelectedRoles(new Set())}
                    disabled={selectedRoles.size === 0}
                    type="button"
                  >
                    Clear
                  </button>
                </div>
              )}

              {actionsOpen && (
                <div id="actions-panel" className={styles.filtersFloatingPanel} role="dialog" aria-label="Actions">
                  <div className={styles.panelTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Actions</span>
                    <button className={styles.bowtieButton} aria-label="Close actions" type="button" onClick={() => setActionsOpen(false)}>×</button>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button className={styles.bowtieButton} type="button" onClick={() => { setLeftExpanded(true); setRightExpanded(true); }}>Expand All</button>
                    <button className={styles.bowtieButton} type="button" onClick={() => { setLeftExpanded(false); setRightExpanded(false); }}>Collapse All</button>
                    <button className={styles.bowtieButton} type="button" aria-pressed={failedMode} onClick={() => setFailedMode((v) => !v)}>
                      {failedMode ? 'Disable failure highlight' : 'Simulate failure'}
                    </button>
                    <button className={styles.bowtieButton} type="button" onClick={() => { try { rf.fitView({ padding: 0.2 }); } catch { /* Ignore fitView errors */ } }}>Fit All</button>
                    <button className={styles.bowtieButton} type="button" onClick={() => { void exportPng(); }}>Export PNG</button>
                  </div>
                </div>
              )}

              {exportOpen && (
                <div id="export-panel" className={styles.filtersFloatingPanel} role="dialog" aria-label="Export">
                  <div className={styles.panelTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Share / Export</span>
                    <button className={styles.bowtieButton} aria-label="Close export" type="button" onClick={() => setExportOpen(false)}>×</button>
                  </div>
                  <div style={{ display: 'grid', gap: 8 }}>
                    <button className={styles.bowtieButton} type="button" onClick={() => { void exportPng(); }}>Export PNG</button>
                  </div>
                </div>
              )}
              {mode === "builder" && (
                <>
                  <button
                    className={styles.bowtieButton}
                    aria-controls="builder-palette-panel"
                    aria-expanded={paletteOpen}
                    onClick={() => setPaletteOpen((o) => !o)}
                    type="button"
                    data-testid="builder-palette-toggle"
                    ref={paletteBtnRef}
                  >
                    Palette ▾
                  </button>
                  <button
                    className={`${styles.bowtieButton} ${styles.resetLayoutButton}`}
                    onClick={() => applyBuilderLayout()}
                    type="button"
                    title="Reset node positions to default layout"
                    aria-label="Reset layout"
                  >
                    ↻ Reset Layout
                  </button>
                  {paletteOpen && (
                    <div id="builder-palette-panel" className={styles.filtersFloatingPanel} role="dialog" aria-label="Builder palette" data-testid="builder-palette">
                      <div className={styles.panelTitle} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Add nodes</span>
                        <button className={styles.bowtieButton} aria-label="Close palette" type="button" onClick={() => setPaletteOpen(false)}>×</button>
                      </div>
                      <div className={styles.paletteGroup} role="group" aria-label="Add nodes">
                        <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "threat")}>Threat</button>
                        <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "preventionBarrier")}>Prevention Barrier</button>
                        <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "topEvent")}>Top Event</button>
                        <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "mitigationBarrier")}>Mitigation Barrier</button>
                        <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "consequence")}>Consequence</button>
                      </div>
                      <div className={styles.hint} aria-hidden="true">Drag a type into the canvas</div>
                    </div>
                  )}
                </>
              )}

            </div>
          </>

        </div>
      </main>
      <aside
        id="bowtie-inspector"
        className={`${styles.inspector} ${!inspectorActive ? styles.collapsed : ""}`}
        aria-label="Inspector"
        aria-hidden={!inspectorActive}
        data-testid="builder-inspector"
      >
        <BuilderInspector
          node={selectedInspectorNode}
          open={inspectorActive}
          onClose={() => {
            setSelectedInspectorId(null);
            setInspectorOpen(false);
          }}
          onChange={handleInspectorChange}
        />
      </aside>

      {cardNode && (
        <ErrorBoundary fallback={<div role="alert">Unable to render details.</div>}>


          <div
            ref={cardRef}
            className={styles.popOutCardWrapper}
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-title"
          >
            <div className={styles.popOutCard}>
              {(() => {
                const nodeData = cardNode.data as BowtieNodeData;
                const { label, metadata } = nodeData;
                return (
                  <>
                    <button
                      className={styles.closeButton}
                      onClick={handleCloseCard}
                      aria-label="Close details"
                      type="button"
                    >
                      ×
                    </button>

                    <h2 id="card-title" className={styles.popOutCard__title}>{label}</h2>

                    {metadata?.eli5 && (
                      <section className={styles.popOutCard__section} aria-labelledby="eli5-heading">
                        <h3 id="eli5-heading" className={styles.popOutCard__heading}>ELI5</h3>
                        <p className={styles.popOutCard__text}>{metadata.eli5}</p>
                      </section>
                    )}

                    {metadata?.chips?.length ? (
                      <section className={styles.popOutCard__section} aria-labelledby="owner-type-heading">
                        <h3 id="owner-type-heading" className={styles.popOutCard__heading}>Owner and type</h3>
                        <ul className={styles.popOutCard__chips}>
                          {metadata.chips.map((chip: string, i: number) => (
                            <li key={i} className={styles.popOutCard__chip}>{chip}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {metadata?.kpis?.length ? (
                      <section className={styles.popOutCard__section} aria-labelledby="kpis-heading">
                        <h3 id="kpis-heading" className={styles.popOutCard__heading}>KPIs</h3>
                        <ul className={styles.popOutCard__list}>
                          {metadata.kpis.map((kpi: string, i: number) => (
                            <li key={i} className={styles.popOutCard__listItem}>{kpi}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {metadata?.details?.length ? (
                      <section className={styles.popOutCard__section} aria-labelledby="details-heading">
                        <h3 id="details-heading" className={styles.popOutCard__heading}>How it works</h3>
                        <ul className={styles.popOutCard__list}>
                          {metadata.details.map((d: string, i: number) => (
                            <li key={i} className={styles.popOutCard__listItem}>{d}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {metadata?.failureModes?.length ? (
                      <section className={styles.popOutCard__section} aria-labelledby="failure-modes-heading">
                        <h3 id="failure-modes-heading" className={styles.popOutCard__heading}>Failure modes</h3>
                        <ul className={styles.popOutCard__list}>
                          {metadata.failureModes.map((fm: string, i: number) => (
                            <li key={i} className={styles.popOutCard__listItem}>{fm}</li>
                          ))}
                        </ul>
                      </section>
                    ) : null}

                    {metadata?.sopLink ? (
                      <section className={styles.popOutCard__section} aria-labelledby="sop-heading">
                        <h3 id="sop-heading" className={styles.popOutCard__heading}>Standard operating procedure</h3>
                        <p className={styles.popOutCard__text}>
                          <a href={metadata.sopLink} target="_blank" rel="noopener noreferrer">View SOP 																																																																																																																																																																																																																																																																									</a>
                        </p>
                      </section>
                    ) : null}
                  </>
                );
              })()}
            </div>
          </div>
        </ErrorBoundary>


      )}
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {cardNode ? `Details for ${(cardNode.data as BowtieNodeData).label} opened` : ""}
      </div>

      {helpOpen && <PreAttentiveHelp onClose={() => setHelpOpen(false)} />}

      <BuilderModeConfirmDialog
        open={showBuilderConfirm}
        onConfirm={handleBuilderConfirm}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="error"
          duration={5000}
          onClose={() => setToastMessage(null)}
          ariaLive="assertive"
        />
      )}

    </div>
  );
}


export function BowtieGraph({ diagram, initialMode = "demo" }: { diagram: BowtieDiagram; initialMode?: "demo" | "builder" }) {
  return (
    <ReactFlowProvider>
      <InnerGraph diagram={diagram} initialMode={initialMode} />
    </ReactFlowProvider>
  );
}
