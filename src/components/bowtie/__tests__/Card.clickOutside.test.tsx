import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

function dispatchMouse(type: "mousedown" | "mouseup", x: number, y: number) {
  const evt = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y });
  window.dispatchEvent(evt);
}

describe("Pop-out card click-outside with drag threshold", () => {
  it("does not close when panning begins (movement > 5px)", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Open any Barrier card
    const barriers = await screen.findAllByTestId("bowtie-barrier-node");
    const barrier = barriers[0]!;
    expect(barrier).toBeDefined();
    await user.click(barrier);

    // Card should be open
    const closeBtn = await screen.findByRole("button", { name: /close details/i });
    expect(closeBtn).toBeInTheDocument();

    // Start drag outside and move > 5px before mouseup -> should NOT close
    dispatchMouse("mousedown", 0, 0);
    dispatchMouse("mouseup", 10, 10);

    expect(screen.getByRole("button", { name: /close details/i })).toBeInTheDocument();
  });

  it("closes on true click outside (movement <= 5px)", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Open any Barrier card
    const barriers2 = await screen.findAllByTestId("bowtie-barrier-node");
    const barrier = barriers2[0]!;
    expect(barrier).toBeDefined();
    await user.click(barrier);

    // True click outside (movement <= 5px)
    dispatchMouse("mousedown", 100, 100);
    dispatchMouse("mouseup", 102, 103);

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /close details/i })).not.toBeInTheDocument();
    });
  });
});

