export const DEFAULT_CATEGORIES = [
  { name: "Health", color: "#22c55e", icon: "heart" },
  { name: "Work", color: "#3b82f6", icon: "briefcase" },
  { name: "Personal", color: "#a855f7", icon: "user" },
  { name: "Learning", color: "#f59e0b", icon: "book-open" },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  "#22c55e": "bg-green-500",
  "#3b82f6": "bg-blue-500",
  "#a855f7": "bg-purple-500",
  "#f59e0b": "bg-amber-500",
  "#ef4444": "bg-red-500",
  "#06b6d4": "bg-cyan-500",
  "#ec4899": "bg-pink-500",
  "#84cc16": "bg-lime-500",
};

export const CATEGORY_COLORS_TEXT: Record<string, string> = {
  "#22c55e": "text-green-500",
  "#3b82f6": "text-blue-500",
  "#a855f7": "text-purple-500",
  "#f59e0b": "text-amber-500",
  "#ef4444": "text-red-500",
  "#06b6d4": "text-cyan-500",
  "#ec4899": "text-pink-500",
  "#84cc16": "text-lime-500",
};

export const CATEGORY_COLORS_BG_LIGHT: Record<string, string> = {
  "#22c55e": "bg-green-100 dark:bg-green-950",
  "#3b82f6": "bg-blue-100 dark:bg-blue-950",
  "#a855f7": "bg-purple-100 dark:bg-purple-950",
  "#f59e0b": "bg-amber-100 dark:bg-amber-950",
  "#ef4444": "bg-red-100 dark:bg-red-950",
  "#06b6d4": "bg-cyan-100 dark:bg-cyan-950",
  "#ec4899": "bg-pink-100 dark:bg-pink-950",
  "#84cc16": "bg-lime-100 dark:bg-lime-950",
};
