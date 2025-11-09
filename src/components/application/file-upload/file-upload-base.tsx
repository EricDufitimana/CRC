"use client";

import type { ComponentProps, ComponentPropsWithRef } from "react";
import { useId, useRef, useState } from "react";
import type { FileIcon } from "@untitledui/file-icons";
import { FileIcon as FileTypeIcon } from "@untitledui/file-icons";
import { CheckCircle, Trash01, UploadCloud02, XCircle } from "@untitledui/icons";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/base/buttons/button";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { ProgressBar } from "@/components/base/progress-indicators/progress-indicators";
import { FeaturedIcon } from "@/components/foundations/featured-icon/featured-icon";
import { cx } from "@/utils/cx";

/**
 * Returns a human-readable file size.
 * @param bytes - The size of the file in bytes.
 * @returns A string representing the file size in a human-readable format.
 */
export const getReadableFileSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";

    const suffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return Math.floor(bytes / Math.pow(1024, i)) + " " + suffixes[i];
};

/**
 * Determines the file icon type based on the file name/extension.
 * @param fileName - The name of the file.
 * @returns The file icon type for @untitledui/file-icons.
 */
export const getFileIconType = (fileName: string): ComponentProps<typeof FileIcon>["type"] => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) {
        return 'image';
    }
    
    // PDF
    if (extension === 'pdf') {
        return 'pdf';
    }
    
    // Word documents
    if (['doc', 'docx'].includes(extension)) {
        return 'word';
    }
    
    // Excel documents
    if (['xls', 'xlsx', 'csv'].includes(extension)) {
        return 'excel';
    }
    
    // PowerPoint
    if (['ppt', 'pptx'].includes(extension)) {
        return 'powerpoint';
    }
    
    // Text files
    if (['txt', 'md', 'markdown'].includes(extension)) {
        return 'text';
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
        return 'video';
    }
    
    // Audio files
    if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(extension)) {
        return 'audio';
    }
    
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
        return 'archive';
    }
    
    // Code files
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'xml', 'yaml', 'yml'].includes(extension)) {
        return 'code';
    }
    
    // Default to empty if type is not recognized
    return 'empty';
};

interface FileUploadDropZoneProps {
    /** The class name of the drop zone. */
    className?: string;
    /**
     * A hint text explaining what files can be dropped.
     */
    hint?: string;
    /**
     * Disables dropping or uploading files.
     */
    isDisabled?: boolean;
    /**
     * Specifies the types of files that the server accepts.
     * Examples: "image/*", ".pdf,image/*", "image/*,video/mpeg,application/pdf"
     */
    accept?: string;
    /**
     * Allows multiple file uploads.
     */
    allowsMultiple?: boolean;
    /**
     * Maximum file size in bytes.
     */
    maxSize?: number;
    /**
     * Callback function that is called with the list of dropped files
     * when files are dropped on the drop zone.
     */
    onDropFiles?: (files: FileList) => void;
    /**
     * Callback function that is called with the list of unaccepted files
     * when files are dropped on the drop zone.
     */
    onDropUnacceptedFiles?: (files: FileList) => void;
    /**
     * Callback function that is called with the list of files that exceed
     * the size limit when files are dropped on the drop zone.
     */
    onSizeLimitExceed?: (files: FileList) => void;
}

export const FileUploadDropZone = ({
    className,
    hint,
    isDisabled,
    accept,
    allowsMultiple = true,
    maxSize,
    onDropFiles,
    onDropUnacceptedFiles,
    onSizeLimitExceed,
}: FileUploadDropZoneProps) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isInvalid, setIsInvalid] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const isFileTypeAccepted = (file: File): boolean => {
        if (!accept) return true;

        // Split the accept string into individual types
        const acceptedTypes = accept.split(",").map((type) => type.trim());

        return acceptedTypes.some((acceptedType) => {
            // Handle file extensions (e.g., .pdf, .doc)
            if (acceptedType.startsWith(".")) {
                const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
                return extension === acceptedType.toLowerCase();
            }

            // Handle wildcards (e.g., image/*)
            if (acceptedType.endsWith("/*")) {
                const typePrefix = acceptedType.split("/")[0];
                return file.type.startsWith(`${typePrefix}/`);
            }

            // Handle exact MIME types (e.g., application/pdf)
            return file.type === acceptedType;
        });
    };

    const handleDragIn = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragOut = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        event.preventDefault();
        event.stopPropagation();
        setIsDraggingOver(false);
    };

    const processFiles = (files: File[]): void => {
        // Reset the invalid state when processing files.
        setIsInvalid(false);

        const acceptedFiles: File[] = [];
        const unacceptedFiles: File[] = [];
        const oversizedFiles: File[] = [];

        // If multiple files are not allowed, only process the first file
        const filesToProcess = allowsMultiple ? files : files.slice(0, 1);

        filesToProcess.forEach((file) => {
            // Check file size first
            if (maxSize && file.size > maxSize) {
                oversizedFiles.push(file);
                return;
            }

            // Then check file type
            if (isFileTypeAccepted(file)) {
                acceptedFiles.push(file);
            } else {
                unacceptedFiles.push(file);
            }
        });

        // Handle oversized files
        if (oversizedFiles.length > 0 && typeof onSizeLimitExceed === "function") {
            const dataTransfer = new DataTransfer();
            oversizedFiles.forEach((file) => dataTransfer.items.add(file));

            setIsInvalid(true);
            onSizeLimitExceed(dataTransfer.files);
        }

        // Handle accepted files
        if (acceptedFiles.length > 0 && typeof onDropFiles === "function") {
            const dataTransfer = new DataTransfer();
            acceptedFiles.forEach((file) => dataTransfer.items.add(file));
            onDropFiles(dataTransfer.files);
        }

        // Handle unaccepted files
        if (unacceptedFiles.length > 0 && typeof onDropUnacceptedFiles === "function") {
            const unacceptedDataTransfer = new DataTransfer();
            unacceptedFiles.forEach((file) => unacceptedDataTransfer.items.add(file));

            setIsInvalid(true);
            onDropUnacceptedFiles(unacceptedDataTransfer.files);
        }

        // Clear the input value to ensure the same file can be selected again
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        if (isDisabled) return;

        handleDragOut(event);
        processFiles(Array.from(event.dataTransfer.files));
    };

    const handleInputFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(Array.from(event.target.files || []));
    };

    return (
        <div
            data-dropzone
            onDragOver={handleDragIn}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragEnd={handleDragOut}
            onDrop={handleDrop}
            className={cx(
                "group relative flex flex-col items-center justify-center gap-4 rounded-xl bg-gradient-to-br from-gray-50 to-white px-8 py-12 text-center border-2 border-dashed transition-all duration-300 ease-in-out",
                "shadow-sm hover:shadow-md",
                isDraggingOver 
                    ? "border-brand bg-brand-primary/50 ring-4 ring-brand/20 scale-[1.02]" 
                    : "border-gray-300 hover:border-gray-400",
                !isDraggingOver && !isDisabled && "hover:bg-gray-50/80",
                isDisabled && "cursor-not-allowed bg-gray-100 border-gray-200 opacity-50",
                isInvalid && "border-error bg-error-primary/30",
                className,
            )}
        >
            {/* Background pattern overlay */}
            <div className="absolute inset-0 rounded-xl opacity-[0.02] bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0)_1px,transparent_0)] bg-[length:20px_20px] pointer-events-none" />
            
            {/* Icon container with subtle animation */}
            <div className={cx(
                "relative transition-all duration-300",
                isDraggingOver && "scale-110"
            )}>
                <FeaturedIcon color="gray" theme="light" size="lg">
                    <UploadCloud02 className={cx(
                        "size-6 transition-all duration-300",
                        isDraggingOver && "text-fg-brand-primary"
                    )} />
                </FeaturedIcon>
            </div>

            <div className="flex flex-col gap-2 text-center relative z-10">
                <div className="flex flex-col items-center gap-2">
                    <input
                        ref={inputRef}
                        id={id}
                        type="file"
                        className="peer sr-only"
                        disabled={isDisabled}
                        accept={accept}
                        multiple={allowsMultiple}
                        onChange={handleInputFileChange}
                    />
                    <div className="flex flex-col sm:flex-row items-center">
                        <label htmlFor={id} className="cursor-pointer -mr-1 inline-flex">
                            <Button 
                                color="link-color" 
                                size="md" 
                                isDisabled={isDisabled} 
                                onClick={() => inputRef.current?.click()}
                                className="font-medium"
                            >
                                <span className="text-gray-900">Browse files</span>
                            </Button>
                        </label>
                        <span className="text-sm text-gray-500 hidden sm:inline px-1">or</span>
                        <span className="text-sm text-gray-600 font-medium">drag and drop here</span>
                    </div>
                </div>
                <p className={cx(
                    "text-xs text-gray-500 transition-colors duration-200",
                    isInvalid && "text-error-600 font-medium"
                )}>
                    {hint || "SVG, PNG, JPG, GIF, PDF up to 10MB"}
                </p>
            </div>

            {/* Subtle glow effect on drag over */}
            {isDraggingOver && (
                <div className="absolute inset-0 rounded-xl bg-brand-primary/10 animate-pulse pointer-events-none" />
            )}
        </div>
    );
};

export interface FileListItemProps {
    /** The name of the file. */
    name: string;
    /** The size of the file. */
    size: number;
    /** The upload progress of the file. */
    progress: number;
    /** Whether the file failed to upload. */
    failed?: boolean;
    /** The type of the file. */
    type?: ComponentProps<typeof FileIcon>["type"];
    /** The class name of the file list item. */
    className?: string;
    /** The variant of the file icon. */
    fileIconVariant?: ComponentProps<typeof FileTypeIcon>["variant"];
    /** The function to call when the file is deleted. */
    onDelete?: () => void;
    /** The function to call when the file upload is retried. */
    onRetry?: () => void;
}

export const FileListItemProgressBar = ({ name, size, progress, failed, type, fileIconVariant, onDelete, onRetry, className }: FileListItemProps) => {
    const isComplete = progress === 100;
    const fileIconType = type ?? getFileIconType(name);

    return (
        <motion.li
            layout="position"
            className={cx(
                "relative flex gap-3 rounded-xl bg-white p-4 border border-border-black transition-all duration-200 ease-in-out shadow-sm",
                failed && "border-error ring-2 ring-error/20",
                !failed && "hover:shadow-md hover:border-border-primary",
                className,
            )}
        >
            <FileTypeIcon className="size-10 shrink-0 dark:hidden" type={fileIconType} theme="light" variant={fileIconVariant ?? "default"} />
            <FileTypeIcon className="size-10 shrink-0 not-dark:hidden" type={fileIconType} theme="dark" variant={fileIconVariant ?? "default"} />

            <div className="flex min-w-0 flex-1 flex-col items-start">
                <div className="flex w-full max-w-full min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-black">{name}</p>

                        <div className="mt-0.5 flex items-center gap-2">
                            <p className="truncate text-sm whitespace-nowrap text-tertiary">{getReadableFileSize(size)}</p>

                            <hr className="h-3 w-px rounded-t-full rounded-b-full border-none bg-border-primary" />

                            <div className="flex items-center gap-1">
                                {isComplete && <CheckCircle className="size-4 stroke-[2.5px] text-fg-success-primary" />}
                                {isComplete && <p className="text-sm font-medium text-success-primary">Complete</p>}

                                {!isComplete && !failed && <UploadCloud02 className="stroke-[2.5px size-4 text-fg-quaternary" />}
                                {!isComplete && !failed && <p className="text-sm font-medium text-quaternary">Uploading...</p>}

                                {failed && <XCircle className="size-4 text-fg-error-primary" />}
                                {failed && <p className="text-sm font-medium text-error-primary">Failed</p>}
                            </div>
                        </div>
                    </div>

                    <ButtonUtility color="tertiary" tooltip="Delete" icon={Trash01} size="xs" className="-mt-2 -mr-2 self-start" onClick={onDelete} />
                </div>

                {!failed && (
                    <div className="mt-1 w-full">
                        <ProgressBar labelPosition="right" max={100} min={0} value={progress} />
                    </div>
                )}

                {failed && (
                    <Button color="link-destructive" size="sm" onClick={onRetry} className="mt-1.5">
                        Try again
                    </Button>
                )}
            </div>
        </motion.li>
    );
};

export const FileListItemProgressFill = ({ name, size, progress, failed, type, fileIconVariant, onDelete, onRetry, className }: FileListItemProps) => {
    const isComplete = progress === 100;
    const fileIconType = type ?? getFileIconType(name);

    return (
        <motion.li layout="position" className={cx("relative flex gap-3 overflow-hidden rounded-xl bg-white p-4 border border-border-black shadow-sm transition-all duration-200 ease-in-out", failed && "border-error ring-2 ring-error/20", !failed && "hover:shadow-md hover:border-border-primary", className)}>
            {/* Progress fill. */}
            <div
                style={{ width: `${progress}%` }}
                className={cx("absolute inset-y-0 left-0 bg-gray-200/30 transition-all duration-75 ease-linear", isComplete && "opacity-0")}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            />
            <FileTypeIcon className="relative size-10 shrink-0 z-10" type={fileIconType} theme="light" variant={fileIconVariant ?? "solid"} />

            <div className="relative flex min-w-0 flex-1 z-10">
                <div className="relative flex min-w-0 flex-1 flex-col items-start">
                    <div className="w-full min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-dark">{name}</p>

                        <div className="mt-0.5 flex items-center gap-2">
                            <p className="text-sm text-tertiary text-gray-500">{failed ? "Upload failed, please try again" : getReadableFileSize(size)}</p>

                            {!failed && (
                                <>
                                    <hr className="h-3 w-px rounded-t-full rounded-b-full border-none bg-border-primary" />
                                    <div className="flex items-center gap-1">
                                        {isComplete && <CheckCircle className="size-4 stroke-[2.5px] text-green-500" />}
                                        {!isComplete && <UploadCloud02 className="size-4 stroke-[2.5px] text-fg-quaternary" />}

                                        <p className="text-sm text-tertiary">{Math.floor(progress)}%</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {failed && (
                        <Button color="link-destructive" size="sm" onClick={onRetry} className="mt-1.5">
                            Try again
                        </Button>
                    )}
                </div>

                <ButtonUtility color="tertiary" tooltip="Delete" icon={Trash01} size="xs" className="-mt-1 -mr-1 self-start p-1 *:data-icon:size-2.5" onClick={onDelete} />
            </div>
        </motion.li>
    );
};

const FileUploadRoot = (props: ComponentPropsWithRef<"div">) => (
    <div {...props} className={cx("flex flex-col gap-4", props.className)}>
        {props.children}
    </div>
);

const FileUploadList = (props: ComponentPropsWithRef<"ul">) => (
    <ul {...props} className={cx("flex flex-col gap-3", props.className)}>
        <AnimatePresence initial={false}>{props.children}</AnimatePresence>
    </ul>
);

// Export FileListItemProgressFill as FileListItem for the main API
export const FileListItem = FileListItemProgressFill;

export const FileUpload = {
    Root: FileUploadRoot,
    List: FileUploadList,
    DropZone: FileUploadDropZone,
    ListItem: FileListItem,
    // Legacy exports for backwards compatibility
    ListItemProgressBar: FileListItemProgressBar,
    ListItemProgressFill: FileListItemProgressFill,
};
