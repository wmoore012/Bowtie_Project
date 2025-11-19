import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Narrative visuals", () => {
  it("shows the narrative overlay only in Demo mode", async () => {
    const { rerender } = render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    expect(await screen.findByLabelText(/Demo narrative/i)).toBeInTheDocument();
    rerender(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);
    await waitFor(() => {
      expect(screen.queryByLabelText(/Demo narrative/i)).not.toBeInTheDocument();
    });
  });

  it("marks canvas host with data-mode attribute", () => {
    const { rerender } = render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);
    expect(screen.getByTestId("canvas-host")).toHaveAttribute("data-mode", "builder");
    rerender(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    expect(screen.getByTestId("canvas-host")).toHaveAttribute("data-mode", "demo");
  });

  it("reveals prevention barriers during the story at the prevention step", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    expect(screen.queryByText(/Periodical alcohol and drug screening/i)).not.toBeInTheDocument();
    await user.click(await screen.findByRole("button", { name: /START/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(await screen.findByText(/Hourly weather alerts/i)).toBeInTheDocument();
  });
});
