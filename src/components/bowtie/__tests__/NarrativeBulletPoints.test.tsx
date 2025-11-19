import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";

describe("Narrative bullet points rendering", () => {
  it("renders bullet points (•) in Story Overlay for step 1 (Normal State)", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    // Click START to go to step 1
    await user.click(await screen.findByRole("button", { name: /START/i }));

    // Find the story overlay
    const storyOverlay = screen.getByLabelText(/Demo narrative/i);
    expect(storyOverlay).toBeInTheDocument();

    // Verify the title is correct
    expect(screen.getByText(/NORMAL: Fleet Operations Running Smooth/i)).toBeInTheDocument();

    // CRITICAL TEST: Verify bullet points are visible in the rendered HTML
    // Step 1 body contains: "• Drivers sober and trained"
    const storyBody = storyOverlay.querySelector('p');
    expect(storyBody).toBeInTheDocument();

    // Check that the bullet character (•) is present in the rendered content
    expect(storyBody?.textContent).toContain('•');
    expect(storyBody?.textContent).toContain('Drivers sober and trained');
    expect(storyBody?.textContent).toContain('Vehicles maintained and inspected');
    expect(storyBody?.textContent).toContain('ADAS systems calibrated');
  });

  it("renders bullet points (•) in Story Overlay for step 2 (Six Threats)", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    // Navigate to step 2
    await user.click(await screen.findByRole("button", { name: /START/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));

    const storyOverlay = screen.getByLabelText(/Demo narrative/i);
    const storyBody = storyOverlay.querySelector('p');

    // Step 2 has multiple bullet points with emojis
    expect(storyBody?.textContent).toContain('•');
    expect(storyBody?.textContent).toContain('Intoxicated driver');
    expect(storyBody?.textContent).toContain('Sensor drift');
    expect(storyBody?.textContent).toContain('Distraction');
  });

  it("renders bullet points (•) in Story Overlay for step 5 (Prevention: Weather)", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    // Navigate to step 5
    await user.click(await screen.findByRole("button", { name: /START/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));

    const storyOverlay = screen.getByLabelText(/Demo narrative/i);
    const storyBody = storyOverlay.querySelector('p');

    // Step 5 has prevention barriers with bullet points
    expect(storyBody?.textContent).toContain('•');
    expect(storyBody?.textContent).toContain('Hourly weather alerts');
    expect(storyBody?.textContent).toContain('Schedule adjustments');
    expect(storyBody?.textContent).toContain('No-drive thresholds');
  });

  it("renders HTML line breaks (<br>) as actual line breaks", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    await user.click(await screen.findByRole("button", { name: /START/i }));

    const storyOverlay = screen.getByLabelText(/Demo narrative/i);
    const storyBody = storyOverlay.querySelector('p');

    // The HTML should be rendered, not displayed as text
    // If <br> tags are working, innerHTML should contain them
    expect(storyBody?.innerHTML).toContain('<br>');

    // The textContent should NOT contain the literal string "<br>"
    expect(storyBody?.textContent).not.toContain('<br>');
  });

  it("renders bold text using <strong> tags", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    await user.click(await screen.findByRole("button", { name: /START/i }));

    const storyOverlay = screen.getByLabelText(/Demo narrative/i);
    const storyBody = storyOverlay.querySelector('p');

    // Check that <strong> tags are rendered as HTML
    expect(storyBody?.innerHTML).toContain('<strong>');
    expect(storyBody?.querySelector('strong')).toBeInTheDocument();
  });

  it("renders italic text using <em> tags", async () => {
    const user = userEvent.setup();
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="demo" />);

    await user.click(await screen.findByRole("button", { name: /START/i }));

    const storyOverlay = screen.getByLabelText(/Demo narrative/i);
    const storyBody = storyOverlay.querySelector('p');

    // Check that <em> tags are rendered as HTML
    expect(storyBody?.innerHTML).toContain('<em>');
    expect(storyBody?.querySelector('em')).toBeInTheDocument();
    expect(storyBody?.textContent).toContain('Every barrier in place, every shift.');
  });
});

