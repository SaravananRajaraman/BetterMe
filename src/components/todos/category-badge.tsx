"use client";

import { Badge } from "@/components/ui/badge";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  CATEGORY_COLORS_BG_LIGHT,
  CATEGORY_COLORS_TEXT,
} from "@/lib/constants";

interface CategoryBadgeProps {
  category: Category | null;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  if (!category) return null;

  const bgClass = CATEGORY_COLORS_BG_LIGHT[category.color] || "bg-muted";
  const textClass = CATEGORY_COLORS_TEXT[category.color] || "text-foreground";

  return (
    <Badge
      variant="secondary"
      className={cn("text-xs font-medium", bgClass, textClass, className)}
    >
      {category.name}
    </Badge>
  );
}
