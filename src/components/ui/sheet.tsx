"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet on small screens. Used for the search filters, which are a
 * sticky sidebar from `lg` up and would otherwise push the results grid off
 * the bottom of a phone.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade-in fixed inset-0 z-[90] bg-overlay backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "animate-slide-up fixed inset-x-0 bottom-0 z-[95] flex max-h-[86vh] flex-col rounded-t-[28px] border-t border-line bg-canvas shadow-[var(--shadow-4)]"
          )}
        >
          <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-ink">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-xs text-ink-subtle">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-ink-subtle transition-colors hover:bg-sunken hover:text-ink"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="scroll-slim flex-1 overflow-y-auto px-5 pb-4">
            {children}
          </div>

          {footer && (
            <div className="border-t border-line bg-surface/60 px-5 py-3">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
