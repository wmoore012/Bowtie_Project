import { useEffect, useMemo, useRef, useState } from "react";
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


import { computeStepDiagram, type StepIndex } from "../../domain/stepMode";
import { PREVENTION_GROUPS, MITIGATION_GROUPS } from "../../domain/scenarios/highway_driving.groups";
import styles from "./BowtieGraph.module.css";
import "../../styles/theme.css";
import { computeRoleFilteredDiagram, collectAvailableRoles } from "../../domain/filters";
import { ErrorBoundary } from "../common/ErrorBoundary";


const nodeTypes = {
  threat: ThreatNode,
  preventionBarrier: BarrierNode,
  mitigationBarrier: BarrierNode,
  hazard: HazardTagNode,
  topEvent: TopEventKnotNode,
  consequence: ConsequenceNode,
} as const;






















function InnerGraph({ diagram }: { diagram: BowtieDiagram }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  // Cache for hover preloading (optional micro-optimization)
  const preloadRef = useRef<Map<string, BowtieNodeData>>(new Map());

  const actionsBtnRef = useRef<HTMLButtonElement | null>(null);
  const filtersBtnRef = useRef<HTMLButtonElement | null>(null);


  // Default to expanded, full-step view
  const [leftExpanded, setLeftExpanded] = useState(true);
  const [rightExpanded, setRightExpanded] = useState(true);
  const [step, setStep] = useState<StepIndex>(10 as StepIndex);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const allRoles = useMemo(() => collectAvailableRoles(diagram), [diagram]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [failedMode, setFailedMode] = useState(false);
  const [showFailedHint, setShowFailedHint] = useState(false);
  const [mode, setMode] = useState<"guided" | "builder">("guided");
  // Collapsible UI panels (maximize canvas like Miro/Excalidraw)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  // Pop-out card state and handlers (global overlay, no side panel)

  const [cardNode, setCardNode] = useState<RFNode<BowtieNodeData> | null>(null);
  const [lastFocusedNodeId, setLastFocusedNodeId] = useState<string | null>(null);

  const handleNodeClick = (node: RFNode<BowtieNodeData>) => {
    setLastFocusedNodeId(node.id);
    setCardNode(node);
  };

  const handleCloseCard = () => {
    setCardNode(null);
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (actionsOpen) setActionsOpen(false);
        if (filtersOpen) setFiltersOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [actionsOpen, filtersOpen]);

  // Focus management for Actions menu
  useEffect(() => {
    if (actionsOpen) {
      setTimeout(() => {
        const first = wrapperRef.current?.querySelector('#actions-menu [role="menuitem"]') as HTMLButtonElement | null;
        first?.focus();
      }, 0);
    } else {
      actionsBtnRef.current?.focus();
    }
  }, [actionsOpen]);

  // Focus management for Filters panel
  useEffect(() => {
    if (filtersOpen) {
      setTimeout(() => {
        const first = wrapperRef.current?.querySelector('#filters-panel button') as HTMLButtonElement | null;
        first?.focus();
      }, 0);
    } else {
      filtersBtnRef.current?.focus();
    }
  }, [filtersOpen]);

  // Close menus on outside click and restore focus to trigger
  useEffect(() => {
    if (!actionsOpen && !filtersOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // Actions
      if (actionsOpen) {
        const panel = wrapperRef.current?.querySelector('#actions-menu') as HTMLElement | null;
        const inPanel = !!(panel && panel.contains(target));
        const inBtn = !!(actionsBtnRef.current && actionsBtnRef.current.contains(target as Node));
        if (!inPanel && !inBtn) {
          setActionsOpen(false);
          setTimeout(() => actionsBtnRef.current?.focus(), 0);
        }
      }
      // Filters
      if (filtersOpen) {
        const panel = wrapperRef.current?.querySelector('#filters-panel') as HTMLElement | null;
        const inPanel = !!(panel && panel.contains(target));
        const inBtn = !!(filtersBtnRef.current && filtersBtnRef.current.contains(target as Node));
        if (!inPanel && !inBtn) {
          setFiltersOpen(false);
          setTimeout(() => filtersBtnRef.current?.focus(), 0);
        }
      }
    };
    window.addEventListener('mousedown', onDocMouseDown);
    return () => window.removeEventListener('mousedown', onDocMouseDown);
  }, [actionsOpen, filtersOpen]);


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
      if (actionsOpen || filtersOpen || cardNode) return;
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
  }, [actionsOpen, filtersOpen, cardNode]);



  const visibleDiagram = useMemo(() => {
    return computeStepDiagram(diagram, {
      step,
      leftExpanded,
      rightExpanded,

      preventionGroups: PREVENTION_GROUPS,
      mitigationGroups: MITIGATION_GROUPS,
    });
  }, [diagram, step, leftExpanded, rightExpanded]);

  const filteredDiagram = useMemo(
    () => computeRoleFilteredDiagram(visibleDiagram, selectedRoles),
    [visibleDiagram, selectedRoles]
  );

  // When opening the card, move focus to its close button for accessibility
  useEffect(() => {
    if (!cardNode) return;
    const btn = cardRef.current?.querySelector('button[aria-label="Close details"]') as HTMLButtonElement | null;
    btn?.focus();
  }, [cardNode]);

  const base = useMemo(() => computeSimpleLayout(filteredDiagram), [filteredDiagram]);
  const [nodes, setNodes, onNodesChange] = useNodesState(base.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(base.edges);
  const rf = useReactFlow();


  // Fit view on initial mount
  // Builder palette DnD helpers
  const onPaletteDragStart = (e: React.DragEvent, t: BowtieNodeType) => {
    try {
      e.dataTransfer.setData("application/bowtie-node-type", t);
      e.dataTransfer.setData("text/plain", t);
      e.dataTransfer.effectAllowed = "copy";
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
      preventionBarrier: "New prevention barrier",
      hazard: "Hazard",
      topEvent: "Top event",
      mitigationBarrier: "New mitigation barrier",
      consequence: "New consequence",
    };

    const id = `${t}-${Math.random().toString(36).slice(2, 9)}`;
    const role = t === "preventionBarrier" ? "prevention" : t === "mitigationBarrier" ? "mitigation" : undefined;
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

  // Onboarding hint for failed scenario toggle
  useEffect(() => {
    const key = "bowtie.hintFailedSeen";
    const ls = typeof window !== "undefined" ? (window as any).localStorage : undefined;
    if (!ls || typeof ls.getItem !== "function" || typeof ls.setItem !== "function") return;
    if (!ls.getItem(key)) {
      setShowFailedHint(true);
      const t = setTimeout(() => {
        setShowFailedHint(false);
        try { ls.setItem(key, "1"); } catch {}
      }, 5000);
      return () => clearTimeout(t);
    }
  }, []);



  // Compute ELK auto-layout after initial render and when wing visibility changes
  useEffect(() => {
    if (mode === "builder") return; // don't override manual positions in Builder mode
    let alive = true;
    (async () => {
      try {
        const laid = await computeElkLayout(filteredDiagram);
        if (!alive) return;
        setNodes(laid.nodes);
        setEdges(laid.edges);
      } catch (e) {
        console.warn("ELK layout failed, using simple layout", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [filteredDiagram, mode]);

  // Focus dimming + failed-path highlight
  useEffect(() => {
    const baseStrokeFor = (e: any) => {
      const failureEdge = failedMode && isFailureEdge(e);
      return failureEdge ? "var(--edge-fail)" : "var(--edge)";
    };
    if (!cardNode) {
      setEdges((eds) => eds.map((e) => ({ ...e, style: { ...(e.style || {}), stroke: baseStrokeFor(e), opacity: 1 } })));
      setNodes((nds) => nds.map((n) => ({ ...n, style: { ...(n.style || {}), opacity: 1 } })));
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
      nds.map((n) => ({
        ...n,
        style: { ...(n.style || {}), opacity: neighborNodeIds.has(n.id) ? 1 : 0.3 },
      }))
    );
  }, [cardNode, failedMode]);

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

  function isFailureEdge(e: { source: string; target: string }) {
    const st = typeById.get(e.source);
    const tt = typeById.get(e.target);
    return st === "topEvent" || st === "mitigationBarrier" || tt === "topEvent" || tt === "consequence";
  }


  const typeById = useMemo(() => {
    const m = new Map<string, BowtieNodeType>();
    for (const n of diagram.nodes) m.set(n.id, n.type);
    return m;
  }, [diagram]);

  // Fit helpers
  function fit(types: BowtieNodeType[] | "all") {
    let nodesToFit = rf.getNodes();
    if (types !== "all") {
      const set = new Set(types);
      nodesToFit = nodesToFit.filter((n) => {
        const t = typeById.get(n.id);
        return t ? set.has(t) : false;
      });
    }
    if (nodesToFit.length) rf.fitView({ nodes: nodesToFit, padding: 0.2 });
  }


  return (
    <div ref={wrapperRef} className={styles.appShell}>
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>Bowtie</div>
        <div className={styles.topBarRight}>
          <span className={styles.modeLabel}>Mode:</span>
          <div className={styles.modeToggle} role="group" aria-label="Mode toggle">
            <button className={styles.bowtieButton} type="button" aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>Guided</button>
            <button className={styles.bowtieButton} type="button" aria-pressed={mode === "builder"} onClick={() => setMode("builder")}>Builder</button>
          </div>
          <button
            className={styles.bowtieButton}
            type="button"
            aria-pressed={sidebarOpen}
            aria-controls="bowtie-sidebar"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {mode === "builder" ? "Palette" : "Outline"}
          </button>
          <button
            className={styles.bowtieButton}
            type="button"
            aria-pressed={inspectorOpen}
            aria-controls="bowtie-inspector"
            onClick={() => setInspectorOpen((v) => !v)}
          >
            Details
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <aside id="bowtie-sidebar" className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ""}`} aria-label={mode === "builder" ? "Builder palette" : "Outline"} aria-hidden={!sidebarOpen}>
          {mode === "builder" ? (
            <div className={styles.sidebarSection} data-testid="builder-palette">
              <div className={styles.sidebarHeader}>Palette</div>
              <div className={styles.paletteGroup} role="group" aria-label="Add nodes">
                <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "threat")}>Threat</button>
                <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "preventionBarrier")}>Prevention Barrier</button>
                <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "hazard")}>Hazard</button>
                <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "topEvent")}>Top Event</button>
                <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "mitigationBarrier")}>Mitigation Barrier</button>
                <button className={styles.bowtieButton} draggable onDragStart={(e) => onPaletteDragStart(e, "consequence")}>Consequence</button>
              </div>
              <div className={styles.sidebarHint} aria-hidden="true">Drag a type into the canvas</div>
            </div>
          ) : (
            <>
              <div className={styles.sidebarHeader}>Outline</div>
              <div className={styles.sidebarSection}>Coming soon</div>
            </>
          )}
        </aside>
        <main className={styles.canvasRegion} aria-label="Canvas region">
          <div className={styles.canvasToolbarContainer}>
            <div className={styles.toolbar}>
          <div
            className={`${styles.stepControls} ${mode === "builder" ? styles.stepControlsHidden : ""}`}
            aria-hidden={mode === "builder"}
          >
            <button
              className={styles.bowtieButton}
              disabled={step === 0}
              onClick={() => setStep((s) => (s > 0 ? ((s - 1) as StepIndex) : s))}
              aria-label="Previous step"
              type="button"
            >
              ◀
            </button>
            <span className={styles.stepLabel}>Step {step}/10</span>
            <span className={styles.srOnly} aria-live="polite">Step changed to {step} of 10</span>

            <button
              className={styles.bowtieButton}
              disabled={step === 10}
              onClick={() => setStep((s) => (s < 10 ? ((s + 1) as StepIndex) : s))}
              aria-label="Next step"
              type="button"
            >
              ▶
            </button>
          </div>
          <div className={styles.toolbarRight}>
            <button
              className={styles.bowtieButton}
              aria-haspopup="menu"
              aria-controls="actions-menu"
              aria-expanded={actionsOpen}
              onClick={() => setActionsOpen((o) => !o)}
              type="button"
              ref={actionsBtnRef}
            >
              Actions ▾
            </button>
            <button
              className={styles.bowtieButton}
              aria-controls="filters-panel"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((o) => !o)}
              type="button"
              ref={filtersBtnRef}
            >
              Filters ▾
            </button>
          </div>
        </div>

        {actionsOpen && (
          <>
            <div id="actions-menu" className={styles.menuPanel} role="menu" aria-label="Actions menu">
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => { setLeftExpanded(true); setRightExpanded(true); setStep(10 as StepIndex); }}
              type="button"
            >
              Expand All
            </button>
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => { setLeftExpanded(false); setRightExpanded(false); setStep(0 as StepIndex); }}
              type="button"
            >
              Collapse All
            </button>
            <button
              className={styles.menuItem}
              role="menuitem"
              aria-pressed={failedMode}
              onClick={() => setFailedMode((v) => !v)}
              type="button"
            >
              {failedMode ? "Simulate failure: On" : "Simulate failure: Off"}
            </button>

            <button className={styles.menuItem} role="menuitem" onClick={() => fit("all")} type="button">
              Fit All
            </button>
            <button className={styles.menuItem} role="menuitem" onClick={exportPng} type="button">
              Export PNG
            </button>
          </div>

          </>
        )}


        {showFailedHint && (
          <div className={styles.hint} role="status" aria-live="polite">
            Tip: open Actions ▾ and toggle “Simulate failure” to preview a disaster scenario.
          </div>

        )}

        {filtersOpen && (
          <div id="filters-panel" className={styles.filtersPanel} aria-label="Filter by role">
            <span className={styles.filterLabel}>Filter:</span>
            {allRoles.map((role) => {
              const pressed = selectedRoles.has(role);
              return (
                <button
                  key={role}
                  className={styles.bowtieChip}
                  aria-label={`Toggle role filter ${role}`}
                  aria-pressed={pressed}
                  data-pressed={pressed ? "true" : "false"}
                  onClick={() => {
                    setSelectedRoles((prev) => {
                      const next = new Set(prev);
                      if (next.has(role)) next.delete(role); else next.add(role);
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
              className={styles.bowtieChip}
              onClick={() => setSelectedRoles(new Set())}
              disabled={selectedRoles.size === 0}
              aria-label="Clear all role filters"
              type="button"
            >
              Clear
            </button>
          </div>
        )}
        <div className={styles.srOnly} aria-live="polite">
          Showing {filteredDiagram.nodes.length} nodes
        </div>
        <Legend />
          </div>
          <div className={styles.canvasHost} ref={canvasRef} onDrop={onCanvasDrop} onDragOver={onCanvasDragOver} data-testid="canvas-host">
      <ErrorBoundary fallback={<div role="alert">Unable to render diagram.</div>}>



      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
          </div>
        </main>
        <aside id="bowtie-inspector" className={`${styles.inspector} ${!inspectorOpen ? styles.collapsed : ""}`} aria-label="Inspector" aria-hidden={!inspectorOpen}>
          <div className={styles.inspectorEmpty}>Details appear here in Builder mode.</div>
        </aside>
      </div>

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

    </div>
  );
}


export function BowtieGraph({ diagram }: { diagram: BowtieDiagram }) {
  return (
    <ReactFlowProvider>
      <InnerGraph diagram={diagram} />
    </ReactFlowProvider>
  );
}
