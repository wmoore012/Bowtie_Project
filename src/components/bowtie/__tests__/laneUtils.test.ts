import { describe, it, expect } from "vitest";
import type { BowtieDiagram, ThreatLaneOrder, BowtieNodeData } from "../../../domain/bowtie.types";
import {
    deriveThreatLaneOrderFromDiagram,
    moveBarrierToThreat,
    buildThreatLaneEdges,
} from "../laneUtils";
import type { Node as RFNode } from "@xyflow/react";

describe("laneUtils", () => {
    describe("deriveThreatLaneOrderFromDiagram", () => {
        it("should correctly group prevention barriers under threats", () => {
            const diagram: BowtieDiagram = {
                id: "test-diagram",
                title: "Test Diagram",
                createdAt: "",
                updatedAt: "",
                nodes: [
                    { id: "threat1", type: "threat", label: "Threat 1" },
                    { id: "barrier1", type: "preventionBarrier", label: "Barrier 1" },
                    { id: "barrier2", type: "preventionBarrier", label: "Barrier 2" },
                    { id: "topEvent", type: "topEvent", label: "Top Event" },
                ],
                edges: [
                    { id: "e1", source: "threat1", target: "barrier1" },
                    { id: "e2", source: "barrier1", target: "barrier2" },
                    { id: "e3", source: "barrier2", target: "topEvent" },
                ],
            };

            const result = deriveThreatLaneOrderFromDiagram(diagram);
            expect(result.lanes["threat1"]).toEqual(["barrier1", "barrier2"]);
        });

        it("should handle multiple threats", () => {
            const diagram: BowtieDiagram = {
                id: "test-diagram-2",
                title: "Test Diagram 2",
                createdAt: "",
                updatedAt: "",
                nodes: [
                    { id: "threat1", type: "threat", label: "Threat 1" },
                    { id: "threat2", type: "threat", label: "Threat 2" },
                    { id: "barrier1", type: "preventionBarrier", label: "Barrier 1" },
                ],
                edges: [
                    { id: "e1", source: "threat1", target: "barrier1" },
                ],
            };

            const result = deriveThreatLaneOrderFromDiagram(diagram);
            expect(result.lanes["threat1"]).toEqual(["barrier1"]);
            expect(result.lanes["threat2"]).toEqual([]);
        });
    });

    describe("moveBarrierToThreat", () => {
        const initialLanes: ThreatLaneOrder = {
            lanes: {
                threat1: ["b1", "b2"],
                threat2: ["b3"],
            },
        };

        it("should move a barrier to a new threat lane", () => {
            const result = moveBarrierToThreat(initialLanes, "b1", "threat2", 0);
            expect(result.lanes["threat1"]).toEqual(["b2"]);
            expect(result.lanes["threat2"]).toEqual(["b1", "b3"]);
        });

        it("should append a barrier to the end of a new threat lane", () => {
            const result = moveBarrierToThreat(initialLanes, "b1", "threat2", 5); // Index > length
            expect(result.lanes["threat1"]).toEqual(["b2"]);
            expect(result.lanes["threat2"]).toEqual(["b3", "b1"]);
        });

        it("should reorder a barrier within the same lane", () => {
            const result = moveBarrierToThreat(initialLanes, "b1", "threat1", 1);
            expect(result.lanes["threat1"]).toEqual(["b2", "b1"]);
        });

        it("should handle moving a barrier that doesn't exist in any lane (add new)", () => {
            const result = moveBarrierToThreat(initialLanes, "b4", "threat1", 0);
            expect(result.lanes["threat1"]).toEqual(["b4", "b1", "b2"]);
        });
    });

    describe("buildThreatLaneEdges", () => {
        const lanes: ThreatLaneOrder = {
            lanes: {
                threat1: ["b1", "b2"],
            },
        };

        const baseNodes: RFNode<BowtieNodeData>[] = [
            { id: "threat1", position: { x: 0, y: 0 }, data: { bowtieType: "threat", label: "Threat 1" } },
            { id: "b1", position: { x: 0, y: 0 }, data: { bowtieType: "preventionBarrier", label: "Barrier 1" } },
            { id: "b2", position: { x: 0, y: 0 }, data: { bowtieType: "preventionBarrier", label: "Barrier 2" } },
            { id: "topEvent", position: { x: 0, y: 0 }, data: { bowtieType: "topEvent", label: "Top Event" } },
        ];

        it("should create a chain of edges from threat to top event", () => {
            const edges = buildThreatLaneEdges(lanes, baseNodes, new Map());

            expect(edges).toHaveLength(3);
            expect(edges).toContainEqual(expect.objectContaining({ source: "threat1", target: "b1" }));
            expect(edges).toContainEqual(expect.objectContaining({ source: "b1", target: "b2" }));
            expect(edges).toContainEqual(expect.objectContaining({ source: "b2", target: "topEvent" }));
        });

        it("should connect threat directly to top event if no barriers exist", () => {
            const emptyLanes: ThreatLaneOrder = {
                lanes: {
                    threat1: [],
                },
            };
            const edges = buildThreatLaneEdges(emptyLanes, baseNodes, new Map());

            expect(edges).toHaveLength(1);
            expect(edges).toContainEqual(expect.objectContaining({ source: "threat1", target: "topEvent" }));
        });
    });
});
