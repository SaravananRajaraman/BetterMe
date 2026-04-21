import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MonthlyHeatmap } from "@/components/analytics/monthly-heatmap";

describe("MonthlyHeatmap", () => {
  beforeEach(() => {
    // Setup before each test
  });

  it("should render loading state with empty data", () => {
    const { container } = render(<MonthlyHeatmap data={[]} month={0} year={2024} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render heatmap when data provided", () => {
    const data = [
      { date: "2024-01-01", completedCount: 5, totalTodos: 10, completionRate: 50, skippedCount: 1, missedCount: 4 },
      { date: "2024-01-02", completedCount: 0, totalTodos: 10, completionRate: 0, skippedCount: 0, missedCount: 10 },
    ];
    const { container } = render(<MonthlyHeatmap data={data} month={0} year={2024} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with empty month array", () => {
    const { container } = render(<MonthlyHeatmap data={[]} month={0} year={2024} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render full month data", () => {
    const monthData = Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      completedCount: Math.floor(Math.random() * 10),
      totalTodos: 10,
      completionRate: Math.floor(Math.random() * 101),
      skippedCount: 0,
      missedCount: 5,
    }));
    const { container } = render(<MonthlyHeatmap data={monthData} month={0} year={2024} />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render all completed month", () => {
    const data = Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      completedCount: 10,
      totalTodos: 10,
      completionRate: 100,
      skippedCount: 0,
      missedCount: 0,
    }));
    const { container } = render(<MonthlyHeatmap data={data} month={0} year={2024} />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render no completed month", () => {
    const data = Array.from({ length: 31 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      completedCount: 0,
      totalTodos: 10,
      completionRate: 0,
      skippedCount: 0,
      missedCount: 10,
    }));
    const { container } = render(<MonthlyHeatmap data={data} month={0} year={2024} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render grid container", () => {
    const { container } = render(<MonthlyHeatmap data={[]} month={0} year={2024} />);
    expect(container.innerHTML).toContain("grid");
  });

  it("should render with varying completion rates", () => {
    const data = [
      { date: "2024-01-01", completedCount: 10, totalTodos: 10, completionRate: 100, skippedCount: 0, missedCount: 0 },
      { date: "2024-01-02", completedCount: 5, totalTodos: 10, completionRate: 50, skippedCount: 0, missedCount: 5 },
      { date: "2024-01-03", completedCount: 0, totalTodos: 10, completionRate: 0, skippedCount: 0, missedCount: 10 },
      { date: "2024-01-04", completedCount: 8, totalTodos: 10, completionRate: 80, skippedCount: 1, missedCount: 1 },
      { date: "2024-01-05", completedCount: 7, totalTodos: 10, completionRate: 70, skippedCount: 0, missedCount: 3 },
      { date: "2024-01-06", completedCount: 9, totalTodos: 10, completionRate: 90, skippedCount: 0, missedCount: 1 },
    ];
    const { container } = render(<MonthlyHeatmap data={data} month={0} year={2024} />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle high completion rates", () => {
    const data = [
      { date: "2024-01-01", completedCount: 100, totalTodos: 100, completionRate: 100, skippedCount: 0, missedCount: 0 },
      { date: "2024-01-02", completedCount: 95, totalTodos: 100, completionRate: 95, skippedCount: 0, missedCount: 5 },
    ];
    const { container } = render(<MonthlyHeatmap data={data} month={0} year={2024} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render day headers", () => {
    const { container } = render(<MonthlyHeatmap data={[]} month={0} year={2024} />);
    const text = container.textContent;
    expect(text).toContain("Mo");
  });

  it("should handle different months and years", () => {
    const data: any[] = [];
    const { container: container1 } = render(<MonthlyHeatmap data={data} month={0} year={2024} />);
    const { container: container2 } = render(<MonthlyHeatmap data={data} month={11} year={2024} />);
    expect(container1.firstChild).toBeTruthy();
    expect(container2.firstChild).toBeTruthy();
  });
});
