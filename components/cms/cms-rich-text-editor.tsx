"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow } from "@tiptap/extension-table";
import { TableInsertPopover, type TableInsertOptions } from "@/components/cms/table-insert-popover";
import {
  CmsTableCell,
  CmsTableHeader,
  TableEditorEnhancements,
  TableRowResizing,
} from "@/lib/tiptap-table-enhancements";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Strikethrough,
  Columns3,
  Rows3,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cmsCredentials } from "@/lib/cms-fetch";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  /** Cloudinary folder for inline image uploads */
  imageFolder?: string;
  enableTables?: boolean;
};

/** Persists width/style on inserted tables for public article HTML. */
const CmsTable = Table.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

function insertTableWithOptions(editor: Editor, options: TableInsertOptions) {
  const { rows, cols, withHeaderRow, width } = options;
  const style =
    width === "100%"
      ? "width: 100%; max-width: 100%"
      : `width: ${width}; max-width: 100%`;

  editor.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
  editor.chain().focus().updateAttributes("table", { style }).run();
}

function TableEditToolbar({ editor, disabled }: { editor: Editor; disabled?: boolean }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    editor.on("selectionUpdate", refresh);
    editor.on("transaction", refresh);
    return () => {
      editor.off("selectionUpdate", refresh);
      editor.off("transaction", refresh);
    };
  }, [editor]);

  if (!editor.isActive("table")) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-blue-50/80 px-2 py-1.5">
      <span className="mr-1 text-xs font-medium text-slate-600">Table:</span>
      <ToolbarButton
        title="Add row above"
        disabled={disabled}
        onClick={() => editor.chain().focus().addRowBefore().run()}
      >
        <Rows3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Add row below"
        disabled={disabled}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <span className="text-[10px] font-bold leading-none">R+</span>
      </ToolbarButton>
      <ToolbarButton
        title="Delete row"
        disabled={disabled || !editor.can().deleteRow()}
        onClick={() => editor.chain().focus().deleteRow().run()}
      >
        <span className="text-[10px] font-bold leading-none">R−</span>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
      <ToolbarButton
        title="Add column left"
        disabled={disabled}
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      >
        <Columns3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        title="Add column right"
        disabled={disabled}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <span className="text-[10px] font-bold leading-none">C+</span>
      </ToolbarButton>
      <ToolbarButton
        title="Delete column"
        disabled={disabled || !editor.can().deleteColumn()}
        onClick={() => editor.chain().focus().deleteColumn().run()}
      >
        <span className="text-[10px] font-bold leading-none">C−</span>
      </ToolbarButton>
      <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
      <ToolbarButton
        title="Toggle header row"
        disabled={disabled}
        active={editor.isActive("tableHeader")}
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        <span className="text-[10px] font-bold leading-none">Hdr</span>
      </ToolbarButton>
      <span className="ml-1 hidden text-xs text-slate-500 sm:inline">
        Click to edit · drag right edge of any column (incl. last) or bottom edge of any row to resize
      </span>
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition",
        active ? "bg-gcs-primary text-white" : "hover:bg-slate-100",
        disabled && "opacity-40"
      )}
    >
      {children}
    </button>
  );
}

export function CmsRichTextEditor({
  value,
  onChange,
  label = "Article body",
  placeholder = "Write the full article. Use the toolbar for headings, lists, links, tables, and inline images.",
  disabled,
  minHeight = "280px",
  imageFolder = "news/body",
  enableTables = true,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tableButtonRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl max-w-full h-auto my-4" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      ...(enableTables
        ? [
            CmsTable.configure({
              resizable: true,
              lastColumnResizable: true,
              handleWidth: 14,
              cellMinWidth: 48,
              renderWrapper: true,
              HTMLAttributes: { class: "cms-editor-table" },
            }),
            TableRow,
            CmsTableHeader,
            CmsTableCell,
            TableRowResizing.configure({ handleHeight: 12 }),
            TableEditorEnhancements,
          ]
        : []),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
    editorProps: {
      attributes: {
        class:
          "tiptap cms-tiptap-surface max-w-none px-4 py-3 text-sm text-gcs-foreground focus:outline-none min-h-[inherit] [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold [&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== (current === "<p></p>" ? "" : current)) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!editor) return;
      setUploading(true);
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", imageFolder);
      try {
        const res = await fetch("/api/cms/upload", { method: "POST", body: fd, ...cmsCredentials });
        const body = (await res.json().catch(() => null)) as { url?: string } | null;
        if (res.ok && body?.url) {
          editor.chain().focus().setImage({ src: body.url, alt: file.name }).run();
        }
      } finally {
        setUploading(false);
      }
    },
    [editor, imageFolder]
  );

  if (!editor) {
    return (
      <div className="flex items-center gap-2 text-sm text-gcs-muted-text">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading editor…
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <div
        className={cn(
          "cms-rich-text-editor overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
          disabled && "opacity-60"
        )}
      >
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-100 bg-slate-50/80 px-2 py-1.5">
          <ToolbarButton
            title="Bold"
            disabled={disabled}
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Italic"
            disabled={disabled}
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Underline"
            disabled={disabled}
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Strikethrough"
            disabled={disabled}
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          <ToolbarButton
            title="Heading"
            disabled={disabled}
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <span className="text-xs font-bold">H2</span>
          </ToolbarButton>
          <ToolbarButton
            title="Subheading"
            disabled={disabled}
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <span className="text-xs font-bold">H3</span>
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          <ToolbarButton
            title="Bullet list"
            disabled={disabled}
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Numbered list"
            disabled={disabled}
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Quote"
            disabled={disabled}
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          <ToolbarButton
            title="Align left"
            disabled={disabled}
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            disabled={disabled}
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            disabled={disabled}
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          <ToolbarButton
            title="Add link"
            disabled={disabled}
            active={editor.isActive("link")}
            onClick={() => {
              const prev = editor.getAttributes("link").href as string | undefined;
              const url = window.prompt("Link URL", prev ?? "https://");
              if (url === null) return;
              if (!url) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor.chain().focus().setLink({ href: url }).run();
            }}
          >
            <Link2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            title="Insert image"
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
          </ToolbarButton>
          {enableTables ? (
            <>
              <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
              <div ref={tableButtonRef} className="relative">
                <ToolbarButton
                  title="Insert table"
                  disabled={disabled}
                  active={editor.isActive("table") || tablePickerOpen}
                  onClick={() => setTablePickerOpen((open) => !open)}
                >
                  <Table2 className="h-4 w-4" />
                </ToolbarButton>
                <TableInsertPopover
                  open={tablePickerOpen}
                  disabled={disabled}
                  anchorRef={tableButtonRef}
                  onClose={() => setTablePickerOpen(false)}
                  onInsert={(options) => insertTableWithOptions(editor, options)}
                />
              </div>
              <ToolbarButton
                title="Delete table"
                disabled={disabled || !editor.can().deleteTable()}
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                <Trash2 className="h-4 w-4" />
              </ToolbarButton>
            </>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = "";
            }}
          />
          <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
          <ToolbarButton title="Undo" disabled={disabled} onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton title="Redo" disabled={disabled} onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
        <TableEditToolbar editor={editor} disabled={disabled} />
        <div style={{ minHeight }} className="cms-rich-text-editor-body bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>
      <p className="text-xs text-gcs-muted-text">
        Format text, add lists, links, tables, and images. In a table: click cells to edit, use the table bar for rows/columns, drag column edges to resize.
      </p>
    </div>
  );
}
