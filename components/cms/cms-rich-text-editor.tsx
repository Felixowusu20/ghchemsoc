"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
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
  const fileRef = useRef<HTMLInputElement>(null);

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
            Table.configure({ resizable: false }),
            TableRow,
            TableHeader,
            TableCell,
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
          "prose prose-sm max-w-none px-4 py-3 focus:outline-none min-h-[inherit] prose-headings:font-semibold prose-p:my-3 prose-ul:my-3 prose-ol:my-3",
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
          "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
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
              <ToolbarButton
                title="Insert table"
                disabled={disabled}
                active={editor.isActive("table")}
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
              >
                <Table2 className="h-4 w-4" />
              </ToolbarButton>
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
        <div style={{ minHeight }} className="bg-white">
          <EditorContent editor={editor} />
        </div>
      </div>
      <p className="text-xs text-gcs-muted-text">
        Format text, add lists, links, tables, and images. Images upload when you insert them in the editor.
      </p>
    </div>
  );
}
