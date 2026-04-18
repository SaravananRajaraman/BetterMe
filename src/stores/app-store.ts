import { create } from "zustand";

interface AppState {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  addTodoOpen: boolean;
  setAddTodoOpen: (open: boolean) => void;
  editTodoId: string | null;
  setEditTodoId: (id: string | null) => void;
  reviewOpen: boolean;
  setReviewOpen: (open: boolean) => void;
  isGuestMode: boolean;
  setGuestMode: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  addTodoOpen: false,
  setAddTodoOpen: (open) => set({ addTodoOpen: open }),
  editTodoId: null,
  setEditTodoId: (id) => set({ editTodoId: id }),
  reviewOpen: false,
  setReviewOpen: (open) => set({ reviewOpen: open }),
  isGuestMode: false,
  setGuestMode: (v) => set({ isGuestMode: v }),
}));
