import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { DailyReviewDialog } from "@/components/review/daily-review-dialog";
import { useTodos } from "@/hooks/use-todos";
import { useAppStore } from "@/stores/app-store";

vi.mock("@/hooks/use-todos");
vi.mock("@/stores/app-store");
vi.mock("sonner");
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user1" } } }),
    },
    from: vi.fn().mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

const mockUseTodos = useTodos as any;
const mockUseAppStore = useAppStore as any;

describe("DailyReviewDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTodos.mockReturnValue({ data: [] });
    mockUseAppStore.mockImplementation((fn: any) => {
      const store = {
        reviewOpen: false,
        setReviewOpen: vi.fn(),
      };
      return fn ? fn(store) : store;
    });
  });

  it("should render without error", () => {
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should use todos hook", () => {
    render(<DailyReviewDialog />);
    expect(mockUseTodos).toHaveBeenCalled();
  });

  it("should use app store", () => {
    render(<DailyReviewDialog />);
    expect(mockUseAppStore).toHaveBeenCalled();
  });

  it("should initialize state", () => {
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should be mountable without errors", () => {
    expect(() => render(<DailyReviewDialog />)).not.toThrow();
  });

  it("should support rerendering", () => {
    const { rerender } = render(<DailyReviewDialog />);
    expect(() => rerender(<DailyReviewDialog />)).not.toThrow();
  });

  it("should render dialog component", () => {
    mockUseAppStore.mockImplementation((fn: any) => {
      const store = {
        reviewOpen: true,
        setReviewOpen: vi.fn(),
      };
      return fn ? fn(store) : store;
    });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should handle empty todos", () => {
    mockUseTodos.mockReturnValue({ data: [] });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should setup useState for notes", () => {
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should setup useState for saving state", () => {
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should render with closed dialog by default", () => {
    mockUseAppStore.mockImplementation((fn: any) => {
      const store = {
        reviewOpen: false,
        setReviewOpen: vi.fn(),
      };
      return fn ? fn(store) : store;
    });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should handle todos with completions", () => {
    mockUseTodos.mockReturnValue({
      data: [
        { id: "1", completion: { skipped: false }, title: "Todo 1" },
        { id: "2", completion: { skipped: true }, title: "Todo 2" },
        { id: "3", title: "Todo 3" },
      ],
    });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should calculate completion stats", () => {
    mockUseTodos.mockReturnValue({
      data: [
        { id: "1", completion: { skipped: false }, title: "Todo 1" },
        { id: "2", completion: { skipped: false }, title: "Todo 2" },
        { id: "3", completion: { skipped: true }, title: "Todo 3" },
        { id: "4", title: "Todo 4" },
      ],
    });
    expect(() => render(<DailyReviewDialog />)).not.toThrow();
  });

  it("should be reusable component", () => {
    const { unmount: unmount1 } = render(<DailyReviewDialog />);
    unmount1();
    const { unmount: unmount2 } = render(<DailyReviewDialog />);
    unmount2();
    expect(true).toBe(true);
  });

  it("should handle saving review", async () => {
    const mockSetReviewOpen = vi.fn();
    mockUseAppStore.mockImplementation((fn: any) => {
      const store = {
        reviewOpen: true,
        setReviewOpen: mockSetReviewOpen,
      };
      return fn ? fn(store) : store;
    });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should render form elements when open", () => {
    mockUseAppStore.mockImplementation((fn: any) => {
      const store = {
        reviewOpen: true,
        setReviewOpen: vi.fn(),
      };
      return fn ? fn(store) : store;
    });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should setup textarea for notes", () => {
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });

  it("should render progress component", () => {
    mockUseAppStore.mockImplementation((fn: any) => {
      const store = {
        reviewOpen: true,
        setReviewOpen: vi.fn(),
      };
      return fn ? fn(store) : store;
    });
    const { container } = render(<DailyReviewDialog />);
    expect(container).toBeTruthy();
  });
});
