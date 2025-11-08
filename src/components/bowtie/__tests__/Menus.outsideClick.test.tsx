import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Actions menu closes on outside click", () => {
  it("closes when clicking outside the menu panel and trigger", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Open Actions menu
    const actionsBtn = screen.getByRole("button", { name: /actions/i });
    await user.click(actionsBtn);
    const menu = screen.getByRole("menu", { name: /actions menu/i });
    expect(menu).toBeInTheDocument();

    // Click outside (on document body)
    await user.click(document.body);

    // Menu should be gone
    expect(screen.queryByRole("menu", { name: /actions menu/i })).not.toBeInTheDocument();
  });
});

