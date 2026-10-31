import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, AlertCircle, CheckCircle2, LogOut, Info, Loader2 } from "lucide-react";

export type ConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning" | "primary" | "default";
  icon?: "danger" | "warning" | "success" | "logout" | "info";
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "destructive",
  icon = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const getIcon = () => {
    switch (icon) {
      case "danger":
        return (
          <div className="mx-auto sm:mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
        );
      case "warning":
        return (
          <div className="mx-auto sm:mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-6 w-6" />
          </div>
        );
      case "success":
        return (
          <div className="mx-auto sm:mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        );
      case "logout":
        return (
          <div className="mx-auto sm:mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <LogOut className="h-6 w-6" />
          </div>
        );
      default:
        return (
          <div className="mx-auto sm:mx-0 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
            <Info className="h-6 w-6" />
          </div>
        );
    }
  };

  const getActionClass = () => {
    switch (variant) {
      case "destructive":
        return "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs";
      case "warning":
        return "bg-amber-600 text-white hover:bg-amber-700 shadow-xs";
      case "primary":
      case "default":
      default:
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs";
    }
  };

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    await onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border bg-card p-5 sm:p-6 shadow-2xl backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {getIcon()}
          <div className="flex-1 space-y-1.5">
            <AlertDialogHeader className="space-y-1.5 text-center sm:text-left">
              <AlertDialogTitle className="font-serif text-lg sm:text-xl font-bold text-foreground">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
        </div>

        <AlertDialogFooter className="mt-5 flex flex-col-reverse sm:flex-row gap-2 sm:gap-2.5 sm:justify-end">
          <AlertDialogCancel
            disabled={loading}
            onClick={handleCancel}
            className="w-full sm:w-auto rounded-xl border border-input bg-background py-2 text-sm font-medium hover:bg-accent transition"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={handleConfirm}
            className={`w-full sm:w-auto rounded-xl py-2 text-sm font-medium transition ${getActionClass()}`}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
