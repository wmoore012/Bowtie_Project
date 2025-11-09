import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { BowtieGraph } from "../BowtieGraph";
import { highwayDrivingExample } from "../../../domain/scenarios/highway_driving.example";
import * as htmlToImage from "html-to-image";

// Mock html-to-image
vi.mock("html-to-image", () => ({
  toPng: vi.fn(),
}));

describe("Export PNG functionality", () => {
  let mockCreateElement: any;
  let mockClick: any;
  let originalCreateElement: any;

  beforeEach(() => {
    // Mock document.createElement for anchor element
    mockClick = vi.fn();
    originalCreateElement = document.createElement.bind(document);
    mockCreateElement = vi.fn((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: mockClick,
        };
      }
      return originalCreateElement(tag);
    });
    document.createElement = mockCreateElement as any;

    // Mock toPng to return a data URL
    vi.mocked(htmlToImage.toPng).mockResolvedValue("data:image/png;base64,mockImageData");
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
    vi.clearAllMocks();
  });

  it("exports PNG via global event (bowtie:exportPng)", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    // Dispatch the export event directly
    window.dispatchEvent(new CustomEvent("bowtie:exportPng"));

    // Wait for toPng to be called
    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });

    // Verify download was triggered
    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it("uses white background for PNG export", async () => {
    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    // Dispatch the export event directly
    window.dispatchEvent(new CustomEvent("bowtie:exportPng"));

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

    render(<BowtieGraph diagram={highwayDrivingExample} initialMode="builder" />);

    // Dispatch the export event directly
    window.dispatchEvent(new CustomEvent("bowtie:exportPng"));

    // Should not crash - error should be caught
    await waitFor(() => {
      expect(htmlToImage.toPng).toHaveBeenCalled();
    });

    // Click should not have been called due to error
    expect(mockClick).not.toHaveBeenCalled();
  });
});

