"use client";

import { useEffect, useRef, useState } from "react";
import { CmsButton } from "@/components/cms/cms-ui";
import { cn } from "@/lib/utils";

const MAX_GRID_ROWS = 8;
const MAX_GRID_COLS = 8;
const MAX_ROWS = 20;
const MAX_COLS = 12;

export type TableInsertOptions = {
  rows: number;
  cols: number;
  withHeaderRow: boolean;
  width: string;
};

const WIDTH_PRESETS = [
  { label: "Full width", value: "100%" },
  { label: "Wide (75%)", value: "75%" },
  { label: "Medium (50%)", value: "50%" },
  { label: "Narrow (33%)", value: "33%" },
] as const;

type Props = {
  open: boolean;
  onClose: () => void;
  onInsert: (options: TableInsertOptions) => void;
  disabled?: boolean;
  /** Toolbar control that opens the popover — excluded from click-outside */
  anchorRef?: React.RefObject<HTMLElement | null>;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TableInsertPopover({ open, onClose, onInsert, disabled, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const anchorRefBox = useRef(anchorRef);
  anchorRefBox.current = anchorRef;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);
  const [withHeaderRow, setWithHeaderRow] = useState(true);
  const [widthPreset, setWidthPreset] = useState<(typeof WIDTH_PRESETS)[number]["value"] | "custom">("100%");
  const [customWidth, setCustomWidth] = useState("");

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRefBox.current?.current?.contains(target)) return;
      onCloseRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  const previewRows = hoverRows || rows;
  const previewCols = hoverCols || cols;
  const resolvedWidth =
    widthPreset === "custom"
      ? `${clamp(Number(customWidth) || 100, 10, 100)}%`
      : widthPreset;

  const handleInsert = () => {
    onInsert({
      rows: clamp(rows, 1, MAX_ROWS),
      cols: clamp(cols, 1, MAX_COLS),
      withHeaderRow,
      width: resolvedWidth,
    });
    onClose();
  };

  const selectFromGrid = (r: number, c: number) => {
    setRows(r);
    setCols(c);
    setHoverRows(0);
    setHoverCols(0);
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Insert table"
      className="absolute left-0 top-full z-50 mt-1 w-[min(100vw-2rem,22rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
    >
      <p className="text-sm font-semibold text-slate-800">Insert table</p>
      <p className="mt-0.5 text-xs text-gcs-muted-text">
        {previewRows} × {previewCols} {previewRows === 1 ? "row" : "rows"},{" "}
        {previewCols === 1 ? "column" : "columns"}
      </p>

      <div
        className="mt-3 inline-grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${MAX_GRID_COLS}, 1fr)` }}
        onMouseLeave={() => {
          setHoverRows(0);
          setHoverCols(0);
        }}
      >
        {Array.from({ length: MAX_GRID_ROWS * MAX_GRID_COLS }, (_, i) => {
          const r = Math.floor(i / MAX_GRID_COLS) + 1;
          const c = (i % MAX_GRID_COLS) + 1;
          const active = r <= previewRows && c <= previewCols;
          return (
            <button
              key={`${r}-${c}`}
              type="button"
              title={`${r} × ${c}`}
              className={cn(
                "h-4 w-4 rounded-sm border border-slate-200 transition-colors",
                active ? "border-gcs-primary bg-gcs-primary/25" : "bg-slate-50 hover:bg-slate-100"
              )}
              onMouseEnter={() => {
                setHoverRows(r);
                setHoverCols(c);
              }}
              onClick={() => selectFromGrid(r, c)}
            />
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-xs font-medium text-slate-600">
          Rows
          <input
            type="number"
            min={1}
            max={MAX_ROWS}
            value={rows}
            disabled={disabled}
            onChange={(e) => setRows(clamp(Number(e.target.value) || 1, 1, MAX_ROWS))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Columns
          <input
            type="number"
            min={1}
            max={MAX_COLS}
            value={cols}
            disabled={disabled}
            onChange={(e) => setCols(clamp(Number(e.target.value) || 1, 1, MAX_COLS))}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <label className="mt-3 block text-xs font-medium text-slate-600">
        Table width
        <select
          value={widthPreset}
          disabled={disabled}
          onChange={(e) => setWidthPreset(e.target.value as (typeof WIDTH_PRESETS)[number]["value"] | "custom")}
          className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
        >
          {WIDTH_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
          <option value="custom">Custom…</option>
        </select>
      </label>

      {widthPreset === "custom" ? (
        <label className="mt-2 block text-xs font-medium text-slate-600">
          Width (%)
          <input
            type="number"
            min={10}
            max={100}
            value={customWidth}
            disabled={disabled}
            placeholder="e.g. 60"
            onChange={(e) => setCustomWidth(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
      ) : null}

      <label className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-700">
        <input
          type="checkbox"
          checked={withHeaderRow}
          disabled={disabled}
          onChange={(e) => setWithHeaderRow(e.target.checked)}
          className="rounded border-slate-300"
        />
        Header row
      </label>

      <div className="mt-4 flex justify-end gap-2">
        <CmsButton type="button" variant="ghost" disabled={disabled} onClick={onClose}>
          Cancel
        </CmsButton>
        <CmsButton type="button" disabled={disabled} onClick={handleInsert}>
          Insert table
        </CmsButton>
      </div>
    </div>
  );
}
