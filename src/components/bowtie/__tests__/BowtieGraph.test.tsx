import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

// Basic smoke/integration test for step navigation

describe("BowtieGraph step navigation", () => {
  it("shows Step 0/10 initially and increments/decrements via controls", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Step label should start at 0
    expect(screen.getByText(/Step 0\/10/i)).toBeInTheDocument();

    // Click Next ▶ twice
    const nextBtn = screen.getByRole("button", { name: /Next step/i });
    await user.click(nextBtn);
    expect(screen.getByText(/Step 1\/10/i)).toBeInTheDocument();
    await user.click(nextBtn);
    expect(screen.getByText(/Step 2\/10/i)).toBeInTheDocument();

    // Click Previous ◀ once
    const prevBtn = screen.getByRole("button", { name: /Previous step/i });
    await user.click(prevBtn);
    expect(screen.getByText(/Step 1\/10/i)).toBeInTheDocument();
  });
});

