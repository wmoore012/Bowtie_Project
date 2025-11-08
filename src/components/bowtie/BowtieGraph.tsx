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
import type { BowtieDiagram, BowtieNode, BowtieNodeType } from "../../domain/bowtie.types";
import { computeSimpleLayout, computeElkLayout } from "./layout";
import { Legend } from "./Legend";
import { toPng } from "html-to-image";
import BarrierNode from "./nodes/BarrierNode";
import ThreatNode from "./nodes/ThreatNode";
import ConsequenceNode from "./nodes/ConsequenceNode";
import HazardTagNode from "./nodes/HazardTagNode";
import TopEventKnotNode from "./nodes/TopEventKnotNode";

import { NodeDetailPanel } from "./NodeDetailPanel";
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
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const allRoles = useMemo(() => collectAvailableRoles(diagram), [diagram]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
  const [selectedNode, setSelectedNode] = useState<BowtieNode | null>(null);
  const rf = useReactFlow();

  // Compute ELK auto-layout after initial render and when wing visibility changes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const laid = await computeElkLayout(visibleDiagram);
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

  // Focus dimming: dim non-adjacent when a node is selected
  useEffect(() => {
    if (!selectedNode) {
      setEdges((eds) => eds.map((e) => ({ ...e, style: { ...(e.style || {}), stroke: "var(--edge)", opacity: 1 } })));
      setNodes((nds) => nds.map((n) => ({ ...n, style: { ...(n.style || {}), opacity: 1 } })));
      return;
    }
    const selId = selectedNode.id;
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
          stroke: "var(--edge)",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNode]);

  async function exportPng() {
    const el = wrapperRef.current;
    if (!el) return;
    const dataUrl = await toPng(el, { backgroundColor: "#ffffff" });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `bowtie-${Date.now()}.png`;
    a.click();
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
              onClick={() => { setLeftExpanded(false); setRightExpanded(false); setSelectedNode(null); setStep(0 as StepIndex); }}
            >
              Collapse All
            </button>
            <button className={styles.menuItem} role="menuitem" onClick={() => fit("all")}>
              Fit All
            </button>
            <button className={styles.menuItem} role="menuitem" onClick={exportPng}>
              Export PNG
            </button>
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
          setSelectedNode(dn);
          const bt = dn?.type;
          if (bt === "hazard") setLeftExpanded((v) => !v);
          if (bt === "topEvent") setRightExpanded((v) => !v);
        }}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: "var(--edge)" } }}
        fitView
      >
        <Background gap={24} />
        <MiniMap />
        <Controls />
      </ReactFlow>

      <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
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
