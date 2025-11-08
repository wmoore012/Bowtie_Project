import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Legend } from "../Legend";

const STORAGE_KEY = "bowtie.legend.expanded";

describe("Legend collapsible behavior", () => {
  beforeEach(() => {
    // ensure a clean slate without depending on removeItem availability in jsdom/node
    try { window.localStorage?.setItem?.(STORAGE_KEY, ""); } catch {}
  });
  afterEach(() => {
    try { window.localStorage?.setItem?.(STORAGE_KEY, ""); } catch {}
  });

  it("is collapsed by default for first-time users and toggles open", async () => {
    const user = userEvent.setup();
    render(<Legend />);

    // Button shows Show legend when collapsed
    const toggle = screen.getByRole("button", { name: /show legend/i });
    expect(toggle).toBeInTheDocument();

    // Region should be hidden (aria-hidden=true)
    const region = screen.getByRole("region", { hidden: true });
    expect(region).toHaveAttribute("aria-hidden", "true");

    // Toggle open
    await user.click(toggle);
    expect(screen.getByRole("button", { name: /hide legend/i })).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-hidden", "false");
  });

  it("respects persisted collapsed state via localStorage", () => {
    window.localStorage.setItem(STORAGE_KEY, "false");
    render(<Legend />);

    // Starts collapsed
    expect(screen.getByRole("button", { name: /show legend/i })).toBeInTheDocument();
    const region = screen.getByRole("region", { hidden: true });
    expect(region).toHaveAttribute("aria-hidden", "true");
  });
});

