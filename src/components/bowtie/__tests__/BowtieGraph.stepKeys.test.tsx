import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

// Keyboard step navigation via ArrowLeft/ArrowRight/Home/End

describe("BowtieGraph step keyboard navigation", () => {
  it("responds to ArrowLeft/ArrowRight/Home/End when no menus or card are open", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Starts at Step 10/10
    expect(screen.getByText(/Step\s*10\/10/i)).toBeInTheDocument();

    // ArrowLeft twice -> Step 8/10
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByText(/Step\s*8\/10/i)).toBeInTheDocument();

    // ArrowRight once -> Step 9/10
    await user.keyboard("{ArrowRight}");
    expect(screen.getByText(/Step\s*9\/10/i)).toBeInTheDocument();

    // Home -> Step 0/10
    await user.keyboard("{Home}");
    expect(screen.getByText(/Step\s*0\/10/i)).toBeInTheDocument();

    // End -> Step 10/10
    await user.keyboard("{End}");
    expect(screen.getByText(/Step\s*10\/10/i)).toBeInTheDocument();
  });
});

