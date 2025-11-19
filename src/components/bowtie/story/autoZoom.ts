import type { Node } from "@xyflow/react";

export interface ViewportTarget {
    x: number;
    y: number;
    zoom: number;
}

export interface ViewportDimensions {
    width: number;
    height: number;
}

export interface AutoZoomOptions {
    padding?: number; // 0.1 = 10% padding
    minZoom?: number;
    maxZoom?: number;
}

export function calculateFocusViewport(
    focusIds: string[] | undefined,
    nodes: Node[],
    viewport: ViewportDimensions,
    options: AutoZoomOptions = {}
): ViewportTarget | null {
    if (!focusIds || focusIds.length === 0) return null;

    const { padding = 0.2, minZoom = 0.2, maxZoom = 1.5 } = options;

    const targets = nodes.filter((n) => focusIds.includes(n.id));
    if (targets.length === 0) return null;

    // Calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    targets.forEach((node) => {
        const w = node.width ?? node.measured?.width ?? 0;
        const h = node.height ?? node.measured?.height ?? 0;

        // React Flow positions are typically top-left
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + w);
        maxY = Math.max(maxY, node.position.y + h);
    });

    if (minX === Infinity) return null;

    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;
    const centerX = minX + boundsWidth / 2;
    const centerY = minY + boundsHeight / 2;

    // Determine zoom to fit
    // Available space with padding
    const availableW = viewport.width * (1 - padding * 2);
    const availableH = viewport.height * (1 - padding * 2);

    const zoomX = availableW / (boundsWidth || 1); // Avoid divide by zero
    const zoomY = availableH / (boundsHeight || 1);

    // Use the smaller zoom to ensure everything fits
    let zoom = Math.min(zoomX, zoomY);

    // Clamp zoom
    zoom = Math.max(minZoom, Math.min(zoom, maxZoom));

    return { x: centerX, y: centerY, zoom };
}
