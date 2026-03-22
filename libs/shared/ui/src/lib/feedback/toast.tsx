import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        success: 'border-success-200 bg-success-50 text-success-900',
        destructive: 'border-danger-200 bg-danger-50 text-danger-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

const ToastContext = React.createContext<{
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
});

let toastCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(toastVariants({ variant: t.variant }))}
            onOpenChange={(open) => {
              if (!open) removeToast(t.id);
            }}
          >
            <div className="grid gap-1">
              <ToastPrimitive.Title className="text-sm font-semibold">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-sm opacity-90">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
              </svg>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  return {
    toast: ctx.addToast,
    dismiss: ctx.removeToast,
  };
}
