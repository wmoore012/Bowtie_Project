import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "../Sidebar";

describe("Sidebar inline dropdown panels", () => {
  it("renders sidebar in expanded state with dropdown triggers", () => {
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: /toggle filters panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open actions panel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /open export panel/i })).toBeInTheDocument();
  });

  it("does not show dropdown content initially", () => {
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    expect(screen.queryByRole("region", { name: /filters/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /actions/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: /export/i })).not.toBeInTheDocument();
  });

  it("opens filters dropdown when filters button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    expect(screen.getByRole("region", { name: /filters/i })).toBeInTheDocument();
    expect(filtersButton).toHaveAttribute("aria-expanded", "true");
  });

  it("opens actions dropdown when actions button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const actionsButton = screen.getByRole("button", { name: /open actions panel/i });
    await user.click(actionsButton);

    expect(screen.getByRole("region", { name: /actions/i })).toBeInTheDocument();
    expect(actionsButton).toHaveAttribute("aria-expanded", "true");
  });

  it("opens export dropdown when export button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const exportButton = screen.getByRole("button", { name: /open export panel/i });
    await user.click(exportButton);

    expect(screen.getByRole("region", { name: /export/i })).toBeInTheDocument();
    expect(exportButton).toHaveAttribute("aria-expanded", "true");
  });

  it("implements accordion behavior - only one dropdown open at a time", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    // Open filters
    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);
    expect(screen.getByRole("region", { name: /filters/i })).toBeInTheDocument();

    // Open actions - filters should close
    const actionsButton = screen.getByRole("button", { name: /open actions panel/i });
    await user.click(actionsButton);
    expect(screen.queryByRole("region", { name: /filters/i })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /actions/i })).toBeInTheDocument();

    // Open export - actions should close
    const exportButton = screen.getByRole("button", { name: /open export panel/i });
    await user.click(exportButton);
    expect(screen.queryByRole("region", { name: /actions/i })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: /export/i })).toBeInTheDocument();
  });

  it("closes dropdown when clicking the same button again", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    
    // Open
    await user.click(filtersButton);
    expect(screen.getByRole("region", { name: /filters/i })).toBeInTheDocument();

    // Close
    await user.click(filtersButton);
    expect(screen.queryByRole("region", { name: /filters/i })).not.toBeInTheDocument();
  });

  it("closes dropdown when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);
    expect(screen.getByRole("region", { name: /filters/i })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: /filters/i })).not.toBeInTheDocument();
  });

  it("shows chevron indicator that changes based on dropdown state", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    
    // Closed state - should show right arrow
    expect(filtersButton.textContent).toContain("▶");

    // Open
    await user.click(filtersButton);
    expect(filtersButton.textContent).toContain("▼");

    // Close
    await user.click(filtersButton);
    expect(filtersButton.textContent).toContain("▶");
  });

  it("export dropdown contains Export PNG button", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const exportButton = screen.getByRole("button", { name: /open export panel/i });
    await user.click(exportButton);

    const exportPngButton = screen.getByRole("button", { name: /export png/i });
    expect(exportPngButton).toBeInTheDocument();
  });

  it("actions dropdown contains Clear Diagram button", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const actionsButton = screen.getByRole("button", { name: /open actions panel/i });
    await user.click(actionsButton);

    const clearButton = screen.getByRole("button", { name: /clear diagram/i });
    expect(clearButton).toBeInTheDocument();
  });

  it("dispatches bowtie:exportPng event when Export PNG is clicked", async () => {
    const user = userEvent.setup();
    const dispatchSpy = vi.fn();
    window.dispatchEvent = dispatchSpy;

    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const exportButton = screen.getByRole("button", { name: /open export panel/i });
    await user.click(exportButton);

    const exportPngButton = screen.getByRole("button", { name: /export png/i });
    await user.click(exportPngButton);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "bowtie:exportPng" })
    );
  });

  it("closes dropdown after Export PNG is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const exportButton = screen.getByRole("button", { name: /open export panel/i });
    await user.click(exportButton);

    const exportPngButton = screen.getByRole("button", { name: /export png/i });
    await user.click(exportPngButton);

    expect(screen.queryByRole("region", { name: /export/i })).not.toBeInTheDocument();
  });

  it("does not show dropdowns when sidebar is collapsed", () => {
    render(<Sidebar collapsed={true} onToggle={vi.fn()} />);

    // Buttons should exist but no labels or chevrons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);

    // No dropdown regions should be visible
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("has proper ARIA attributes for accessibility", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });

    // Initially closed
    expect(filtersButton).toHaveAttribute("aria-expanded", "false");

    // Open
    await user.click(filtersButton);
    expect(filtersButton).toHaveAttribute("aria-expanded", "true");

    const dropdown = screen.getByRole("region", { name: /filters/i });
    expect(dropdown).toBeInTheDocument();
  });
});

describe("Filter chips in Filters dropdown", () => {
  it("renders 6 role filter chips when Filters dropdown is open", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    expect(screen.getByRole("switch", { name: /toggle human filter/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /toggle supervisor filter/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /toggle policy filter/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /toggle maintenance filter/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /toggle active hardware filter/i })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /toggle operations filter/i })).toBeInTheDocument();
  });

  it("toggles chip selected state when clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    expect(humanChip).toHaveAttribute("aria-checked", "false");

    await user.click(humanChip);
    expect(humanChip).toHaveAttribute("aria-checked", "true");

    await user.click(humanChip);
    expect(humanChip).toHaveAttribute("aria-checked", "false");
  });

  it("allows multiple chips to be selected simultaneously", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    const policyChip = screen.getByRole("switch", { name: /toggle policy filter/i });

    await user.click(humanChip);
    await user.click(policyChip);

    expect(humanChip).toHaveAttribute("aria-checked", "true");
    expect(policyChip).toHaveAttribute("aria-checked", "true");
  });

  it("dispatches bowtie:filterChanged event with selected roles", async () => {
    const user = userEvent.setup();
    const dispatchSpy = vi.fn();
    window.dispatchEvent = dispatchSpy;

    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    await user.click(humanChip);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "bowtie:filterChanged",
        detail: expect.objectContaining({
          roles: expect.arrayContaining(["Human"])
        })
      })
    );
  });

  it("maintains filter state when dropdown is closed and reopened", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });

    // Open and select a chip
    await user.click(filtersButton);
    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    await user.click(humanChip);
    expect(humanChip).toHaveAttribute("aria-checked", "true");

    // Close dropdown
    await user.click(filtersButton);

    // Reopen and verify state persisted
    await user.click(filtersButton);
    const humanChipAgain = screen.getByRole("switch", { name: /toggle human filter/i });
    expect(humanChipAgain).toHaveAttribute("aria-checked", "true");
  });

  it("supports keyboard navigation with Space key", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    humanChip.focus();

    await user.keyboard(" "); // Space key
    expect(humanChip).toHaveAttribute("aria-checked", "true");
  });

  it("shows Clear All Filters button when filters are selected", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    // Initially no clear button
    expect(screen.queryByRole("button", { name: /clear all filters/i })).not.toBeInTheDocument();

    // Select a chip
    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    await user.click(humanChip);

    // Clear button should appear
    expect(screen.getByRole("button", { name: /clear all filters/i })).toBeInTheDocument();
  });

  it("clears all filters when Clear All Filters button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar collapsed={false} onToggle={vi.fn()} />);

    const filtersButton = screen.getByRole("button", { name: /toggle filters panel/i });
    await user.click(filtersButton);

    // Select multiple chips
    const humanChip = screen.getByRole("switch", { name: /toggle human filter/i });
    const policyChip = screen.getByRole("switch", { name: /toggle policy filter/i });
    await user.click(humanChip);
    await user.click(policyChip);

    expect(humanChip).toHaveAttribute("aria-checked", "true");
    expect(policyChip).toHaveAttribute("aria-checked", "true");

    // Click clear button
    const clearButton = screen.getByRole("button", { name: /clear all filters/i });
    await user.click(clearButton);

    // All chips should be deselected
    expect(humanChip).toHaveAttribute("aria-checked", "false");
    expect(policyChip).toHaveAttribute("aria-checked", "false");
  });
});

