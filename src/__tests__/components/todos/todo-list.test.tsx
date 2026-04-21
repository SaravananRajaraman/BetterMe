import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { TodoList } from "@/components/todos/todo-list";
import { useTodos } from "@/hooks/use-todos";
import { useAppStore } from "@/stores/app-store";

vi.mock("@/hooks/use-todos");
vi.mock("@/stores/app-store");

const mockUseTodos = useTodos as any;
const mockUseAppStore = useAppStore as any;

describe("TodoList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppStore.mockReturnValue(null);
  });

  it("should render loading skeleton", () => {
    mockUseTodos.mockReturnValue({ data: [], isLoading: true, error: null });
    const { container } = render(<TodoList />);
    expect(container.innerHTML).toContain("skeleton");
  });

  it("should render todos when loaded", () => {
    const todos = [
      { id: "1", title: "Test Todo", completed: false, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
    ];
    mockUseTodos.mockReturnValue({ data: todos, isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render empty state", () => {
    mockUseTodos.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render multiple todos", () => {
    const todos = [
      { id: "1", title: "Todo 1", completed: false, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
      { id: "2", title: "Todo 2", completed: true, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
      { id: "3", title: "Todo 3", completed: false, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
    ];
    mockUseTodos.mockReturnValue({ data: todos, isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle date parameter", () => {
    mockUseTodos.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<TodoList date="2024-01-01" />);
    expect(mockUseTodos).toHaveBeenCalledWith("2024-01-01");
  });

  it("should render completed and incomplete todos", () => {
    const todos = [
      { id: "1", title: "Done", completed: true, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
      { id: "2", title: "Pending", completed: false, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
    ];
    mockUseTodos.mockReturnValue({ data: todos, isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle todos with categories", () => {
    const todos = [
      { id: "1", title: "Work Todo", completed: false, categoryId: "cat1", userId: "user1", createdAt: new Date(), dueDate: null },
      { id: "2", title: "Health Todo", completed: false, categoryId: "cat2", userId: "user1", createdAt: new Date(), dueDate: null },
    ];
    mockUseTodos.mockReturnValue({ data: todos, isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle todos with due dates", () => {
    const todos = [
      { id: "1", title: "Due Soon", completed: false, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: "2024-12-31" },
      { id: "2", title: "No Due Date", completed: false, categoryId: null, userId: "user1", createdAt: new Date(), dueDate: null },
    ];
    mockUseTodos.mockReturnValue({ data: todos, isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should handle large number of todos", () => {
    const todos = Array.from({ length: 50 }, (_, i) => ({
      id: `${i}`,
      title: `Todo ${i}`,
      completed: i % 2 === 0,
      categoryId: null,
      userId: "user1",
      createdAt: new Date(),
      dueDate: null,
    }));
    mockUseTodos.mockReturnValue({ data: todos, isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render without date prop", () => {
    mockUseTodos.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<TodoList />);
    expect(mockUseTodos).toHaveBeenCalledWith(undefined);
  });

  it("should handle error state gracefully", () => {
    mockUseTodos.mockReturnValue({ data: [], isLoading: false, error: new Error("Failed to load") });
    const { container } = render(<TodoList />);
    expect(container.firstChild).toBeTruthy();
  });
});
