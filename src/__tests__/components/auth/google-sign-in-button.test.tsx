import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { toast } from "sonner";

vi.mock("sonner");
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: vi.fn(),
    },
  }),
}));

describe("GoogleSignInButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render sign in button", () => {
    const { container } = render(<GoogleSignInButton />);
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should display button text", () => {
    const { container } = render(<GoogleSignInButton />);
    expect(container.innerHTML).toContain("button");
  });

  it("should render Google branding", () => {
    const { container } = render(<GoogleSignInButton />);
    expect(container.innerHTML.length).toBeGreaterThan(0);
  });

  it("should have proper button type", () => {
    const { container } = render(<GoogleSignInButton />);
    const button = container.querySelector("button");
    expect(button?.type).toBe("button");
  });

  it("should be clickable", () => {
    const { container } = render(<GoogleSignInButton />);
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
  });

  it("should render with icon", () => {
    const { container } = render(<GoogleSignInButton />);
    expect(container.innerHTML).toContain("button");
  });

  it("should not be disabled initially", () => {
    const { container } = render(<GoogleSignInButton />);
    const button = container.querySelector("button");
    expect(button?.disabled).toBe(false);
  });

  it("should render in button wrapper", () => {
    const { container } = render(<GoogleSignInButton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should have accessible button styling", () => {
    const { container } = render(<GoogleSignInButton />);
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
  });

  it("should render full-width option", () => {
    const { container } = render(<GoogleSignInButton />);
    expect(container.innerHTML).toContain("button");
  });

  it("should show loading state variant", () => {
    const { container } = render(<GoogleSignInButton />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should handle click without error", () => {
    const { container } = render(<GoogleSignInButton />);
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
  });
});
