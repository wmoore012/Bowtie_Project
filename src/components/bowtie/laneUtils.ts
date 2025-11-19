import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type {
    BowtieDiagram,
    BowtieNodeData,
    ThreatLaneOrder,
    BarrierId,
    ThreatId,
} from "../../domain/bowtie.types";

/**
 * Derives the initial ThreatLaneOrder from a loaded diagram.
 * It scans for Threats and their connected Prevention Barriers to build the lane structure.
 */
export function deriveThreatLaneOrderFromDiagram(diagram: BowtieDiagram): ThreatLaneOrder {
    const nodeIndex = new Map(diagram.nodes.map((node) => [node.id, node]));
    const threats = diagram.nodes.filter((node) => node.type === "threat");
    const preventionIds = new Set(
        diagram.nodes.filter((node) => node.type === "preventionBarrier").map((node) => node.id)
    );

    const edgesBySource = new Map<string, string[]>();
    diagram.edges.forEach((edge) => {
        if (!edgesBySource.has(edge.source)) edgesBySource.set(edge.source, []);
        edgesBySource.get(edge.source)!.push(edge.target);
    });

    const lanes: ThreatLaneOrder["lanes"] = {};

    threats.forEach((threat) => {
        const laneBarriers: string[] = [];
        let currentId = threat.id;

        // Traverse the chain: Threat -> Barrier -> Barrier ...
        while (true) {
            const outgoingEdges = edgesBySource.get(currentId) ?? [];
            // Find a target that is a prevention barrier
            // We assume a linear chain, so we take the first one found.
            // In a well-formed bowtie, there should be only one next barrier in the lane.
            const nextBarrierId = outgoingEdges.find((targetId) => {
                const targetNode = nodeIndex.get(targetId);
                return targetNode?.type === "preventionBarrier";
            });

            if (nextBarrierId && preventionIds.has(nextBarrierId)) {
                laneBarriers.push(nextBarrierId);
                currentId = nextBarrierId;
            } else {
                break;
            }
        }

        lanes[threat.id] = laneBarriers;
    });

    return { lanes };
}

/**
 * Moves a barrier to a specific index within a Threat lane.
 * Ensures the barrier is removed from any previous lane it might have been in.
 */
export function moveBarrierToThreat(
    lanes: ThreatLaneOrder,
    barrierId: BarrierId,
    newThreatId: ThreatId,
    insertIndex: number
): ThreatLaneOrder {
    const nextLanes: ThreatLaneOrder["lanes"] = {};
    let occurrences = 0;

    Object.entries(lanes.lanes).forEach(([threatId, barrierIds]) => {
        const filtered = barrierIds.filter((id) => {
            if (id === barrierId) {
                occurrences += 1;
                return false;
            }
            return true;
        });
        nextLanes[threatId] = filtered;
    });

    if (occurrences > 1) {
        console.error(
            "ThreatLaneOrder invariant violation: barrier appears on more than one threat lane",
            { barrierId, lanes }
        );
    }

    const existingLane = nextLanes[newThreatId] ?? [];
    const clampedIndex = Math.max(0, Math.min(insertIndex, existingLane.length));
    const updatedLane = [
        ...existingLane.slice(0, clampedIndex),
        barrierId,
        ...existingLane.slice(clampedIndex),
    ];

    nextLanes[newThreatId] = updatedLane;

    return { lanes: nextLanes };
}

/**
 * Rebuilds the edges for the "Left Wing" (Threat -> Prevention -> Top Event)
 * based on the current ThreatLaneOrder.
 */
export function buildThreatLaneEdges(
    lanes: ThreatLaneOrder,
    baseNodes: RFNode<BowtieNodeData>[],
    strictConnections: Map<string, Set<string>>
): RFEdge[] {
    // strictConnections is unused in the current logic but kept for signature compatibility if needed later
    void strictConnections;
    const nodeIndex = new Map(baseNodes.map((node) => [node.id, node]));
    const topEventNode = baseNodes.find(
        (node) => (node.data as BowtieNodeData | undefined)?.bowtieType === "topEvent"
    );

    const edges: RFEdge[] = [];

    const addLaneEdge = (sourceId: string | undefined, targetId: string | undefined) => {
        if (!sourceId || !targetId) return;

        const sourceNode = nodeIndex.get(sourceId);
        const targetNode = nodeIndex.get(targetId);
        if (!sourceNode || !targetNode) return;

        const sourceData = sourceNode.data as BowtieNodeData | undefined;
        const targetData = targetNode.data as BowtieNodeData | undefined;
        const sourceType = sourceData?.bowtieType;
        const targetType = targetData?.bowtieType;
        if (!sourceType || !targetType) return;

        const sourceOrientation = sourceData?.orientation;
        const targetOrientation = targetData?.orientation;

        let sourceHandle: string | undefined;
        let targetHandle: string | undefined;

        // Handle logic for specific node types (e.g., topEvent orientation)
        if (targetType === "topEvent" && sourceType !== "hazard") {
            if (sourceOrientation === "left") {
                targetHandle = "left";
            }
        } else if (sourceType === "topEvent") {
            if (targetOrientation === "right") {
                sourceHandle = "right";
                targetHandle = "left";
            }
        }

        edges.push({
            id: `chain-${sourceId}-${targetId}`,
            source: sourceId,
            target: targetId,
            ...(sourceHandle && { sourceHandle }),
            ...(targetHandle && { targetHandle }),
            markerEnd: { type: MarkerType.ArrowClosed },
            style: { stroke: "var(--edge)", strokeWidth: 2 },
        });
    };

    const topEventId = topEventNode?.id;

    Object.entries(lanes.lanes).forEach(([threatId, barrierIds]) => {
        // Filter out any barriers that don't actually exist in the nodes list
        const visibleBarriers = barrierIds.filter((id) => {
            const node = nodeIndex.get(id);
            const data = node?.data as BowtieNodeData | undefined;
            return !!node && data?.bowtieType === "preventionBarrier";
        });

        if (visibleBarriers.length === 0) {
            if (topEventId) {
                addLaneEdge(threatId, topEventId);
            }
            return;
        }

        addLaneEdge(threatId, visibleBarriers[0]);

        for (let i = 0; i < visibleBarriers.length - 1; i += 1) {
            addLaneEdge(visibleBarriers[i], visibleBarriers[i + 1]);
        }

        if (topEventId) {
            addLaneEdge(visibleBarriers[visibleBarriers.length - 1], topEventId);
        }
    });

    return edges;
}

/**
 * Helper to replace existing lane edges with new ones while preserving other edges.
 */
export function replaceThreatLaneEdges(existingEdges: RFEdge[], laneEdges: RFEdge[]): RFEdge[] {
    if (!laneEdges.length) return existingEdges;

    const lanePairs = new Set(laneEdges.map((edge) => `${edge.source}->${edge.target}`));

    const preservedEdges = existingEdges.filter(
        (edge) => !lanePairs.has(`${edge.source}->${edge.target}`)
    );

    return [...preservedEdges, ...laneEdges];
}
