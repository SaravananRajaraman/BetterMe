import { Navbar } from "@/components/layout/navbar";
import { GuestModeProvider } from "@/components/auth/guest-mode-provider";
import { GuestSignupPrompt } from "@/components/auth/guest-signup-prompt";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <GuestModeProvider />
      <GuestSignupPrompt />
      <Navbar />
      {/* Main content - offset for desktop sidebar, offset for mobile bottom nav */}
      <main className="md:pl-64 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
