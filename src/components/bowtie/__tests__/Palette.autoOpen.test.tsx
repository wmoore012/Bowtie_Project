import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Builder palette auto-open", () => {
  it("auto-opens the palette in Builder mode", () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);
    const toggle = screen.getByTestId("builder-palette-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    // Palette content should be visible
    expect(screen.getByRole("group", { name: /add nodes/i })).toBeInTheDocument();
  });

  it("hides the palette entirely in Demo mode", () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    expect(screen.queryByTestId("builder-palette")).not.toBeInTheDocument();
  });

  it("opens the palette when switching from Demo to Builder", () => {
    const { rerender } = render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);
    rerender(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);
    const toggle = screen.getByTestId("builder-palette-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });
});

