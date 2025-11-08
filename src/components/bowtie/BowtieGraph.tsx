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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { BowtieDiagram, BowtieNodeType } from "../../domain/bowtie.types";
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
  // Pop-out card state and handlers (global overlay, no side panel)
  const [cardNode, setCardNode] = useState<any>(null);
  const [lastFocusedNodeId, setLastFocusedNodeId] = useState<string | null>(null);

  const handleNodeClick = (node: any) => {
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

  const base = useMemo(() => computeSimpleLayout(filteredDiagram), [filteredDiagram]);
  const [nodes, setNodes, onNodesChange] = useNodesState(base.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(base.edges);
  const rf = useReactFlow();


  // Fit view on initial mount
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
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(key)) {
      setShowFailedHint(true);
      const t = setTimeout(() => {
        setShowFailedHint(false);
        localStorage.setItem(key, "1");
      }, 5000);
      return () => clearTimeout(t);
    }
  }, []);



  // Compute ELK auto-layout after initial render and when wing visibility changes
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredDiagram]);

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
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `bowtie-${Date.now()}.png`;
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
    <div ref={wrapperRef} className={styles.wrapper}>
      {/* Toolbar + Legend (stacked) */}
      <div className={styles.hud}>
        <div className={styles.toolbar}>
          <div className={styles.stepControls}>
            <button
              className={styles.button}
              disabled={step === 0}
              onClick={() => setStep((s) => (s > 0 ? ((s - 1) as StepIndex) : s))}
              aria-label="Previous step"
            >
              ◀
            </button>
            <span className={styles.stepLabel}>Step {step}/10</span>
            <button
              className={styles.button}
              disabled={step === 10}
              onClick={() => setStep((s) => (s < 10 ? ((s + 1) as StepIndex) : s))}
              aria-label="Next step"
            >
              ▶
            </button>
          </div>
          <div className={styles.toolbarRight}>
            <button
              className={styles.button}
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              onClick={() => setActionsOpen((o) => !o)}
            >
              Actions ▾
            </button>
            <button
              className={styles.button}
              aria-controls="filters-panel"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((o) => !o)}
            >
              Filters ▾
            </button>
          </div>
        </div>

        {actionsOpen && (
          <>
            <div className={styles.menuPanel} role="menu" aria-label="Actions menu">
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => { setLeftExpanded(true); setRightExpanded(true); setStep(10 as StepIndex); }}
            >
              Expand All
            </button>
            <button
              className={styles.menuItem}
              role="menuitem"
              onClick={() => { setLeftExpanded(false); setRightExpanded(false); setStep(0 as StepIndex); }}
            >
              Collapse All
            </button>
            <button
              className={styles.menuItem}
              role="menuitem"
              aria-pressed={failedMode}
              onClick={() => setFailedMode((v) => !v)}
            >
              {failedMode ? "Simulate failure: On" : "Simulate failure: Off"}
            </button>

            <button className={styles.menuItem} role="menuitem" onClick={() => fit("all")}>
              Fit All
            </button>
            <button className={styles.menuItem} role="menuitem" onClick={exportPng}>
              Export PNG
            </button>
          </div>

        {showFailedHint && (
          <div className={styles.hint} role="status" aria-live="polite">
            Tip: open Actions ▾ and toggle “Simulate failure” to preview a disaster scenario.
          </div>
        )}

          </>


        )}

        {filtersOpen && (
          <div id="filters-panel" className={styles.filtersPanel} aria-label="Filter by role">
            <span className={styles.filterLabel}>Filter:</span>
            {allRoles.map((role) => {
              const pressed = selectedRoles.has(role);
              return (
                <button
                  key={role}
                  className={styles.chip}
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
                >
                  {role}
                </button>
              );
            })}
            <button
              className={styles.chip}
              onClick={() => setSelectedRoles(new Set())}
              disabled={selectedRoles.size === 0}
              aria-label="Clear all role filters"
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
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "var(--edge)" } }}
        fitView
      >
        <Background gap={24} />
        <MiniMap />
        <Controls />
      </ReactFlow>

      {cardNode && (
        <div
          className={styles.popOutCardWrapper}
          role="dialog"
          aria-modal="true"
          aria-labelledby="popout-title"
        >
          <div className={styles.popOutCard}>
            <button
              className={styles.closeButton}
              onClick={handleCloseCard}
              aria-label="Close card"
            >
              ×
            </button>
            <h2 id="popout-title" className={styles.popOutCard__title}>
              {(cardNode.data as any)?.label}
            </h2>

            {(cardNode.data as any)?.metadata?.eli5 && (
              <section className={styles.popOutCard__section} aria-labelledby="eli5-heading">
                <h3 id="eli5-heading" className={styles.popOutCard__heading}>ELI5</h3>
                <p className={styles.popOutCard__text}>{(cardNode.data as any).metadata.eli5}</p>
              </section>
            )}

            {(cardNode.data as any)?.metadata?.chips?.length ? (
              <section className={styles.popOutCard__section} aria-labelledby="roles-heading">
                <h3 id="roles-heading" className={styles.popOutCard__heading}>Roles</h3>
                <ul className={styles.popOutCard__chips}>
                  {(cardNode.data as any).metadata.chips.map((chip: string, i: number) => (
                    <li key={i} className={styles.popOutCard__chip}>{chip}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(cardNode.data as any)?.metadata?.details?.length ? (
              <section className={styles.popOutCard__section} aria-labelledby="details-heading">
                <h3 id="details-heading" className={styles.popOutCard__heading}>Details</h3>
                <ul className={styles.popOutCard__list}>
                  {(cardNode.data as any).metadata.details.map((d: string, i: number) => (
                    <li key={i} className={styles.popOutCard__listItem}>{d}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(cardNode.data as any)?.metadata?.kpis?.length ? (
              <section className={styles.popOutCard__section} aria-labelledby="kpis-heading">
                <h3 id="kpis-heading" className={styles.popOutCard__heading}>KPIs</h3>
                <ul className={styles.popOutCard__list}>
                  {(cardNode.data as any).metadata.kpis.map((kpi: string, i: number) => (
                    <li key={i} className={styles.popOutCard__listItem}>{kpi}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
          <div
            className={styles.popOutOverlay}
            onClick={handleCloseCard}
            aria-hidden="true"
          />
        </div>
      )}
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {cardNode ? `Details for ${(cardNode.data as any)?.label} opened` : ''}
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
