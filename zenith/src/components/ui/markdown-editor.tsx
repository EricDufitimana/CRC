"use client";

import * as React from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Bold, Italic, List, ListOrdered, Quote, Code, Link, Image as ImageIcon } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your markdown content here...",
  className,
  rows = 6,
}: MarkdownEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = (text: string, before: string = "", after: string = "") => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = start + before.length + selectedText.length + after.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  const formatText = (format: string) => {
    switch (format) {
      case "bold":
        insertText("**", "**", "**");
        break;
      case "italic":
        insertText("*", "*", "*");
        break;
      case "code":
        insertText("`", "`", "`");
        break;
      case "quote":
        insertText("> ", "", "");
        break;
      case "link":
        insertText("[", "](url)", "");
        break;
      case "image":
        insertText("![alt text](", ")", "");
        break;
      case "ul":
        insertText("- ", "", "");
        break;
      case "ol":
        insertText("1. ", "", "");
        break;
    }
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown rendering for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/^>\s+(.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>')
      .replace(/^-\s+(.*$)/gm, '<li class="list-disc ml-4">$1</li>')
      .replace(/^\d+\.\s+(.*$)/gm, '<li class="list-decimal ml-4">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline">$1</a>')
      .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto" />')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className={className}>
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="space-y-2">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-md bg-gray-50">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("bold")}
              className="h-8 w-8 p-0"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("italic")}
              className="h-8 w-8 p-0"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("code")}
              className="h-8 w-8 p-0"
              title="Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("quote")}
              className="h-8 w-8 p-0"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("link")}
              className="h-8 w-8 p-0"
              title="Link"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("image")}
              className="h-8 w-8 p-0"
              title="Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("ul")}
              className="h-8 w-8 p-0"
              title="Unordered List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => formatText("ol")}
              className="h-8 w-8 p-0"
              title="Ordered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Editor */}
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="rounded-t-none border-t-0 focus:ring-1 focus:ring-dark"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-2">
          <div className="p-4 border border-gray-200 rounded-md bg-white min-h-[200px]">
            {value ? (
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
              />
            ) : (
              <p className="text-gray-500 italic">No content to preview</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 