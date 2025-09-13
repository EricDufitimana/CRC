"use client";

import * as React from "react";
import { useCallback } from "react";
import { Upload, X, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  value?: File[];
  onChange?: (files: File[]) => void;
  onRemove?: (index: number) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: React.ReactNode;
  helperText?: React.ReactNode;
}

export function FileUpload({
  multiple = false,
  accept = "image/*",
  maxFiles = 10,
  value = [],
  onChange,
  onRemove,
  className,
  disabled = false,
  placeholder = "Drop files here or click to upload",
  helperText,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      
      if (!multiple && fileArray.length > 0) {
        // Single file mode - replace existing file
        onChange?.(fileArray.slice(0, 1));
      } else if (multiple) {
        // Multiple file mode - add to existing files
        const newFiles = [...value, ...fileArray].slice(0, maxFiles);
        onChange?.(newFiles);
      }
    },
    [multiple, value, onChange, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      // Reset input value to allow selecting the same file again
      if (e.target) {
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      onRemove?.(index);
    },
    [onRemove]
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            {placeholder}
          </p>
          {helperText ? (
            <div className="text-xs text-muted-foreground">{helperText}</div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {multiple 
                ? `Up to ${maxFiles} files allowed` 
                : "Single file only"
              }
            </p>
          )}
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium space-y-2">Selected Files:</p>
          <div className="grid gap-2">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 