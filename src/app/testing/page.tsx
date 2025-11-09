"use client";

import { useState } from "react";
import { FileUpload, getReadableFileSize } from "@/components/application/file-upload/file-upload-base";

interface FileWithProgress {
  file: File;
  progress: number;
  failed?: boolean;
}

export default function TestingPage() {
  const [files, setFiles] = useState<FileWithProgress[]>([]);

  const handleDropFiles = (fileList: FileList) => {
    const newFiles: FileWithProgress[] = Array.from(fileList).map(file => ({
      file,
      progress: 0,
      failed: false
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach((fileWithProgress, index) => {
      const globalIndex = files.length + index;
      simulateUpload(globalIndex);
    });
  };

  const simulateUpload = (index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      
      setFiles(prev => prev.map((item, i) => 
        i === index ? { ...item, progress } : item
      ));
    }, 200);
  };

  const handleDelete = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRetry = (index: number) => {
    setFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, progress: 0, failed: false } : item
    ));
    simulateUpload(index);
  };

  const handleSizeLimitExceed = (fileList: FileList) => {
    console.warn("Files exceed size limit:", fileList);
    alert(`Some files exceed the size limit. Max size: 10MB`);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-800">File Upload Testing</h1>
        <p className="text-sm text-gray-600">Test the file-upload-base component</p>
      </div>

      <div className="space-y-3">
        {/* Drop Zone */}
        <div className="scale-90 origin-top">
          <FileUpload.DropZone
            accept="image/*,application/pdf,.doc,.docx"
            allowsMultiple={true}
            maxSize={10 * 1024 * 1024} // 10MB
            hint="Drop files here or click to browse"
            onDropFiles={handleDropFiles}
            onSizeLimitExceed={handleSizeLimitExceed}
            className="py-4 px-4"
          />
        </div>

        {/* Progress Fill Variant */}
        {files.length > 0 && (
          <div className="scale-90 origin-top">
            <FileUpload.Root className="gap-2">
              <FileUpload.List className="gap-2">
                {files.map((item, index) => (
                  <FileUpload.ListItem
                    key={`${item.file.name}-${index}`}
                    name={item.file.name}
                    size={item.file.size}
                    progress={item.progress}
                    failed={item.failed}
                    onDelete={() => handleDelete(index)}
                    onRetry={() => handleRetry(index)}
                    className="p-2 gap-2 rounded-lg"
                  />
                ))}
              </FileUpload.List>
            </FileUpload.Root>
          </div>
        )}
      </div>
    </div>
  );
}
