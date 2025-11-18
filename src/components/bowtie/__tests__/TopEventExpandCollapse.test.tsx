import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Top Event expansion toggle", () => {
  it("expands all nodes on first click and collapses back to spine on second click", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    const topEventButton = await screen.findByLabelText(/Top Event:/i);
    expect(topEventButton).toBeInTheDocument();

    const hideStoryButton = await screen.findByRole("button", { name: /Hide/i });
    fireEvent.click(hideStoryButton);

    await waitFor(() => expect(screen.queryAllByTestId("bowtie-barrier-node")).toHaveLength(0));

    fireEvent.click(topEventButton);

    await waitFor(() => {
      expect(screen.getAllByTestId("bowtie-barrier-node").length).toBeGreaterThan(0);
    });

    fireEvent.click(topEventButton);

    await waitFor(() => {
      expect(screen.queryAllByTestId("bowtie-barrier-node")).toHaveLength(0);
    });

    expect(screen.getByText(/Intoxicated driving/i)).toBeInTheDocument();
    expect(screen.getByText(/Crash into other vehicle or object/i)).toBeInTheDocument();
  });
});
