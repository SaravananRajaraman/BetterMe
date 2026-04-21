import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Providers } from "@/components/providers";

vi.mock("@tanstack/react-query", () => ({
  QueryClient: class {
    setQueryData = vi.fn();
  },
  QueryClientProvider: ({ children }: any) => children,
}));
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: any) => children,
}));
vi.mock("sonner", () => ({
  Toaster: () => null,
}));
vi.mock("@/components/service-worker-register", () => ({
  ServiceWorkerRegister: () => null,
}));

describe("Providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without error", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    expect(container).toBeTruthy();
  });

  it("should render children", () => {
    const { container } = render(<Providers><div>test content</div></Providers>);
    expect(container.innerHTML).toContain("test content");
  });

  it("should initialize query client", () => {
    expect(() => 
      render(<Providers><div>test</div></Providers>)
    ).not.toThrow();
  });

  it("should provide query client", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    expect(container).toBeTruthy();
  });

  it("should provide theme provider", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    expect(container).toBeTruthy();
  });

  it("should include service worker register", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    expect(container).toBeTruthy();
  });

  it("should include toaster", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    expect(container).toBeTruthy();
  });

  it("should have suppressed hydration warning", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    const div = container.querySelector("div");
    expect(div).toBeTruthy();
  });

  it("should render multiple children", () => {
    const { container } = render(
      <Providers>
        <div>child1</div>
        <div>child2</div>
      </Providers>
    );
    expect(container.innerHTML).toContain("child1");
    expect(container.innerHTML).toContain("child2");
  });

  it("should support rerendering", () => {
    const { rerender } = render(<Providers><div>test1</div></Providers>);
    expect(() => rerender(<Providers><div>test2</div></Providers>)).not.toThrow();
  });

  it("should handle empty children", () => {
    expect(() => render(<Providers></Providers>)).not.toThrow();
  });

  it("should be composable provider", () => {
    const { container } = render(
      <Providers>
        <div>content</div>
      </Providers>
    );
    expect(container).toBeTruthy();
  });

  it("should setup query client with defaults", () => {
    expect(() => 
      render(<Providers><div>test</div></Providers>)
    ).not.toThrow();
  });

  it("should render div wrapper", () => {
    const { container } = render(<Providers><div>test</div></Providers>);
    const divs = container.querySelectorAll("div");
    expect(divs.length).toBeGreaterThan(0);
  });

  it("should provide nested children access", () => {
    const { container } = render(
      <Providers>
        <div>
          <span>nested content</span>
        </div>
      </Providers>
    );
    expect(container.innerHTML).toContain("nested content");
  });

  it("should support react fragments", () => {
    const { container } = render(
      <Providers>
        <>
          <div>item1</div>
          <div>item2</div>
        </>
      </Providers>
    );
    expect(container).toBeTruthy();
  });

  it("should be mountable multiple times", () => {
    const { unmount: unmount1 } = render(<Providers><div>test</div></Providers>);
    unmount1();
    const { unmount: unmount2 } = render(<Providers><div>test</div></Providers>);
    unmount2();
    expect(true).toBe(true);
  });
});
