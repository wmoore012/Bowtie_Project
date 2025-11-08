import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

// Verify step keyboard navigation is ignored while a card is open

describe("Step keys are ignored when a details card is open", () => {
  it("does not change steps with ArrowLeft/Right when card is open", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} />);

    // Initial step 10/10
    expect(screen.getByText(/Step\s*10\/10/i)).toBeInTheDocument();

    // Open the Hazard card (has a known label in the example)
    const hazard = await screen.findByTestId("bowtie-hazard-node");
    await user.click(hazard);

    // Sanity: card dialog is present
    expect(screen.getByRole("dialog", { name: /driving a commercial vehicle on a highway/i })).toBeInTheDocument();

    // Try to navigate steps with keyboard; should be ignored while card is open
    await user.keyboard("{ArrowLeft}{ArrowLeft}{Home}{End}{ArrowRight}");

    // Still Step 10/10
    expect(screen.getByText(/Step\s*10\/10/i)).toBeInTheDocument();
  });
});

