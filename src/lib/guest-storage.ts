import type { Category, Todo, TodoCompletion, TodoWithCompletion } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

const GUEST_STORAGE_KEY = "betterme-guest-data";

interface GuestData {
  categories: Category[];
  todos: Todo[];
  completions: TodoCompletion[];
  lastPromptDate: string | null;
}

function buildDefaultCategories(): Category[] {
  const now = new Date().toISOString();
  return [
    { id: crypto.randomUUID(), user_id: "guest", name: "Health", color: "#22c55e", icon: "heart", is_default: true, sort_order: 0, created_at: now },
    { id: crypto.randomUUID(), user_id: "guest", name: "Work", color: "#3b82f6", icon: "briefcase", is_default: true, sort_order: 1, created_at: now },
    { id: crypto.randomUUID(), user_id: "guest", name: "Personal", color: "#a855f7", icon: "user", is_default: true, sort_order: 2, created_at: now },
    { id: crypto.randomUUID(), user_id: "guest", name: "Learning", color: "#f59e0b", icon: "book-open", is_default: true, sort_order: 3, created_at: now },
  ];
}

export function getGuestData(): GuestData {
  if (typeof window === "undefined") {
    return { categories: [], todos: [], completions: [], lastPromptDate: null };
  }
  const raw = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!raw) {
    const defaults: GuestData = {
      categories: buildDefaultCategories(),
      todos: [],
      completions: [],
      lastPromptDate: null,
    };
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(raw) as GuestData;
}

export function saveGuestData(data: GuestData): void {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
}

export function clearGuestData(): void {
  localStorage.removeItem(GUEST_STORAGE_KEY);
}

// ---- Query helpers ----

export function getGuestTodosForDate(date: string): TodoWithCompletion[] {
  const data = getGuestData();
  return data.todos
    .filter((t) => t.is_active)
    .map((todo) => {
      const completion =
        data.completions.find(
          (c) => c.todo_id === todo.id && c.completed_date === date
        ) ?? null;
      return {
        ...todo,
        category: data.categories.find((c) => c.id === todo.category_id) ?? null,
        completion,
      };
    });
}

export function getGuestCategories(): Category[] {
  return getGuestData().categories;
}

// ---- Mutation helpers ----

export function createGuestTodo(data: {
  title: string;
  description?: string;
  category_id?: string;
  reminder_time?: string;
}): Todo {
  const guestData = getGuestData();
  const now = new Date().toISOString();
  const newTodo: Todo = {
    id: crypto.randomUUID(),
    user_id: "guest",
    title: data.title,
    description: data.description ?? null,
    category_id: data.category_id ?? null,
    reminder_time: data.reminder_time ?? null,
    is_recurring: true,
    is_active: true,
    created_at: now,
    updated_at: now,
  };
  guestData.todos.push(newTodo);
  saveGuestData(guestData);
  return newTodo;
}

export function updateGuestTodo(
  id: string,
  data: Partial<Pick<Todo, "title" | "description" | "category_id" | "reminder_time" | "is_active">>
): Todo {
  const guestData = getGuestData();
  const idx = guestData.todos.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error("Todo not found");
  guestData.todos[idx] = {
    ...guestData.todos[idx],
    ...data,
    updated_at: new Date().toISOString(),
  };
  saveGuestData(guestData);
  return guestData.todos[idx];
}

export function deleteGuestTodo(id: string): void {
  const guestData = getGuestData();
  guestData.todos = guestData.todos.filter((t) => t.id !== id);
  guestData.completions = guestData.completions.filter((c) => c.todo_id !== id);
  saveGuestData(guestData);
}

export function toggleGuestCompletion(
  todoId: string,
  completed: boolean,
  skipped: boolean,
  date: string
): void {
  const guestData = getGuestData();
  if (completed) {
    const exists = guestData.completions.some(
      (c) => c.todo_id === todoId && c.completed_date === date
    );
    if (!exists) {
      const now = new Date().toISOString();
      guestData.completions.push({
        id: crypto.randomUUID(),
        todo_id: todoId,
        user_id: "guest",
        completed_date: date,
        completed_at: now,
        skipped,
      });
    }
  } else {
    guestData.completions = guestData.completions.filter(
      (c) => !(c.todo_id === todoId && c.completed_date === date)
    );
  }
  saveGuestData(guestData);
}

// ---- Category mutation helpers ----

export function createGuestCategory(data: {
  name: string;
  color: string;
  icon: string;
}): Category {
  const guestData = getGuestData();
  const now = new Date().toISOString();
  const newCategory: Category = {
    id: crypto.randomUUID(),
    user_id: "guest",
    name: data.name,
    color: data.color,
    icon: data.icon,
    is_default: false,
    sort_order: guestData.categories.length,
    created_at: now,
  };
  guestData.categories.push(newCategory);
  saveGuestData(guestData);
  return newCategory;
}

export function updateGuestCategory(
  id: string,
  data: Partial<Pick<Category, "name" | "color" | "icon">>
): Category {
  const guestData = getGuestData();
  const idx = guestData.categories.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Category not found");
  guestData.categories[idx] = { ...guestData.categories[idx], ...data };
  saveGuestData(guestData);
  return guestData.categories[idx];
}

export function deleteGuestCategory(id: string): void {
  const guestData = getGuestData();
  guestData.categories = guestData.categories.filter((c) => c.id !== id);
  // Null out category_id on any todos that referenced this category
  guestData.todos = guestData.todos.map((t) =>
    t.category_id === id ? { ...t, category_id: null } : t
  );
  saveGuestData(guestData);
}

export function updateGuestLastPromptDate(date: string): void {
  const guestData = getGuestData();
  guestData.lastPromptDate = date;
  saveGuestData(guestData);
}

export function getGuestLastPromptDate(): string | null {
  return getGuestData().lastPromptDate;
}

// ---- Migration ----

export async function migrateGuestDataToSupabase(
  supabase: SupabaseClient
): Promise<void> {
  const data = getGuestData();
  if (data.todos.length === 0) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Fetch supabase default categories (created by DB trigger on sign-up)
  const { data: supaCats } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id);

  const categoryIdMap: Record<string, string> = {};

  // Map default guest categories → matching Supabase categories by name
  for (const localCat of data.categories) {
    if (localCat.is_default) {
      const match = supaCats?.find(
        (c) => c.name.toLowerCase() === localCat.name.toLowerCase()
      );
      if (match) categoryIdMap[localCat.id] = match.id;
    } else {
      // Custom guest category — insert into Supabase
      const { data: newCat } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: localCat.name,
          color: localCat.color,
          icon: localCat.icon,
          sort_order: localCat.sort_order,
        })
        .select()
        .single();
      if (newCat) categoryIdMap[localCat.id] = newCat.id;
    }
  }

  // Migrate todos
  const todoIdMap: Record<string, string> = {};
  for (const todo of data.todos) {
    if (!todo.is_active) continue;
    const { data: newTodo } = await supabase
      .from("todos")
      .insert({
        user_id: user.id,
        title: todo.title,
        description: todo.description,
        category_id: todo.category_id
          ? (categoryIdMap[todo.category_id] ?? null)
          : null,
        reminder_time: todo.reminder_time,
        is_recurring: todo.is_recurring,
      })
      .select()
      .single();
    if (newTodo) todoIdMap[todo.id] = newTodo.id;
  }

  // Migrate today's completions
  const today = new Date().toISOString().split("T")[0];
  for (const comp of data.completions.filter((c) => c.completed_date === today)) {
    const newTodoId = todoIdMap[comp.todo_id];
    if (!newTodoId) continue;
    await supabase.from("todo_completions").insert({
      user_id: user.id,
      todo_id: newTodoId,
      completed_date: comp.completed_date,
      skipped: comp.skipped,
    });
  }
}
