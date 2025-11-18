import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

async function hideStoryOverlay() {
  const hideButton = await screen.findByRole("button", { name: /Hide/i });
  fireEvent.click(hideButton);
  await waitFor(() => expect(screen.queryAllByTestId("bowtie-barrier-node")).toHaveLength(0));
}

describe("Threat and consequence chain toggles", () => {
  it("expands and collapses a threat chain along with escalations", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    await hideStoryOverlay();

    const threatSelector = /Threat: .*Miscalibrated assistance systems/i;
    const getThreatNode = () => screen.getByLabelText(threatSelector);
    fireEvent.click(await screen.findByLabelText(threatSelector));

    await waitFor(() => expect(screen.getAllByTestId("bowtie-barrier-node").length).toBeGreaterThan(0));
    await waitFor(() => expect(getThreatNode()).toHaveAttribute("data-highlight", "true"));
    const preventionNode = await screen.findByLabelText(/Barrier: .*Periodic calibration/i);
    expect(preventionNode).toHaveAttribute("data-highlight", "true");
    expect(await screen.findByLabelText(/Escalation factor: .*Calibration overdue/i)).toBeInTheDocument();

    fireEvent.click(preventionNode);

    await waitFor(() => expect(getThreatNode()).not.toHaveAttribute("data-highlight", "true"));
    expect(preventionNode).toHaveAttribute("data-highlight", "true");
    expect(await screen.findByLabelText(/Escalation factor: .*Calibration overdue/i)).toBeInTheDocument();

    fireEvent.click(getThreatNode());

    await waitFor(() => expect(screen.queryAllByTestId("bowtie-barrier-node")).toHaveLength(0));
    await waitFor(() => expect(screen.queryByLabelText(/Escalation factor: .*Calibration overdue/i)).toBeNull());
  });

  it("expands and collapses a consequence chain along with escalations", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    await hideStoryOverlay();

    const consequenceSelector = /Consequence: .*seatbelt/i;
    const getConsequenceNode = () => screen.getByLabelText(consequenceSelector);
    fireEvent.click(await screen.findByLabelText(consequenceSelector));

    await waitFor(() => expect(screen.getAllByTestId("bowtie-barrier-node").length).toBeGreaterThan(0));
    await waitFor(() => expect(getConsequenceNode()).toHaveAttribute("data-highlight", "true"));
    const mitigationNode = await screen.findByLabelText(/Barrier: .*Seatbelt warning alarm/i);
    expect(mitigationNode).toHaveAttribute("data-highlight", "true");
    expect(await screen.findByLabelText(/Escalation factor: .*seatbelt/i)).toBeInTheDocument();

    fireEvent.click(mitigationNode);

    await waitFor(() => expect(getConsequenceNode()).not.toHaveAttribute("data-highlight", "true"));
    expect(mitigationNode).toHaveAttribute("data-highlight", "true");
    expect(await screen.findByLabelText(/Escalation factor: .*seatbelt/i)).toBeInTheDocument();

    fireEvent.click(getConsequenceNode());

    await waitFor(() => expect(screen.queryAllByTestId("bowtie-barrier-node")).toHaveLength(0));
    await waitFor(() => expect(screen.queryByLabelText(/Escalation factor: .*seatbelt/i)).toBeNull());
  });
});
