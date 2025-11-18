import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";
import * as htmlToImage from "html-to-image";

// Mock html-to-image
vi.mock("html-to-image", () => ({
  toPng: vi.fn(),
}));

describe("Export PNG functionality", () => {
  beforeEach(() => {
    // Spy on the native anchor click so we can assert that a download was
    // triggered without changing DOM behavior.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    // Mock toPng to return a data URL
    vi.mocked(htmlToImage.toPng).mockResolvedValue("data:image/png;base64,mockImageData");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("exports PNG via global event (bowtie:exportPng)", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent("bowtie:exportPng"));
    });

    // Wait for toPng to be called
    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });

    // Verify download was triggered
    await waitFor(() => {
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    });
  });

  it("uses white background for PNG export", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent("bowtie:exportPng"));
    });

    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ backgroundColor: "#ffffff" })
      );
    });
  });

  it("handles export errors gracefully", async () => {
    // Mock toPng to reject
    vi.mocked(htmlToImage.toPng).mockRejectedValue(new Error("Export failed"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    await act(async () => {
      window.dispatchEvent(new CustomEvent("bowtie:exportPng"));
    });

    // Should not crash - error should be caught
    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });

    // Click should not have been called due to error
    expect(HTMLAnchorElement.prototype.click).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

