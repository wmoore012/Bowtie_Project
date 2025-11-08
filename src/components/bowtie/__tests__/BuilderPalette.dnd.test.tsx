import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

function makeDataTransfer() {
  const store: Record<string, string> = {};
  return {
    setData: (type: string, val: string) => {
      store[type] = String(val);
    },
    getData: (type: string) => store[type] ?? "",
    clearData: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
    effectAllowed: "copy" as const,
    dropEffect: "copy" as const,
    files: [] as File[],
    items: [] as any,
    types: [] as string[],
  } as unknown as DataTransfer;
}

describe("Builder Palette drag-and-drop", () => {
  it("shows Palette in Builder mode and allows dropping a prevention barrier", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Switch to Builder mode and open Palette drawer
    await user.click(screen.getByRole("button", { name: /Builder/i }));
    await user.click(screen.getByRole("button", { name: /Palette/i }));
    expect(screen.getByTestId("builder-palette")).toBeInTheDocument();

    const btn = screen.getByRole("button", { name: /Prevention Barrier/i });
    expect(btn).toHaveAttribute("draggable");

    const canvas = screen.getByTestId("canvas-host");

    const dt = makeDataTransfer();
    // Start dragging from palette
    fireEvent.dragStart(btn, { dataTransfer: dt });

    // Drag over canvas and drop
    fireEvent.dragOver(canvas, { dataTransfer: dt, clientX: 200, clientY: 200 });
    fireEvent.drop(canvas, { dataTransfer: dt, clientX: 220, clientY: 220 });

    // A new barrier node with default label should appear (visible label element, not hidden desc)
    expect(
      await screen.findByText(/New prevention barrier/i, { selector: "div" })
    ).toBeInTheDocument();
  });
});

