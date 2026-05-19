"use client";

import { Loader2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CmsButton } from "@/components/cms/cms-ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export type CmsListActionsConfirm = {
  /** Modal headline, e.g. "Delete this slide?" */
  title: string;
  /** Body copy under the title. */
  description?: ReactNode;
  /** Optional bullet/highlight block (use a list of items styled with `bg-red-500` dots). */
  highlights?: ReactNode;
  /** Confirm button label (defaults to "Delete"). */
  confirmLabel?: string;
  /** Cancel button label (defaults to "Keep it"). */
  cancelLabel?: string;
};

/**
 * Edit + optional extra links + Delete — used on CMS list rows.
 *
 * Pass `confirm` to show a polished confirmation dialog before calling `onDelete`.
 * When `confirm` is omitted, the delete button calls `onDelete` directly (the
 * caller is expected to handle confirmation itself).
 */
export function CmsListActions({
  onEdit,
  onDelete,
  children,
  confirm,
  editLabel = "Edit",
  deleteLabel = "Delete",
}: {
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  children?: ReactNode;
  confirm?: CmsListActionsConfirm;
  editLabel?: string;
  deleteLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleDeleteClick() {
    if (!confirm) {
      await onDelete();
      return;
    }
    setOpen(true);
  }

  async function handleConfirm() {
    setBusy(true);
    try {
      await onDelete();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col gap-2 self-start sm:flex-row sm:items-center">
      <CmsButton type="button" onClick={onEdit}>
        {editLabel}
      </CmsButton>
      {children}
      <CmsButton
        variant="danger"
        type="button"
        onClick={() => void handleDeleteClick()}
        disabled={busy}
        className="gap-2"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        {deleteLabel}
      </CmsButton>

      {confirm ? (
        <ConfirmDialog
          open={open}
          variant="danger"
          title={confirm.title}
          description={confirm.description}
          highlights={confirm.highlights}
          confirmLabel={confirm.confirmLabel ?? "Delete"}
          cancelLabel={confirm.cancelLabel ?? "Keep it"}
          loading={busy}
          onConfirm={() => void handleConfirm()}
          onCancel={() => {
            if (!busy) setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
