import { create } from "zustand";

export type ToastMessage = {
  id: string;
  type: "success" | "info" | "warning" | "error";
  text: string;
  description?: string;
  duration?: number;
};

type ToastState = {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts.slice(-2), newToast], // keep at most 3 toasts
    }));

    const duration = toast.duration ?? 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (text: string, description?: string) =>
    useToastStore.getState().addToast({ type: "success", text, description }),
  info: (text: string, description?: string) =>
    useToastStore.getState().addToast({ type: "info", text, description }),
  warning: (text: string, description?: string) =>
    useToastStore.getState().addToast({ type: "warning", text, description }),
  error: (text: string, description?: string) =>
    useToastStore.getState().addToast({ type: "error", text, description }),
};
