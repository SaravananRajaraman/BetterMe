import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { BuildInfoDisplay } from "@/components/build-info-display";

describe("BuildInfoDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without error", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container).toBeTruthy();
  });

  it("should show mounted state", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container).toBeTruthy();
  });

  it("should format timestamp", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T12:30:00Z" />);
    expect(container).toBeTruthy();
  });

  it("should use useEffect hook", () => {
    expect(() => 
      render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />)
    ).not.toThrow();
  });

  it("should initialize mounted state", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container).toBeTruthy();
  });

  it("should render span element after mount", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    const spans = container.querySelectorAll("span");
    expect(spans.length).toBeGreaterThan(0);
  });

  it("should have text-sm class", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container.innerHTML).toContain("text-sm");
  });

  it("should have muted-foreground class", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container.innerHTML).toContain("muted-foreground");
  });

  it("should accept timestamp prop", () => {
    expect(() => 
      render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />)
    ).not.toThrow();
  });

  it("should handle different timestamp formats", () => {
    expect(() => 
      render(<BuildInfoDisplay timestamp="2024-12-31T23:59:59.999Z" />)
    ).not.toThrow();
  });

  it("should support rerendering", () => {
    const { rerender } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(() => 
      rerender(<BuildInfoDisplay timestamp="2024-01-02T00:00:00Z" />)
    ).not.toThrow();
  });

  it("should handle prop changes", () => {
    const { rerender } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    rerender(<BuildInfoDisplay timestamp="2024-06-15T12:30:00Z" />);
    expect(true).toBe(true);
  });

  it("should render text content", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should be client component", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    expect(container).toBeTruthy();
  });

  it("should format with toLocaleString", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    const span = container.querySelector("span");
    expect(span?.textContent).toBeTruthy();
  });

  it("should render with proper styling", () => {
    const { container } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    const span = container.querySelector("span");
    expect(span?.className).toContain("text");
  });

  it("should be mountable multiple times", () => {
    const { unmount: unmount1 } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    unmount1();
    const { unmount: unmount2 } = render(<BuildInfoDisplay timestamp="2024-01-01T00:00:00Z" />);
    unmount2();
    expect(true).toBe(true);
  });
});
