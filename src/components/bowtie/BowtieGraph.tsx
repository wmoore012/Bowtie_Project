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
import type { Node as RFNode } from "@xyflow/react";

import type { BowtieDiagram, BowtieNodeType, BowtieNodeData } from "../../domain/bowtie.types";
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


import { computeStepDiagram, type StepIndex } from "../../domain/stepMode";
import { PREVENTION_GROUPS, MITIGATION_GROUPS } from "../../domain/scenarios/highway_driving.groups";
import styles from "./BowtieGraph.module.css";
import "../../styles/theme.css";
import { computeRoleFilteredDiagram, collectAvailableRoles } from "../../domain/filters";
import { ErrorBoundary } from "../common/ErrorBoundary";

import { highwayDrivingNarrative } from "../../domain/scenarios/highway_driving_narrative";

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

const TYPE_CONNECTION_RULES: Record<BowtieNodeType, BowtieNodeType[]> = {
  threat: ["preventionBarrier"],
  escalationFactor: ["escalationBarrier"],
  preventionBarrier: ["topEvent"],
  escalationBarrier: ["topEvent"],
  hazard: ["topEvent"],
  topEvent: ["mitigationBarrier"],
  mitigationBarrier: ["consequence"],
  consequence: [],
};






















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
  useEffect(() => { setMode(initialMode); }, [initialMode]);
  useEffect(() => { setPaletteOpen(mode === "builder"); }, [mode]);
  useEffect(() => {
    if (mode === "builder") {
      setStep(10 as StepIndex);
    } else {
      setStep(lastDemoStepRef.current ?? (1 as StepIndex));
    }
  }, [mode]);
  useEffect(() => {
    if (mode === "demo") {
      lastDemoStepRef.current = step;
    }
  }, [mode, step]);

  // Optional render override (e.g., Clear Diagram in Builder)
  const [renderOverride, setRenderOverride] = useState<BowtieDiagram | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Demo story overlay
  const [storyOpen, setStoryOpen] = useState(false);
  // Narrative step index is 1-based; initialize to last step so UI shows "Step N of N" before starting
  const [storyIdx, setStoryIdx] = useState<number>(highwayDrivingNarrative.length);
  const [manualRevealIds, setManualRevealIds] = useState<Set<string>>(new Set());
  const [manualFocusIds, setManualFocusIds] = useState<Set<string>>(new Set());
  const [storyRevealIds, setStoryRevealIds] = useState<Set<string>>(new Set());
  const [storyFocusIds, setStoryFocusIds] = useState<Set<string>>(new Set());
  const lastDemoStepRef = useRef<StepIndex>(1 as StepIndex);


  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  // Persist sidebar open/close across sessions


  const [cardNode, setCardNode] = useState<RFNode<BowtieNodeData> | null>(null);
  const [lastFocusedNodeId, setLastFocusedNodeId] = useState<string | null>(null);

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
  const barrierTypes = useMemo(
    () => new Set<BowtieNodeType>(["preventionBarrier", "mitigationBarrier", "escalationBarrier"]),
    []
  );

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

  const handleNodeClick = (node: RFNode<BowtieNodeData>) => {
    setLastFocusedNodeId(node.id);
    setCardNode(node);
    if (mode !== "builder") {
      const reveal = collectRevealForNode(node.id);
      const revealArr = Array.from(reveal);
      setManualRevealIds(new Set(revealArr));
      setManualFocusIds(new Set<string>([node.id, ...revealArr]));
    }
  };

  const handleCloseCard = () => {
    setCardNode(null);
    setManualRevealIds(new Set());
    setManualFocusIds(new Set());
    if (lastFocusedNodeId) {
      const elem = document.querySelector(`[data-nodeid="${lastFocusedNodeId}"], [data-id="${lastFocusedNodeId}"]`) as HTMLElement | null;
      elem?.focus();
    }
  };

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
  }, [cardNode]);
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
      if (handled) e.stopPropagation();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen, actionsOpen, exportOpen, paletteOpen, helpOpen]);


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
      const el = cardRef.current as unknown as { contains?: (t: any) => boolean } | null;
      let outside = true;
      try {
        outside = !!(el && el.contains ? !el.contains(target as any) : true);
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
      const el = cardRef.current as unknown as { contains?: (t: any) => boolean } | null;
      const t = e.touches[0];
      let outside = true;
      try {
        outside = !!(el && el.contains ? !el.contains(target as any) : true);
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
  }, [cardNode]);

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
        setStep((s) => (s < 10 ? ((s + 1) as StepIndex) : s));
      } else if (e.key === "Home") {
        e.preventDefault();
        setStep(0 as StepIndex);
      } else if (e.key === "End") {
        e.preventDefault();
        setStep(10 as StepIndex);
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
    return union;
  }, [manualRevealIds, storyRevealIds, mode]);

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

  const renderDiagram = renderOverride ?? revealDiagram;
  const activeFocusIds = useMemo(() => {
    const ids = new Set<string>();
    manualFocusIds.forEach((id) => ids.add(id));
    storyFocusIds.forEach((id) => ids.add(id));
    return ids;
  }, [manualFocusIds, storyFocusIds]);
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
  const [edges, setEdges, onEdgesChange] = useEdgesState(base.edges);
  const rf = useReactFlow();

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
      const allowedTypes = TYPE_CONNECTION_RULES[sourceType];
      if (allowedTypes && !allowedTypes.includes(targetType)) {
        return;
      }
      const strictTargets = strictConnections.get(connection.source);
      if (strictTargets && !strictTargets.has(connection.target)) {
        return;
      }
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

  const applyBuilderLayout = useCallback(() => {
    const baseDiagram = renderOverride ?? diagram;
    const laid = computeSimpleLayout(baseDiagram);
    const hydrated = laid.nodes.map((n) => ({
      ...n,
      data: { ...(n.data as BowtieNodeData), highlighted: false, dimmed: false },
    }));
    setNodes(hydrated);
    setEdges(laid.edges);
  }, [diagram, renderOverride, setEdges, setNodes]);


  // Fit view on initial mount
  // Builder palette DnD helpers
  const onPaletteDragStart = (e: React.DragEvent, t: BowtieNodeType) => {
    try {
      e.dataTransfer.setData("application/bowtie-node-type", t);
      e.dataTransfer.setData("text/plain", t);
      e.dataTransfer.effectAllowed = "copy";

      // Visual drag preview so users immediately recognize what they're dragging
      if (typeof document !== "undefined") {
        const preview = document.createElement("div");
        preview.className = (styles as any).dragPreview || ""; // fallback if CSS module changes
        let bg = "#fff";
        let fg = "#111827";
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
        } catch {}
        const cleanup = () => { try { preview.remove(); } catch {} };
        (e.currentTarget as HTMLElement).addEventListener("dragend", cleanup, { once: true } as any);
      }
    } catch {}
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
    try { e.dataTransfer.dropEffect = "copy"; } catch {}
  };

  const onCanvasDrop = (e: React.DragEvent) => {
    if (mode !== "builder") return;
    e.preventDefault();
    const tRaw = e.dataTransfer.getData("application/bowtie-node-type") || e.dataTransfer.getData("text/plain");
    const t = (tRaw as BowtieNodeType) || undefined;
    if (!t) return;
    const client = { x: e.clientX, y: e.clientY };
    const pos = rf.screenToFlowPosition(client, { snapToGrid: false });

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
    const snappedX = getSnapXForType(t, pos.x);

    setNodes((nds) => nds.concat({
      id,
      type: t,
      data: { label: defaultLabel[t], bowtieType: t, role } as BowtieNodeData,
      position: { x: snappedX, y: pos.y },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    } as RFNode<BowtieNodeData>));
  };
  useEffect(() => {
    const t = setTimeout(() => {
      try { rf.fitView({ padding: 0.2 }); } catch {}
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
            highlighted: activeFocusIds.has(n.id),
            dimmed: shouldDim && !activeFocusIds.has(n.id),
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
  }, [renderDiagram, mode, activeFocusIds, shouldDim]);

  useEffect(() => {
    if (mode === "builder") {
      applyBuilderLayout();
    }
  }, [mode, applyBuilderLayout]);

  // Global events from the left Sidebar (export, toggle builder, clear diagram)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onExport = () => { void exportPng(); };
    const onToggle = () => setMode((m) => (m === "builder" ? "demo" : "builder"));
    const onClear = () => {
      if (mode !== "builder") return;
      try {
        const hazard = diagram.nodes.find((n) => n.type === "hazard");
        const topEvent = diagram.nodes.find((n) => n.type === "topEvent");
        const hazardLabel = hazard?.label || "Hazard";
        const topLabel = topEvent?.label || "Thermal runaway";
        const cleared: BowtieDiagram = {
          id: "cleared",
          title: diagram.title,
          createdAt: diagram.createdAt,
          updatedAt: new Date().toISOString(),
          nodes: [
            { id: "hazard", type: "hazard", label: hazardLabel },
            { id: "topEvent", type: "topEvent", label: topLabel },
          ],
          edges: [
            { id: "h_to_top", source: "hazard", target: "topEvent" },
          ],
        };
        setRenderOverride(cleared);
        setInspectorOpen(false);
        setCardNode(null);
      } catch {}
    };
    window.addEventListener("bowtie:exportPng", onExport as any);
    window.addEventListener("bowtie:toggleBuilder", onToggle as any);
    window.addEventListener("bowtie:clearDiagram", onClear as any);
    return () => {
      window.removeEventListener("bowtie:exportPng", onExport as any);
      window.removeEventListener("bowtie:toggleBuilder", onToggle as any);
      window.removeEventListener("bowtie:clearDiagram", onClear as any);
    };
  }, [setMode, mode, diagram]);


  // Broadcast mode changes so Sidebar can reflect state
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("bowtie:modeChanged", { detail: { mode } }));
      }
    } catch {}
  }, [mode]);




  // Focus dimming + failed-path highlight + barrier group expansion on card open
  useEffect(() => {
    if (storyOpen) return;
    const baseStrokeFor = (e: any) => {
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
  }, [cardNode, failedMode, storyOpen]);

  async function exportPng() {
    const el = wrapperRef.current;
    if (!el) return;
    const dataUrl = await toPng(el, { backgroundColor: "#ffffff" });
    const titleNode = diagram.nodes.find((n) => n.type === "topEvent") ?? diagram.nodes.find((n) => n.type === "hazard");
    const slug = (titleNode?.label ?? "bowtie")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 60);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${slug || "bowtie"}-${Date.now()}.png`;
    a.click();
  }

  // Clear any render overrides when leaving Builder mode
  useEffect(() => {
    if (mode !== "builder") setRenderOverride(null);
  }, [mode]);

  // Auto-show/hide story based on mode
  useEffect(() => {
    setStoryOpen(mode === "demo");
  }, [mode]);
  useEffect(() => {
    if (storyOpen && mode === "demo") {
      const stepData = highwayDrivingNarrative[storyIdx - 1];
      setStoryFocusIds(new Set(stepData?.focusIds ?? []));
      const revealList = stepData?.revealIds ?? stepData?.focusIds ?? [];
      setStoryRevealIds(new Set(revealList));
      setManualFocusIds(new Set());
      setManualRevealIds(new Set());
    } else {
      setStoryFocusIds(new Set());
      setStoryRevealIds(new Set());
    }
  }, [storyIdx, storyOpen, mode]);

  function isFailureEdge(e: { source: string; target: string }) {

  // Global events: toggle Filters / Actions / Export panels from Sidebar
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onToggleFilters = () => setFiltersOpen((o) => !o);
    const onToggleActions = () => setActionsOpen((o) => !o);
    const onToggleExport = () => setExportOpen((o) => !o);
    window.addEventListener("bowtie:toggleFilters", onToggleFilters as any);
    window.addEventListener("bowtie:toggleActions", onToggleActions as any);
    window.addEventListener("bowtie:toggleExport", onToggleExport as any);
    return () => {
      window.removeEventListener("bowtie:toggleFilters", onToggleFilters as any);
      window.removeEventListener("bowtie:toggleActions", onToggleActions as any);
      window.removeEventListener("bowtie:toggleExport", onToggleExport as any);
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

    window.addEventListener("bowtie:filterChanged", onFilterChanged as any);
    return () => window.removeEventListener("bowtie:filterChanged", onFilterChanged as any);
  }, []);

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

    const st = typeById.get(e.source);
    const tt = typeById.get(e.target);
    return st === "topEvent" || st === "mitigationBarrier" || tt === "topEvent" || tt === "consequence";
  }


  const typeById = useMemo(() => {
    const m = new Map<string, BowtieNodeType>();
    for (const n of renderDiagram.nodes) m.set(n.id, n.type);
    return m;
  }, [renderDiagram]);





  return (
    <div ref={wrapperRef} className={styles.graphRoot}>

        <main className={styles.canvasRegion} aria-label="Canvas region">
            <div className={styles.canvasToolbarContainer}>



        </div>




        <div className={styles.srOnly} aria-live="polite">
          Showing {filteredDiagram.nodes.length} nodes
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
        onPaneClick={() => { if (cardNode) handleCloseCard(); }}

        onNodeClick={(_, n) => {
          const dn = diagram.nodes.find((x) => x.id === n.id) || null;
          const bt = dn?.type;
          if (bt === "hazard") setLeftExpanded((v) => !v);
          if (bt === "topEvent") setRightExpanded((v) => !v);
          handleNodeClick(n);
        }}
        onNodeMouseEnter={(_, n) => {
          try {
            const d = n.data as BowtieNodeData;
            if (d && !preloadRef.current.has(n.id)) {
              preloadRef.current.set(n.id, d);
            }
          } catch {}
        }}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "var(--edge)" } }}
        fitView
      >

        <Background gap={24} />

        <MiniMap />
        <Controls />
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
                  <button className={styles.bowtieButton} onClick={() => setStoryOpen(false)} type="button">Hide</button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    {storyIdx === highwayDrivingNarrative.length ? (
                      <button className={styles.bowtieButton} onClick={() => setStoryIdx(1)} type="button">START</button>
                    ) : (
                      <>
                        <button className={styles.bowtieButton} onClick={() => setStoryIdx((i) => (i > 1 ? i - 1 : i))} disabled={storyIdx === 1} type="button">◀ Prev</button>
                        <span
                          className={`${styles.stepLabel} ${styles[`stepRole${getStepRole(storyIdx)}`] || ""}`}
                          aria-live="polite"
                        >
                          Step {storyIdx} of {highwayDrivingNarrative.length}
                        </span>
                        <button className={styles.bowtieButton} onClick={() => setStoryIdx((i) => (i < highwayDrivingNarrative.length ? i + 1 : i))} disabled={storyIdx === highwayDrivingNarrative.length} type="button">Next ▶</button>
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
                  <button className={styles.bowtieButton} type="button" onClick={() => { try { rf.fitView({ padding: 0.2 }); } catch {} }}>Fit All</button>
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
        <aside id="bowtie-inspector" className={`${styles.inspector} ${!inspectorOpen ? styles.collapsed : ""}`} aria-label="Inspector" aria-hidden={!inspectorOpen}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>Details</div>
            <button className={styles.panelClose} type="button" aria-label="Close details" onClick={() => setInspectorOpen(false)}>x</button>
          </div>

          <div className={styles.inspectorEmpty}>Details appear here in Builder mode.</div>
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
