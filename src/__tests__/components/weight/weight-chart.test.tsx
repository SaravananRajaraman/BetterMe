import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { WeightChart } from "@/components/weight/weight-chart";
import { useWeightEntries } from "@/hooks/use-weight";

vi.mock("@/hooks/use-weight");

const mockUseWeightEntries = useWeightEntries as any;

describe("WeightChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", () => {
    mockUseWeightEntries.mockReturnValue({ data: [], isLoading: true });
    const { container } = render(<WeightChart />);
    expect(container.innerHTML).toContain("skeleton");
  });

  it("should render chart with weight data", () => {
    const data = [
      { id: "1", userId: "user1", date: "2024-01-01", weight: 75, unit: "kg", createdAt: new Date() },
      { id: "2", userId: "user1", date: "2024-01-02", weight: 74.5, unit: "kg", createdAt: new Date() },
    ];
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render with empty data", () => {
    mockUseWeightEntries.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should display range filter buttons", () => {
    mockUseWeightEntries.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<WeightChart />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThanOrEqual(3);
  });

  it("should render card structure", () => {
    mockUseWeightEntries.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.innerHTML).toContain("card");
  });

  it("should handle 30 day range", () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      id: `${i}`,
      userId: "user1",
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      weight: 75 - i * 0.1,
      unit: "kg",
      createdAt: new Date(),
    }));
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle 90 day range", () => {
    const data = Array.from({ length: 90 }, (_, i) => ({
      id: `${i}`,
      userId: "user1",
      date: `2024-01-${String((i % 30) + 1).padStart(2, "0")}`,
      weight: 75 - i * 0.05,
      unit: "kg",
      createdAt: new Date(),
    }));
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle all data range", () => {
    const data = Array.from({ length: 365 }, (_, i) => ({
      id: `${i}`,
      userId: "user1",
      date: `2024-01-${String((i % 30) + 1).padStart(2, "0")}`,
      weight: 75 - i * 0.01,
      unit: "kg",
      createdAt: new Date(),
    }));
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should detect weight unit from data", () => {
    const data = [
      { id: "1", userId: "user1", date: "2024-01-01", weight: 165, unit: "lbs", createdAt: new Date() },
    ];
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle declining weight", () => {
    const data = [
      { id: "1", userId: "user1", date: "2024-01-01", weight: 80, unit: "kg", createdAt: new Date() },
      { id: "2", userId: "user1", date: "2024-01-02", weight: 79, unit: "kg", createdAt: new Date() },
      { id: "3", userId: "user1", date: "2024-01-03", weight: 78, unit: "kg", createdAt: new Date() },
    ];
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle fluctuating weight", () => {
    const data = [
      { id: "1", userId: "user1", date: "2024-01-01", weight: 75, unit: "kg", createdAt: new Date() },
      { id: "2", userId: "user1", date: "2024-01-02", weight: 76, unit: "kg", createdAt: new Date() },
      { id: "3", userId: "user1", date: "2024-01-03", weight: 74.5, unit: "kg", createdAt: new Date() },
      { id: "4", userId: "user1", date: "2024-01-04", weight: 75.5, unit: "kg", createdAt: new Date() },
    ];
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle single weight entry", () => {
    const data = [
      { id: "1", userId: "user1", date: "2024-01-01", weight: 75, unit: "kg", createdAt: new Date() },
    ];
    mockUseWeightEntries.mockReturnValue({ data, isLoading: false });
    const { container } = render(<WeightChart />);
    expect(container.firstChild).toBeTruthy();
  });
});
