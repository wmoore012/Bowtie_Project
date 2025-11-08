import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

// Verify focus moves to the first Actions menu item on open, and returns to the trigger on Escape

describe("Actions menu focus management", () => {
  it("focuses first item on open and returns focus to trigger on Escape", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    const actionsBtn = screen.getByRole("button", { name: /actions/i });
    await user.click(actionsBtn);

    // First menuitem should be focused ("Expand All")
    const menu = screen.getByRole("menu", { name: /actions menu/i });
    const firstItem = within(menu).getByRole("menuitem", { name: /expand all/i });
    expect(document.activeElement).toBe(firstItem);

    // Press Escape to close and return focus to trigger
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(actionsBtn);
  });
});

