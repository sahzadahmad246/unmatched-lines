"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./editor-toolbar";
import { LinkDialog } from "./link-dialog";
import { ImageDialog } from "./image-dialog";
import { useEffect, useState } from "react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ content, onChange, placeholder, className }: RichTextEditorProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-300 pl-4 italic",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-100 p-2 rounded-md font-mono text-sm",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-6",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-6",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Write something amazing...",
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-md my-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextStyle,
      Color,
    ],
    content: content, // Initial content
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-[200px] p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
      },
    },
    immediatelyRender: false,
  });

  // Sync editor content when the `content` prop changes
 useEffect(() => {
  if (editor && content !== editor.getHTML()) {
    editor.commands.setContent(content, { emitUpdate: false }); // Use options object
  }
}, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-md", className)}>
      <EditorToolbar
        editor={editor}
        onLinkClick={() => setIsLinkDialogOpen(true)}
        onImageClick={() => setIsImageDialogOpen(true)}
      />
      <EditorContent editor={editor} />
      <LinkDialog editor={editor} isOpen={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen} />
      <ImageDialog editor={editor} isOpen={isImageDialogOpen} onOpenChange={setIsImageDialogOpen} />
    </div>
  );
};

export default RichTextEditor;