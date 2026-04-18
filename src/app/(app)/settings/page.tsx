"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BuildInfoDisplay } from "@/components/build-info-display";
import { useRouter } from "next/navigation";
import type { Database, Profile } from "@/lib/types";
import {
  BUILD_VERSION,
  COMMIT_HASH,
  BUILD_TIMESTAMP,
  BUILD_ENVIRONMENT,
} from "@/lib/build-info";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export default function SettingsPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { permission, isSubscribed, subscribe, unsubscribe } =
    useNotifications();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<Profile | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return data;
    },
  });

  const [reviewTime, setReviewTime] = useState("20:00");

  useEffect(() => {
    if (profile?.review_time) {
      setReviewTime(profile.review_time);
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (updates: ProfileUpdate) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Settings saved!");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred theme
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="review-time">Daily Review Time</Label>
              <p className="text-sm text-muted-foreground">
                When to prompt your daily review
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="review-time"
                type="time"
                value={reviewTime}
                onChange={(e) => setReviewTime(e.target.value)}
                className="w-32"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  updateProfile.mutate({ review_time: reviewTime })
                }
              >
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                {permission === "denied"
                  ? "Notifications are blocked in your browser"
                  : "Receive reminders for your todos"}
              </p>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={(checked) =>
                checked ? subscribe() : unsubscribe()
              }
              disabled={permission === "denied"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm font-medium">v{BUILD_VERSION}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Commit</span>
            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
              {COMMIT_HASH}
            </code>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Built</span>
            <BuildInfoDisplay timestamp={BUILD_TIMESTAMP} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Environment</span>
            <span className="text-xs font-medium uppercase tracking-wide">
              {BUILD_ENVIRONMENT}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
