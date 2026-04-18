"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ContinueAsGuest() {
  const router = useRouter();

  const handleGuestMode = () => {
    document.cookie = "guest_mode=true; path=/; max-age=604800; SameSite=Lax";
    router.push("/dashboard");
  };

  return (
    <div className="text-center space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={handleGuestMode}
      >
        Continue as guest
      </Button>
      <p className="text-xs text-muted-foreground">
        Data is saved locally. Sign up anytime to keep it safe.
      </p>
    </div>
  );
}
