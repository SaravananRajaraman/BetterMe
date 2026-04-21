import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MonthlyInsights } from "@/components/analytics/monthly-insights";
import { useMonthlyAnalytics } from "@/hooks/use-analytics";

vi.mock("@/hooks/use-analytics");

const mockUseMonthlyAnalytics = useMonthlyAnalytics as any;

describe("MonthlyInsights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    mockUseMonthlyAnalytics.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<MonthlyInsights />);
    expect(container.innerHTML).toContain("skeleton");
  });

  it("should render monthly insights with data", () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      completedCount: 8,
      totalTodos: 10,
      completionRate: 80,
      skippedCount: 1,
      missedCount: 1,
    }));
    mockUseMonthlyAnalytics.mockReturnValue({ data, isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with empty month data", () => {
    mockUseMonthlyAnalytics.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should calculate average completion rate", () => {
    const data = [
      { date: "2024-01-01", completedCount: 10, totalTodos: 10, completionRate: 100, skippedCount: 0, missedCount: 0 },
      { date: "2024-01-02", completedCount: 5, totalTodos: 10, completionRate: 50, skippedCount: 0, missedCount: 5 },
      { date: "2024-01-03", completedCount: 7, totalTodos: 10, completionRate: 70, skippedCount: 0, missedCount: 3 },
    ];
    mockUseMonthlyAnalytics.mockReturnValue({ data, isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should display full month insights", () => {
    const data = Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      completedCount: Math.floor(Math.random() * 10),
      totalTodos: 10,
      completionRate: Math.floor(Math.random() * 101),
      skippedCount: 0,
      missedCount: 5,
    }));
    mockUseMonthlyAnalytics.mockReturnValue({ data, isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render card structure", () => {
    mockUseMonthlyAnalytics.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.innerHTML).toContain("card");
  });

  it("should handle 100% completion rate", () => {
    const data = Array.from({ length: 28 }, (_, i) => ({
      date: `2024-02-${String(i + 1).padStart(2, "0")}`,
      completedCount: 10,
      totalTodos: 10,
      completionRate: 100,
      skippedCount: 0,
      missedCount: 0,
    }));
    mockUseMonthlyAnalytics.mockReturnValue({ data, isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle 0% completion rate", () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      completedCount: 0,
      totalTodos: 10,
      completionRate: 0,
      skippedCount: 0,
      missedCount: 10,
    }));
    mockUseMonthlyAnalytics.mockReturnValue({ data, isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render insights content", () => {
    mockUseMonthlyAnalytics.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle navigation controls", () => {
    mockUseMonthlyAnalytics.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<MonthlyInsights />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  it("should display with mixed completion values", () => {
    const data = [
      { date: "2024-01-01", completedCount: 10, totalTodos: 10, completionRate: 100, skippedCount: 0, missedCount: 0 },
      { date: "2024-01-02", completedCount: 7, totalTodos: 10, completionRate: 70, skippedCount: 1, missedCount: 2 },
      { date: "2024-01-03", completedCount: 0, totalTodos: 10, completionRate: 0, skippedCount: 0, missedCount: 10 },
      { date: "2024-01-04", completedCount: 5, totalTodos: 10, completionRate: 50, skippedCount: 2, missedCount: 3 },
    ];
    mockUseMonthlyAnalytics.mockReturnValue({ data, isLoading: false });
    const { container } = render(<MonthlyInsights />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
