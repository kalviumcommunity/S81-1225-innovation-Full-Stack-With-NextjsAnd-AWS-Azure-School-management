"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/Button";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "secondary" | "danger";
  confirmDisabled?: boolean;
  onConfirm: () => void | Promise<void>;
  children: React.ReactNode;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  confirmDisabled = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const titleId = "confirm-dialog-title";
  const descId = "confirm-dialog-desc";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />

        <Dialog.Content
          aria-labelledby={titleId}
          aria-describedby={description ? descId : undefined}
          className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-foreground/15 bg-background p-5 shadow-lg focus:outline-none"
        >
          <Dialog.Title id={titleId} className="text-base font-semibold">
            {title}
          </Dialog.Title>

          {description ? (
            <Dialog.Description
              id={descId}
              className="mt-2 text-sm text-foreground/70"
            >
              {description}
            </Dialog.Description>
          ) : null}

          <div className="mt-5 flex items-center justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" type="button">
                {cancelLabel}
              </Button>
            </Dialog.Close>

            <Button
              type="button"
              variant={confirmVariant}
              disabled={confirmDisabled}
              onClick={() => void onConfirm()}
            >
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
