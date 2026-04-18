"use client";

import { useEffect, useState } from "react";

interface BuildInfoDisplayProps {
  timestamp: string;
}

export function BuildInfoDisplay({ timestamp }: BuildInfoDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <span className="text-sm text-muted-foreground">
      {new Date(timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    </span>
  );
}
