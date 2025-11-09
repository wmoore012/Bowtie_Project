import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Narrative visuals", () => {
  it("shows HazardBanner in Demo mode", () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    // Hazard banner should be present
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/Lithium-ion Battery Fire Risk/i)).toBeInTheDocument();
  });

  it("does not show HazardBanner in Builder mode", () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("marks canvas host with data-mode attribute", () => {
    const { rerender } = render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);
    expect(screen.getByTestId("canvas-host")).toHaveAttribute("data-mode", "builder");
    rerender(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    expect(screen.getByTestId("canvas-host")).toHaveAttribute("data-mode", "demo");
  });
});

