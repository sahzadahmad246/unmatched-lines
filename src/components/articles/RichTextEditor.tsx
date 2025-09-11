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
import { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Code, Type, Eye, Maximize2, Minimize2 } from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor = ({ content, onChange, placeholder, className }: RichTextEditorProps) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"classic" | "code">("classic");
  const [htmlContent, setHtmlContent] = useState(content);
  const [isSticky, setIsSticky] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

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
    setHtmlContent(content);
  }, [editor, content]);

  // Handle sticky toolbar
  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current && toolbarRef.current && !isFullscreen) {
        const editorRect = editorRef.current.getBoundingClientRect();
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        setIsSticky(editorRect.top <= 0 && editorRect.bottom > toolbarRect.height);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFullscreen]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle HTML content changes
  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  // Switch to classic editor and parse HTML
  const switchToClassic = () => {
    if (editor && htmlContent) {
      editor.commands.setContent(htmlContent, { emitUpdate: false });
    }
    setActiveTab("classic");
  };

  // Switch to code editor and get HTML
  const switchToCode = () => {
    if (editor) {
      const currentHtml = editor.getHTML();
      setHtmlContent(currentHtml);
    }
    setActiveTab("code");
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      "border rounded-md", 
      isFullscreen && "fixed inset-0 z-50 bg-background border-0 rounded-none",
      className
    )} ref={editorRef}>
      <Tabs value={activeTab} onValueChange={(value) => {
        if (value === "classic") switchToClassic();
        if (value === "code") switchToCode();
      }}>
        <div className={cn(
          "border-b flex items-center justify-between", 
          (isSticky || isFullscreen) && "sticky top-0 z-50 bg-background shadow-sm"
        )} ref={toolbarRef}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="classic" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Classic Editor
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML Code
            </TabsTrigger>
          </TabsList>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="ml-2"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
        
        <TabsContent value="classic" className={cn("mt-0", isFullscreen && "h-[calc(100vh-60px)] overflow-auto")}>
          <EditorToolbar
            editor={editor}
            onLinkClick={() => setIsLinkDialogOpen(true)}
            onImageClick={() => setIsImageDialogOpen(true)}
          />
          <div className={cn(isFullscreen && "h-[calc(100vh-120px)]")}>
            <EditorContent editor={editor} />
          </div>
        </TabsContent>
        
        <TabsContent value="code" className={cn("mt-0", isFullscreen && "h-[calc(100vh-60px)] overflow-auto")}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Write HTML directly or paste from external sources</p>
              <Button
                variant="outline"
                size="sm"
                onClick={switchToClassic}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            </div>
            <Textarea
              value={htmlContent}
              onChange={(e) => handleHtmlChange(e.target.value)}
              placeholder="<h1>Your heading</h1><p>Your content here...</p>"
              className={cn("font-mono text-sm", isFullscreen ? "h-[calc(100vh-200px)]" : "min-h-[300px]")}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <LinkDialog editor={editor} isOpen={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen} />
      <ImageDialog editor={editor} isOpen={isImageDialogOpen} onOpenChange={setIsImageDialogOpen} />
    </div>
  );
};

export default RichTextEditor;