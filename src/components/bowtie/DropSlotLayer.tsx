import { useReactFlow } from "@xyflow/react";
import type { DropSlot } from "./slotUtils";

interface DropSlotLayerProps {
    slots: DropSlot[];
    activeSlot: DropSlot | null;
}

export function DropSlotLayer({ slots, activeSlot }: DropSlotLayerProps) {
    const { flowToScreenPosition } = useReactFlow();

    // We render slots as absolute divs on top of the canvas.
    // We need to project their flow coordinates to screen coordinates.
    // Note: This component re-renders when slots or activeSlot changes.
    // If the canvas is panned/zoomed, the parent BowtieGraph needs to trigger a re-render
    // or we need to listen to viewport changes.
    // Since this is only visible during drag, and users usually don't pan *while* dragging
    // (unless edge scrolling), this might be acceptable.
    // However, to be robust, we should rely on React Flow's viewport state if possible,
    // or just use the fact that BowtieGraph re-renders on drag over?
    // Actually, BowtieGraph's onCanvasDragOver updates state, which triggers re-render.
    // So we just need to project correctly.

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none", // Let clicks/drops pass through to canvas
                zIndex: 1000, // Above everything
            }}
        >
            {slots.map((slot) => {
                const screenPos = flowToScreenPosition({ x: slot.x, y: slot.y });
                const isActive = activeSlot?.id === slot.id;

                return (
                    <div
                        key={slot.id}
                        style={{
                            position: "absolute",
                            left: screenPos.x,
                            top: screenPos.y,
                            transform: "translate(-50%, -50%)",
                            width: isActive ? 24 : 12,
                            height: isActive ? 24 : 12,
                            borderRadius: "50%",
                            backgroundColor: isActive ? "#059669" : "rgba(5, 150, 105, 0.3)",
                            border: isActive ? "3px solid #fff" : "1px solid rgba(255,255,255,0.5)",
                            boxShadow: isActive ? "0 0 0 4px rgba(5, 150, 105, 0.2)" : "none",
                            transition: "all 0.2s ease",
                        }}
                    />
                );
            })}
            {activeSlot && (
                <div
                    style={{
                        position: "absolute",
                        left: flowToScreenPosition({ x: activeSlot.x, y: activeSlot.y }).x,
                        top: flowToScreenPosition({ x: activeSlot.x, y: activeSlot.y }).y + 24,
                        transform: "translateX(-50%)",
                        backgroundColor: "#1f2937",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                    }}
                >
                    Insert here
                </div>
            )}
        </div>
    );
}
