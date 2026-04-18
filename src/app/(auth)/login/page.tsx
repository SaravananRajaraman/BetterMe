import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { ContinueAsGuest } from "@/components/auth/continue-as-guest";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">✨ BetterMe</h1>
          <p className="text-muted-foreground">
            Track your daily habits. Build better routines.
          </p>
        </div>

        {/* Sign in card */}
        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5">
          <div className="space-y-2 text-center">
            <h2 className="text-lg font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your journey
            </p>
          </div>

          <GoogleSignInButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <EmailAuthForm />

          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Continue as guest */}
        <ContinueAsGuest />

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl">📋</div>
            <p className="text-xs text-muted-foreground">Daily Habits</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">📊</div>
            <p className="text-xs text-muted-foreground">Analytics</p>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🔥</div>
            <p className="text-xs text-muted-foreground">Streaks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
