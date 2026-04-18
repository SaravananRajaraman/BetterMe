"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppStore } from "@/stores/app-store";
import { migrateGuestDataToSupabase, clearGuestData } from "@/lib/guest-storage";

interface FormData {
  email: string;
  password: string;
}

export function EmailAuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const isGuestMode = useAppStore((s) => s.isGuestMode);
  const setGuestMode = useAppStore((s) => s.setGuestMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const clearGuestCookie = () => {
    document.cookie = "guest_mode=; path=/; max-age=0; SameSite=Lax";
  };

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        if (isGuestMode) {
          try {
            await migrateGuestDataToSupabase(supabase);
            clearGuestData();
            clearGuestCookie();
            setGuestMode(false);
          } catch {
            // Migration failure is non-fatal — user still signed up
          }
        }

        toast.success("Check your email for a verification link!");
        reset();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        if (isGuestMode) {
          clearGuestCookie();
          setGuestMode(false);
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="auth-email">Email</Label>
          <Input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="auth-password">Password</Label>
          <Input
            id="auth-password"
            type="password"
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? "Loading..."
            : mode === "signin"
            ? "Sign In"
            : "Create Account"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signin"
          ? "Don't have an account?"
          : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            reset();
          }}
          className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
