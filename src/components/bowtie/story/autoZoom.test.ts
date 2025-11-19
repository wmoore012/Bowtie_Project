import { describe, it, expect } from "vitest";
import { calculateFocusViewport } from "./autoZoom";
import type { Node } from "@xyflow/react";

describe("autoZoom calculation", () => {
    const mockNodes: Node[] = [
        { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" }, width: 100, height: 50 },
        { id: "n2", position: { x: 200, y: 0 }, data: { label: "Node 2" }, width: 100, height: 50 },
        { id: "n3", position: { x: 0, y: 200 }, data: { label: "Node 3" }, width: 100, height: 50 },
    ];

    const viewport = { width: 1000, height: 800 };

    it("returns default view if no focusIds provided", () => {
        const result = calculateFocusViewport([], mockNodes, viewport);
        expect(result).toBeNull();
    });

    it("returns default view if focusIds don't exist", () => {
        const result = calculateFocusViewport(["non-existent"], mockNodes, viewport);
        expect(result).toBeNull();
    });

    it("centers on a single node", () => {
        const result = calculateFocusViewport(["n1"], mockNodes, viewport);
        expect(result).toBeDefined();
        if (!result) return;

        // Node center is at (50, 25) because pos is top-left (0,0) and size is 100x50
        // We expect the viewport center to match node center.
        // React Flow x/y are the *center* of the viewport in the flow coordinate system?
        // No, setCenter(x, y, zoom) usually takes the x,y coordinate that should be in the center.
        expect(result.x).toBe(50);
        expect(result.y).toBe(25);
        // Zoom should be reasonably close to 1 or max zoom since it fits easily
        expect(result.zoom).toBeGreaterThan(0.5);
    });

    it("zooms to fit multiple nodes", () => {
        const result = calculateFocusViewport(["n1", "n3"], mockNodes, viewport);
        expect(result).toBeDefined();
        if (!result) return;

        // Bounds: x: 0-100, y: 0-250 (n1 top 0 to n3 bottom 250)
        // Center x: 50
        // Center y: 125
        expect(result.x).toBe(50);
        expect(result.y).toBe(125);
    });

    it("adds padding", () => {
        // If we have a node 100x100 and viewport 100x100, zoom should be < 1 with padding
        const tightViewport = { width: 100, height: 100 };
        const result = calculateFocusViewport(["n1"], mockNodes, tightViewport, { padding: 0.1 });
        expect(result).toBeDefined();
        if (!result) return;
        expect(result.zoom).toBeLessThan(1);
    });
});
