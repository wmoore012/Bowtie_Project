import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Filters panel Clear button state", () => {
  it("is disabled initially, enabled after selecting a role, and disabled again after clearing", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Open Filters panel
    await user.click(screen.getByRole("button", { name: /filters/i }));

    const clearBtn = screen.getByRole("button", { name: /clear/i });
    expect(clearBtn).toBeDisabled();

    // Pick the first role chip
    const panel = document.getElementById("filters-panel");
    if (!panel) throw new Error("filters panel not found");
    const buttons = within(panel).getAllByRole("button");
    const firstChip = buttons.find((b) => b !== clearBtn);
    expect(firstChip).toBeTruthy();

    if (firstChip) {
      await user.click(firstChip);
    }

    // Clear should now be enabled
    expect(clearBtn).not.toBeDisabled();

    // Click Clear and verify disabled again
    await user.click(clearBtn);
    expect(clearBtn).toBeDisabled();
  });
});

