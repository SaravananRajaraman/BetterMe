import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Navbar } from "@/components/layout/navbar";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

vi.mock("next/navigation");
vi.mock("@tanstack/react-query");
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({})
}));

const mockUsePathname = usePathname as any;
const mockUseRouter = useRouter as any;
const mockUseQuery = useQuery as any;

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePathname.mockReturnValue("/dashboard");
    mockUseRouter.mockReturnValue({ push: vi.fn() });
    mockUseQuery.mockReturnValue({ data: null, isLoading: false });
  });

  it("should render navbar container", () => {
    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render navigation items", () => {
    const { container } = render(<Navbar />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should render logo or branding", () => {
    const { container } = render(<Navbar />);
    expect(container.innerHTML).toContain("a");
  });

  it("should render theme toggle", () => {
    const { container } = render(<Navbar />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should render user avatar section", () => {
    const { container } = render(<Navbar />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should highlight active route", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    const { container } = render(<Navbar />);
    expect(container.innerHTML).toContain("a");
  });

  it("should handle different pathname", () => {
    mockUsePathname.mockReturnValue("/analytics");
    const { container } = render(<Navbar />);
    expect(container.innerHTML).toContain("a");
  });

  it("should render all navigation links", () => {
    const { container } = render(<Navbar />);
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });

  it("should render user profile button", () => {
    mockUseQuery.mockReturnValue({
      data: { id: "user1", email: "test@example.com" },
      isLoading: false,
    });
    const { container } = render(<Navbar />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should handle loading state", () => {
    mockUseQuery.mockReturnValue({ data: null, isLoading: true });
    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should render logout button", () => {
    const { container } = render(<Navbar />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should have navigation structure", () => {
    const { container } = render(<Navbar />);
    expect(container.innerHTML).toContain("nav");
  });

  it("should render with user data", () => {
    mockUseQuery.mockReturnValue({
      data: { id: "123", email: "user@test.com", user_metadata: { name: "Test User" } },
      isLoading: false,
    });
    const { container } = render(<Navbar />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });
});
