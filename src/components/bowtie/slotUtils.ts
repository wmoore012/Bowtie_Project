import type { Node } from "@xyflow/react";
import type { BowtieNodeData, ThreatLaneOrder, ThreatId } from "../../domain/bowtie.types";
import { barrierChainSpacing, xPrevention } from "./layout";

export interface DropSlot {
    id: string;
    threatId: ThreatId;
    insertIndex: number;
    x: number;
    y: number;
}

/**
 * Calculate all valid drop slots for prevention barriers based on current threat lanes.
 *
 * Slots are positioned:
 * - Before the first barrier (or after Threat if empty)
 * - Between existing barriers
 * - After the last barrier
 */
export function calculatePreventionSlots(
    lanes: ThreatLaneOrder,
    nodes: Node<BowtieNodeData>[]
): DropSlot[] {
    const slots: DropSlot[] = [];
    const nodeIndex = new Map(nodes.map((n) => [n.id, n]));

    Object.entries(lanes.lanes).forEach(([threatId, barrierIds]) => {
        const threatNode = nodeIndex.get(threatId);
        if (!threatNode) return;

        // If the lane is empty, we place one slot where the first barrier would go.
        // In our layout, the first barrier goes at xPrevention.
        // The Threat is usually at collapsedThreatColumnX (far left) if empty.
        if (barrierIds.length === 0) {
            slots.push({
                id: `slot-${threatId}-0`,
                threatId: threatId as ThreatId,
                insertIndex: 0,
                x: xPrevention,
                y: threatNode.position.y,
            });
            return;
        }

        // If lane has barriers, we place slots relative to them.
        // Visual order: Threat (Left) -> Barrier[0] -> Barrier[1] -> ... -> Top Event (Right)
        // Actually, layout.ts says:
        // Barrier[0] (idx=0) is at xPrevention - spacing * (N-1)
        // Barrier[N-1] (last) is at xPrevention
        // Wait, let's re-verify layout.ts logic:
        // visibleChain.forEach((barrierId, idx) => {
        //   const desiredX = xPrevention - barrierChainSpacing * (chainLength - idx - 1);
        // });
        // If N=1: idx=0. desiredX = xPrevention - 300 * (1 - 0 - 1) = xPrevention.
        // If N=2:
        //   idx=0 (First in list): xPrevention - 300 * (2 - 0 - 1) = xPrevention - 300.
        //   idx=1 (Second in list): xPrevention - 300 * (2 - 1 - 1) = xPrevention.
        // So the list order [B0, B1] corresponds to Left->Right visual order.
        // B0 is Leftmost. B_last is Rightmost (at xPrevention).

        const barriers = barrierIds
            .map((id) => nodeIndex.get(id))
            .filter((n): n is Node<BowtieNodeData> => !!n);

        if (barriers.length === 0) return;

        // Slot 0: Before the first barrier.
        const first = barriers[0];
        if (first) {
            slots.push({
                id: `slot-${threatId}-0`,
                threatId: threatId as ThreatId,
                insertIndex: 0,
                x: first.position.x - barrierChainSpacing,
                y: first.position.y,
            });
        }

        // Slots between barriers
        for (let i = 0; i < barriers.length - 1; i++) {
            const current = barriers[i];
            const next = barriers[i + 1];
            if (current && next) {
                slots.push({
                    id: `slot-${threatId}-${i + 1}`,
                    threatId: threatId as ThreatId,
                    insertIndex: i + 1,
                    x: (current.position.x + next.position.x) / 2,
                    y: (current.position.y + next.position.y) / 2,
                });
            }
        }

        // Slot Last: After the last barrier.
        const last = barriers[barriers.length - 1];
        if (last) {
            slots.push({
                id: `slot-${threatId}-${barriers.length}`,
                threatId: threatId as ThreatId,
                insertIndex: barriers.length,
                x: last.position.x + barrierChainSpacing,
                y: last.position.y,
            });
        }
    });

    return slots;
}

export function findNearestSlot(
    slots: DropSlot[],
    x: number,
    y: number,
    threshold = 150 // px radius to snap
): DropSlot | null {
    let nearest: DropSlot | null = null;
    let minDist = threshold * threshold; // Compare squared distance

    for (const slot of slots) {
        const dx = slot.x - x;
        const dy = slot.y - y;
        const distSq = dx * dx + dy * dy;

        if (distSq < minDist) {
            minDist = distSq;
            nearest = slot;
        }
    }

    return nearest;
}
