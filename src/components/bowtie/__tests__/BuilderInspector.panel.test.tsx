import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Builder Inspector panel", () => {
  it("opens when selecting a node and updates the node label", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    const hazardButton = await screen.findByTestId("bowtie-hazard-node");
    fireEvent.click(hazardButton);

    const inspector = screen.getByTestId("builder-inspector");
    expect(inspector).toHaveAttribute("aria-hidden", "false");

    const labelInput = screen.getByLabelText(/^Label$/i) as HTMLInputElement;
    fireEvent.change(labelInput, { target: { value: "Highway context hazard" } });

    expect(await within(hazardButton).findByText(/Highway context hazard/i)).toBeInTheDocument();
  });
});
