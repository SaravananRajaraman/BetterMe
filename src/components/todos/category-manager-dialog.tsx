"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { CATEGORY_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Heart,
  Briefcase,
  User,
  BookOpen,
  Star,
  Target,
  Dumbbell,
  Coffee,
  Home,
  Music,
  Flame,
  Leaf,
  Brain,
  Zap,
  ShoppingCart,
  Pencil,
  Trash2,
  Plus,
  Folder,
} from "lucide-react";
import type { Category } from "@/lib/types";

const ICON_OPTIONS = [
  { name: "heart", Icon: Heart },
  { name: "briefcase", Icon: Briefcase },
  { name: "user", Icon: User },
  { name: "book-open", Icon: BookOpen },
  { name: "star", Icon: Star },
  { name: "target", Icon: Target },
  { name: "dumbbell", Icon: Dumbbell },
  { name: "coffee", Icon: Coffee },
  { name: "home", Icon: Home },
  { name: "music", Icon: Music },
  { name: "flame", Icon: Flame },
  { name: "leaf", Icon: Leaf },
  { name: "brain", Icon: Brain },
  { name: "zap", Icon: Zap },
  { name: "shopping-cart", Icon: ShoppingCart },
  { name: "folder", Icon: Folder },
] as const;

const COLOR_OPTIONS = Object.keys(CATEGORY_COLORS);

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Max 50 characters"),
  color: z.string().min(1, "Color is required"),
  icon: z.string().min(1, "Icon is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function IconComponent({ name, className }: { name: string; className?: string }) {
  const match = ICON_OPTIONS.find((o) => o.name === name);
  if (!match) return <Folder className={className} />;
  const { Icon } = match;
  return <Icon className={className} />;
}

function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting,
}: {
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      color: defaultValues?.color ?? COLOR_OPTIONS[0],
      icon: defaultValues?.icon ?? "folder",
    },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input
          id="cat-name"
          placeholder="e.g., Fitness"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setValue("color", color)}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                selectedColor === color
                  ? "border-foreground scale-110"
                  : "border-transparent"
              )}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-8 gap-1.5">
          {ICON_OPTIONS.map(({ name, Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => setValue("icon", name)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                selectedIcon === name
                  ? "border-foreground bg-accent"
                  : "border-transparent hover:border-border hover:bg-accent/50"
              )}
              aria-label={name}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/40">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full"
          style={{ backgroundColor: selectedColor }}
        >
          <IconComponent name={selectedIcon} className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="text-sm font-medium">
          {watch("name") || "Category name"}
        </span>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function CategoryRow({
  category,
  canDelete,
  onDeleted,
}: {
  category: Category;
  canDelete: boolean;
  onDeleted: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleUpdate = async (data: CategoryFormData) => {
    await updateCategory.mutateAsync({ id: category.id, ...data });
    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteCategory.mutateAsync(category.id);
    onDeleted();
    setConfirmDelete(false);
  };

  if (editing) {
    return (
      <div className="rounded-md border p-3 bg-muted/30">
        <CategoryForm
          defaultValues={{ name: category.name, color: category.color, icon: category.icon }}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
          submitLabel="Update"
          isSubmitting={updateCategory.isPending}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border px-3 py-2.5 group">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: category.color }}
        >
          <IconComponent name={category.icon} className="h-3.5 w-3.5 text-white" />
        </span>
        <span className="flex-1 text-sm font-medium">{category.name}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setConfirmDelete(true)}
            disabled={!canDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{category.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Todos assigned to it will become
              uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface CategoryManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryManagerDialog({
  open,
  onOpenChange,
}: CategoryManagerDialogProps) {
  const [addingNew, setAddingNew] = useState(false);
  const { data: categories } = useCategories();
  const createCategory = useCreateCategory();

  const handleCreate = async (data: CategoryFormData) => {
    await createCategory.mutateAsync(data);
    setAddingNew(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                canDelete={categories.length > 1}
                onDeleted={() => {}}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories yet.
            </p>
          )}
        </div>

        <Separator className="my-2" />

        {addingNew ? (
          <div className="rounded-md border p-3 bg-muted/30">
            <p className="text-sm font-medium mb-1">New Category</p>
            <CategoryForm
              onSubmit={handleCreate}
              onCancel={() => setAddingNew(false)}
              submitLabel="Create"
              isSubmitting={createCategory.isPending}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setAddingNew(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
