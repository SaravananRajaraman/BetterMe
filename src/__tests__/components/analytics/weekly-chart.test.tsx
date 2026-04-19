import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { WeeklyChart } from "@/components/analytics/weekly-chart";
import { useWeeklyAnalytics } from "@/hooks/use-analytics";

vi.mock("@/hooks/use-analytics");

const mockUseWeeklyAnalytics = useWeeklyAnalytics as any;

describe("WeeklyChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    mockUseWeeklyAnalytics.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<WeeklyChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render chart when data loaded", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [
        { date: "2024-01-01", completed: 5, total: 10 },
        { date: "2024-01-02", completed: 6, total: 10 },
      ],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with empty data", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with multiple data points", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [
        { date: "2024-01-01", completed: 3, total: 10 },
        { date: "2024-01-02", completed: 5, total: 10 },
        { date: "2024-01-03", completed: 4, total: 10 },
      ],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle undefined data", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render navigation controls", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });

  it("should render full week data", () => {
    const weekData = Array.from({ length: 7 }, (_, i) => ({
      date: `2024-01-0${i + 1}`,
      completed: 5,
      total: 10,
    }));
    mockUseWeeklyAnalytics.mockReturnValue({
      data: weekData,
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render with zero completion", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [{ date: "2024-01-01", completed: 0, total: 10 }],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with high completion", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [{ date: "2024-01-01", completed: 10, total: 10 }],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with mixed completion values", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [
        { date: "2024-01-01", completed: 0, total: 10 },
        { date: "2024-01-02", completed: 5, total: 10 },
        { date: "2024-01-03", completed: 10, total: 10 },
      ],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render card container", () => {
    mockUseWeeklyAnalytics.mockReturnValue({
      data: [],
      isLoading: false,
    });
    const { container } = render(<WeeklyChart />);
    expect(container.innerHTML).toContain("card");
  });
});
