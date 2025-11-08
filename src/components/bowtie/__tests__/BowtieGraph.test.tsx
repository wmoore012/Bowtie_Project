import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

// Basic smoke/integration test for step navigation

describe("BowtieGraph step navigation", () => {
  it("shows Step 10/10 initially and decrements/increments via controls", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Step label should start at 10 (full diagram by default)
    expect(screen.getByText(/Step\s*10\/10/i)).toBeInTheDocument();

    // Click Previous ◀ twice
    const prevBtn = screen.getByRole("button", { name: /Previous step/i });
    await user.click(prevBtn);
    expect(screen.getByText(/Step\s*9\/10/i)).toBeInTheDocument();
    await user.click(prevBtn);
    expect(screen.getByText(/Step\s*8\/10/i)).toBeInTheDocument();

    // Click Next ▶ once
    const nextBtn = screen.getByRole("button", { name: /Next step/i });
    await user.click(nextBtn);
    expect(screen.getByText(/Step\s*9\/10/i)).toBeInTheDocument();
  });
});

