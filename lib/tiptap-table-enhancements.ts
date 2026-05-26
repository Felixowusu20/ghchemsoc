import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import {
  cellAround,
  columnResizingPluginKey,
  TableMap,
} from "prosemirror-tables";

const rowResizingPluginKey = new PluginKey("cmsTableRowResizing");

const CMS_TABLE_HEADER_STYLE =
  "background-color: #bfdbfe; border: 1px solid #64748b; padding: 0.5rem 0.75rem;";
const CMS_TABLE_CELL_STYLE =
  "background-color: #e2e8f0; border: 1px solid #64748b; padding: 0.5rem 0.75rem;";

function domCellAround(target: EventTarget | null): HTMLElement | null {
  let el = target as HTMLElement | null;
  while (el && el.nodeName !== "TD" && el.nodeName !== "TH") {
    el = el.classList?.contains("ProseMirror") ? null : (el.parentNode as HTMLElement | null);
  }
  return el;
}

function mergeCellStyle(base: string, height: string | null | undefined) {
  if (!height) return base;
  return `${base} height: ${height}; min-height: ${height};`;
}

function createRowHeightAttribute() {
  return {
    default: null as string | null,
    parseHTML: (element: HTMLElement) => element.style.height || element.getAttribute("data-row-height"),
    renderHTML: (attributes: { rowHeight?: string | null }) => {
      if (!attributes.rowHeight) return {};
      return { "data-row-height": attributes.rowHeight };
    },
  };
}

export const CmsTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      rowHeight: createRowHeightAttribute(),
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const rowHeight = (node.attrs.rowHeight as string | null) ?? null;
    const style = mergeCellStyle(CMS_TABLE_CELL_STYLE, rowHeight);
    return ["td", { ...HTMLAttributes, style }, 0];
  },
});

export const CmsTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      rowHeight: createRowHeightAttribute(),
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const rowHeight = (node.attrs.rowHeight as string | null) ?? null;
    const style = mergeCellStyle(CMS_TABLE_HEADER_STYLE, rowHeight);
    return ["th", { ...HTMLAttributes, style }, 0];
  },
});

function rowEdgeCell(view: import("@tiptap/pm/view").EditorView, event: MouseEvent, handleHeight: number) {
  const cellEl = domCellAround(event.target);
  if (!cellEl) return -1;
  const { bottom } = cellEl.getBoundingClientRect();
  if (bottom - event.clientY > handleHeight) return -1;

  const found = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!found) return -1;

  const $cell = cellAround(view.state.doc.resolve(found.pos));
  if (!$cell) return -1;
  return $cell.pos;
}

function setRowHeightOnCell(
  tr: import("@tiptap/pm/state").Transaction,
  tableStart: number,
  table: import("@tiptap/pm/model").Node,
  cellPosInTable: number,
  heightPx: number
) {
  const height = `${Math.max(32, Math.round(heightPx))}px`;
  const cell = table.nodeAt(cellPosInTable);
  if (!cell) return;
  tr.setNodeMarkup(tableStart + cellPosInTable, undefined, {
    ...cell.attrs,
    rowHeight: height,
  });
}

function updateRowHeight(view: import("@tiptap/pm/view").EditorView, cellPos: number, heightPx: number) {
  const $cell = view.state.doc.resolve(cellPos);
  const table = $cell.node(-1);
  if (!table) return;
  const map = TableMap.get(table);
  const tableStart = $cell.start(-1);
  const rect = map.findCell($cell.pos - tableStart);
  const tr = view.state.tr;

  for (let col = 0; col < map.width; col++) {
    const index = rect.top * map.width + col;
    const pos = map.map[index];
    if (col > 0 && map.map[index] === map.map[index - 1]) continue;
    setRowHeightOnCell(tr, tableStart, table, pos, heightPx);
  }

  view.dispatch(tr);
}

function currentRowHeight(view: import("@tiptap/pm/view").EditorView, cellPos: number) {
  const dom = view.domAtPos(cellPos);
  const node = dom.node instanceof HTMLElement ? dom.node : (dom.node.parentNode as HTMLElement | null);
  const cellEl = node?.closest?.("td, th") as HTMLElement | null;
  return cellEl?.getBoundingClientRect().height ?? 48;
}

function rowHandleDecorations(state: import("@tiptap/pm/state").EditorState, cellPos: number) {
  const $cell = state.doc.resolve(cellPos);
  const table = $cell.node(-1);
  if (!table) return DecorationSet.empty;

  const map = TableMap.get(table);
  const tableStart = $cell.start(-1);
  const rect = map.findCell($cell.pos - tableStart);
  const decorations: Decoration[] = [];

  for (let col = 0; col < map.width; col++) {
    const index = rect.top * map.width + col;
    const cellIndex = map.map[index];
    if (col > 0 && cellIndex === map.map[index - 1]) continue;

    const cell = table.nodeAt(cellIndex);
    if (!cell) continue;
    const pos = tableStart + cellIndex + cell.nodeSize - 1;
    const dom = document.createElement("div");
    dom.className = "row-resize-handle";
    decorations.push(Decoration.widget(pos, dom, { side: 1 }));
  }

  return DecorationSet.create(state.doc, decorations);
}

function createRowResizingPlugin(handleHeight: number) {
  return new Plugin({
    key: rowResizingPluginKey,
    state: {
      init: () => ({ activeCell: -1, dragging: null as { startY: number; startHeight: number } | null }),
      apply(tr, value) {
        const meta = tr.getMeta(rowResizingPluginKey) as
          | { setActive?: number; setDragging?: { startY: number; startHeight: number } | null }
          | undefined;
        if (!meta) return value;
        return {
          activeCell: meta.setActive ?? value.activeCell,
          dragging: meta.setDragging !== undefined ? meta.setDragging : value.dragging,
        };
      },
    },
    props: {
      decorations(state) {
        const pluginState = rowResizingPluginKey.getState(state);
        if (!pluginState || pluginState.activeCell < 0) return null;
        return rowHandleDecorations(state, pluginState.activeCell);
      },
      handleDOMEvents: {
        mousemove(view, event) {
          if (!view.editable) return false;
          const pluginState = rowResizingPluginKey.getState(view.state);
          if (!pluginState || pluginState.dragging) return false;

          const cell = rowEdgeCell(view, event, handleHeight);
          if (cell !== pluginState.activeCell) {
            view.dispatch(
              view.state.tr.setMeta(rowResizingPluginKey, { setActive: cell })
            );
          }
          return false;
        },
        mouseleave(view) {
          const pluginState = rowResizingPluginKey.getState(view.state);
          if (pluginState?.activeCell !== -1 && !pluginState.dragging) {
            view.dispatch(view.state.tr.setMeta(rowResizingPluginKey, { setActive: -1 }));
          }
          return false;
        },
        mousedown(view, event) {
          if (!view.editable) return false;
          const pluginState = rowResizingPluginKey.getState(view.state);
          if (!pluginState || pluginState.activeCell < 0) return false;

          const win = view.dom.ownerDocument?.defaultView ?? window;
          const activeCell = pluginState.activeCell;
          const startHeight = currentRowHeight(view, activeCell);
          view.dispatch(
            view.state.tr.setMeta(rowResizingPluginKey, {
              setDragging: { startY: event.clientY, startHeight },
            })
          );

          const onMove = (moveEvent: MouseEvent) => {
            if (!moveEvent.buttons) {
              onUp();
              return;
            }
            const dragging = rowResizingPluginKey.getState(view.state)?.dragging;
            if (!dragging) return;
            const next =
              dragging.startHeight + (moveEvent.clientY - dragging.startY);
            updateRowHeight(view, activeCell, next);
          };

          const onUp = () => {
            win.removeEventListener("mousemove", onMove);
            win.removeEventListener("mouseup", onUp);
            view.dispatch(
              view.state.tr.setMeta(rowResizingPluginKey, { setDragging: null, setActive: -1 })
            );
          };

          win.addEventListener("mousemove", onMove);
          win.addEventListener("mouseup", onUp);
          event.preventDefault();
          return true;
        },
      },
    },
  });
}

/** Syncs col/row resize cursors on the editor root while hovering table edges. */
function createTableCursorPlugin() {
  return new Plugin({
    view(view) {
      const sync = () => {
        const col = columnResizingPluginKey.getState(view.state);
        const row = rowResizingPluginKey.getState(view.state);
        const inTable = cellAround(view.state.selection.$from);

        view.dom.classList.toggle(
          "resize-cursor",
          Boolean(col && (col.activeHandle > -1 || col.dragging))
        );
        view.dom.classList.toggle(
          "row-resize-cursor",
          Boolean(row && (row.activeCell > -1 || row.dragging))
        );
        view.dom.classList.toggle("in-table-editor", Boolean(inTable));
      };

      sync();
      return { update: sync };
    },
  });
}

export const TableRowResizing = Extension.create({
  name: "tableRowResizing",
  /** Run before tableEditing so bottom-edge drags resize the row instead of only selecting the cell. */
  priority: 1000,
  addOptions() {
    return { handleHeight: 12 };
  },
  addProseMirrorPlugins() {
    if (!this.editor.isEditable) return [];
    return [createRowResizingPlugin(this.options.handleHeight)];
  },
});

export const TableEditorEnhancements = Extension.create({
  name: "tableEditorEnhancements",
  addProseMirrorPlugins() {
    if (!this.editor.isEditable) return [];
    return [createTableCursorPlugin()];
  },
});
